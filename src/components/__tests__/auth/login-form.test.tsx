import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/features/auth";
import {
  mockPush,
  resetRouterMocks,
} from "../../../../__tests__/__mocks__/next-router";

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRouterMocks();
    vi.mocked(signIn).mockResolvedValue({ error: null });
    vi.mocked(toast.success).mockReset();
    vi.mocked(toast.error).mockReset();
  });

  it("should render login form with all fields", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^login$/i }),
    ).toBeInTheDocument();
  });

  it("should show heading and description", () => {
    render(<LoginForm />);

    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByText(/login to your account/i)).toBeInTheDocument();
  });

  it("should validate username - show error for short username", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const usernameInput = screen.getByLabelText(/username/i);
    const submitButton = screen.getByRole("button", { name: /^login$/i });

    await user.type(usernameInput, "ab");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/username must be at least 3 characters/i),
      ).toBeInTheDocument();
    });
  });

  it("should validate password - show error for short password", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /^login$/i });

    await user.type(passwordInput, "123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/password must be at least 6 characters/i),
      ).toBeInTheDocument();
    });
  });

  it("should submit form with valid data", async () => {
    const user = userEvent.setup();

    render(<LoginForm />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /^login$/i });

    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(vi.mocked(signIn)).toHaveBeenCalledWith("credentials", {
          username: "testuser",
          password: "password123",
          redirect: false,
        });
      },
      { timeout: 2000 },
    );
  });

  it("should show error message on login failure", async () => {
    const user = userEvent.setup();

    vi.mocked(signIn).mockResolvedValue({ error: "Invalid credentials" });

    render(<LoginForm />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /^login$/i });

    await user.type(usernameInput, "wronguser");
    await user.type(passwordInput, "wrongpass");
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
          "Invalid credentials",
        );
      },
      { timeout: 2000 },
    );
  });

  it("should show success message and redirect on successful login", async () => {
    const user = userEvent.setup();

    vi.mocked(signIn).mockResolvedValue({ error: null });

    render(<LoginForm />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /^login$/i });

    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
          "Login successful!",
        );
        expect(mockPush).toHaveBeenCalledWith("/");
      },
      { timeout: 2000 },
    );
  });

  it("should show loading state while submitting", async () => {
    const user = userEvent.setup();
    vi.mocked(signIn).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ error: null }), 1000),
        ),
    );

    render(<LoginForm />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /^login$/i });

    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(submitButton).toBeDisabled();
      },
      { timeout: 2000 },
    );
  });

  it("should have social login buttons", () => {
    render(<LoginForm />);

    expect(
      screen.getByRole("button", { name: /login with apple/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /login with google/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /login with meta/i }),
    ).toBeInTheDocument();
  });

  it("should have link to signup page", () => {
    render(<LoginForm />);

    const signupLink = screen.getByRole("link", { name: /sign up/i });
    expect(signupLink).toHaveAttribute("href", "/signup");
  });

  it("should show generic error on network failure", async () => {
    const user = userEvent.setup();

    vi.mocked(signIn).mockRejectedValue(new Error("Network error"));

    render(<LoginForm />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /^login$/i });

    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
          "Something went wrong. Please try again.",
        );
      },
      { timeout: 2000 },
    );
  });
});
