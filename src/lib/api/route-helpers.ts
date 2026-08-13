import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/api/client";

/** Parses a Route Handler's JSON body defensively — a malformed/empty body must never throw. */
export async function safeJsonBody<T>(request: NextRequest): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export function badRequest(title = "Malformed request body.") {
  return NextResponse.json({ status: 400, title }, { status: 400 });
}

/**
 * Converts any thrown value into a well-formed JSON error response. Used as the final catch
 * in every Route Handler so an unexpected/unknown error can never escape as an HTML 500 page
 * (which would break the client's JSON parsing and surface as an uncaught exception).
 */
export function apiErrorResponse(err: unknown) {
  if (err instanceof ApiError) {
    // status 0 means the request never reached the upstream API at all.
    const status = err.status === 0 ? 503 : err.status;
    return NextResponse.json({ status, title: err.message, errors: err.errors }, { status });
  }
  return NextResponse.json(
    { status: 500, title: "Something went wrong. Please try again." },
    { status: 500 }
  );
}
