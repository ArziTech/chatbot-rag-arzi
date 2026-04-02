export const settingsKeys = {
  all: ["settings"] as const,
  app: () => [...settingsKeys.all, "app"] as const,
  user: (userId: string) => [...settingsKeys.all, "user", userId] as const,
} as const;
