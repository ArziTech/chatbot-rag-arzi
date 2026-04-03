"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { encrypt } from "@/lib/crypto";
import type { RuntimeEnvInput } from "../types";

export async function getRuntimeEnvs() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const runtimeEnvs = await prisma.runtimeEnv.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: { name: "asc" },
    });

    return { success: true, data: runtimeEnvs };
  } catch (error) {
    console.error("Error fetching runtime envs:", error);
    return { success: false, error: "Failed to fetch runtime environments" };
  }
}

export async function getRuntimeEnvById(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const runtimeEnv = await prisma.runtimeEnv.findUnique({
      where: { id },
    });

    if (!runtimeEnv) {
      return { success: false, error: "Runtime environment not found" };
    }

    // Check ownership
    if (runtimeEnv.userId !== session.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    return { success: true, data: runtimeEnv };
  } catch (error) {
    console.error("Error fetching runtime env:", error);
    return { success: false, error: "Failed to fetch runtime environment" };
  }
}

export async function createRuntimeEnv(data: RuntimeEnvInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if name already exists for this user
    const existing = await prisma.runtimeEnv.findFirst({
      where: {
        userId: session.user.id,
        name: data.name,
      },
    });

    if (existing) {
      return {
        success: false,
        error: "A runtime environment with this name already exists",
      };
    }

    const runtimeEnv = await prisma.runtimeEnv.create({
      data: {
        name: data.name,
        key: data.key,
        value: encrypt(data.value),
        description: data.description,
        isActive: data.isActive ?? true,
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard/settings");
    return { success: true, data: runtimeEnv };
  } catch (error) {
    console.error("Error creating runtime env:", error);
    return { success: false, error: "Failed to create runtime environment" };
  }
}

export async function updateRuntimeEnv(
  id: string,
  data: Partial<RuntimeEnvInput>,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Check ownership
    const existing = await prisma.runtimeEnv.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, error: "Runtime environment not found" };
    }

    if (existing.userId !== session.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if name already exists for this user (excluding current)
    if (data.name) {
      const nameExists = await prisma.runtimeEnv.findFirst({
        where: {
          userId: session.user.id,
          name: data.name,
          NOT: { id },
        },
      });

      if (nameExists) {
        return {
          success: false,
          error: "A runtime environment with this name already exists",
        };
      }
    }

    const runtimeEnv = await prisma.runtimeEnv.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.key !== undefined && { key: data.key }),
        ...(data.value !== undefined && { value: encrypt(data.value) }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    revalidatePath("/dashboard/settings");
    return { success: true, data: runtimeEnv };
  } catch (error) {
    console.error("Error updating runtime env:", error);
    return { success: false, error: "Failed to update runtime environment" };
  }
}

export async function deleteRuntimeEnv(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Check ownership
    const existing = await prisma.runtimeEnv.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, error: "Runtime environment not found" };
    }

    if (existing.userId !== session.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.runtimeEnv.delete({
      where: { id },
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Error deleting runtime env:", error);
    return { success: false, error: "Failed to delete runtime environment" };
  }
}

export async function deleteRuntimeEnvs(ids: string[]) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const results = {
      success: [] as string[],
      failed: [] as { id: string; error: string }[],
    };

    for (const id of ids) {
      // Check ownership
      const existing = await prisma.runtimeEnv.findUnique({
        where: { id },
      });

      if (!existing) {
        results.failed.push({ id, error: "Not found" });
        continue;
      }

      if (existing.userId !== session.user.id) {
        results.failed.push({ id, error: "Unauthorized" });
        continue;
      }

      await prisma.runtimeEnv.delete({
        where: { id },
      });
      results.success.push(id);
    }

    revalidatePath("/dashboard/settings");

    if (results.failed.length > 0 && results.success.length === 0) {
      return {
        success: false,
        error: `Failed to delete ${results.failed.length} runtime environment(s)`,
      };
    }

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    console.error("Error deleting runtime envs:", error);
    return { success: false, error: "Failed to delete runtime environments" };
  }
}

export async function toggleRuntimeEnvStatus(id: string, isActive: boolean) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Check ownership
    const existing = await prisma.runtimeEnv.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, error: "Runtime environment not found" };
    }

    if (existing.userId !== session.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    const runtimeEnv = await prisma.runtimeEnv.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath("/dashboard/settings");
    return { success: true, data: runtimeEnv };
  } catch (error) {
    console.error("Error toggling runtime env status:", error);
    return {
      success: false,
      error: "Failed to update runtime environment status",
    };
  }
}
