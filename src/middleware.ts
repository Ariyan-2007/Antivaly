import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { ACCESS_COOKIE, REFRESH_COOKIE, buildAuthCookies } from "./lib/auth/cookies";
import { refreshTokens } from "./lib/auth/refresh";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // Middleware runs on every request with no error boundary above it — a throw here would
  // take the entire site down, so this is wrapped defensively even though nothing inside
  // should realistically throw (refreshTokens already never throws).
  try {
    const response = intlMiddleware(request);

    // The access-token cookie's own maxAge matches its JWT expiry, so if it's absent but the
    // refresh cookie is still present, the access token has simply expired — refresh it here
    // (middleware is the only place besides Route Handlers allowed to set response cookies)
    // so Server Components downstream see a valid session without any client-side round trip.
    const hasAccessToken = request.cookies.has(ACCESS_COOKIE);
    const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

    if (!hasAccessToken && refreshToken) {
      const auth = await refreshTokens(refreshToken);
      if (auth) {
        for (const cookie of buildAuthCookies(auth)) {
          response.cookies.set(cookie.name, cookie.value, cookie.options);
        }
      }
    }

    return response;
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
