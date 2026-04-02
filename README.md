# Arzi StarterKit

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)

A production-ready Next.js 16 fullstack starter kit with RBAC (Role-Based Access Control), feature-based architecture, and Docker deployment support.

## 🚀 Features

- ✅ **Modern Stack** - Built with Next.js 16, TypeScript 5, and Tailwind CSS v4
- ✅ **Feature-Based Architecture** - Scalable and maintainable codebase structure
- ✅ **RBAC System** - Complete role-based access control with permissions
- ✅ **Authentication** - NextAuth v5 integration with JWT sessions
- ✅ **Database** - PostgreSQL with Prisma ORM v7
- ✅ **UI Components** - Pre-built shadcn/ui components
- ✅ **Testing** - Vitest for unit testing with full test coverage
- ✅ **Docker Support** - Multi-environment Docker deployment (dev/staging/prod)
- ✅ **Type Safety** - Fully typed TypeScript codebase
- ✅ **Developer Experience** - Hot reload, ESLint, Prettier, Husky pre-commit hooks

## 📦 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) with App Router |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Runtime** | [Bun](https://bun.sh/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) |
| **State Management** | [TanStack Query](https://tanstack.com/query) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) |
| **ORM** | [Prisma v7](https://www.prisma.io/) |
| **Authentication** | [NextAuth v5](https://authjs.dev/) |
| **Validation** | [Zod](https://zod.dev/) |
| **Testing** | [Vitest](https://vitest.dev/) + Testing Library |
| **Git Hooks** | [Husky](https://github.com/typicode/husky) + lint-staged |
| **Deployment** | Docker + Docker Compose |

## 🏗️ Architecture

This project follows **Feature-Based Architecture** for better scalability and maintainability.

```
src/
├── features/          # Feature-based organization
│   ├── auth/         # Authentication (login, signup)
│   ├── permissions/  # Permissions management
│   ├── dashboard/    # Dashboard & navigation
│   ├── users/        # User management
│   ├── roles/        # Role management
│   └── settings/     # Settings
├── shared/           # Shared code across features
│   ├── components/   # Reusable components
│   └── hooks/        # Reusable hooks
├── lib/              # Infrastructure code
├── app/              # Next.js app router pages
└── types/            # Global type definitions
```

### Architecture Rules

All code must follow the principles defined in `rules/feature-based-architecture-rules.md`:

1. **Code organized by feature** - Each feature is self-contained
2. **Public API pattern** - Features export via `index.ts`
3. **No circular dependencies** - Features only depend on shared code
4. **Type safety** - Every feature has its own types
5. **Query keys** - Each feature has its own query key factory

## 🛠️ Installation

### Prerequisites

- Node.js 20+ (or [Bun](https://bun.sh/))
- PostgreSQL 14+
- Docker (optional, for containerized deployment)

### Clone & Install

```bash
# Clone the repository
git clone https://github.com/ArziTech/nextjs-arzi-starterkit.git
cd nextjs-arzi-starterkit

# Install dependencies
bun install

# Copy environment file
cp .env.example .env

# Generate Prisma Client
bun prisma generate

# Run database migrations
bun prisma db push

# Seed database (optional)
bun prisma db seed
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/arzi?schema=public"

# NextAuth
AUTH_SECRET="your-secret-minimum-32-characters"
NEXTAUTH_URL="http://localhost:3000"

# App
NODE_ENV="development"
NEXT_PUBLIC_APP_NAME="Arzi StarterKit"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 🚦 Getting Started

### Development Mode

```bash
# Start development server
bun dev

# Or with npm
npm run dev

# Or with Docker
make dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

```bash
# Development
bun dev              # Start development server
bun build            # Build for production
bun start            # Start production server

# Database
bun prisma generate  # Generate Prisma Client
bun prisma push      # Push schema to database
bun prisma migrate   # Run migrations
bun prisma seed      # Seed database
bun prisma studio    # Open Prisma Studio

# Testing
bun test             # Run tests
bun test:watch       # Run tests in watch mode
bun test:coverage    # Run tests with coverage

# Linting & Formatting
bun lint             # Run ESLint
bun lint:fix         # Fix ESLint errors
bun format           # Format code with Prettier
```

## 🐳 Docker Deployment

This project includes complete Docker configuration for all environments.

### Quick Start with Docker

```bash
# Copy Docker environment file
cp .env.docker.example .env

# Start development environment
make dev

# Deploy to staging
make staging

# Deploy to production
make prod
```

### Docker Commands

```bash
make build           # Build Docker images
make up              # Start containers
make down            # Stop containers
make logs            # View logs
make backup          # Backup database
make clean           # Remove all containers
make health          # Check container health
```

For detailed Docker instructions, see [DOCKER.md](./DOCKER.md)

## 📁 Project Structure

```
nextjs-arzi-starterkit/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── (auth)/            # Auth routes (login, signup)
│   │   ├── (dashboard)/       # Dashboard routes
│   │   ├── api/               # API routes
│   │   └── layout.tsx         # Root layout
│   ├── features/              # Feature-based modules
│   │   ├── auth/             # Authentication feature
│   │   ├── permissions/      # Permissions feature
│   │   ├── dashboard/        # Dashboard feature
│   │   ├── users/            # Users feature
│   │   ├── roles/            # Roles feature
│   │   └── settings/         # Settings feature
│   ├── shared/               # Shared components & hooks
│   │   ├── components/       # Reusable components
│   │   └── hooks/            # Reusable hooks
│   ├── components/           # UI components
│   │   └── ui/               # shadcn/ui components
│   ├── lib/                  # Utility functions
│   ├── providers/            # React providers
│   ├── hooks/                # Global hooks
│   └── types/                # TypeScript types
├── prisma/                   # Prisma ORM
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Database seed
├── docker/                   # Docker configuration
├── nginx/                    # Nginx configuration
├── public/                   # Static assets
├── rules/                    # Architecture rules
├── .env.example             # Environment template
├── Dockerfile               # Docker configuration
├── docker-compose.yml       # Docker Compose (dev)
├── Makefile                 # Convenient commands
└── README.md                # This file
```

## 🔐 Authentication & Authorization

### NextAuth v5 Setup

The project uses NextAuth v5 for authentication with the following configuration:

- **Strategy**: Credentials (username/password)
- **Session**: JWT-based
- **Password Hashing**: bcrypt
- **Protected Routes**: Middleware-based route protection

### Hybrid RBAC/ABAC Permission System

This project implements a **hybrid permission system** combining:

- **RBAC (Role-Based Access Control)**: Static permissions stored in database
- **ABAC (Attribute-Based Access Control)**: Dynamic, context-aware permissions defined in code

#### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Type Definitions                          │
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
│  src/features/permissions/actions/evaluate-permission.ts     │
│  - hasPermission(user, resource, action, data?)             │
│  - hasAnyPermission, hasAllPermissions                       │
└─────────────────────────────────────────────────────────────┘
```

#### Core Concepts

**1. Permissions Type**

The `Permissions` interface defines all resources and their available actions:

```typescript
interface Permissions {
  users: {
    dataType: UserData;
    action: "view" | "create" | "edit" | "delete";
  };
  dashboard: {
    dataType: null;
    action: "view";
  };
}
```

**2. ABACUser (Subject Attributes)**

```typescript
interface ABACUser {
  id: string;
  roles: string[];
  blockedBy?: string[];
}
```

**3. PermissionCheck (Boolean or Function)**

```typescript
type PermissionCheck<Key extends keyof Permissions> =
  | boolean                              // Static permission
  | ((user: ABACUser, data: DataType) => boolean);  // Dynamic ABAC
```

#### Static vs Dynamic Permissions

**Static Permission (Boolean)** - For permissions that don't need context:

```typescript
const ADMIN_PERMISSIONS = {
  users: { view: true, create: true, edit: true, delete: true },
  dashboard: { view: true },
} as const;
```

**Dynamic Permission (Function)** - For context-aware checks like ownership:

```typescript
const USER_PERMISSIONS = {
  users: {
    // Users can only edit their own profile
    edit: (user: ABACUser, data: UserData | null) => {
      if (!data) return false;
      return user.id === data.id;
    },
    delete: false,
  },
} as const;
```

#### Using hasPermission

**Basic Usage (Boolean Check)**:

```typescript
import { hasPermission } from "@/features/permissions";

const canViewDashboard = hasPermission(user, "dashboard", "view");
// Returns: true if any of user's roles grants dashboard.view
```

**With Data Context (ABAC Check)**:

```typescript
const user: ABACUser = { id: "1", roles: ["user"] };
const targetUser: UserData = { id: "2", name: "John", ... };

const canEdit = hasPermission(user, "users", "edit", targetUser);
// Returns: false because user.id !== targetUser.id (ownership check)
```

**Multiple Roles (OR Logic)**:

```typescript
const multiRoleUser: ABACUser = { id: "1", roles: ["user", "moderator"] };

// Returns true if ANY role grants permission
hasPermission(multiRoleUser, "users", "delete");  // moderator can delete
```

#### Server-Side Permission Checks

```typescript
"use server";

import { hasServerPermissionABAC } from "@/features/permissions";

export async function updateUser(userId: string, data: Partial<UserData>) {
  const targetUser = await getUserById(userId);

  const canEdit = await hasServerPermissionABAC(
    currentUserId,
    "users",
    "edit",
    targetUser
  );

  if (!canEdit) {
    throw new Error("Unauthorized");
  }

  return prisma.user.update({ where: { id: userId }, data });
}
```

#### Client-Side Hook

```typescript
"use client";

import { usePermission } from "@/features/permissions";

function UserEditButton({ userId, userData }) {
  const { can } = usePermission();

  // Boolean permission check
  const canCreate = can("users", "create");

  // ABAC permission check with data context
  const canEditThisUser = can("users", "edit", userData);

  return canCreate ? <Button>Edit</Button> : <Button disabled>View</Button>;
}
```

#### PermissionGate Component

For component-level protection:

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

#### Checking Permissions Programmatically (Legacy RBAC)

```tsx
import { usePermission } from "@/features/permissions";

function MyComponent() {
  const { hasPermission } = usePermission();

  const handleDelete = () => {
    if (hasPermission("users.delete")) {
      // Perform delete action
    }
  };
}
```

#### Adding New Resources

**Step 1**: Add to `Permissions` type in `src/features/permissions/types/abac.ts`:

```typescript
interface Permissions {
  // Existing resources...
  posts: {
    dataType: PostData;
    action: "view" | "create" | "edit" | "delete";
  };
}
```

**Step 2**: Define permission rules in `src/features/permissions/rules/role-rules.ts`:

```typescript
const USER_PERMISSIONS = {
  // Existing permissions...
  posts: {
    view: true,
    create: true,
    edit: (user, post) => user.id === post?.authorId,  // Ownership
    delete: (user, post) => user.id === post?.authorId,
  },
} as const satisfies RolePermissions;
```

**Step 3**: Use in code:

```typescript
hasPermission(user, "posts", "create");
hasPermission(user, "posts", "edit", postData);
```

#### Database RBAC vs Code-Based ABAC

| Aspect | Database RBAC | Code-Based ABAC |
|--------|---------------|-----------------|
| Storage | Prisma/PostgreSQL | TypeScript files |
| Flexibility | Runtime changes | Compile-time safety |
| Use Case | Admin-configurable | Fixed business rules |
| Speed | Slower (query needed) | Faster (in-memory) |
| Examples | `hasServerPermission()` | `hasPermission()` |

The system maintains backward compatibility - both approaches work together.

## 🧪 Testing

The project uses Vitest for testing with React Testing Library.

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test:watch

# Run tests with coverage
bun test:coverage

# Run specific test file
bun test users.test.ts
```

### Test Structure

```
src/
├── __tests__/            # Global test utilities
├── features/
│   └── auth/
│       └── components/
│           └── __tests__/  # Feature-specific tests
└── components/
    └── __tests__/         # Component tests
```

## 📝 Code Quality

### ESLint & Prettier

The project includes ESLint and Prettier configurations with Husky pre-commit hooks:

```bash
# Lint code
bun lint

# Fix linting issues
bun lint:fix

# Format code
bun format
```

### Git Hooks

Pre-commit hooks automatically run:
- ESLint on staged files
- Prettier formatting
- Type checking

## 🏷️ Naming Conventions

### Files

- **Components**: `PascalCase` (e.g., `UserProfile.tsx`)
- **Utilities**: `kebab-case` (e.g., `format-date.ts`)
- **Hooks**: `use-*` (e.g., `useUser.ts`)
- **Types**: `*.types.ts` or `*.type.ts`
- **Constants**: `*.constants.ts`

### Code

- **Variables**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`
- **Enums**: `PascalCase`

## 🌐 API Routes

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signout` - Sign out user

### Permissions

- `GET /api/permissions/me` - Get user permissions
- `GET /api/user/menu` - Get user menu

## 🗄️ Database Schema

### Core Tables

- `User` - User accounts
- `Role` - System roles
- `Permission` - System permissions
- `RolePermission` - Role-permission mapping
- `UserPermission` - User-permission mapping (for custom permissions)

View complete schema in `prisma/schema.prisma`

## 📚 Documentation

- [Feature-Based Architecture Rules](./rules/feature-based-architecture-rules.md)
- [Docker Deployment Guide](./DOCKER.md)
- [Refactoring Summary](./REFACTORING_SUMMARY.md)
- [Permission System](./PERMISSION_SYSTEM.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation changes
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [NextAuth.js](https://authjs.dev/) - Authentication for Next.js

## 📞 Support

For support, email support@arzi.com or open an issue on GitHub.

---

Made with ❤️ by [Arzi Tech](https://arzi.com)

