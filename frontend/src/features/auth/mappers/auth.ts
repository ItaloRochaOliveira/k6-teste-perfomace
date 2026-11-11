import { ApiError } from "@/lib/api";

import { authErrorMessages } from "../errors";

export function mapAuthError(error: unknown): string {
  if (error instanceof ApiError) {
    return authErrorMessages[error.code] ?? error.message;
  }
  return "Não foi possível concluir a operação.";
}
