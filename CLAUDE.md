# 🚨 STOP! READ THIS FIRST! 🚨

@AGENTS.md

## ⚠️ MANDATORY REQUIREMENT

**BEFORE writing ANY code, you MUST:**

1. **Read ALL rules in `rules/` folder** - This is NOT optional
2. **Understand Feature-Based Architecture** - Code must follow this pattern
3. **Check existing features** - Follow the exact same patterns
4. **Follow ALL rules** - No exceptions, no shortcuts

### Rules Location
```
.claude/rules/
├── feature-based-architecture-rules.md  # ⚠️ READ FIRST
├── data-access-layer-rules.md           # ⚠️ CRITICAL
├── fetching-rules.md                    # ⚠️ IMPORTANT
├── prefer-server-action-than-api.md     # ⚠️ IMPORTANT
├── tanstack-query-rules.md              # ⚠️ IMPORTANT
└── abac.md                               # ⚠️ CRITICAL
```

### Quick Reference to Rules
```bash
# Read feature-based architecture rules
cat rules/feature-based-architecture-rules.md

# List all rules
ls -la rules/

# Read all rules before coding
for file in rules/*.md; do echo "=== $file ==="; cat "$file"; echo ""; done
```

---

# Claude Code Project Instructions

## Project Overview

**Arzi StarterKit** - A production-ready Next.js 16 fullstack starter kit with RBAC, feature-based architecture, and Docker deployment.

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Runtime**: Bun (preferred over npm)
- **Architecture**: Feature-Based Architecture (FBA)
- **Database**: PostgreSQL with Prisma v7
- **Authentication**: NextAuth v5 with JWT sessions
- **UI**: shadcn/ui components with Tailwind CSS v4

## ⚠️ MANDATORY: Project Rules

**CRITICAL**: You MUST read and follow ALL rules defined in the `rules/` folder before writing any code.

### Available Rules

The following rules files in `rules/` are **MANDATORY** for all development:

| Rule File | Purpose | Priority |
|-----------|---------|----------|
| `feature-based-architecture-rules.md` | Feature-based code organization | **CRITICAL** |
| `data-access-layer-rules.md` | Database & API layer patterns | **CRITICAL** |
| `fetching-rules.md` | Data fetching guidelines | **HIGH** |
| `prefer-server-action-than-api.md` | When to use Server Actions vs API routes | **HIGH** |
| `tanstack-query-rules.md` | TanStack Query usage patterns | **HIGH** |
| `rbac.md` | Role-Based Access Control implementation | **CRITICAL** |

### How to Apply Rules

**Before starting ANY task:**

1. **Read relevant rules** in the `rules/` folder
2. **Check existing features** that implement similar patterns
3. **Follow the exact patterns** shown in rules and existing code
4. **Ask if uncertain** - never guess

### Quick Rule References

```bash
# Read a specific rule
cat rules/feature-based-architecture-rules.md

# List all rules
ls -la rules/

# Search for specific pattern in rules
grep -r "pattern" rules/
```

### Rules Summary

- **Feature-Based Architecture**: All domain code MUST be in `src/features/`
- **Data Access Layer**: Use Server Actions over API routes when possible
- **Fetching**: Use TanStack Query for client-side data fetching
- **RBAC**: All protected features must use permission gates
- **Query Keys**: Follow strict query key factory patterns

## Critical Architecture Rules

This project follows **Feature-Based Architecture**. You MUST follow these rules:

### Rule 1: Organize Code by Features

All domain logic MUST be in `src/features/` folders:

```
src/features/
  ├── auth/          # Authentication
  ├── permissions/   # Permissions management
  ├── dashboard/     # Dashboard & navigation
  ├── users/         # User management
  ├── roles/         # Role management
  └── settings/      # Settings
```

**DO NOT** create domain logic in global folders like:
- `src/components/users/` ❌
- `src/services/` ❌
- `src/api/` ❌

### Rule 2: Features Must Be Self-Contained

Each feature folder contains:
```
features/
  example-feature/
    ├── api/           # Server actions/API calls
    ├── components/    # Feature-specific UI
    ├── hooks/         # Feature-specific hooks
    ├── queries/       # TanStack Query queries
    ├── mutations/     # TanStack Query mutations
    ├── types.ts       # TypeScript types
    ├── keys.ts        # Query key factories
    └── index.ts       # Public API exports
```

### Rule 3: Use Public API Pattern

Each feature MUST have an `index.ts` that exports its public API:

