import { render, screen } from "@testing-library/react";
import { PermissionGate } from "@/features/permissions/components/permission-gate";

// Mock the usePermission hook
const mockUsePermission = vi.fn();

vi.mock("@/features/permissions/hooks/use-permission", () => ({
  usePermission: (...args: unknown[]) => mockUsePermission(...args),
}));

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: {
      user: {
        id: "1",
        name: "Test User",
        username: "testuser",
        roleId: 1,
      },
    },
    status: "authenticated",
  }),
}));

describe("PermissionGate", () => {
  const mockProps = {
    hasPermission: vi.fn((code: string) => code === "test.permission"),
    hasAnyPermission: vi.fn((codes: string[]) =>
      codes.some((c) => c === "test.permission"),
    ),
    hasAllPermissions: vi.fn((codes: string[]) =>
      codes.every((c) => c === "test.permission"),
    ),
    byPassAllFeatures: false,
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePermission.mockReturnValue(mockProps);
  });

  describe("when user has permission", () => {
    it("renders children when user has the required permission", () => {
      mockUsePermission.mockReturnValue({
        ...mockProps,
        hasPermission: vi.fn(() => true),
      });

      render(
        <PermissionGate permission="test.permission">
          <div data-testid="protected-content">Protected Content</div>
        </PermissionGate>,
      );

      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });

    it("renders children when user has any of the required permissions", () => {
      mockUsePermission.mockReturnValue({
        ...mockProps,
        hasAnyPermission: vi.fn(() => true),
      });

      render(
        <PermissionGate
          permissions={["test.permission", "other.permission"]}
          requireAll={false}
        >
          <div data-testid="protected-content">Protected Content</div>
        </PermissionGate>,
      );

      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });

    it("renders children when user has all required permissions", () => {
      mockUsePermission.mockReturnValue({
        ...mockProps,
        hasAllPermissions: vi.fn(() => true),
      });

      render(
        <PermissionGate
          permissions={["test.permission", "another.permission"]}
          requireAll={true}
        >
          <div data-testid="protected-content">Protected Content</div>
        </PermissionGate>,
      );

      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });
  });

  describe("when user does not have permission", () => {
    it("renders fallback when user lacks required permission", () => {
      mockUsePermission.mockReturnValue({
        ...mockProps,
        hasPermission: vi.fn(() => false),
      });

      render(
        <PermissionGate
          permission="denied.permission"
          fallback={<div data-testid="fallback">Access Denied</div>}
        >
          <div data-testid="protected-content">Protected Content</div>
        </PermissionGate>,
      );

      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
      expect(screen.getByTestId("fallback")).toBeInTheDocument();
    });

    it("renders fallback when user lacks any of the required permissions", () => {
      mockUsePermission.mockReturnValue({
        ...mockProps,
        hasAnyPermission: vi.fn(() => false),
      });

      render(
        <PermissionGate
          permissions={["denied.permission", "another.denied"]}
          requireAll={false}
          fallback={<div data-testid="fallback">Access Denied</div>}
        >
          <div data-testid="protected-content">Protected Content</div>
        </PermissionGate>,
      );

      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
      expect(screen.getByTestId("fallback")).toBeInTheDocument();
    });

    it("renders fallback when user lacks all required permissions", () => {
      mockUsePermission.mockReturnValue({
        ...mockProps,
        hasAllPermissions: vi.fn(() => false),
      });

      render(
        <PermissionGate
          permissions={["denied.permission", "another.denied"]}
          requireAll={true}
          fallback={<div data-testid="fallback">Access Denied</div>}
        >
          <div data-testId="protected-content">Protected Content</div>
        </PermissionGate>,
      );

      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
      expect(screen.getByTestId("fallback")).toBeInTheDocument();
    });
  });

  describe("when loading", () => {
    it("renders loadingFallback when permissions are loading", () => {
      mockUsePermission.mockReturnValue({
        ...mockProps,
        isLoading: true,
      });

      render(
        <PermissionGate
          permission="test.permission"
          loadingFallback={<div data-testid="loading">Loading...</div>}
        >
          <div data-testid="protected-content">Protected Content</div>
        </PermissionGate>,
      );

      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
      expect(screen.getByTestId("loading")).toBeInTheDocument();
    });
  });

  describe("superadmin bypass", () => {
    it("renders children when user has bypass all features", () => {
      mockUsePermission.mockReturnValue({
        ...mockProps,
        byPassAllFeatures: true,
        hasPermission: vi.fn(() => false),
      });

      render(
        <PermissionGate permission="denied.permission">
          <div data-testid="protected-content">Protected Content</div>
        </PermissionGate>,
      );

      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });
  });

  describe("when no permission specified", () => {
    it("renders children when no permission is specified", () => {
      mockUsePermission.mockReturnValue({
        ...mockProps,
        hasPermission: vi.fn(() => false),
      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error - Testing case where neither permission nor permissions are provided
      render(
        <PermissionGate
          fallback={<div data-testid="fallback">Access Denied</div>}
        >
          <div data-testid="protected-content">Protected Content</div>
        </PermissionGate>,
      );

      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });
  });

  describe("null fallback and loadingFallback", () => {
    it("renders nothing when fallback is null and access denied", () => {
      mockUsePermission.mockReturnValue({
        ...mockProps,
        hasPermission: vi.fn(() => false),
      });

      const { container } = render(
        <PermissionGate permission="denied.permission" fallback={null}>
          <div data-testid="protected-content">Protected Content</div>
        </PermissionGate>,
      );

      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
      expect(container.firstChild).toBeNull();
    });

    it("renders nothing when loadingFallback is null and loading", () => {
      mockUsePermission.mockReturnValue({
        ...mockProps,
        isLoading: true,
      });

      const { container } = render(
        <PermissionGate permission="test.permission" loadingFallback={null}>
          <div data-testid="protected-content">Protected Content</div>
        </PermissionGate>,
      );

      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
      expect(container.firstChild).toBeNull();
    });
  });
});
