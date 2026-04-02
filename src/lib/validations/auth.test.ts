import { describe, expect, it } from "vitest";
import { loginSchema, signupSchema } from "./auth";

describe("loginSchema", () => {
  describe("username validation", () => {
    it("should accept valid username", () => {
      const result = loginSchema.safeParse({
        username: "testuser",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject username shorter than 3 characters", () => {
      const result = loginSchema.safeParse({
        username: "ab",
        password: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Username must be at least 3 characters",
        );
      }
    });

    it("should reject username longer than 20 characters", () => {
      const result = loginSchema.safeParse({
        username: "a".repeat(21),
        password: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Username must be at most 20 characters",
        );
      }
    });

    it("should reject missing username", () => {
      const result = loginSchema.safeParse({
        username: "",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("password validation", () => {
    it("should accept valid password", () => {
      const result = loginSchema.safeParse({
        username: "testuser",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject password shorter than 6 characters", () => {
      const result = loginSchema.safeParse({
        username: "testuser",
        password: "12345",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Password must be at least 6 characters",
        );
      }
    });

    it("should reject missing password", () => {
      const result = loginSchema.safeParse({
        username: "testuser",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("complete form validation", () => {
    it("should accept valid login data", () => {
      const result = loginSchema.safeParse({
        username: "validuser",
        password: "validpass123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject data with multiple errors", () => {
      const result = loginSchema.safeParse({
        username: "ab",
        password: "123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2);
      }
    });
  });
});

describe("signupSchema", () => {
  describe("username validation", () => {
    it("should accept valid username with letters", () => {
      const result = signupSchema.safeParse({
        username: "validuser",
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should accept username with numbers", () => {
      const result = signupSchema.safeParse({
        username: "user123",
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should accept username with underscore", () => {
      const result = signupSchema.safeParse({
        username: "user_name",
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should accept username with hyphen", () => {
      const result = signupSchema.safeParse({
        username: "user-name",
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject username with special characters", () => {
      const result = signupSchema.safeParse({
        username: "user@name",
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Username can only contain letters, numbers, underscores, and hyphens",
        );
      }
    });

    it("should reject username shorter than 3 characters", () => {
      const result = signupSchema.safeParse({
        username: "ab",
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("should reject username longer than 20 characters", () => {
      const result = signupSchema.safeParse({
        username: "a".repeat(21),
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("name validation", () => {
    it("should accept valid name", () => {
      const result = signupSchema.safeParse({
        username: "validuser",
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject name shorter than 2 characters", () => {
      const result = signupSchema.safeParse({
        username: "validuser",
        name: "T",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Name must be at least 2 characters",
        );
      }
    });

    it("should reject name longer than 50 characters", () => {
      const result = signupSchema.safeParse({
        username: "validuser",
        name: "a".repeat(51),
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Name must be at most 50 characters",
        );
      }
    });
  });

  describe("email validation", () => {
    it("should accept valid email", () => {
      const result = signupSchema.safeParse({
        username: "validuser",
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should accept empty email", () => {
      const result = signupSchema.safeParse({
        username: "validuser",
        name: "Test User",
        email: "",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = signupSchema.safeParse({
        username: "validuser",
        name: "Test User",
        email: "invalid-email",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid email address");
      }
    });
  });

  describe("password validation", () => {
    it("should accept valid password", () => {
      const result = signupSchema.safeParse({
        username: "validuser",
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject password shorter than 6 characters", () => {
      const result = signupSchema.safeParse({
        username: "validuser",
        name: "Test User",
        email: "test@example.com",
        password: "12345",
        confirmPassword: "12345",
      });
      expect(result.success).toBe(false);
    });

    it("should reject password longer than 100 characters", () => {
      const result = signupSchema.safeParse({
        username: "validuser",
        name: "Test User",
        email: "test@example.com",
        password: "a".repeat(101),
        confirmPassword: "a".repeat(101),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Password is too long");
      }
    });
  });

  describe("confirmPassword validation", () => {
    it("should accept matching passwords", () => {
      const result = signupSchema.safeParse({
        username: "validuser",
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject non-matching passwords", () => {
      const result = signupSchema.safeParse({
        username: "validuser",
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password456",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Passwords do not match");
      }
    });

    it("should show error on confirmPassword field when passwords do not match", () => {
      const result = signupSchema.safeParse({
        username: "validuser",
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password456",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("confirmPassword");
      }
    });
  });

  describe("complete form validation", () => {
    it("should accept valid signup data", () => {
      const result = signupSchema.safeParse({
        username: "validuser",
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should accept valid signup data without email", () => {
      const result = signupSchema.safeParse({
        username: "validuser",
        name: "Test User",
        email: "",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject data with multiple errors", () => {
      const result = signupSchema.safeParse({
        username: "ab",
        name: "T",
        email: "invalid-email",
        password: "123",
        confirmPassword: "456",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(1);
      }
    });
  });
});
