import { getRuntimeEnvs } from "@/features/runtime-env/api/runtime-env";
import { runtimeEnvKeys } from "@/features/runtime-env/keys";

/**
 * Query factory for runtime envs list
 * Following TanStack Query Rules - Rule 5: Query Options Pattern
 */
export const runtimeEnvsListQuery = () => ({
  queryKey: runtimeEnvKeys.lists(),
  queryFn: async () => {
    return await getRuntimeEnvs();
  },
});
