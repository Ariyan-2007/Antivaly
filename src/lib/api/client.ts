import { API_BASE_URL } from "@/lib/constants";
import type { ProblemDetails } from "@/types/api";

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(problem: ProblemDetails) {
    super(problem.title || `Request failed with status ${problem.status}`);
    this.status = problem.status;
    this.errors = problem.errors;
  }
}

/** The request never reached the API at all (offline, DNS failure, connection refused, timeout). */
export function isNetworkError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 0;
}

export type ApiFetchInit = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Forwarded to Next's fetch cache config for public/cacheable GETs. */
  next?: NextFetchRequestConfig;
};

/**
 * Low-level fetch wrapper for calling the Vastora API directly (server-side only —
 * used for public catalog endpoints and internal auth/session checks). Parses the
 * RFC 7807 problem+json error contract (blueprint §5) into a typed ApiError.
 *
 * Every failure mode — network failure, a non-JSON/malformed response body, an HTTP error
 * status — is normalized into an ApiError so callers only ever need one catch shape. This
 * function is intentionally the single choke point where a `fetch()` call can go wrong;
 * nothing here should ever throw a raw TypeError/SyntaxError past this boundary.
 */
export async function apiFetch<T>(path: string, init: ApiFetchInit = {}): Promise<T> {
  const { body, headers, next, ...rest } = init;

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      next,
    });
  } catch {
    throw new ApiError({ status: 0, title: "Unable to reach the server. Please check your connection and try again." });
  }

  if (res.status === 204) {
    return undefined as T;
  }

  let text: string;
  try {
    text = await res.text();
  } catch {
    throw new ApiError({ status: res.status, title: "The server response was interrupted. Please try again." });
  }

  let data: unknown;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    if (!res.ok) {
      throw new ApiError({ status: res.status, title: res.statusText || "Something went wrong. Please try again." });
    }
    throw new ApiError({ status: res.status, title: "Received an unexpected response from the server." });
  }

  if (!res.ok) {
    const problem = (data ?? {}) as Partial<ProblemDetails>;
    throw new ApiError({
      status: res.status,
      title: problem.title ?? res.statusText ?? "Something went wrong. Please try again.",
      type: problem.type,
      errors: problem.errors,
    });
  }

  return data as T;
}
