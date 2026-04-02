"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePermissions } from "@/features/permissions/api/permissions";
import { permissionKeys } from "@/features/permissions/keys";

/**
 * Mutation factory for deleting multiple permissions
 * Following TanStack Query Rules - Rule 8: Mutation Factory Pattern
 */
export const deletePermissionsMutation = {
  mutationFn: async (ids: number[]) => {
    return await deletePermissions(ids);
  },
  onSuccess: (
    _data: Awaited<ReturnType<typeof deletePermissions>>,
    _variables: number[],
    _context: unknown,
    queryClient: ReturnType<typeof useQueryClient>,
  ) => {
    // Rule 9: Automatic Cache Invalidation
    queryClient.invalidateQueries({
      queryKey: permissionKeys.all,
    });
  },
};

/**
 * Hook to delete permissions with automatic cache invalidation
 */
export function useDeletePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    ...deletePermissionsMutation,
    onSuccess: (data, variables, context) => {
      deletePermissionsMutation.onSuccess(
        data,
        variables,
        context,
        queryClient,
      );
    },
  });
}
