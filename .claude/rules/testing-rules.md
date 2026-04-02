# Testing Rules

This document defines the testing conventions for the Financial Plan App project.

## Test Stack

| Type | Framework | Config File |
|------|-----------|-------------|
| Unit & Component | Vitest | `vitest.config.ts` |
| Integration (API/Page) | Vitest | `vitest.integration.config.ts` |
| End-to-End | Playwright | `playwright.config.ts` |

## Test File Structure

### Unit Tests (Vitest)
Location: alongside source code in `__tests__` subdirectories

```
src/features/{feature}/
├── components/
│   └── __tests__/
│       └── {component}.test.tsx       # Component tests
├── hooks/
│   └── __tests__/
│       └── {hook}.test.ts             # Hook tests
├── dal/
│   └── __tests__/
│       └── {dal}.test.ts              # DAL tests
└── lib/
    └── __tests__/
        └── {lib}.test.ts               # Utility/lib tests

src/components/
├── __tests__/
│   └── {component}/                    # Shared component tests
│       └── {component}.test.tsx
```

### Integration Tests (Vitest)
Location: `src/app/__tests__/` for page and API route tests

```
src/app/
├── __tests__/
│   └── {route}/                        # Route group tests
│       └── {page}.test.tsx            # Page integration tests
└── api/
    └── __tests__/
        └── {api-route}.test.ts        # API route tests
```

### E2E Tests (Playwright)
Location: `tests/e2e/` with feature-based grouping

```
tests/e2e/
├── auth/
│   └── {page}.spec.ts                  # Auth flow tests
├── {feature}/
│   └── {page}.spec.ts                  # Feature page tests
└── shared/
    └── {flow}.spec.ts                  # Cross-feature flows
```

## Naming Conventions

| Test Type | File Pattern | Example |
|-----------|--------------|---------|
| Component | `{name}.test.tsx` | `create-bucket-dialog.test.tsx` |
| Hook | `{name}.test.ts` | `use-permission.test.ts` |
| DAL | `{name}.test.ts` | `buckets.mutation.test.ts` |
| API/Integration | `{route}.test.ts` | `buckets.api.test.ts` |
| Page | `{page}.test.tsx` | `buckets.page.test.tsx` |
| E2E | `{flow}.spec.ts` | `create-bucket.spec.ts` |

## Test Patterns

### Unit Test Pattern (Component)

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { MyComponent } from "@/features/{feature}/components/my-component";

// Mock external dependencies
vi.mock("@/features/some-hook", () => ({
  useSomeHook: (...args: unknown[]) => mockUseSomeHook(...args),
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: mockSession, status: "authenticated" }),
}));

describe("MyComponent", () => {
  const mockProps = {
    onSubmit: vi.fn(),
    // ...
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when rendering", () => {
    it("renders form fields", () => {
      render(<MyComponent {...mockProps} />);
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });
  });

  describe("when submitting", () => {
    it("calls onSubmit with form data", async () => {
      const user = userEvent.setup();
      render(<MyComponent {...mockProps} />);

      await user.type(screen.getByLabelText(/name/i), "Test Name");
      await user.click(screen.getByRole("button", { name: /submit/i }));

      expect(mockProps.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Test Name" }),
      );
    });
  });

  describe("when validation fails", () => {
    it("shows error message", async () => {
      const user = userEvent.setup();
      render(<MyComponent {...mockProps} />);

      await user.click(screen.getByRole("button", { name: /submit/i }));
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });
});
```

### Hook Test Pattern

```typescript
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useMyHook } from "@/features/{feature}/hooks/use-my-hook";

vi.mock("@/features/{feature}/api/my-api", () => ({
  myApiCall: vi.fn(),
}));

describe("useMyHook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns initial state", () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("fetches data on mount", async () => {
    const { result } = renderHook(() => useMyHook());
    // Assert async behavior
  });
});
```

### DAL/Mutation Test Pattern

```typescript
import { describe, expect, it, vi, beforeEach } from "vitest";
import { createBucket } from "@/features/buckets/dal/mutations";
import { mockPrismaClient, resetPrismaMocks } from "@/__tests__/__mocks__/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrismaClient,
}));

