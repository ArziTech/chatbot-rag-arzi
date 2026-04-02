# Authorization HOC (Higher-Order Component)

Protect entire pages/components with authentication and permission checks.

## Usage

```tsx
import { WithAuth, withHasAnyPermission, withHasAllPermissions } from "@/components/global/authorization/withPermissions";

// Require authentication only
const ProtectedPage = WithAuth(MyPage);

// Require specific permission
const ProtectedPage = WithAuth(MyPage, { permission: "users.view" });

// Require ANY of permissions (user needs at least one)
const ProtectedPage = withHasAnyPermission(MyPage, {
  permissions: ["users.edit", "users.manage"]
});

// Require ALL permissions (user needs all)
const ProtectedPage = withHasAllPermissions(MyPage, {
  permissions: ["users.create", "users.edit"]
});

// Custom redirect URLs
const ProtectedPage = WithAuth(MyPage, {
  permission: "users.view",
  redirectToLogin: "/auth/login?callbackUrl=/protected",
  redirectOnUnauthorized: "/access-denied"
});
```

## Dynamic Routes

For dynamic routes like `/dashboard/users/[id]/page.tsx`:

```tsx
import { WithAuthDynamic, withHasAnyPermissionDynamic, withHasAllPermissionsDynamic } from "@/components/global/authorization/withPermissions";

// Dynamic route - single permission
const ProtectedPage = WithAuthDynamic(UserDetailPage, {
  permission: "users.view"
});

// Dynamic route - any permission
const ProtectedPage = withHasAnyPermissionDynamic(UserEditPage, {
  permissions: ["users.edit", "users.manage"]
});

// Dynamic route - all permissions
const ProtectedPage = withHasAllPermissionsDynamic(UserDeletePage, {
  permissions: ["users.delete", "users.manage"]
});

// With custom redirects
const ProtectedPage = WithAuthDynamic(UserPage, {
  permission: "users.view",
  redirectToLogin: "/login",
  redirectOnUnauthorized: "/forbidden"
});
```

## Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `permission` | `string` | Required permission code | - |
| `permissions` | `string[]` | Array of permission codes (for any/all) | - |
| `redirectToLogin` | `string` | Custom login redirect URL | `/login` |
| `redirectOnUnauthorized` | `string` | Custom unauthorized redirect URL | `/dashboard?error=unauthorized` |

## API Reference

### WithAuth

Require authentication and optional single permission.

```tsx
WithAuth(Component, { permission?: string })
```

### withHasAnyPermission

Require authentication and ANY of the specified permissions (OR logic).

```tsx
withHasAnyPermission(Component, { permissions: string[] })
```

### withHasAllPermissions

Require authentication and ALL of the specified permissions (AND logic).

```tsx
withHasAllPermissions(Component, { permissions: string[] })
```

### Dynamic Variants

For routes with `params` and `searchParams`:

- `WithAuthDynamic`
- `withHasAnyPermissionDynamic`
- `withHasAllPermissionsDynamic`
