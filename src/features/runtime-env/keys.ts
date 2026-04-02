export const runtimeEnvKeys = {
  all: ["runtime-env"] as const,
  lists: () => [...runtimeEnvKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...runtimeEnvKeys.lists(), filters] as const,
  details: () => [...runtimeEnvKeys.all, "detail"] as const,
  detail: (id: string) => [...runtimeEnvKeys.details(), id] as const,
} as const;
