import { ApiError } from "@/lib/api/client";
import type { ProblemDetails } from "@/types/api";

export type BrowserFetchInit = Omit<RequestInit, "body"> & { body?: unknown };

/**
 * Calls this app's own Route Handlers (never the Vastora API directly) from Client
 * Components. Every failure mode (offline, a Route Handler that itself failed to return
 * JSON, an HTTP error) is normalized into an ApiError — callers only ever need `catch (err)`
 * + `err instanceof ApiError` to show a safe message, never a raw parse/network exception.
 */
export async function browserFetch<T>(path: string, init: BrowserFetchInit = {}): Promise<T> {
  const { body, headers, ...rest } = init;

  let res: Response;
  try {
    res = await fetch(path, {
      ...rest,
      headers: { "Content-Type": "application/json", ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError({ status: 0, title: "You appear to be offline. Please check your connection and try again." });
  }

  return parseResponse<T>(res);
}

/** For the one client-side call that isn't JSON (avatar upload, blueprint §6.1/§9.41) — no
 * `Content-Type` header so the browser sets its own multipart boundary. */
export async function browserFetchFormData<T>(
  path: string,
  init: { method: string; formData: FormData }
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, { method: init.method, body: init.formData });
  } catch {
    throw new ApiError({ status: 0, title: "You appear to be offline. Please check your connection and try again." });
  }

  return parseResponse<T>(res);
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;

  let text: string;
  try {
    text = await res.text();
  } catch {
    throw new ApiError({ status: res.status, title: "The response was interrupted. Please try again." });
  }

  let data: unknown;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    throw new ApiError({
      status: res.status,
      title: res.ok
        ? "Received an unexpected response from the server."
        : res.statusText || "Something went wrong. Please try again.",
    });
  }

  if (!res.ok) {
    const problem = (data ?? {}) as Partial<ProblemDetails>;
    throw new ApiError({
      status: res.status,
      title: problem.title ?? res.statusText ?? "Something went wrong. Please try again.",
      errors: problem.errors,
    });
  }

  return data as T;
}
