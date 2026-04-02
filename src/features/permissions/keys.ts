export const permissionKeys = {
  all: ["permissions"] as const,
  lists: () => [...permissionKeys.all, "list"] as const,
  list: (filters?: Record<string, any>) =>
    [...permissionKeys.lists(), filters] as const,
  details: () => [...permissionKeys.all, "detail"] as const,
  detail: (id: number) => [...permissionKeys.details(), id] as const,
  forSelect: () => [...permissionKeys.all, "select"] as const,
} as const;