describe("createBucket", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("creates bucket with valid data", async () => {
    mockPrismaClient.bucket.create.mockResolvedValue(mockBucket);

    const result = await createBucket({
      name: "Test Bucket",
      targetAmount: 1000,
    });

    expect(result).toEqual(mockBucket);
    expect(mockPrismaClient.bucket.create).toHaveBeenCalledWith({
      data: { name: "Test Bucket", targetAmount: 1000 },
    });
  });

  it("throws on invalid data", async () => {
    await expect(
      createBucket({ name: "", targetAmount: -100 }),
    ).rejects.toThrow();
  });
});
```

### E2E Test Pattern (Playwright)

```typescript
import { expect, test } from "@playwright/test";

test.describe("Feature - Page Name", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/{feature}");
  });

  test("should display page title", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Expected Title");
  });

  test("should create item", async ({ page }) => {
    // Click add button
    await page.click('button:has-text("Add")');

    // Fill form
    await page.fill('input[id="name"]', "Test Item");

    // Submit
    await page.click('button[type="submit"]');

    // Assert
    await expect(page.getByText("Test Item")).toBeVisible();
  });

  test("should show validation error", async ({ page }) => {
    await page.click('button:has-text("Add")');
    await page.click('button[type="submit"]');

    await expect(page.getByText(/required/i)).toBeVisible();
  });

  test("should edit item", async ({ page }) => {
    // Click edit on existing item
    await page.click('button:has-text("Edit")').first();

    // Modify and save
    await page.fill('input[id="name"]', "Updated Name");
    await page.click('button:has-text("Save")');

    await expect(page.getByText("Updated Name")).toBeVisible();
  });

  test("should delete item", async ({ page }) => {
    // Click delete
    await page.click('button:has-text("Delete")').first();

    // Confirm in dialog
    await page.click('button:has-text("Confirm")');

    // Assert item is gone
    await expect(page.getByText("Deleted Item")).not.toBeVisible();
  });
});
```

## Query Priority

Use Testing Library queries in this order:

1. `getByRole` — preferred for interactive elements
2. `getByLabelText` — for form fields
3. `getByText` — for non-interactive text
4. `getByPlaceholderText` — for inputs with placeholder
5. `getByTestId` — last resort only

```typescript
// ✅ GOOD
await user.click(screen.getByRole("button", { name: /submit/i }));
await user.type(screen.getByLabelText(/username/i), "testuser");

// ❌ BAD
await user.click(screen.getByTestId("submit-button"));
```

## Mock Patterns

### Mock External Dependencies
```typescript
vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: mockSession, status: "authenticated" }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
```

### Reset Mocks in beforeEach
```typescript
beforeEach(() => {
  vi.clearAllMocks();
});
```

### Mock Prisma with Helper
```typescript
import { mockPrismaClient, resetPrismaMocks } from "@/__tests__/__mocks__/prisma";

beforeEach(() => {
  resetPrismaMocks();
});
```

## Test Commands

```bash
# Run unit tests (watch mode)
bun run test

# Run unit tests once
bun run test:run

# Run unit tests with UI
bun run test:ui

# Run unit tests with coverage
bun run test:coverage

# Run integration tests
bun run test:integration

# Run E2E tests
bun run test:e2e

# Run E2E tests with UI
bun run test:e2e:ui

# Run E2E tests in debug mode
bun run test:e2e:debug

# Run all tests
bun run test:all
```

## Coverage Thresholds

| Metric | Threshold |
|--------|-----------|
| Statements | 70% |
| Branches | 65% |
| Functions | 70% |
| Lines | 70% |

## Fixtures & Helpers

Test fixtures and helpers are located in:

```
__tests__/
├── __mocks__/
│   ├── prisma.ts           # Prisma client mock
│   ├── next-auth.ts        # NextAuth mock
│   └── next-router.ts      # Next.js router mock
├── fixtures/
│   ├── users.ts            # User fixtures
│   ├── roles.ts            # Role fixtures
│   └── permissions.ts      # Permission fixtures
└── helpers/
    ├── auth-helpers.ts      # Auth test helpers
    ├── render-helpers.tsx   # Render with providers
    └── test-database.ts     # Database helpers
```

## Coverage Targets by Feature Type

| Feature Type | Minimum Coverage |
|--------------|-----------------|
| Business Critical (Buckets, Expenses) | 80% statements |
| Core Features (Timeline, Simulation) | 75% statements |
| Supporting Features (Dashboard, Profile) | 60% statements |
