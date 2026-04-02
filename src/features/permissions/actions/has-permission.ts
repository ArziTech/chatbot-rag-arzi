"use server";

import { prisma } from "@/lib/prisma";
import type { ABACUser, Permissions } from "../types/abac";
import { hasPermission } from "./evaluate-permission";

/**
 * Check if role has bypass all features (superadmin)
 */
async function isSuperAdmin(roleId: number): Promise<boolean> {
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    select: { byPassAllFeatures: true },
  });
  return role?.byPassAllFeatures ?? false;
}

/**
 * Server action: Check if user has permission (RBAC)
 * Returns true if user has the specified permission
 */
export async function hasServerPermission(
  roleId: number,
  permission: string,
): Promise<boolean> {
  try {
    // Superadmin bypass
    if (await isSuperAdmin(roleId)) {
      return true;
    }

    // Check if role has the specific permission
    const rolePermission = await prisma.rolePermission.findFirst({
      where: {
        roleId,
        permission: {
          code: permission,
          isActive: true,
        },
      },
    });

    return !!rolePermission;
  } catch {
    return false;
  }
}

/**
 * Server action: Check if user has ANY of the specified permissions (RBAC)
 * Returns true if user has at least one of the permissions
 */
export async function hasAnyServerPermission(
  roleId: number,
  permissions: string[],
): Promise<boolean> {
  try {
    // Superadmin bypass
    if (await isSuperAdmin(roleId)) {
      return true;
    }

    // Check if role has any of the permissions
    const rolePermissions = await prisma.rolePermission.findMany({
      where: {
        roleId,
        permission: {
          code: { in: permissions },
          isActive: true,
        },
      },
    });

    return rolePermissions.length > 0;
  } catch {
    return false;
  }
}

/**
 * Server action: Check if user has ALL of the specified permissions (RBAC)
 * Returns true if user has all permissions
 */
export async function hasAllServerPermissions(
  roleId: number,
  permissions: string[],
): Promise<boolean> {
  try {
    // Superadmin bypass
    if (await isSuperAdmin(roleId)) {
      return true;
    }

    // Check if role has all permissions
    const rolePermissions = await prisma.rolePermission.findMany({
      where: {
        roleId,
        permission: {
          code: { in: permissions },
          isActive: true,
        },
      },
      include: {
        permission: {
          select: { code: true },
        },
      },
    });

    const uniquePermissions = new Set(
      rolePermissions.map((rp) => rp.permission.code),
    );
    return permissions.every((p) => uniquePermissions.has(p));
  } catch {
    return false;
  }
}

/**
 * Server action: Check if user has ABAC permission with data context
 * Returns true if user has the specified permission based on ABAC rules
 *
 * @param userId - The user's ID
 * @param resource - The resource being accessed (e.g., "users", "roles")
 * @param action - The action being performed (e.g., "view", "edit", "delete")
 * @param data - Optional resource data for contextual permission checks
 *
 * @example
 * // Check if user can edit a specific user
 * const canEdit = await hasServerPermissionABAC("user-123", "users", "edit", {
 *   id: "user-456",
 *   username: "other",
 *   ...
 * });
 * // Returns true only if user-123 can edit user-456 based on ABAC rules
 */
export async function hasServerPermissionABAC<
  Resource extends keyof Permissions,
  Action extends Permissions[Resource]["action"],
>(
  userId: string,
  resource: Resource,
  action: Action,
  data?: Permissions[Resource]["dataType"],
): Promise<boolean> {
  try {
    // Fetch user with their roles (primary role + UserRole junction)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          select: { name: true, byPassAllFeatures: true },
        },
        userRoles: {
          include: {
            role: {
              select: { name: true, byPassAllFeatures: true },
            },
          },
        },
      },
    });

    if (!user) {
      return false;
    }

    // Collect all roles (primary role + UserRole entries)
    const allRoles = [
      user.role.name,
      ...user.userRoles.map((ur) => ur.role.name),
    ];

    // Check if any role has bypass all features
    const hasBypass =
      user.role.byPassAllFeatures ||
      user.userRoles.some((ur) => ur.role.byPassAllFeatures);

    if (hasBypass) {
      return true;
    }

    // Build ABAC user object with all roles and blockedBy list
    const abacUser: ABACUser = {
      id: user.id,
      roles: allRoles,
      blockedBy: user.blockedBy,
    };

    // Evaluate ABAC permission
    return hasPermission(abacUser, resource, action, data);
  } catch {
    return false;
  }
}

/**
 * Server action: Check if user has ANY ABAC permission (OR logic)
 */
export async function hasAnyServerPermissionABAC<
  Resource extends keyof Permissions,
  Action extends Permissions[Resource]["action"],
>(
  userId: string,
  resource: Resource,
  actions: Action[],
  data?: Permissions[Resource]["dataType"],
): Promise<boolean> {
  for (const action of actions) {
    if (await hasServerPermissionABAC(userId, resource, action, data)) {
      return true;
    }
  }
  return false;
}

/**
 * Server action: Check if user has ALL ABAC permissions (AND logic)
 * Note: Uses single role for now; upgrade to multi-role when UserRole table is added
 */
export async function hasAllServerPermissionsABAC<
  Resource extends keyof Permissions,
  Action extends Permissions[Resource]["action"],
>(
  userId: string,
  resource: Resource,
  actions: Action[],
  data?: Permissions[Resource]["dataType"],
): Promise<boolean> {
  for (const action of actions) {
    if (!(await hasServerPermissionABAC(userId, resource, action, data))) {
      return false;
    }
  }
  return true;
}
