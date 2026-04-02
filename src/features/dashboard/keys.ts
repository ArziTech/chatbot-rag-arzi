export const dashboardKeys = {
  all: ["dashboard"] as const,
  menu: () => [...dashboardKeys.all, "menu"] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
} as const;