```ts
// features/users/index.ts
export * from "./components/users-table";
export * from "./queries/users.query";
export * from "./mutations/create-user.mutation";
export * from "./types";
export * from "./keys";
```

**Imports MUST use the public API:**
```tsx
// ✅ GOOD
import { UsersTable } from "@/features/users";

// ❌ BAD
import { UsersTable } from "@/features/users/components/users-table";
```

### Rule 4: Shared Code Location

**Shared components** → `src/shared/components/`
**Shared hooks** → `src/shared/hooks/`

Examples:
- `src/shared/components/dynamic-breadcrumb.tsx`
- `src/shared/hooks/use-debounce.ts`

### Rule 5: Data Layer in Features

All data fetching MUST be in the feature:

```ts
// features/users/api/get-users.ts
export async function getUsers() {
  // Implementation
}

// features/users/queries/users.query.ts
export const usersQuery = () => ({
  queryKey: userKeys.list(),
  queryFn: async () => {
    const data = await getUsers();
    return data;
  },
});
```

### Rule 6: No Circular Dependencies

Features can only import from:
- Their own subdirectories
- `src/shared/`
- `src/lib/` (infrastructure only)

Features CANNOT import from other features.

## File Organization

### App Router Structure

```
src/app/
  ├── (auth)/              # Auth route group
  │   ├── login/
  │   └── signup/
  ├── (dashboard)/         # Dashboard route group
  │   ├── layout.tsx      # Dashboard layout
  │   └── dashboard/
  │       ├── users/
  │       ├── roles/
  │       ├── permissions/
  │       └── settings/
  └── api/                # API routes
```

**IMPORTANT**: `app/` pages should ONLY import from features. No business logic in app routes.

### Component Organization

- **UI Components**: `src/components/ui/` (shadcn/ui)
- **Shared Components**: `src/shared/components/`
- **Feature Components**: `src/features/{feature}/components/`

## Coding Standards

### TypeScript

- Use strict mode
- All functions must have return types
- Prefer `interface` over `type` for object shapes
- Use `type` for unions, intersections, and primitives

```ts
// ✅ GOOD
interface User {
  id: string;
  name: string;
}

type UserRole = "admin" | "user" | "guest";

// ❌ BAD
type User = {
  id: string;
  name: string;
};
```

### Naming Conventions

**Files:**
- Components: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- Hooks: `use-{name}.ts` (e.g., `useUser.ts`)
- Utils: `kebab-case.ts` (e.g., `format-date.ts`)
- Types: `{name}.types.ts` or `{name}.type.ts`

**Code:**
- Variables/Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Types/Interfaces: `PascalCase`
- Enum members: `PascalCase`

### Component Structure

```tsx
// 1. Imports (grouped and sorted)
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/features/users";

// 2. Types/Interfaces
interface UserProps {
  userId: string;
}

// 3. Component
export function UserProfile({ userId }: UserProps) {
  // 3.1 Hooks (at the top)
  const { user, loading } = useUser(userId);
  const [isOpen, setIsOpen] = useState(false);

  // 3.2 Event handlers
  const handleClick = () => {
    setIsOpen(true);
  };

  // 3.3 Effects
  useEffect(() => {
    // Side effects
  }, [userId]);

  // 3.4 Render
  if (loading) return <Skeleton />;

  return <div>{user.name}</div>;
}
```

### Server vs Client Components

- Use `"use client"` for:
  - Interactive components (onClick, onChange, etc.)
  - Browser APIs (localStorage, window, etc.)
  - Third-party libraries requiring client-side

- Use server components (default) for:
  - Data fetching
  - Static content
  - Performance-critical renders

## Prisma Best Practices

### Schema Organization

- Use PascalCase for models
- Use descriptive field names
- Add indexes for frequently queried fields
- Use relations for foreign keys

```prisma
model User {
  id        String   @id @default(cuid())
  username  String   @unique
  email     String?  @unique
  roleId    Int
  role      Role     @relation(fields: [roleId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([username])
  @@index([email])
}
```

### Migrations

- **NEVER** modify existing migrations
- Always create new migrations for schema changes
- Use descriptive migration names
- Test migrations on development database first

```bash
bun prisma migrate dev --name add_user_preferences
```

### Seed Data

- Seed file: `prisma/seed/index.ts` (modular structure in `prisma/seed/` folder)
- Run with: `bun prisma db seed`
- Include only essential data
- Use transactions for data integrity

## Authentication & Authorization

### Permission Gates

