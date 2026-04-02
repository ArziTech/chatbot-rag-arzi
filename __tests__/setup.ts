// Test setup file - runs before all tests
import { afterAll, beforeEach } from "vitest";
import { resetAuthMocks } from "./__mocks__/next-auth";
import { resetRouterMocks } from "./__mocks__/next-router";
import { resetPrismaMocks } from "./__mocks__/prisma";

// Reset all mocks before each test
beforeEach(() => {
  resetAuthMocks();
  resetPrismaMocks();
  resetRouterMocks();
});

// Cleanup after all tests
afterAll(() => {
  // Any global cleanup can go here
});
