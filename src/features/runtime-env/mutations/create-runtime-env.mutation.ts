"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRuntimeEnv } from "@/features/runtime-env/api/runtime-env";
import { runtimeEnvKeys } from "@/features/runtime-env/keys";
import type { RuntimeEnvInput } from "@/features/runtime-env/types";

/**
 * Mutation factory for creating a runtime env
 * Following TanStack Query Rules - Rule 8: Mutation Factory Pattern
 */
export const createRuntimeEnvMutation = {
  mutationFn: async (data: RuntimeEnvInput) => {
    return await createRuntimeEnv(data);
  },
  onSuccess: (
    _data: Awaited<ReturnType<typeof createRuntimeEnv>>,
    _variables: RuntimeEnvInput,
    _context: unknown,
    queryClient: ReturnType<typeof useQueryClient>,
  ) => {
    // Rule 9: Automatic Cache Invalidation
    queryClient.invalidateQueries({
      queryKey: runtimeEnvKeys.all,
    });
  },
};

/**
 * Hook to create a runtime env with automatic cache invalidation
 */
export function useCreateRuntimeEnv() {
  const queryClient = useQueryClient();

  return useMutation({
    ...createRuntimeEnvMutation,
    onSuccess: (data, variables, context) => {
      createRuntimeEnvMutation.onSuccess(
        data,
        variables,
        context,
        queryClient,
      );
    },
  });
}
