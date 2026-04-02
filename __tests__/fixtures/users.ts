// Test user fixtures

export const validUser = {
  id: "1",
  name: "Test User",
  username: "testuser",
  email: "test@example.com",
  password: "password123",
  roleId: 1,
  status: true,
  deletedAt: null,
};

export const adminUser = {
  id: "1",
  name: "Admin User",
  username: "admin",
  email: "admin@example.com",
  password: "admin123",
  roleId: 1,
  status: true,
  deletedAt: null,
};

export const regularUser = {
  id: "2",
  name: "Regular User",
  username: "user",
  email: "user@example.com",
  password: "user123",
  roleId: 2,
  status: true,
  deletedAt: null,
};

export const inactiveUser = {
  id: "3",
  name: "Inactive User",
  username: "inactive",
  email: "inactive@example.com",
  password: "inactive123",
  roleId: 2,
  status: false,
  deletedAt: null,
};

export const deletedUser = {
  id: "4",
  name: "Deleted User",
  username: "deleted",
  email: "deleted@example.com",
  password: "deleted123",
  roleId: 2,
  status: true,
  deletedAt: new Date("2024-01-01"),
};

// User credentials for login tests
export const validCredentials = {
  username: "testuser",
  password: "password123",
};

export const invalidCredentials = {
  username: "wronguser",
  password: "wrongpassword",
};

export const missingPasswordCredentials = {
  username: "testuser",
  password: "",
};

export const missingUsernameCredentials = {
  username: "",
  password: "password123",
};
