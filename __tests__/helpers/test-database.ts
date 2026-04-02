import {
  mockCreateUser,
  mockFindUniqueUser,
  mockUsers,
  resetPrismaMocks,
} from "../__mocks__/prisma";

// Database test helpers
export const setupDatabase = () => {
  // Reset all mocks before each test
  resetPrismaMocks();

  // Setup default database state
  mockFindUniqueUser(mockUsers[0]); // Admin user by default
};

export const cleanupDatabase = () => {
  resetPrismaMocks();
};

// Helper to create a test user in the mock database
export const createTestUser = async (userData: any) => {
  const newUser = {
    id: Math.random().toString(36).substr(2, 9),
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockCreateUser(newUser);
  return newUser;
};

// Helper to mock a user query
export const mockUserQuery = (username: string) => {
  const user = mockUsers.find((u) => u.username === username);
  mockFindUniqueUser(user || null);
  return user;
};

// Helper to setup transaction mock
export const mockTransaction = async (callback: any) => {
  return await callback(mockPrismaClient);
};

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
  $transaction: mockTransaction,
  $disconnect: vi.fn(),
};
