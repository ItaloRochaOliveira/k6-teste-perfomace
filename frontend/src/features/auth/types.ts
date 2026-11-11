import { z } from "zod";

import {
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "./constants";

export const loginFormSchema = z.object({
  email: z.string().trim().min(1, "Informe o e-mail").email("E-mail inválido").max(EMAIL_MAX_LENGTH),
  password: z.string().min(1, "Informe a senha").max(PASSWORD_MAX_LENGTH),
});

export const signupFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(NAME_MAX_LENGTH),
  email: z.string().trim().min(1, "Informe o e-mail").email("E-mail inválido").max(EMAIL_MAX_LENGTH),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `A senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres`)
    .max(PASSWORD_MAX_LENGTH),
});

export type LoginInput = z.infer<typeof loginFormSchema>;
export type SignupInput = z.infer<typeof signupFormSchema>;

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
