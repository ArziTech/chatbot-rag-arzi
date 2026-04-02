import { renderHook } from "@testing-library/react";
import { usePermission } from "@/features/permissions/hooks/use-permission";

// Mock the usePermissions context
const mockUsePermissions = vi.fn();

vi.mock("@/providers/permission-provider", () => ({
  usePermissions: (...args: unknown[]) => mockUsePermissions(...args),
}));

describe("usePermission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockPermissions = (codes: string[]) =>
    codes.map((code, index) => ({
      id: index + 1,
      code,
      label: code,
      href: null,
      description: null,
      icon: null,
      module: null,
      isSection: false,
      sequence: index,
      parentId: null,
      showOnSidebar: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

  describe("hasPermission", () => {
    it("returns true when user has the permission", () => {
      mockUsePermissions.mockReturnValue({
        permissions: createMockPermissions(["users.view", "users.edit"]),
        byPassAllFeatures: false,
        isLoading: false,
      });

      const { result } = renderHook(() => usePermission());

      expect(result.current.hasPermission("users.view")).toBe(true);
    });

    it("returns false when user does not have the permission", () => {
      mockUsePermissions.mockReturnValue({
        permissions: createMockPermissions(["users.view"]),
        byPassAllFeatures: false,
        isLoading: false,
      });

      const { result } = renderHook(() => usePermission());

      expect(result.current.hasPermission("users.delete")).toBe(false);
    });

    it("returns true for superadmin regardless of permissions", () => {
      mockUsePermissions.mockReturnValue({
        permissions: [],
        byPassAllFeatures: true,
        isLoading: false,
      });

      const { result } = renderHook(() => usePermission());

      expect(result.current.hasPermission("any.permission")).toBe(true);
    });
  });

  describe("hasAnyPermission", () => {
    it("returns true when user has at least one of the permissions", () => {
      mockUsePermissions.mockReturnValue({
        permissions: createMockPermissions(["users.view", "users.edit"]),
        byPassAllFeatures: false,
        isLoading: false,
      });

      const { result } = renderHook(() => usePermission());

      expect(
        result.current.hasAnyPermission(["users.delete", "users.edit"]),
      ).toBe(true);
    });

    it("returns false when user does not have any of the permissions", () => {
      mockUsePermissions.mockReturnValue({
        permissions: createMockPermissions(["users.view"]),
        byPassAllFeatures: false,
        isLoading: false,
      });

      const { result } = renderHook(() => usePermission());

      expect(
        result.current.hasAnyPermission(["users.delete", "users.manage"]),
      ).toBe(false);
    });

    it("returns true for superadmin regardless of permissions", () => {
      mockUsePermissions.mockReturnValue({
        permissions: [],
        byPassAllFeatures: true,
        isLoading: false,
      });

      const { result } = renderHook(() => usePermission());

      expect(
        result.current.hasAnyPermission([
          "any.permission",
          "another.permission",
        ]),
      ).toBe(true);
    });
  });

  describe("hasAllPermissions", () => {
    it("returns true when user has all of the permissions", () => {
      mockUsePermissions.mockReturnValue({
        permissions: createMockPermissions([
          "users.view",
          "users.edit",
          "users.delete",
        ]),
        byPassAllFeatures: false,
        isLoading: false,
      });

      const { result } = renderHook(() => usePermission());

      expect(
        result.current.hasAllPermissions(["users.view", "users.edit"]),
      ).toBe(true);
    });

    it("returns false when user does not have all of the permissions", () => {
      mockUsePermissions.mockReturnValue({
        permissions: createMockPermissions(["users.view"]),
        byPassAllFeatures: false,
        isLoading: false,
      });

      const { result } = renderHook(() => usePermission());

      expect(
        result.current.hasAllPermissions(["users.view", "users.delete"]),
      ).toBe(false);
    });

    it("returns true for superadmin regardless of permissions", () => {
      mockUsePermissions.mockReturnValue({
        permissions: [],
        byPassAllFeatures: true,
        isLoading: false,
      });

      const { result } = renderHook(() => usePermission());

      expect(
        result.current.hasAllPermissions([
          "any.permission",
          "another.permission",
        ]),
      ).toBe(true);
    });
  });

  describe("context values", () => {
    it("returns permissions from context", () => {
      const permissions = createMockPermissions(["users.view"]);
      mockUsePermissions.mockReturnValue({
        permissions,
        byPassAllFeatures: false,
        isLoading: false,
      });

      const { result } = renderHook(() => usePermission());

      expect(result.current.permissions).toEqual(permissions);
    });

    it("returns byPassAllFeatures from context", () => {
      mockUsePermissions.mockReturnValue({
        permissions: [],
        byPassAllFeatures: true,
        isLoading: false,
      });

      const { result } = renderHook(() => usePermission());

      expect(result.current.byPassAllFeatures).toBe(true);
    });

    it("returns isLoading from context", () => {
      mockUsePermissions.mockReturnValue({
        permissions: [],
        byPassAllFeatures: false,
        isLoading: true,
      });

      const { result } = renderHook(() => usePermission());

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("handles empty permissions array", () => {
      mockUsePermissions.mockReturnValue({
        permissions: [],
        byPassAllFeatures: false,
        isLoading: false,
      });

      const { result } = renderHook(() => usePermission());

      expect(result.current.hasPermission("any.permission")).toBe(false);
      expect(result.current.hasAnyPermission(["any"])).toBe(false);
      expect(result.current.hasAllPermissions(["any"])).toBe(false);
    });

    it("handles empty permissions array for hasAllPermissions", () => {
      mockUsePermissions.mockReturnValue({
        permissions: [],
        byPassAllFeatures: false,
        isLoading: false,
      });

      const { result } = renderHook(() => usePermission());

      // Empty array - every() returns true for empty array
      expect(result.current.hasAllPermissions([])).toBe(true);
    });
  });
});
