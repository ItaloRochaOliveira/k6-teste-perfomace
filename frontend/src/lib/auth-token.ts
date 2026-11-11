export const AUTH_COOKIE = "k6_token";

export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((row) => row.startsWith(`${AUTH_COOKIE}=`));
  return match ? decodeURIComponent(match.slice(AUTH_COOKIE.length + 1)) : null;
}

export function setToken(token: string, maxAgeSeconds = 60 * 60) {
  document.cookie = `${AUTH_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

export function clearToken() {
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
