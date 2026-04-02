"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { usePermission } from "@/features/permissions/hooks/use-permission";
import type { ABACUser } from "../types/abac";

interface PermissionGateProps {
  children: ReactNode;
  /** Legacy: Single permission code (RBAC) */
  permission?: string;
  /** Legacy: Multiple permission codes (RBAC) */
  permissions?: string[];
  /** Legacy: Require all permissions (AND logic) vs any (OR logic) */
  requireAll?: boolean;
  /** Fallback UI when access is denied */
  fallback?: ReactNode;
  /** Loading state UI */
  loadingFallback?: ReactNode;
  /** Redirect URL when access is denied */
  redirectTo?: string;
  /** ABAC: Resource to check (e.g., "users", "roles", "dashboard") */
  resource?: string;
  /** ABAC: Action to check (e.g., "view", "edit", "delete") */
  action?: string;
  /** ABAC: Data context for permission check */
  data?: unknown;
  /** ABAC: User attributes for permission check (uses context if not provided) */
  user?: ABACUser;
}

export function PermissionGate({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  loadingFallback = null,
  redirectTo,
  resource,
  action,
  data,
  user,
}: PermissionGateProps) {
  const router = useRouter();
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    can,
    byPassAllFeatures,
    isLoading,
  } = usePermission();

  // Superadmin bypass - check this FIRST
  if (byPassAllFeatures) {
    return <>{children}</>;
  }

  // Show loading fallback while loading
  if (isLoading) {
    return <>{loadingFallback}</>;
  }

  let hasAccess = false;

  // ABAC-style check with data context
  if (resource && action) {
    hasAccess = can(resource, action, data, user);
  }
  // Legacy RBAC checks
  else if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  } else {
    // No permission specified, allow access
    hasAccess = true;
  }

  // Handle redirect when access is denied
  if (!hasAccess && redirectTo) {
    // Only redirect on the client side, not during SSR
    if (typeof window !== "undefined") {
      router.push(redirectTo);
    }
    return fallback;
  }

  return hasAccess ? children : fallback;
}
