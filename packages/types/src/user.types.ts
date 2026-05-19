export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  name?: string;
  password: string;
  role?: Role;
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  password?: string;
  role?: Role;
}
