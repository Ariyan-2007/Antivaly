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
import { CART_TOKEN_HEADER } from "@/lib/cart/guest-token";

type ProxyOptions = {
  method: string;
  /** Path on the Vastora API, e.g. "/api/shop/cart" — never slug-rooted for these calls. */
  upstreamPath: string;
  body?: unknown;
  /** Extra headers to forward upstream on every attempt (e.g. Idempotency-Key). */
  extraHeaders?: Record<string, string>;
};

/**
 * Shared retry dance for every authed Route Handler: attaches the access-token cookie as a
 * Bearer token via `performRequest`, and if the upstream call comes back 401 (access token
 * expired without proxy.ts having caught it) or unreachable, refreshes once using the
 * refresh-token cookie, rotates cookies on the response, and retries — matching the
 * blueprint's "rotates on every use" refresh-token requirement. `performRequest` itself must
 * never throw (both callers' inner fetches already catch and return null on failure).
 *
 * The caller must never throw either: a Route Handler that throws returns an HTML error page
 * in production, which breaks the client's JSON parsing and surfaces as an uncaught exception
 * in the browser. Every branch below resolves to a well-formed NextResponse instead.
 */
async function withAuthRetry(
  performRequest: (accessToken: string) => Promise<Response | null>
): Promise<NextResponse> {
  const store = await cookies();
  const accessToken = store.get(ACCESS_COOKIE)?.value;
  const refreshToken = store.get(REFRESH_COOKIE)?.value;

  if (!accessToken && !refreshToken) {
    return unauthorized();
  }

  let upstreamRes = accessToken ? await performRequest(accessToken) : null;
  let rotated: ReturnType<typeof buildAuthCookies> | null = null;
  let unreachable = accessToken ? upstreamRes === null : false;

  if ((!upstreamRes || upstreamRes.status === 401) && refreshToken) {
    const auth = await refreshTokens(refreshToken);
    if (auth) {
      rotated = buildAuthCookies(auth);
      upstreamRes = await performRequest(auth.accessToken);
      unreachable = upstreamRes === null;
    }
  }

  if (!upstreamRes) {
    return unreachable ? serviceUnavailable() : unauthorized();
  }

  const res = await toNextResponse(upstreamRes);
  if (rotated) for (const c of rotated) res.cookies.set(c.name, c.value, c.options);
  if (upstreamRes.status === 401) {
    for (const name of AUTH_COOKIE_NAMES) res.cookies.delete(name);
  }
  return res;
}

/** Shared implementation for every JSON-bodied authed Route Handler (cart, orders,
 * /api/auth/me). See withAuthRetry for the refresh/retry behavior. */
export async function proxyAuthed({ method, upstreamPath, body, extraHeaders }: ProxyOptions) {
  try {
    return await withAuthRetry((accessToken) =>
      forward(upstreamPath, {
        method,
        body,
        headers: { Authorization: `Bearer ${accessToken}`, ...extraHeaders },
      })
    );
  } catch {
    return serviceUnavailable();
  }
}

/** Avatar upload (blueprint §6.1/§9.41) is the one authed call that isn't JSON — `forward`
 * always sets `Content-Type: application/json` and stringifies the body, which would corrupt
 * a multipart upload, so this takes a pre-built FormData and lets fetch set its own boundary. */
export async function proxyAuthedMultipart({
  method,
  upstreamPath,
  formData,
}: {
  method: string;
  upstreamPath: string;
  formData: FormData;
}) {
  try {
    return await withAuthRetry((accessToken) =>
      forwardMultipart(upstreamPath, method, formData, accessToken)
    );
  } catch {
    return serviceUnavailable();
  }
}

/**
 * Cart and checkout/preview are "guests welcome, not slug-rooted" (blueprint §6.3/§6.4): a
 * signed-in Customer's JWT always wins (same refresh-on-401 dance as proxyAuthed), but with no
 * session at all the call still goes through anonymously, carrying the guest's `X-Cart-Token`
 * instead of a Bearer token. Never returns 401 for the guest path — these endpoints have no
 * auth requirement at all when no token is present.
 */
export async function proxyCartOrCheckout({
  method,
  upstreamPath,
  body,
  guestToken,
  extraHeaders,
}: ProxyOptions & { guestToken?: string | null }) {
  try {
    const store = await cookies();
    const accessToken = store.get(ACCESS_COOKIE)?.value;
    const refreshToken = store.get(REFRESH_COOKIE)?.value;

    if (accessToken || refreshToken) {
      return proxyAuthed({ method, upstreamPath, body, extraHeaders });
    }

    const headers: Record<string, string> = { ...extraHeaders };
    if (guestToken) headers[CART_TOKEN_HEADER] = guestToken;

    const upstreamRes = await forward(upstreamPath, { method, body, headers });
    if (!upstreamRes) return serviceUnavailable();
    return toNextResponse(upstreamRes);
  } catch {
    return serviceUnavailable();
  }
}

/** No auth, ever — order lookup, email verification. */
export async function proxyPublic({ method, upstreamPath, body, extraHeaders }: ProxyOptions) {
  try {
    const upstreamRes = await forward(upstreamPath, { method, body, headers: extraHeaders });
    if (!upstreamRes) return serviceUnavailable();
    return toNextResponse(upstreamRes);
  } catch {
    return serviceUnavailable();
  }
}

async function forward(
  upstreamPath: string,
  opts: { method: string; body?: unknown; headers?: Record<string, string> }
): Promise<Response | null> {
  try {
    return await fetch(`${API_BASE_URL}${upstreamPath}`, {
      method: opts.method,
      headers: { "Content-Type": "application/json", ...opts.headers },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      cache: "no-store",
    });
  } catch {
    return null;
  }
}

async function forwardMultipart(
  upstreamPath: string,
  method: string,
  formData: FormData,
  accessToken: string
): Promise<Response | null> {
  try {
    return await fetch(`${API_BASE_URL}${upstreamPath}`, {
      method,
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
      cache: "no-store",
    });
  } catch {
    return null;
  }
}

async function toNextResponse(upstreamRes: Response): Promise<NextResponse> {
  const status = upstreamRes.status;

  if (status === 204) {
    return new NextResponse(null, { status: 204 });
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

  return NextResponse.json(data, { status });
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
