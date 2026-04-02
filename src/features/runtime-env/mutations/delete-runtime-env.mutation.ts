"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRuntimeEnv } from "@/features/runtime-env/api/runtime-env";
import { runtimeEnvKeys } from "@/features/runtime-env/keys";

/**
 * Mutation factory for deleting a runtime env
 */
export const deleteRuntimeEnvMutation = {
  mutationFn: async (id: string) => {
    return await deleteRuntimeEnv(id);
  },
  onSuccess: (
    _data: Awaited<ReturnType<typeof deleteRuntimeEnv>>,
    _variables: string,
    _context: unknown,
    queryClient: ReturnType<typeof useQueryClient>,
  ) => {
    queryClient.invalidateQueries({
      queryKey: runtimeEnvKeys.all,
    });
  },
};

/**
 * Hook to delete a runtime env with automatic cache invalidation
 */
export function useDeleteRuntimeEnv() {
  const queryClient = useQueryClient();

  return useMutation({
    ...deleteRuntimeEnvMutation,
    onSuccess: (data, variables, context) => {
      deleteRuntimeEnvMutation.onSuccess(data, variables, context, queryClient);
    },
  });
}
