export interface AuthUserRow {
  id: number;
  name: string;
  email: string;
}

export interface LoginResult {
  accessToken: string;
  user: AuthUserRow;
}
