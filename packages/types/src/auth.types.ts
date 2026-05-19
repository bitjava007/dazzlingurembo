import { Role } from './user.types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: Role;
  };
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}
