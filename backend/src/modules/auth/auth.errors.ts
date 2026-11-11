export const authErrorCode = {
  EMAIL_TAKEN: 'AUTH_EMAIL_TAKEN',
  INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
} as const;

export type AuthErrorCode = (typeof authErrorCode)[keyof typeof authErrorCode];
