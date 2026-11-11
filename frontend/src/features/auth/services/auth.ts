import { api } from "@/lib/api";

import type { AuthUser, LoginInput, LoginResponse, SignupInput } from "../types";

export function login(body: LoginInput) {
  return api.post<LoginResponse>("/auth/login", body);
}

export function signup(body: SignupInput) {
  return api.post<AuthUser>("/auth/signup", body);
}
