export interface Role {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  permissions?: {
    permission: {
      id: number;
      code: string;
      label: string;
    };
  }[];
  _count?: {
    User: number;
    RolePermission: number;
  };
}

export interface RoleInput {
  name: string;
  description?: string;
  isActive?: boolean;
  permissionIds?: number[];
}

export interface RoleListFilters {
  search?: string;
  isActive?: boolean;
}
