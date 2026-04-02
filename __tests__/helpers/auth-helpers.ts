import type { Session } from "next-auth";

// Mock session factory
export const createMockSession = (overrides?: Partial<Session>): Session => ({
  user: {
    id: "1",
    name: "Test User",
    username: "testuser",
    roleId: 1,
    ...overrides?.user,
  },
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
  ...overrides,
});

// Mock authenticated session
export const authenticatedSession = createMockSession({
  user: {
    id: "1",
    name: "Admin User",
    username: "admin",
    roleId: 1,
  },
});

// Mock regular user session
export const regularUserSession = createMockSession({
  user: {
    id: "2",
    name: "Regular User",
    username: "user",
    roleId: 2,
  },
});

// Mock unauthenticated session
export const unauthenticatedSession = null;

// Helper to mock next-auth useSession
export const mockUseSession = (session: Session | null) => {
  const { useSession } = require("next-auth/react");
  useSession.mockReturnValue({
    data: session,
    status: session ? "authenticated" : "unauthenticated",
    update: vi.fn(),
  });
};

// Helper to mock withSession server-side helper
export const mockAuth = (session: Session | null) => {
  const { auth } = require("next-auth");
  auth.mockResolvedValue(session);
};
