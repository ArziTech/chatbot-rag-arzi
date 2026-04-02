/**
 * ABAC Permission Evaluation Function
 *
 * Core function for evaluating permissions using the ABAC model.
 * Supports both static boolean permissions and dynamic function-based
 * permissions that can inspect user and resource attributes.
 */

import { ROLE_PERMISSIONS } from "../rules/role-rules";
import type { ABACUser, Permissions } from "../types/abac";

/**
 * Check if a user has a specific permission on a resource.
 *
 * @param user - The user making the request (with roles and attributes)
 * @param resource - The resource being accessed (e.g., "users", "roles")
 * @param action - The action being performed (e.g., "view", "edit", "delete")
 * @param data - Optional resource data for contextual permission checks
 * @returns boolean indicating if permission is granted
 *
 * @example
 * // Boolean permission check
 * hasPermission(user, "dashboard", "view")  // true if user.role includes dashboard.view
 *
 * @example
 * // ABAC permission check with data context
 * hasPermission(user, "users", "edit", { id: "123", name: "John", ... })
 * // Returns true only if user.id === data.id (ownership check)
 */
export function hasPermission<
  Resource extends keyof Permissions,
  Action extends Permissions[Resource]["action"],
>(
  user: ABACUser,
  resource: Resource,
  action: Action,
  data?: Permissions[Resource]["dataType"],
): boolean {
  // If user has no roles, deny
  if (!user.roles || user.roles.length === 0) {
    return false;
  }

  // Check each role the user has (OR logic - any role that grants access is sufficient)
  return user.roles.some((roleName) => {
    const rolePerms =
      ROLE_PERMISSIONS[roleName as keyof typeof ROLE_PERMISSIONS];

    // Role doesn't exist in our configuration
    if (!rolePerms) {
      return false;
    }

    const resourcePerms = rolePerms[resource];

    // Resource not defined for this role
    if (!resourcePerms) {
      return false;
    }

    const actionPerm = resourcePerms[action as keyof typeof resourcePerms];

    // Action not defined for this role
    if (actionPerm === undefined) {
      return false;
    }

    // Boolean permission (static)
    if (typeof actionPerm === "boolean") {
      return actionPerm;
    }

    // Function-based permission (ABAC)
    if (typeof actionPerm === "function") {
      // If data is required but not provided, deny
      if (data === undefined) {
        return false;
      }
      return actionPerm(user, data);
    }

    return false;
  });
}

/**
 * Check if a user has ANY of the specified permissions (OR logic)
 *
 * @param user - The user making the request
 * @param resource - The resource being accessed
 * @param actions - Array of actions to check
 * @param data - Optional resource data for contextual checks
 * @returns boolean indicating if any permission is granted
 *
 * @example
 * hasAnyPermission(user, "users", ["edit", "delete"], userData)
 * // Returns true if user can edit OR delete the user
 */
export function hasAnyPermission<
  Resource extends keyof Permissions,
  Action extends Permissions[Resource]["action"],
>(
  user: ABACUser,
  resource: Resource,
  actions: Action[],
  data?: Permissions[Resource]["dataType"],
): boolean {
  return actions.some((action) => hasPermission(user, resource, action, data));
}

/**
 * Check if a user has ALL of the specified permissions (AND logic)
 *
 * @param user - The user making the request
 * @param resource - The resource being accessed
 * @param actions - Array of actions to check
 * @param data - Optional resource data for contextual checks
 * @returns boolean indicating if all permissions are granted
 *
 * @example
 * hasAllPermissions(user, "users", ["view", "edit"], userData)
 * // Returns true only if user can BOTH view AND edit the user
 */
export function hasAllPermissions<
  Resource extends keyof Permissions,
  Action extends Permissions[Resource]["action"],
>(
  user: ABACUser,
  resource: Resource,
  actions: Action[],
  data?: Permissions[Resource]["dataType"],
): boolean {
  return actions.every((action) => hasPermission(user, resource, action, data));
}

/**
 * Check if a user has a specific role
 *
 * @param user - The user to check
 * @param roleName - The role name to check for
 * @returns boolean indicating if user has the role
 */
export function hasRole(user: ABACUser, roleName: string): boolean {
  return user.roles.includes(roleName);
}

/**
 * Check if a user has any of the specified roles
 *
 * @param user - The user to check
 * @param roleNames - Array of role names to check
 * @returns boolean indicating if user has any of the roles
 */
export function hasAnyRole(user: ABACUser, roleNames: string[]): boolean {
  return user.roles.some((role) => roleNames.includes(role));
}

/**
 * Check if a user has all of the specified roles
 *
 * @param user - The user to check
 * @param roleNames - Array of role names to check
 * @returns boolean indicating if user has all of the roles
 */
export function hasAllRoles(user: ABACUser, roleNames: string[]): boolean {
  return roleNames.every((role) => user.roles.includes(role));
}
