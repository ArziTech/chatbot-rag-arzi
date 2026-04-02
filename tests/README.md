# Testing Guide

This project uses a comprehensive testing strategy with Vitest for unit/integration tests and Playwright for E2E tests.

## Test Structure

```
/home/wawan/Projects/Nextjs/nextjs-arzi-starterkit/
├── __tests__/              # Test infrastructure
│   ├── __mocks__/          # Mock utilities
│   ├── fixtures/           # Test data
│   ├── helpers/            # Test helpers
│   └── setup.ts            # Global test setup
├── src/
│   ├── components/__tests__/   # Component tests
│   ├── hooks/__tests__/        # Hook tests
│   ├── lib/__tests__/          # Utility tests
│   └── app/__tests__/          # Page/API tests
└── tests/
    └── e2e/               # E2E tests
        ├── auth/
        ├── navigation/
        ├── dashboard/
        └── themes/
```

## Running Tests

### Unit & Integration Tests

```bash
# Run tests in watch mode
bun run test

# Run tests once
bun run test:run

# Run tests with UI
bun run test:ui

# Run tests with coverage
bun run test:coverage

# Run integration tests only
bun run test:integration
```

### E2E Tests

```bash
# Run all E2E tests
bun run test:e2e

# Run E2E tests with UI
bun run test:e2e:ui

# Run E2E tests in debug mode
bun run test:e2e:debug
```

### Run All Tests

```bash
bun run test:all
```

## Writing Tests

### Unit Tests

Unit tests should be fast, isolated, and test a single piece of functionality.

```typescript
import { describe, it, expect } from "vitest";

describe("MyFunction", () => {
  it("should do something", () => {
    const result = myFunction("input");
    expect(result).toBe("expected output");
  });
});
```

### Component Tests

Component tests should test user behavior and interactions.

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { MyComponent } from "./my-component";

describe("MyComponent", () => {
  it("should render", () => {
    render(<MyComponent />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("should handle click", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<MyComponent onClick={handleClick} />);

    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### E2E Tests

E2E tests should test complete user flows through the application.

```typescript
import { test, expect } from "@playwright/test";

test("user can login", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[id="username"]', "testuser");
  await page.fill('input[id="password"]', "password123");
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL("/dashboard");
});
```

## Test Helpers

### Authentication Helpers

```typescript
import { createMockSession, mockUseSession } from "@/__tests__/helpers/auth-helpers";

// Create a mock session
const session = createMockSession({
  user: { id: "1", name: "Test User", username: "testuser", roleId: 1 }
});

// Mock useSession hook
mockUseSession(session);
```

### Render with Providers

```typescript
import { renderWithProviders } from "@/__tests__/helpers/test-client";

const { container } = renderWithProviders(<MyComponent />, {
  session: mockSession,
  theme: "dark"
});
```

### Database Helpers

```typescript
import { setupDatabase, createTestUser } from "@/__tests__/helpers/test-database";

setupDatabase();
const user = await createTestUser({ username: "test" });
```

## Coverage Targets

- Statements: 70%
- Branches: 65%
- Functions: 70%
- Lines: 70

## CI/CD

Tests run automatically on push and pull requests to main and develop branches.

- Unit & Integration tests run with coverage reporting
- E2E tests run on multiple browsers (Chromium, Firefox, WebKit)
- Test reports and coverage reports are uploaded as artifacts

## Best Practices

1. **Test user behavior, not implementation** - Use getByRole instead of class names
2. **AAA Pattern** - Arrange, Act, Assert structure
3. **One assertion per test** - When possible
4. **Descriptive test names** - Should read like requirements
5. **Mock external dependencies** - NextAuth, Prisma, APIs
6. **Don't mock your own components** - Unless necessary
7. **Reset mocks between tests** - Ensure test isolation
8. **Keep tests fast** - Unit tests should run in seconds

## Troubleshooting

### Tests fail with "Cannot find module"

Make sure to install dependencies:
```bash
bun install
```

### Playwright tests fail with "Web Server not running"

The Playwright config includes a webServer that starts the dev server. If it's not working:
```bash
bun run dev
```
Then in another terminal:
```bash
bun run test:e2e
```

### Coverage is low

Run coverage with specific file filtering:
```bash
bun run test:coverage -- src/path/to/files
```

### Tests timeout

Increase timeout in vitest.config.ts or for specific tests:
```typescript
it("slow test", async () => { ... }, { timeout: 10000 });
```
