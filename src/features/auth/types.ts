export interface LoginInput {
  username: string;
  password: string;
}

export interface SignupInput {
  name: string;
  username: string;
  email?: string;
  password: string;
  confirmPassword: string;
}

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  roleId: number;
}

export interface AuthError {
  message: string;
  code?: string;
}
