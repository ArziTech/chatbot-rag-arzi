import { QueryClient } from "@tanstack/react-query";
import { type RenderOptions, render } from "@testing-library/react";
import type { Session } from "next-auth";
import type { ReactElement } from "react";
import React from "react";
import { createMockSession } from "./auth-helpers";

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  session?: Session | null;
  queryClient?: QueryClient;
  theme?: string;
}

export const renderWithProviders = (
  ui: ReactElement,
  {
    session = createMockSession(),
    queryClient,
    theme = "light",
    ...renderOptions
  }: CustomRenderOptions = {},
) => {
  const testQueryClient =
    queryClient ||
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(
      QueryClientProvider,
      { client: testQueryClient },
      children,
    );
  };

  return {
    ...render(ui, { wrapper: AllTheProviders, ...renderOptions }),
    testQueryClient,
  };
};

// Re-export everything from RTL
export * from "@testing-library/react";
