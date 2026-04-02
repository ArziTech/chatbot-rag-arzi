import type { RuntimeEnv as PrismaRuntimeEnv } from "@prisma/client";

// Export Prisma model type
export type RuntimeEnv = PrismaRuntimeEnv;

export interface RuntimeEnvInput {
  name: string;
  key: string;
  value: string;
  description?: string | null;
  isActive?: boolean;
}

export interface RuntimeEnvCheck {
  hasRuntimeEnv: (name: string) => boolean;
  runtimeEnvs: RuntimeEnv[];
  isLoading: boolean;
}