Always use `PermissionGate` for permission-protected UI:

```tsx
import { PermissionGate } from "@/features/permissions";

function DeleteButton() {
  return (
    <PermissionGate permission="users.delete" fallback={<AccessDenied />}>
      <Button>Delete User</Button>
    </PermissionGate>
  );
}
```

### Server-Side Checks

Server actions MUST include permission checks:

```ts
"use server";

import { getServerSession } from "@/lib/auth";
import { hasPermission } from "@/features/permissions";

export async function deleteUser(userId: string) {
  const session = await getServerSession();

  if (!hasPermission(session, "users.delete")) {
    throw new Error("Unauthorized");
  }

  // Delete user logic
}
```

## State Management

### TanStack Query

- Use for server state
- Query keys in `features/{feature}/keys.ts`
- Queries in `features/{feature}/queries/`
- Mutations in `features/{feature}/mutations/`

```ts
// keys.ts
export const userKeys = {
  all: ["users"] as const,
  list: () => [...userKeys.all, "list"] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
};

// Query
export const useUsers = () => {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: fetchUsers,
  });
};
```

### Local State

- Use `useState` for component-local state
- Use `useReducer` for complex state logic
- Use Zustand for global state (if needed)

## Testing

### Test Structure

```
features/
  auth/
    components/
      login-form.tsx
      __tests__/
        login-form.test.tsx
```

### Testing Best Practices

- Test user behavior, not implementation
- Use screen queries by role/label (not test IDs)
- Mock external dependencies
- Keep tests simple and focused

```tsx
// ✅ GOOD
test("user can login with valid credentials", async () => {
  const user = userEvent.setup();
  render(<LoginForm />);

  await user.type(screen.getByLabelText(/username/i), "testuser");
  await user.type(screen.getByLabelText(/password/i), "password123");
  await user.click(screen.getByRole("button", { name: /login/i }));

  expect(signIn).toHaveBeenCalledWith({
    username: "testuser",
    password: "password123",
  });
});
```

## Git Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation changes
- `test/` - Adding/updating tests
- `chore/` - Maintenance tasks

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user profile page
fix: resolve permission gate not working
refactor: migrate users to feature-based architecture
docs: update deployment guide
test: add tests for login form
chore: upgrade dependencies
```

### Before Pushing

1. Run tests: `bun test`
2. Run linter: `bun lint`
3. Format code: `bun format`
4. Build project: `bun build`

## Common Tasks

### Adding a New Feature

1. Create feature folder:
```bash
mkdir -p src/features/new-feature/{api,components,hooks,queries,mutations,types,keys}
```

2. Create `index.ts` with public API exports

3. Add types in `types.ts`

4. Add query keys in `keys.ts`

5. Implement components in `components/`

6. Import using public API: `import { X } from "@/features/new-feature"`

### Adding a New Component

**Shared component** → `src/shared/components/`
**Feature component** → `src/features/{feature}/components/`
**UI component** → `src/components/ui/`

### Adding a New Hook

**Shared hook** → `src/shared/hooks/`
**Feature hook** → `src/features/{feature}/hooks/`

### Database Schema Changes

1. Update `prisma/schema.prisma`
2. Run migration: `bun prisma migrate dev --name describe_change`
3. Update types in feature if needed
4. Regenerate Prisma Client: `bun prisma generate`

### Adding API Route

Create in `src/app/api/`:
```
src/app/api/
  users/
    route.ts          # GET /api/users, POST /api/users
    [id]/
      route.ts        # GET /api/users/:id, PATCH /api/users/:id
```

## Important Files

### Configuration

- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `.env.example` - Environment variables template

### Architecture

- `rules/feature-based-architecture-rules.md` - **READ THIS FIRST**
- `REFACTORING_SUMMARY.md` - Recent architecture changes
- `DOCKER.md` - Docker deployment guide

### Documentation

- `README.md` - Project overview
- `CLAUDE.md` - This file (for Claude Code)

## Commands to Use

```bash
# Always use bun instead of npm
bun install          # Install dependencies
bun dev              # Start dev server
bun build            # Build for production
bun test             # Run tests
bun lint             # Run linter
bun format           # Format code

# Prisma
bun prisma generate  # Generate Prisma Client
bun prisma push      # Push schema changes
bun prisma migrate   # Run migrations
bun prisma studio    # Open Prisma Studio
bun prisma db seed   # Seed database

