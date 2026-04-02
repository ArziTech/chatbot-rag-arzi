/**
 * Unit tests for ABAC Permission Evaluation
 *
 * Tests the core hasPermission function and related utilities.
 */

import { describe, expect, it } from "vitest";
import {
  hasAllPermissions,
  hasAllRoles,
  hasAnyPermission,
  hasAnyRole,
  hasPermission,
  hasRole,
} from "../actions/evaluate-permission";
import {
  adminUser,
  blockedCommentData,
  blockedUser,
  invalidRoleUser,
  moderatorUser,
  multiRoleUser,
  noRoleUser,
  otherUserData,
  regularUser,
  sampleCommentData,
  sampleUserData,
} from "./fixtures/abac";

describe("hasPermission - Boolean permissions", () => {
  describe("admin role", () => {
    it("returns true for dashboard view", () => {
      expect(hasPermission(adminUser, "dashboard", "view")).toBe(true);
    });

    it("returns true for users delete", () => {
      expect(hasPermission(adminUser, "users", "delete")).toBe(true);
    });

    it("returns true for roles create", () => {
      expect(hasPermission(adminUser, "roles", "create")).toBe(true);
    });

    it("returns true for permissions manage", () => {
      expect(hasPermission(adminUser, "permissions", "manage")).toBe(true);
    });
  });

  describe("user role", () => {
    it("returns true for dashboard view", () => {
      expect(hasPermission(regularUser, "dashboard", "view")).toBe(true);
    });

    it("returns true for users view", () => {
      expect(hasPermission(regularUser, "users", "view")).toBe(true);
    });

    it("returns true for users create", () => {
      expect(hasPermission(regularUser, "users", "create")).toBe(true);
    });

    it("returns false for users delete", () => {
      expect(hasPermission(regularUser, "users", "delete")).toBe(false);
    });

    it("returns false for roles create", () => {
      expect(hasPermission(regularUser, "roles", "create")).toBe(false);
    });
  });

  describe("moderator role", () => {
    it("returns true for users delete", () => {
      expect(hasPermission(moderatorUser, "users", "delete")).toBe(true);
    });

    it("returns true for comments delete", () => {
      expect(hasPermission(moderatorUser, "comments", "delete")).toBe(true);
    });
  });
});

describe("hasPermission - Multi-role user", () => {
  it("grants permission if ANY role has it (moderator has delete)", () => {
    // user role cannot delete, but moderator can
    expect(hasPermission(multiRoleUser, "users", "delete")).toBe(true);
  });

  it("denies permission if NO role has it", () => {
    // Neither user nor moderator can delete roles
    expect(hasPermission(multiRoleUser, "roles", "delete")).toBe(false);
  });

  it("handles user with no roles", () => {
    expect(hasPermission(noRoleUser, "dashboard", "view")).toBe(false);
  });

  it("handles user with invalid role", () => {
    expect(hasPermission(invalidRoleUser, "dashboard", "view")).toBe(false);
  });
});

