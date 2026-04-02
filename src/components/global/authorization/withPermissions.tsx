import { redirect } from "next/navigation";
import { hasServerPermission } from "@/features/permissions";
import { auth } from "@/lib/auth";
import { AuthorizationFallback } from "./authorization-fallback";

export interface WithAuthProps {
  user: {
    id: string;
    name: string | null;
    username: string;
    roleId: number;
  };
}

export interface WithAuthComponentProps {
  user: WithAuthProps["user"];
}

export interface WithAuthOptions {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  redirectToLogin?: string;
  redirectOnUnauthorized?: string;
}

/**
 * Higher-Order Component for protecting static routes
 * with server-side authentication and permission checking
 */
export function WithAuth<P extends WithAuthComponentProps>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {},
) {
  const {
    permission,
    permissions,
    requireAll = false,
    redirectToLogin = "/login",
  } = options;

  async function ProtectedComponent(props: Omit<P, "user">) {
    const session = await auth();

    if (!session?.user) {
      redirect(redirectToLogin);
    }

    // Build permission array
    const permissionList = permission ? [permission] : permissions || [];

    if (permissionList.length > 0) {
      const hasPermission = requireAll
        ? await checkAllPermissions(session.user.roleId, permissionList)
        : await checkAnyPermission(session.user.roleId, permissionList);

      if (!hasPermission) {
        return <AuthorizationFallback type="unauthorized" />;
      }
    }

    return <Component {...(props as P)} user={session.user} />;
  }

  ProtectedComponent.displayName = `WithAuth(${Component.displayName || Component.name})`;

  return ProtectedComponent;
}

/**
 * Higher-Order Component for protecting dynamic routes
 * with server-side authentication and permission checking
 */
export function WithAuthDynamic<P extends WithAuthComponentProps>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {},
) {
  return WithAuth(Component, options);
}

/**
 * Check if user has ALL permissions (AND logic)
 */
async function checkAllPermissions(
  roleId: number,
  permissions: string[],
): Promise<boolean> {
  for (const permission of permissions) {
    const hasPermission = await hasServerPermission(roleId, permission);
    if (!hasPermission) {
      return false;
    }
  }
  return true;
}

/**
 * Check if user has ANY permission (OR logic)
 */
async function checkAnyPermission(
  roleId: number,
  permissions: string[],
): Promise<boolean> {
  for (const permission of permissions) {
    const hasPermission = await hasServerPermission(roleId, permission);
    if (hasPermission) {
      return true;
    }
  }
  return false;
}

/**
 * HOC for requiring ANY permission (OR logic)
 */
export function withHasAnyPermission<P extends WithAuthComponentProps>(
  Component: React.ComponentType<P>,
  options: Omit<WithAuthOptions, "requireAll"> & { permissions: string[] },
) {
  return WithAuth(Component, { ...options, requireAll: false });
}

/**
 * HOC for requiring ALL permissions (AND logic)
 */
export function withHasAllPermissions<P extends WithAuthComponentProps>(
  Component: React.ComponentType<P>,
  options: Omit<WithAuthOptions, "requireAll"> & { permissions: string[] },
) {
  return WithAuth(Component, { ...options, requireAll: true });
}

/**
 * Dynamic variant for withHasAnyPermission
 */
export function withHasAnyPermissionDynamic<P extends WithAuthComponentProps>(
  Component: React.ComponentType<P>,
  options: Omit<WithAuthOptions, "requireAll"> & { permissions: string[] },
) {
  return WithAuthDynamic(Component, { ...options, requireAll: false });
}

/**
 * Dynamic variant for withHasAllPermissions
 */
export function withHasAllPermissionsDynamic<P extends WithAuthComponentProps>(
  Component: React.ComponentType<P>,
  options: Omit<WithAuthOptions, "requireAll"> & { permissions: string[] },
) {
  return WithAuthDynamic(Component, { ...options, requireAll: true });
}
