import type { User as PrismaUser } from "@prisma/client";
import { vi } from "vitest";

// Type for user data (simplified version of Prisma User)
type MockUser = Omit<PrismaUser, "createdAt" | "updatedAt"> & {
  createdAt: Date;
  updatedAt: Date;
};

// Mock user data
export const mockUsers = [
  {
    id: "1",
    name: "Admin User",
    username: "admin",
    email: "admin@example.com",
    roleId: 1,
    status: true,
    password: "$2a$10$hash1", // Mock bcrypt hash
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Regular User",
    username: "user",
    email: "user@example.com",
    roleId: 2,
    status: true,
    password: "$2a$10$hash2",
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Inactive User",
    username: "inactive",
    email: "inactive@example.com",
    roleId: 2,
    status: false,
    password: "$2a$10$hash3",
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    name: "Deleted User",
    username: "deleted",
    email: "deleted@example.com",
    roleId: 2,
    status: true,
    password: "$2a$10$hash4",
    deletedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Mock role data
export const mockRoles = [
  {
    id: 1,
    name: "Admin",
    description: "Administrator role",
    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: "User",
    description: "Regular user role",
    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Mock permission data
export const mockPermissions = [
  {
    id: 1,
    name: "users:read",
    description: "Read users",
    module: "users",
    action: "read",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: "users:write",
    description: "Write users",
    module: "users",
    action: "write",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    name: "dashboard:read",
    description: "Read dashboard",
    module: "dashboard",
    action: "read",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Mock Prisma client
export const mockPrismaClient = {
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  role: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  permission: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  rolePermission: {
    findMany: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
  $disconnect: vi.fn(),
  $connect: vi.fn(),
  $transaction: vi.fn(),
};

// Helper to setup mock user findUnique
export const mockFindUniqueUser = (user: MockUser | null) => {
  mockPrismaClient.user.findUnique.mockResolvedValue(user);
};

// Helper to setup mock user findMany
export const mockFindManyUsers = (users: MockUser[]) => {
  mockPrismaClient.user.findMany.mockResolvedValue(users);
};

// Helper to setup mock user create
export const mockCreateUser = (user: MockUser) => {
  mockPrismaClient.user.create.mockResolvedValue(user);
};

// Helper to setup mock user update
export const mockUpdateUser = (user: MockUser) => {
  mockPrismaClient.user.update.mockResolvedValue(user);
};

// Helper to reset all Prisma mocks
export const resetPrismaMocks = () => {
  Object.values(mockPrismaClient).forEach((mock: unknown) => {
    if (typeof mock === "object" && mock !== null && "mockReset" in mock) {
      (mock as { mockReset: () => void }).mockReset();
    }
  });
};

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrismaClient,
}));
