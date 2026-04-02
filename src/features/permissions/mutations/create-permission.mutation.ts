"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPermission } from "@/features/permissions/api/permissions";
import { permissionKeys } from "@/features/permissions/keys";
import type { PermissionInput } from "@/features/permissions/types";

/**
 * Mutation factory for creating a permission
 * Following TanStack Query Rules - Rule 8: Mutation Factory Pattern
 */
export const createPermissionMutation = {
  mutationFn: async (data: PermissionInput) => {
    return await createPermission(data);
  },
  onSuccess: (
    _data: Awaited<ReturnType<typeof createPermission>>,
    _variables: PermissionInput,
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
 * Hook to create a permission with automatic cache invalidation
 */
export function useCreatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    ...createPermissionMutation,
    onSuccess: (data, variables, context) => {
      createPermissionMutation.onSuccess(data, variables, context, queryClient);
    },
  });
}
