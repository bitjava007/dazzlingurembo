export interface JwtPayload {
  sub: string; // userId
  email: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}
