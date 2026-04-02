/**
 * Role Permission Rules
 *
 * This module defines the ABAC permission rules for each role.
 * Rules can be either static (boolean) or dynamic (function with context).
 *
 * The `as const satisfies` pattern ensures:
 * - All roles are validated against the type system at compile time
 * - IDE autocomplete works for valid permission paths
 * - Invalid permission paths cause TypeScript errors
 */

import type {
  ABACUser,
  Permissions,
  RolePermissions,
  UserData,
} from "../types/abac";

// Admin role has bypassAllFeatures - all permissions are true
const ADMIN_PERMISSIONS = {
  users: {
    view: true,
    create: true,
    edit: true,
    delete: true,
  },
  roles: {
    view: true,
    create: true,
    edit: true,
    delete: true,
  },
  comments: {
    view: true,
    create: true,
    update: true,
    delete: true,
  },
  dashboard: {
    view: true,
  },
  permissions: {
    view: true,
    manage: true,
  },
  settings: {
    view: true,
  },
} as const satisfies RolePermissions;

// User role - standard permissions with ownership checks
const USER_PERMISSIONS = {
  users: {
    view: true,
    create: true,
    // Dynamic: users can only edit their own profile
    edit: (user: ABACUser, data: UserData | null) => {
      if (!data) return false;
      return user.id === data.id;
    },
    delete: false,
  },
  roles: {
    view: true,
    create: false,
    edit: false,
    delete: false,
  },
  comments: {
    // Dynamic: users can view comments unless blocked by the author
    view: (user: ABACUser, data: { authorId: string } | null) => {
      if (!data) return true;
      return !user.blockedBy?.includes(data.authorId);
    },
    create: true,
    // Dynamic: users can only update their own comments
    update: (user: ABACUser, data: { authorId: string } | null) => {
      if (!data) return false;
      return user.id === data.authorId;
    },
    delete: false,
  },
  dashboard: {
    view: true,
  },
  permissions: {
    view: true,
    manage: false,
  },
  settings: {
    view: true,
  },
} as const satisfies RolePermissions;

// Moderator role - enhanced permissions with some conditional deletes
const MODERATOR_PERMISSIONS = {
  users: {
    view: true,
    create: true,
    edit: true,
    // Dynamic: moderators can delete users
    delete: true,
  },
  roles: {
    view: true,
    create: true,
    edit: true,
    delete: false,
  },
  comments: {
    view: true,
    create: true,
    update: true,
    delete: true,
  },
  dashboard: {
    view: true,
  },
  permissions: {
    view: true,
    manage: false,
  },
  settings: {
    view: true,
  },
} as const satisfies RolePermissions;

/**
 * Role permission configuration
 * Maps role names to their permission rules
 *
 * The `satisfies` keyword validates this object against RolePermissions
 * type at compile time while preserving the literal types.
 */
export const ROLE_PERMISSIONS = {
  admin: ADMIN_PERMISSIONS,
  user: USER_PERMISSIONS,
  moderator: MODERATOR_PERMISSIONS,
} as const satisfies Record<string, RolePermissions>;

/**
 * Get the permission rule for a specific role, resource, and action
 * Returns undefined if no rule is defined
 */
export function getRolePermission<
  Resource extends keyof Permissions,
  Action extends Permissions[Resource]["action"],
>(
  roleName: string,
  resource: Resource,
  action: Action,
):
  | ((user: ABACUser, data: Permissions[Resource]["dataType"]) => boolean)
  | boolean
  | undefined {
  const rolePerms = ROLE_PERMISSIONS[roleName as keyof typeof ROLE_PERMISSIONS];
  if (!rolePerms) return undefined;

  const resourcePerms = rolePerms[resource];
  if (!resourcePerms) return undefined;

  return resourcePerms[action as keyof typeof resourcePerms] as
    | ((user: ABACUser, data: Permissions[Resource]["dataType"]) => boolean)
    | boolean
    | undefined;
}

/**
 * Check if a role name exists in ROLE_PERMISSIONS
 */
export function isValidRole(roleName: string): boolean {
  return roleName in ROLE_PERMISSIONS;
}

/**
 * Get all available roles
 */
export function getAvailableRoles(): (keyof typeof ROLE_PERMISSIONS)[] {
  return Object.keys(ROLE_PERMISSIONS) as (keyof typeof ROLE_PERMISSIONS)[];
}
