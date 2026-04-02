# ABAC (Attribute-Based Access Control) Rules

## Overview

This project uses a hybrid ABAC (Attribute-Based Access Control) system that combines:
- **Static permissions** (boolean) for simple role-based access
- **Dynamic permissions** (functions) for attribute-based context checks
- **Database-driven** permission assignments (role-permission mappings in Prisma)
- **Code-based** permission structure (TypeScript types for compile-time safety)

This approach provides the best of both worlds: flexible runtime permission management with full type safety.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Type Definitions                        │
│  src/features/permissions/types/abac.ts                      │
│  - Permissions interface (resources + actions)               │
│  - ABACUser type (subject attributes)                       │
│  - PermissionCheck type (boolean | function)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Role Permission Rules                      │
│  src/features/permissions/rules/role-rules.ts               │
│  - ROLE_PERMISSIONS constant (as const satisfies)           │
│  - Permission rules for admin, user, moderator roles        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Permission Evaluation                       │
│  src/features/permissions/actions/evaluate-permission.ts    │
│  - hasPermission(user, resource, action, data?)             │
│  - hasAnyPermission, hasAllPermissions                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Concepts

### 1. Permissions Type

The `Permissions` interface defines all resources and their available actions:

```typescript
// src/features/permissions/types/abac.ts
interface Permissions {
  users: {
    dataType: UserData;
    action: "view" | "create" | "edit" | "delete";
  };
  dashboard: {
    dataType: null;
    action: "view";
  };
  // Add new resources here
}
```

### 2. ABACUser (Subject Attributes)

```typescript
interface ABACUser {
  id: string;
  roles: string[];
  blockedBy?: string[];
}
```

### 3. PermissionCheck (Boolean or Function)

```typescript
type PermissionCheck<Key extends keyof Permissions> =
  | boolean                              // Static permission
  | ((user: ABACUser, data: Permissions[Key]["dataType"]) => boolean);  // Dynamic
```

---

## Defining Permissions

### Static Permission (Boolean)

Use `true` or `false` for permissions that don't need context:

```typescript
// role-rules.ts
const USER_PERMISSIONS = {
  users: {
    view: true,      // All users can view
    create: true,    // All users can create
    delete: false,   // No users can delete
  },
} as const satisfies RolePermissions;
```

### Dynamic Permission (Function)

Use a function for context-aware permission checks:

```typescript
// Example: Ownership check
users: {
  edit: (user: ABACUser, data: UserData | null) => {
    if (!data) return false;
    return user.id === data.id;  // Only owner can edit
  },
}

// Example: Blocked users check
comments: {
  view: (user: ABACUser, data: { authorId: string } | null) => {
    if (!data) return true;
    return !user.blockedBy?.includes(data.authorId);
  },
}
```

---

## Role Permission Rules

### Admin Role

```typescript
const ADMIN_PERMISSIONS = {
  users: { view: true, create: true, edit: true, delete: true },
  roles: { view: true, create: true, edit: true, delete: true },
  dashboard: { view: true },
  permissions: { view: true, manage: true },
  settings: { view: true },
} as const satisfies RolePermissions;
```

**Note:** Admin has `byPassAllFeatures: true` in the database, which provides complete bypass.

### User Role

```typescript
const USER_PERMISSIONS = {
  users: {
    view: true,
    create: true,
    edit: (user, data) => user.id === data?.id,  // Ownership check
    delete: false,
  },
  roles: { view: true, create: false, edit: false, delete: false },
  dashboard: { view: true },
  permissions: { view: true, manage: false },
  settings: { view: true },
} as const satisfies RolePermissions;
```

### Moderator Role

```typescript
const MODERATOR_PERMISSIONS = {
  users: { view: true, create: true, edit: true, delete: true },
  roles: { view: true, create: true, edit: true, delete: false },
  dashboard: { view: true },
  permissions: { view: true, manage: false },
  settings: { view: true },
} as const satisfies RolePermissions;
```

---

## Using hasPermission

### Basic Usage (Boolean Check)

```typescript
import { hasPermission } from "@/features/permissions";

// Check if user can view dashboard
const canView = hasPermission(user, "dashboard", "view");
// Returns: true if user.role includes "dashboard.view"
```

### With Data Context (ABAC Check)

```typescript
import { hasPermission } from "@/features/permissions";

// Check if user can edit a specific user
const user: ABACUser = { id: "1", roles: ["user"], blockedBy: [] };
const targetUser: UserData = { id: "2", name: "Other", ... };

const canEdit = hasPermission(user, "users", "edit", targetUser);
// Returns: false because user.id !== targetUser.id
```

### Multiple Roles (OR Logic)

```typescript
const multiRoleUser: ABACUser = { id: "1", roles: ["user", "moderator"] };

// Returns true if ANY role grants permission
hasPermission(multiRoleUser, "users", "delete");  // moderator can delete
```

---

## Server Actions

### ABAC Server Permission Check

```typescript
"use server";

import { hasServerPermissionABAC } from "@/features/permissions";
import type { UserData } from "@/features/permissions/types/abac";

export async function updateUser(
  userId: string,
  targetUserId: string,
  data: Partial<UserData>
) {
  // Fetch target user data for context
  const targetUser = await getUserById(targetUserId);

  // ABAC check with data context
  const canEdit = await hasServerPermissionABAC(
    userId,
    "users",
    "edit",
    targetUser
  );

  if (!canEdit) {
    throw new Error("Unauthorized");
  }

  // Proceed with update
  return prisma.user.update({ where: { id: targetUserId }, data });
}
```

