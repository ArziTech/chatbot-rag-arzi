export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  list: (filters?: Record<string, any>) =>
    [...roleKeys.lists(), filters] as const,
  details: () => [...roleKeys.all, "detail"] as const,
  detail: (id: number) => [...roleKeys.details(), id] as const,
} as const;
