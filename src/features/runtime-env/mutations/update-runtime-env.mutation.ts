"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRuntimeEnv } from "@/features/runtime-env/api/runtime-env";
import { runtimeEnvKeys } from "@/features/runtime-env/keys";
import type { RuntimeEnvInput } from "@/features/runtime-env/types";

/**
 * Mutation factory for updating a runtime env
 */
export const updateRuntimeEnvMutation = {
  mutationFn: async ({
    id,
    data,
  }: {
    id: string;
    data: Partial<RuntimeEnvInput>;
  }) => {
    return await updateRuntimeEnv(id, data);
  },
  onSuccess: (
    _data: Awaited<ReturnType<typeof updateRuntimeEnv>>,
    _variables: { id: string; data: Partial<RuntimeEnvInput> },
    _context: unknown,
    queryClient: ReturnType<typeof useQueryClient>,
  ) => {
    queryClient.invalidateQueries({
      queryKey: runtimeEnvKeys.all,
    });
  },
};

/**
 * Hook to update a runtime env with automatic cache invalidation
 */
export function useUpdateRuntimeEnv() {
  const queryClient = useQueryClient();

  return useMutation({
    ...updateRuntimeEnvMutation,
    onSuccess: (data, variables, context) => {
      updateRuntimeEnvMutation.onSuccess(data, variables, context, queryClient);
    },
  });
}