---

## Client-Side Hook

```typescript
"use client";

import { usePermission } from "@/features/permissions";

function UserEditButton({ userId, userData }) {
  const { can } = usePermission();

  // Boolean permission check
  const canCreate = can("users", "create");

  // ABAC permission check with data context
  const canEditThisUser = can("users", "edit", userData);

  if (!canCreate) return null;

  return (
    <Button>
      {canEditThisUser ? "Edit" : "View"}
    </Button>
  );
}
```

---

## Adding New Resources

### Step 1: Add to Permissions Type

```typescript
// src/features/permissions/types/abac.ts
interface Permissions {
  // Existing resources...
  posts: {
    dataType: PostData;
    action: "view" | "create" | "edit" | "delete";
  };
}
```

### Step 2: Define Permission Rules

```typescript
// src/features/permissions/rules/role-rules.ts
const USER_PERMISSIONS = {
  // Existing permissions...
  posts: {
    view: true,
    create: true,
    edit: (user, post) => user.id === post?.authorId,
    delete: (user, post) => user.id === post?.authorId,
  },
} as const satisfies RolePermissions;
```

### Step 3: Use in Code

```typescript
hasPermission(user, "posts", "create");
hasPermission(user, "posts", "edit", postData);
```

---

## Best Practices

### 1. Always Use Type-Safe Imports

```typescript
// ✅ Good
import { hasPermission } from "@/features/permissions";
import type { ABACUser } from "@/features/permissions/types/abac";

// ❌ Bad
import { hasPermission } from "@/features/permissions/actions/evaluate-permission";
```

### 2. Provide Data Context When Required

```typescript
// ✅ Good - providing data for ABAC check
hasPermission(user, "users", "edit", userData);

// ❌ Bad - ABAC function requires data but none provided
hasPermission(user, "users", "edit");  // Will return false!
```

### 3. Handle Missing Data in ABAC Functions

```typescript
// ✅ Good - explicitly handle null/undefined
edit: (user, data) => {
  if (!data) return false;
  return user.id === data.id;
},

// ❌ Bad - may cause runtime errors
edit: (user, data) => user.id === data.id,  // Crashes if data is null
```

### 4. Use OR Logic for Multi-Role (Any Role Can Grant Access)

```typescript
// hasPermission uses "some" - if ANY role has permission, access is granted
const multiRoleUser: ABACUser = { id: "1", roles: ["user", "moderator"] };
hasPermission(multiRoleUser, "users", "delete");  // true if moderator can delete
```

### 5. Keep ABAC Functions Pure

```typescript
// ✅ Good - pure function, no side effects
edit: (user, data) => user.id === data?.id,

// ❌ Bad - side effects in permission check
edit: (user, data) => {
  console.log("Checking permission");  // Side effect!
  return user.id === data?.id;
}
```

---

## Common Patterns

### Ownership Check

```typescript
edit: (user, data) => user.id === data?.authorId,
delete: (user, data) => user.id === data?.authorId && data?.status === "draft",
```

### Role-Based Override

```typescript
// Moderators can do X, users can only do X to their own resources
edit: (user, data) =>
  user.roles.includes("moderator") ||
  user.id === data?.authorId,
```

### Team/Collaborator Access

```typescript
edit: (user, data) =>
  user.id === data?.authorId ||
  data?.collaborators.includes(user.id),
```

### Time-Based Access

```typescript
view: (user, data) =>
  data?.publishedAt < new Date() ||
  user.id === data?.authorId,
```

### Status-Based Access

```typescript
delete: (user, data) =>
  user.roles.includes("admin") ||
  (user.id === data?.authorId && data?.status === "draft"),
```

---

## File Structure

```
src/features/permissions/
├── types/
│   └── abac.ts                    # Core ABAC type definitions
├── rules/
│   └── role-rules.ts              # Role permission configurations
├── actions/
│   ├── has-permission.ts          # Legacy server actions (DB-based)
│   └── evaluate-permission.ts     # NEW ABAC evaluation functions
├── hooks/
│   └── use-permission.ts          # Client hook (updated for ABAC)
├── __tests__/
│   ├── fixtures/
│   │   └── abac.ts                # Test user fixtures
│   ├── evaluate-permission.test.ts
│   └── role-rules.test.ts
└── index.ts                       # Public API exports
```

---

## Migration Notes

### From RBAC to ABAC

The system maintains backward compatibility:

1. **Existing `hasServerPermission(roleId, permission)`** - Still works, uses database
2. **New `hasServerPermissionABAC(userId, resource, action, data?)`** - Uses ABAC rules
3. **Existing `PermissionGate` component** - Works unchanged
4. **Existing `WithAuth` HOCs** - Work unchanged

### When to Use ABAC vs RBAC

| Scenario | Approach |
|----------|----------|
| Simple role-based check (admin can access X) | RBAC (`hasServerPermission`) |
| Ownership check (user can edit their own data) | ABAC (`hasPermission` with data) |
| Context-dependent (blocked users can't view) | ABAC (`hasPermission` with data) |
| Static permissions (dashboard.view) | Either works |

---

## Testing

Run ABAC tests:

```bash
bun run test:run src/features/permissions/__tests__/
```

Test files:
- `evaluate-permission.test.ts` - Core function tests
- `role-rules.test.ts` - Configuration tests
- `fixtures/abac.ts` - Reusable test fixtures
