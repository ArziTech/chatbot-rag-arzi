/**
 * ABAC Test Fixtures
 *
 * Reusable test user fixtures for ABAC permission tests.
 */

import type {
  ABACUser,
  CommentData,
  RoleData,
  UserData,
} from "../../../permissions/types/abac";

// Admin user with bypass all features
export const adminUser: ABACUser = {
  id: "admin-1",
  roles: ["admin"],
  blockedBy: [],
};

// Regular user with standard permissions
export const regularUser: ABACUser = {
  id: "user-1",
  roles: ["user"],
  blockedBy: [],
};

// Moderator user with enhanced permissions
export const moderatorUser: ABACUser = {
  id: "mod-1",
  roles: ["moderator"],
  blockedBy: [],
};

// User with multiple roles
export const multiRoleUser: ABACUser = {
  id: "multi-1",
  roles: ["user", "moderator"],
  blockedBy: [],
};

// User who has blocked other users
export const blockedUser: ABACUser = {
  id: "user-2",
  roles: ["user"],
  blockedBy: ["user-1", "user-3"],
};

// User with no roles (should be denied all)
export const noRoleUser: ABACUser = {
  id: "norole-1",
  roles: [],
  blockedBy: [],
};

// User with invalid role (should be denied)
export const invalidRoleUser: ABACUser = {
  id: "invalid-1",
  roles: ["nonexistent-role"],
  blockedBy: [],
};

// Sample user data for ABAC tests
export const sampleUserData: UserData = {
  id: "user-1",
  username: "testuser",
  name: "Test User",
  email: "test@example.com",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

// Sample other user data
export const otherUserData: UserData = {
  id: "user-2",
  username: "otheruser",
  name: "Other User",
  email: "other@example.com",
  createdAt: new Date("2024-01-02"),
  updatedAt: new Date("2024-01-02"),
};

// Sample role data
export const sampleRoleData: RoleData = {
  id: 1,
  name: "user",
  description: "Standard user role",
  byPassAllFeatures: false,
};

// Sample comment data
export const sampleCommentData: CommentData = {
  id: "comment-1",
  body: "This is a test comment",
  authorId: "user-1",
  createdAt: new Date("2024-01-01"),
};

// Comment from blocked user
export const blockedCommentData: CommentData = {
  id: "comment-2",
  body: "Comment from blocked user",
  authorId: "user-3", // This user is in blockedUser's blockedBy list
  createdAt: new Date("2024-01-02"),
};
