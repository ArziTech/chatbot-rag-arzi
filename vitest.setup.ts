import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterEach, expect, vi } from "vitest";

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: () => null,
}));

// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: vi.fn(),
    systemTheme: "light",
    resolvedTheme: "light",
  }),
  ThemeProvider: ({ children }: { children: unknown }) => children,
}));

// Mock environment variables
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
process.env.AUTH_SECRET = "test-auth-secret";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
