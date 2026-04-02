// Test permission fixtures

export const dashboardReadPermission = {
  id: 1,
  name: "dashboard:read",
  description: "View dashboard",
  module: "dashboard",
  action: "read",
};

export const usersReadPermission = {
  id: 2,
  name: "users:read",
  description: "View users",
  module: "users",
  action: "read",
};

export const usersWritePermission = {
  id: 3,
  name: "users:write",
  description: "Create and edit users",
  module: "users",
  action: "write",
};

export const usersDeletePermission = {
  id: 4,
  name: "users:delete",
  description: "Delete users",
  module: "users",
  action: "delete",
};

export const profileReadPermission = {
  id: 5,
  name: "profile:read",
  description: "View profile",
  module: "profile",
  action: "read",
};

export const profileWritePermission = {
  id: 6,
  name: "profile:write",
  description: "Edit profile",
  module: "profile",
  action: "write",
};

export const contentReadPermission = {
  id: 7,
  name: "content:read",
  description: "View content",
  module: "content",
  action: "read",
};

export const contentWritePermission = {
  id: 8,
  name: "content:write",
  description: "Create and edit content",
  module: "content",
  action: "write",
};

// All permissions array
export const allPermissions = [
  dashboardReadPermission,
  usersReadPermission,
  usersWritePermission,
  usersDeletePermission,
  profileReadPermission,
  profileWritePermission,
  contentReadPermission,
  contentWritePermission,
];

// Permission sets for different roles
export const adminPermissions = allPermissions;
export const userPermissions = [
  dashboardReadPermission,
  profileReadPermission,
  profileWritePermission,
];
export const moderatorPermissions = [
  dashboardReadPermission,
  usersReadPermission,
  contentReadPermission,
  contentWritePermission,
];
export const guestPermissions = [dashboardReadPermission];