# Docker
make dev             # Start development environment
make build           # Build Docker images
make up              # Start containers
make down            # Stop containers
make logs            # View logs
make backup          # Backup database
```

## Project-Specific Patterns

### Permission Checking

```tsx
// Client-side
import { usePermission } from "@/features/permissions";

const { hasPermission } = usePermission();

// Server-side
import { hasServerPermission } from "@/lib/server-permissions";

const canDelete = await hasServerPermission("users.delete");
```

### Form Validation

```tsx
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
});

// ... use form with schema
```

### Error Handling

```tsx
// Async operations
try {
  await createPermission(data);
  toast.success("Permission created successfully");
} catch (error) {
  toast.error(error instanceof Error ? error.message : "Failed to create permission");
}
```

### Loading States

```tsx
import { Skeleton } from "@/components/ui/skeleton";

if (isLoading) return <Skeleton className="h-10 w-full" />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <EmptyState />;
```

## What NOT to Do

❌ **DON'T** create global service folders (`src/services/`, `src/api/`)
❌ **DON'T** import feature components directly (use public API)
❌ **DON'T** put business logic in `app/` routes
❌ **DON'T** use circular dependencies between features
❌ **DON'T** modify existing migrations
❌ **DON'T** commit `.env` files
❌ **DON'T** use npm (use bun)
❌ **DON'T** ignore TypeScript errors
❌ **DON'T** skip tests
❌ **DON'T** use `any` type

## Quick Reference

### Creating a New Page

```bash
# 1. Create page in app router
touch "src/app/(dashboard)/dashboard/new-page/page.tsx"

# 2. Import from features
# import { FeatureComponent } from "@/features/feature-name";

# 3. Implement page logic
```

### Adding Permissions

```prisma
// 1. Add to prisma/seed.ts
{
  code: "feature.action",
  label: "Action Name",
  module: "Feature",
  // ...
}

// 2. Run seed
bun prisma db seed

// 3. Use in components
<PermissionGate permission="feature.action">
  {/* Protected content */}
</PermissionGate>
```

### Docker Operations

```bash
# Development
make dev

# With database tools
make dev-tools

# Production
make prod

# Backup
make backup
```

## Environment Variables

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - NextAuth secret (min 32 chars)

**Optional but recommended:**
- `NEXT_PUBLIC_APP_NAME` - Application name
- `NEXT_PUBLIC_API_URL` - API base URL
- `REDIS_URL` - Redis connection string

## Getting Help

**STEPS TO FOLLOW WHEN YOU NEED HELP:**

1. **FIRST**: Check `rules/` folder for relevant rules
   - `rules/feature-based-architecture-rules.md` - Architecture guidelines
   - `rules/data-access-layer-rules.md` - Database/API patterns
   - `rules/fetching-rules.md` - Data fetching rules
   - `rules/prefer-server-action-than-api.md` - Server Actions vs API routes
   - `rules/tanstack-query-rules.md` - Query patterns
   - `rules/rbac.md` - Permission system rules

2. **SECOND**: Check existing features as examples
   - Look at similar features in `src/features/`
   - Follow the exact patterns used

3. **THIRD**: Check project documentation
   - `README.md` - Project overview
   - `DOCKER.md` - Deployment issues
   - `REFACTORING_SUMMARY.md` - Recent changes

4. **FOURTH**: Ask for clarification if still uncertain

### Rule Priority Matrix

| Situation | Check This Rule First |
|-----------|----------------------|
| Creating new feature | `feature-based-architecture-rules.md` |
| Adding API/database | `data-access-layer-rules.md` |
| Fetching data | `fetching-rules.md` + `tanstack-query-rules.md` |
| Server vs Client | `prefer-server-action-than-api.md` |
| Adding permissions | `rbac.md` |

## Summary

### Golden Rules (NEVER VIOLATE)

- **ALWAYS** read relevant rules in `rules/` folder before coding
- **ALWAYS** follow Feature-Based Architecture
- **ALWAYS** use public API imports from features
- **ALWAYS** use bun instead of npm
- **ALWAYS** use TypeScript strict mode
- **ALWAYS** write tests for new features
- **ALWAYS** follow naming conventions
- **ALWAYS** check rules/ folder when uncertain

### Never Do

- **NEVER** skip reading rules in `rules/` folder
- **NEVER** violate feature-based architecture rules
- **NEVER** use circular dependencies between features
- **NEVER** put business logic in `app/` routes
- **NEVER** skip proper error handling
- **NEVER** commit secrets or sensitive data
- **NEVER** ignore TypeScript errors
- **NEVER** use `any` type
