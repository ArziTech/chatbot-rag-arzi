export interface User {
  id: string;
  name: string;
  username: string;
  email: string | null;
  roleId: number;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  role?: {
    id: number;
    name: string;
  };
}

export interface UserInput {
  name: string;
  username: string;
  email?: string;
  roleId: number;
  status?: boolean;
}

export interface UserListFilters {
  search?: string;
  roleId?: number;
  status?: boolean;
}
