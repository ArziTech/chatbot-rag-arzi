// Test role fixtures

export const adminRole = {
  id: 1,
  name: "Admin",
  description: "Administrator role with full access",
  status: true,
};

export const userRole = {
  id: 2,
  name: "User",
  description: "Regular user with limited access",
  status: true,
};

export const moderatorRole = {
  id: 3,
  name: "Moderator",
  description: "Moderator role with moderate access",
  status: true,
};

export const guestRole = {
  id: 4,
  name: "Guest",
  description: "Guest role with minimal access",
  status: true,
};

export const inactiveRole = {
  id: 5,
  name: "Inactive",
  description: "Inactive role",
  status: false,
};

// Role permissions mapping
export const rolePermissions = {
  1: ["*"], // Admin has all permissions
  2: ["dashboard:read", "profile:read", "profile:write"], // User
  3: ["dashboard:read", "users:read", "content:read", "content:write"], // Moderator
  4: ["dashboard:read"], // Guest
  5: [], // Inactive - no permissions
};
