export interface AuthContext {
  userId: number;
  email: string;
}

export interface AuthenticatedRequest {
  headers: Record<string, string | string[] | undefined>;
  auth?: AuthContext;
}
