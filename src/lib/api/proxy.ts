import "server-only";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE_URL } from "@/lib/constants";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  AUTH_COOKIE_NAMES,
  buildAuthCookies,
} from "@/lib/auth/cookies";
import { refreshTokens } from "@/lib/auth/refresh";

type ProxyOptions = {
  method: string;
  /** Path on the Vastora API, e.g. "/api/shop/cart" — never slug-rooted for these calls. */
  upstreamPath: string;
  body?: unknown;
};

/**
 * Shared implementation for every authed Route Handler (cart, orders, /api/auth/me).
 * Attaches the access-token cookie as a Bearer token, and if the upstream call comes back
 * 401 (access token expired without proxy.ts having caught it), refreshes once using the
 * refresh-token cookie, rotates cookies on the response, and retries — matching the
 * blueprint's "rotates on every use" refresh-token requirement.
 *
 * This function must never throw: a Route Handler that throws returns an HTML error page in
 * production, which breaks the client's JSON parsing and surfaces as an uncaught exception in
 * the browser. Every branch below resolves to a well-formed NextResponse instead.
 */
export async function proxyAuthed({ method, upstreamPath, body }: ProxyOptions) {
  try {
    const store = await cookies();
    const accessToken = store.get(ACCESS_COOKIE)?.value;
    const refreshToken = store.get(REFRESH_COOKIE)?.value;

    if (!accessToken && !refreshToken) {
      return unauthorized();
    }

    const callUpstream = async (token: string) => {
      try {
        return await fetch(`${API_BASE_URL}${upstreamPath}`, {
          method,
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: body !== undefined ? JSON.stringify(body) : undefined,
          cache: "no-store",
        });
      } catch {
        return null;
      }
    };

    let upstreamRes = accessToken ? await callUpstream(accessToken) : null;
    let rotated: ReturnType<typeof buildAuthCookies> | null = null;
    let unreachable = accessToken ? upstreamRes === null : false;

    if ((!upstreamRes || upstreamRes.status === 401) && refreshToken) {
      const auth = await refreshTokens(refreshToken);
      if (auth) {
        rotated = buildAuthCookies(auth);
        upstreamRes = await callUpstream(auth.accessToken);
        unreachable = upstreamRes === null;
      }
    }

    if (!upstreamRes) {
      return unreachable ? serviceUnavailable() : unauthorized();
    }

    const status = upstreamRes.status;

    if (status === 204) {
      const res = new NextResponse(null, { status: 204 });
      if (rotated) for (const c of rotated) res.cookies.set(c.name, c.value, c.options);
      return res;
    }

    let text: string;
    try {
      text = await upstreamRes.text();
    } catch {
      return serviceUnavailable();
    }

    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        return status >= 200 && status < 300
          ? serviceUnavailable()
          : problem(status, "Something went wrong. Please try again.");
      }
    }

    const res = NextResponse.json(data, { status });

    if (rotated) {
      for (const cookie of rotated) res.cookies.set(cookie.name, cookie.value, cookie.options);
    }
    if (status === 401) {
      for (const name of AUTH_COOKIE_NAMES) res.cookies.delete(name);
    }

    return res;
  } catch {
    return serviceUnavailable();
  }
}

function problem(status: number, title: string) {
  return NextResponse.json({ status, title }, { status });
}

function unauthorized() {
  const res = NextResponse.json({ status: 401, title: "Not authenticated" }, { status: 401 });
  for (const name of AUTH_COOKIE_NAMES) res.cookies.delete(name);
  return res;
}

function serviceUnavailable() {
  return problem(503, "The server is temporarily unavailable. Please try again in a moment.");
}
