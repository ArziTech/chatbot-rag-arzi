"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { createQueryClient } from "./query-client";

const queryClient = createQueryClient();

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * QueryProvider wraps the application with React Query context
 * Use in root layout or app provider
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
