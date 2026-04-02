import { getPermissions } from "@/features/permissions/api/permissions";
import { permissionKeys } from "@/features/permissions/keys";

/**
 * Query factory for permissions list
 * Following TanStack Query Rules - Rule 5: Query Options Pattern
 *
 * Note: This query can be used from both server (prefetch) and client (useQuery)
 */
export const permissionsListQuery = () => ({
  queryKey: permissionKeys.lists(),
  queryFn: async () => {
    return await getPermissions();
  },
});
