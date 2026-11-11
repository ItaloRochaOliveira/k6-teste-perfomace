// Códigos de erro espelhando o backend (modules/auth/auth.errors.ts)
export const authErrorCode = {
  EMAIL_TAKEN: "AUTH_EMAIL_TAKEN",
  INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
} as const;

export const authErrorMessages: Record<string, string> = {
  [authErrorCode.EMAIL_TAKEN]: "Este e-mail já está cadastrado.",
  [authErrorCode.INVALID_CREDENTIALS]: "E-mail ou senha inválidos.",
};
