import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "@/components/theme-toggle";

// Mock next-themes
const mockSetTheme = vi.fn();
const mockUseTheme = vi.fn(() => ({
  theme: "light",
  setTheme: mockSetTheme,
  systemTheme: "light",
  resolvedTheme: "light",
}));

vi.mock("next-themes", () => ({
  useTheme: () => mockUseTheme(),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render button with theme toggle", () => {
    mockUseTheme.mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
      systemTheme: "light",
      resolvedTheme: "light",
    });

    const { container } = render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it("should show Sun icon in light mode", () => {
    mockUseTheme.mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
      systemTheme: "light",
      resolvedTheme: "light",
    });

    const { container } = render(<ThemeToggle />);

    // Check for Sun icon (should be visible in light mode)
    const sunIcon = container.querySelector("svg");
    expect(sunIcon).toBeInTheDocument();
  });

  it("should switch to dark mode when clicked in light mode", async () => {
    const user = userEvent.setup();

    mockUseTheme.mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
      systemTheme: "light",
      resolvedTheme: "light",
    });

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: /toggle theme/i });
    await user.click(button);

    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("should switch to light mode when clicked in dark mode", async () => {
    const user = userEvent.setup();

    mockUseTheme.mockReturnValue({
      theme: "dark",
      setTheme: mockSetTheme,
      systemTheme: "dark",
      resolvedTheme: "dark",
    });

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: /toggle theme/i });
    await user.click(button);

    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("should have accessible label", () => {
    mockUseTheme.mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
      systemTheme: "light",
      resolvedTheme: "light",
    });

    render(<ThemeToggle />);

    // Check for screen reader text
    expect(screen.getByText(/toggle theme/i)).toBeInTheDocument();
  });

  it("should have proper button styling", () => {
    mockUseTheme.mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
      systemTheme: "light",
      resolvedTheme: "light",
    });

    const { container } = render(<ThemeToggle />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass(/inline-flex/);
    expect(button).toHaveClass(/items-center/);
  });

  it("should have icon size class", () => {
    mockUseTheme.mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
      systemTheme: "light",
      resolvedTheme: "light",
    });

    const { container } = render(<ThemeToggle />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass(/size-8/);
  });
});
