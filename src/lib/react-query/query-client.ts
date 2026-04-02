"use client";

import { QueryClient, type QueryClientConfig } from "@tanstack/react-query";
import { useState } from "react";

/**
 * Query client configuration following TanStack Query Rules - Rule 11: Cache Strategy
 */
const defaultOptions: QueryClientConfig["defaultOptions"] = {
  queries: {
    staleTime: 60 * 1000, // 60 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    retry: 1,
    refetchOnWindowFocus: false,
  },
};

/**
 * Creates a new QueryClient instance with default options
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions,
  });
}

/**
 * Hook to get or create QueryClient
 * Must be used within QueryProvider
 */
export function useQueryClient() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions,
      }),
  );

  return queryClient;
}
