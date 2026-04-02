"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { UpdatePreferencesInput } from "../types";

export async function updatePreferences(data: UpdatePreferencesInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const updateData: Record<string, unknown> = {};

    if (data.defaultModel !== undefined) {
      updateData.defaultModel = data.defaultModel;
    }
    if (data.defaultProvider !== undefined) {
      updateData.defaultProvider = data.defaultProvider;
    }
    if (data.openaiKey !== undefined) {
      updateData.openaiKey = data.openaiKey || null;
    }
    if (data.anthropicKey !== undefined) {
      updateData.anthropicKey = data.anthropicKey || null;
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        defaultModel: true,
        defaultProvider: true,
        openaiKey: true,
        anthropicKey: true,
      },
    });

    revalidatePath("/dashboard/settings");

    // Return without exposing encrypted keys
    return {
      success: true,
      data: {
        defaultModel: user.defaultModel,
        defaultProvider: user.defaultProvider,
        hasOpenAIKey: !!user.openaiKey,
        hasAnthropicKey: !!user.anthropicKey,
      },
    };
  } catch (error) {
    console.error("Update preferences error:", error);
    return { success: false, error: "Failed to update preferences" };
  }
}

export async function getPreferences() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        defaultModel: true,
        defaultProvider: true,
        openaiKey: true,
        anthropicKey: true,
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return {
      success: true,
      data: {
        defaultModel: user.defaultModel,
        defaultProvider: user.defaultProvider,
        hasOpenAIKey: !!user.openaiKey,
        hasAnthropicKey: !!user.anthropicKey,
      },
    };
  } catch (error) {
    console.error("Get preferences error:", error);
    return { success: false, error: "Failed to get preferences" };
  }
}
