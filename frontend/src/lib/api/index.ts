import { clearToken, getToken } from "@/lib/auth-token";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3006";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Method = "GET" | "POST" | "PUT" | "DELETE";

async function request<T>(
  method: Method,
  path: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    method,
    cache: "no-store",
    ...(signal ? { signal } : {}),
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: unknown } | null;
    const message = typeof payload?.message === "string" ? payload.message : response.statusText;

    if (response.status === 401 && token && typeof window !== "undefined") {
      clearToken();
      window.location.href = "/login";
    }

    throw new ApiError(response.status, message, message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>("GET", path, undefined, signal),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body ?? {}),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body ?? {}),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
