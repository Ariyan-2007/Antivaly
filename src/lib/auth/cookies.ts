import type { AuthResponse } from "@/types/api";

export const ACCESS_COOKIE = "av_at";
export const REFRESH_COOKIE = "av_rt";
/** Non-httpOnly flag so Client Components can cheaply know "is logged in" without exposing tokens. */
export const SESSION_FLAG_COOKIE = "av_session";

type CookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
};

function maxAgeFromExpiry(expiresAt: string): number {
  const ms = new Date(expiresAt).getTime() - Date.now();
  return Math.max(Math.floor(ms / 1000), 0);
}

export function buildAuthCookies(
  auth: AuthResponse
): { name: string; value: string; options: CookieOptions }[] {
  const secure = process.env.NODE_ENV === "production";
  const base = { httpOnly: true, secure, sameSite: "lax" as const, path: "/" };

  return [
    {
      name: ACCESS_COOKIE,
      value: auth.accessToken,
      options: { ...base, maxAge: maxAgeFromExpiry(auth.accessTokenExpiresAt) },
    },
    {
      name: REFRESH_COOKIE,
      value: auth.refreshToken,
      options: { ...base, maxAge: maxAgeFromExpiry(auth.refreshTokenExpiresAt) },
    },
    {
      name: SESSION_FLAG_COOKIE,
      value: "1",
      options: {
        ...base,
        httpOnly: false,
        maxAge: maxAgeFromExpiry(auth.refreshTokenExpiresAt),
      },
    },
  ];
}

export const AUTH_COOKIE_NAMES = [ACCESS_COOKIE, REFRESH_COOKIE, SESSION_FLAG_COOKIE];
