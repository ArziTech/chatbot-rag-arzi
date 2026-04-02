import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "@/components/theme-provider";

// Mock next-themes
vi.mock("next-themes", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
}));

describe("ThemeProvider", () => {
  it("should render children", () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="light">
        <div>Test Content</div>
      </ThemeProvider>,
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("should pass props to underlying provider", () => {
    const { container } = render(
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <div>Test Content</div>
      </ThemeProvider>,
    );

    const provider = container.querySelector('[data-testid="theme-provider"]');
    expect(provider).toBeInTheDocument();
  });

  it("should render multiple children", () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="light">
        <div>First Child</div>
        <div>Second Child</div>
      </ThemeProvider>,
    );

    expect(screen.getByText("First Child")).toBeInTheDocument();
    expect(screen.getByText("Second Child")).toBeInTheDocument();
  });

  it("should render nested components", () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="light">
        <div>
          <span>Nested Content</span>
        </div>
      </ThemeProvider>,
    );

    expect(screen.getByText("Nested Content")).toBeInTheDocument();
  });
});