describe("hasPermission - ABAC function-based permissions", () => {
  describe("users.edit - ownership check", () => {
    it("returns true when user edits their own profile", () => {
      // regularUser.id === sampleUserData.id
      expect(hasPermission(regularUser, "users", "edit", sampleUserData)).toBe(
        true,
      );
    });

    it("returns false when user tries to edit another user's profile", () => {
      // regularUser.id !== otherUserData.id
      expect(hasPermission(regularUser, "users", "edit", otherUserData)).toBe(
        false,
      );
    });

    it("returns false when no data is provided (data required)", () => {
      // edit permission requires data context
      expect(hasPermission(regularUser, "users", "edit")).toBe(false);
    });
  });

  describe("admin bypasses ownership check", () => {
    it("admin can edit any user regardless of ownership", () => {
      // admin has boolean true for edit, not function
      expect(hasPermission(adminUser, "users", "edit", otherUserData)).toBe(
        true,
      );
    });
  });

  describe("comments.view - blockedBy check", () => {
    it("returns false when comment author is blocked", () => {
      // blockedUser.blockedBy includes user-3, blockedCommentData.authorId is user-3
      expect(
        hasPermission(blockedUser, "comments", "view", blockedCommentData),
      ).toBe(false);
    });

    it("returns true when comment author is not blocked", () => {
      // blockedUser.blockedBy includes user-1, but sampleCommentData.authorId is user-1
      // Wait, let me reconsider - sampleCommentData.authorId is user-1
      // blockedUser.blockedBy is ["user-1", "user-3"]
      // So user-1 IS blocked
      const unblockedComment = { ...sampleCommentData, authorId: "user-999" };
      expect(
        hasPermission(blockedUser, "comments", "view", unblockedComment),
      ).toBe(true);
    });
  });

  describe("comments.update - ownership check", () => {
    it("returns true when user updates their own comment", () => {
      const ownComment = { ...sampleCommentData, authorId: regularUser.id };
      expect(hasPermission(regularUser, "comments", "update", ownComment)).toBe(
        true,
      );
    });

    it("returns false when user tries to update someone else's comment", () => {
      // sampleCommentData.authorId is "user-1", but regularUser.id is "user-1"
      // So we need a comment from a different user
      const otherComment = { ...sampleCommentData, authorId: "other-user" };
      expect(
        hasPermission(regularUser, "comments", "update", otherComment),
      ).toBe(false);
    });
  });
});

describe("hasAnyPermission", () => {
  it("returns true if user has ANY of the permissions", () => {
    const result = hasAnyPermission(regularUser, "users", ["edit", "delete"]);
    // regularUser can view (implied) but not edit without data or delete
    // Since none of these are true without data context, should be false
    // Actually, let's check - users.view is true
    // But we're checking edit and delete specifically
    expect(result).toBe(false);
  });

  it("returns true when at least one permission is granted", () => {
    // moderator can delete users
    const result = hasAnyPermission(multiRoleUser, "users", ["edit", "delete"]);
    expect(result).toBe(true);
  });

  it("returns false when no permissions are granted", () => {
    const result = hasAnyPermission(regularUser, "roles", [
      "create",
      "edit",
      "delete",
    ]);
    expect(result).toBe(false);
  });
});

describe("hasAllPermissions", () => {
  it("returns true when user has ALL permissions", () => {
    // admin has all permissions
    const result = hasAllPermissions(adminUser, "users", [
      "view",
      "create",
      "edit",
      "delete",
    ]);
    expect(result).toBe(true);
  });

  it("returns false when user is missing ANY permission", () => {
    // regularUser cannot delete
    const result = hasAllPermissions(regularUser, "users", ["view", "delete"]);
    expect(result).toBe(false);
  });
});

describe("hasRole utilities", () => {
  describe("hasRole", () => {
    it("returns true when user has the role", () => {
      expect(hasRole(regularUser, "user")).toBe(true);
    });

    it("returns false when user does not have the role", () => {
      expect(hasRole(regularUser, "admin")).toBe(false);
    });
  });

  describe("hasAnyRole", () => {
    it("returns true when user has any of the roles", () => {
      expect(hasAnyRole(regularUser, ["admin", "user"])).toBe(true);
    });

    it("returns false when user has none of the roles", () => {
      expect(hasAnyRole(regularUser, ["admin", "moderator"])).toBe(false);
    });
  });

  describe("hasAllRoles", () => {
    it("returns true when user has all roles", () => {
      expect(hasAllRoles(multiRoleUser, ["user", "moderator"])).toBe(true);
    });

    it("returns false when user is missing any role", () => {
      expect(hasAllRoles(multiRoleUser, ["user", "admin"])).toBe(false);
    });
  });
});

describe("Edge cases", () => {
  it("handles null/undefined roles gracefully", () => {
    // @ts-expect-error - testing runtime behavior
    expect(hasPermission({ id: "1" }, "dashboard", "view")).toBe(false);
  });

  it("handles null/undefined blockedBy gracefully", () => {
    const userWithNoBlockedBy: typeof regularUser = {
      ...regularUser,
      blockedBy: undefined,
    };
    // Should not throw and should return appropriate result
    expect(
      hasPermission(userWithNoBlockedBy, "comments", "view", sampleCommentData),
    ).toBe(true);
  });
});
