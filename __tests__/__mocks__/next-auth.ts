import type { Session } from "next-auth";
import React from "react";
import { vi } from "vitest";

// Mock NextAuth
export const mockSession = {
  user: {
    id: "1",
    name: "Test User",
    username: "testuser",
    roleId: 1,
  },
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
};

export const mockUnauthorizedSession = null;

export const mockSignIn = vi.fn().mockResolvedValue({
  user: {
    id: "1",
    name: "Test User",
    username: "testuser",
    roleId: 1,
  },
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
  error: null,
});

export const mockSignOut = vi.fn().mockResolvedValue(undefined);

vi.mock("next-auth/react", () => ({
  signIn: () => mockSignIn(),
  signOut: () => mockSignOut(),
  useSession: vi.fn(() => ({ data: mockSession, status: "authenticated" })),
  SessionProvider: ({ children }: { children: React.ReactNode }) => {
    return React.createElement(React.Fragment, null, children);
  },
}));

vi.mock("next-auth", () => ({
  auth: vi.fn(() => Promise.resolve(mockSession)),
  handlers: {},
  signIn: () => mockSignIn(),
  signOut: () => mockSignOut(),
}));

// Helper to set mock session state
export const setMockSession = (session: Session | null) => {
  const { useSession } = require("next-auth/react");
  useSession.mockReturnValue({
    data: session,
    status: session ? "authenticated" : "unauthenticated",
  });
};

// Helper to set mock signIn result
export const setMockSignInResult = (result: {
  user?: {
    id: string;
    name: string;
    username: string;
    roleId: number;
  };
  expires?: string;
  error?: string | null;
}) => {
  mockSignIn.mockResolvedValueOnce(result);
};

// Helper to reset all mocks
export const resetAuthMocks = () => {
  mockSignIn.mockReset();
  mockSignOut.mockReset();
  setMockSession(mockSession);
};
