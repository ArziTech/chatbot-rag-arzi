"use client";

import { usePermissions } from "@/providers/permission-provider";
import { hasPermission as evaluatePermission } from "../actions/evaluate-permission";
import type { PermissionCheck } from "../types";
import type { ABACUser } from "../types/abac";

export function usePermission(): PermissionCheck {
  const { permissions, byPassAllFeatures, isLoading } = usePermissions();

  const permissionCodes = new Set(permissions.map((p) => p.code));

  const hasPermission = (code: string): boolean => {
    if (byPassAllFeatures) return true;
    return permissionCodes.has(code);
  };

  const hasAnyPermission = (codes: string[]): boolean => {
    if (byPassAllFeatures) return true;
    return codes.some((code) => permissionCodes.has(code));
  };

  const hasAllPermissions = (codes: string[]): boolean => {
    if (byPassAllFeatures) return true;
    return codes.every((code) => permissionCodes.has(code));
  };

  /**
   * ABAC-style permission check with data context
   *
   * @param resource - The resource being accessed (e.g., "users", "roles")
   * @param action - The action being performed (e.g., "view", "edit")
   * @param data - Optional resource data for contextual permission checks
   * @param user - The user to check permissions for (uses context user if not provided)
   *
   * Note: For full ABAC support, pass the user's ABAC attributes.
   * This method uses the permissions from context as a fallback.
   *
   * @example
   * // Check if current user can edit a specific user
   * const canEdit = can("users", "edit", { id: "123", ... });
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const can = (
    resource: string,
    action: string,
    data?: unknown,
    user?: ABACUser,
  ): boolean => {
    // If bypass is enabled, allow everything
    if (byPassAllFeatures) return true;

    // If no user provided, fall back to legacy permission code check
    if (!user) {
      const code = `${resource}.${action}`;
      return permissionCodes.has(code);
    }

    // Validate resource is a valid key
    const validResources = [
      "users",
      "roles",
      "comments",
      "dashboard",
      "permissions",
      "settings",
    ] as const;
    if (!validResources.includes(resource as (typeof validResources)[number])) {
      return false;
    }

    // Use ABAC permission evaluation with type assertions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return evaluatePermission(
      user,
      resource as any,
      action as any,
      data as any,
    );
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    can,
    permissions,
    byPassAllFeatures,
    isLoading,
  };
}
