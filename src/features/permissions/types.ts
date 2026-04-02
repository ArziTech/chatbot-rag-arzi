import type { Permission as PrismaPermission } from "@prisma/client";
import type { ABACUser } from "./types/abac";

// Re-export ABAC types
export * from "./types/abac";

// Export Permission type for use in other files
export type Permission = PrismaPermission;

export interface UserPermissions {
  permissions: Permission[];
  byPassAllFeatures: boolean;
}

export interface PermissionCheck {
  hasPermission: (code: string) => boolean;
  hasAnyPermission: (codes: string[]) => boolean;
  hasAllPermissions: (codes: string[]) => boolean;
  permissions: Permission[];
  byPassAllFeatures: boolean;
  isLoading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  can: (
    resource: string,
    action: string,
    data?: any,
    user?: ABACUser,
  ) => boolean;
}

export interface PermissionInput {
  code: string;
  label: string;
  href?: string | null;
  description?: string | null;
  icon?: string | null;
  module?: string | null;
  isSection?: boolean;
  sequence?: number;
  parentId?: number | null;
  showOnSidebar?: boolean;
  isActive?: boolean;
}
