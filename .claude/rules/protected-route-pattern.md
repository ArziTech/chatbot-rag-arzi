# Protected Route Pattern Rules

## Purpose

This document defines the **mandatory pattern** for implementing protected routes in the application. All protected routes must follow this pattern to ensure consistent security and authorization across the codebase.

## Overview

Protected routes require authentication and/or permission checks before allowing access. This pattern provides:

- Server-side authentication checking
- Server-side permission checking
- Configurable redirect behavior
- Support for both static and dynamic routes

---

## Architecture

```
Request → Auth Check → Permission Check → Component Render
                ↓              ↓
           Redirect to    Redirect to
           Login Page     Unauthorized Page
```

---

## Rule 1 — Use Authorization HOC for Page Protection

All protected pages MUST use the authorization HOCs from `@/components/global/authorization/withPermissions`.

**Required Import:**

```ts
import {
  WithAuth,
  WithAuthDynamic,
  withHasAnyPermission,
  withHasAnyPermissionDynamic,
  withHasAllPermissions,
  withHasAllPermissionsDynamic
} from "@/components/global/authorization/withPermissions";
```

---

## Rule 2 — Use Static HOC for Static Routes

For routes without dynamic parameters (`[id]`, `[slug]`, etc.):

```ts
// src/app/dashboard/users/page.tsx
import { WithAuth } from "@/components/global/authorization/withPermissions";

function UsersPage() {
  return <div>Users List</div>;
}

export default WithAuth(UsersPage, { permission: "users.view" });
```

---

## Rule 3 — Use Dynamic HOC for Dynamic Routes

For routes with dynamic parameters:

```ts
// src/app/dashboard/users/[id]/page.tsx
import { WithAuthDynamic } from "@/components/global/authorization/withPermissions";

function UserDetailPage({ params }: { params: { id: string } }) {
  return <div>User ID: {params.id}</div>;
}

export default WithAuthDynamic(UserDetailPage, { permission: "users.view" });
```

---

## Rule 4 — Permission Options

### Single Permission

```ts
WithAuth(Component, { permission: "users.view" });
```

### ANY Permissions (OR Logic)

```ts
withHasAnyPermission(Component, {
  permissions: ["users.edit", "users.manage"]
});
```

### ALL Permissions (AND Logic)

```ts
withHasAllPermissions(Component, {
  permissions: ["users.create", "users.edit"]
});
```

---

## Rule 5 — Custom Redirects

All HOCs support custom redirect URLs:

```ts
WithAuth(Component, {
  permission: "users.view",
  redirectToLogin: "/auth/login?callbackUrl=/protected",
  redirectOnUnauthorized: "/access-denied"
});
```

| Option | Description | Default |
|--------|-------------|---------|
| `redirectToLogin` | Redirect when not authenticated | `/login` |
| `redirectOnUnauthorized` | Redirect when permission denied | `/dashboard?error=unauthorized` |

---

## Rule 6 — Use Server Actions for Programmatic Checks

For non-route protection (e.g., buttons, conditional rendering):

```ts
import {
  hasServerPermission,
  hasAnyServerPermission,
  hasAllServerPermissions
} from "@/features/permissions";

// Single permission
const canDelete = await hasServerPermission(roleId, "users.delete");

// Any permission (OR)
const canEdit = await hasAnyServerPermission(roleId, ["users.edit", "users.manage"]);

// All permissions (AND)
const canManage = await hasAllServerPermissions(roleId, ["users.create", "users.edit", "users.delete"]);
```

---

## Rule 7 — Use PermissionGate for Component-Level Protection

For protecting UI elements within a page:

```tsx
import { PermissionGate } from "@/features/permissions";

function UsersTable() {
  return (
    <table>
      {/* ... */}
      <td>
        <PermissionGate permission="users.delete">
          <DeleteButton />
        </PermissionGate>
      </td>
    </table>
  );
}
```

---

## Rule 8 — Never Bypass Authentication

**NEVER** do the following:

```ts
// ❌ BAD - No auth check
export default function Page() { ... }

// ❌ BAD - Client-side only check (can be bypassed)
const { hasPermission } = usePermission();
if (!hasPermission("users.view")) return null;

// ❌ BAD - Hardcoded permission
if (user.roleId !== 1) redirect("/");
```

**ALWAYS** use server-side HOCs:

```ts
// ✅ GOOD - Server-side auth check
export default WithAuth(Page);

// ✅ GOOD - Server-side permission check
export default WithAuth(Page, { permission: "users.view" });
```

---

## Rule 9 — Dynamic Route Variants

Use the correct HOC variant based on your route:

| Route Type | HOC to Use |
|------------|------------|
| Static (`/dashboard/users`) | `WithAuth` |
| Dynamic (`/dashboard/users/[id]`) | `WithAuthDynamic` |
| With Query Params (`/dashboard/users?status=active`) | `WithAuthDynamic` |

---

## Rule 10 — Export Protected Pages as Default

Always export the protected component as default:

```ts
// ✅ CORRECT
export default WithAuth(UsersPage);

// ❌ WRONG - Named export
export const ProtectedUsersPage = WithAuth(UsersPage);
```

---

## Decision Matrix

Use this matrix to choose the right protection method:

| Scenario | Solution |
|----------|----------|
| Protect entire page | HOC (`WithAuth`, `WithAuthDynamic`) |
| Protect a button/element | `PermissionGate` component |
| Check permission in server action | `hasServerPermission()` |
| Check permission in client component | `usePermission()` hook |
| Conditional rendering in server component | `hasServerPermission()` |

---

## Summary

- ✅ Use **HOCs** for page-level protection
- ✅ Use **Dynamic HOCs** for routes with params/searchParams
- ✅ Use **PermissionGate** for component-level protection
- ✅ Use **Server Actions** for programmatic checks
- ❌ Never rely solely on client-side permission checks
- ❌ Never hardcode permission logic
