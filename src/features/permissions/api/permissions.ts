"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { PermissionInput } from "../types";

export async function getPermissions() {
  try {
    const permissions = await prisma.permission.findMany({
      include: {
        parent: {
          select: {
            id: true,
            label: true,
            code: true,
          },
        },
        _count: {
          select: {
            children: true,
            RolePermission: true,
          },
        },
      },
      orderBy: [{ sequence: "asc" }, { module: "asc" }, { label: "asc" }],
    });

    return { success: true, data: permissions };
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return { success: false, error: "Failed to fetch permissions" };
  }
}

export async function getPermissionById(id: number) {
  try {
    const permission = await prisma.permission.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            label: true,
            code: true,
          },
        },
      },
    });

    if (!permission) {
      return { success: false, error: "Permission not found" };
    }

    return { success: true, data: permission };
  } catch (error) {
    console.error("Error fetching permission:", error);
    return { success: false, error: "Failed to fetch permission" };
  }
}

export async function createPermission(data: PermissionInput) {
  try {
    const permission = await prisma.permission.create({
      data: {
        code: data.code.toLowerCase().replace(/\s+/g, "."),
        label: data.label,
        href: data.href,
        description: data.description,
        icon: data.icon,
        module: data.module,
        isSection: data.isSection ?? false,
        sequence: data.sequence ?? 0,
        parentId: data.parentId,
        showOnSidebar: data.showOnSidebar ?? false,
        isActive: data.isActive ?? true,
      },
    });

    revalidatePath("/dashboard/permissions");
    return { success: true, data: permission };
  } catch (error) {
    console.error("Error creating permission:", error);
    return { success: false, error: "Failed to create permission" };
  }
}

export async function updatePermission(
  id: number,
  data: Partial<PermissionInput>,
) {
  try {
    const permission = await prisma.permission.update({
      where: { id },
      data: {
        ...(data.code && {
          code: data.code.toLowerCase().replace(/\s+/g, "."),
        }),
        ...(data.label !== undefined && { label: data.label }),
        ...(data.href !== undefined && { href: data.href }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.module !== undefined && { module: data.module }),
        ...(data.isSection !== undefined && { isSection: data.isSection }),
        ...(data.sequence !== undefined && { sequence: data.sequence }),
        ...(data.parentId !== undefined && { parentId: data.parentId }),
        ...(data.showOnSidebar !== undefined && {
          showOnSidebar: data.showOnSidebar,
        }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    revalidatePath("/dashboard/permissions");
    return { success: true, data: permission };
  } catch (error) {
    console.error("Error updating permission:", error);
    return { success: false, error: "Failed to update permission" };
  }
}

export async function deletePermission(id: number) {
  try {
    // Check if permission has children
    const hasChildren = await prisma.permission.count({
      where: { parentId: id },
    });

    if (hasChildren > 0) {
      return {
        success: false,
        error:
          "Cannot delete permission with child permissions. Please delete or reassign child permissions first.",
      };
    }

    // Check if permission is assigned to any roles
    const hasRoles = await prisma.rolePermission.count({
      where: { permissionId: id },
    });

    if (hasRoles > 0) {
      return {
        success: false,
        error:
          "Cannot delete permission assigned to roles. Please remove from roles first.",
      };
    }

    await prisma.permission.delete({
      where: { id },
    });

    revalidatePath("/dashboard/permissions");
    return { success: true };
  } catch (error) {
    console.error("Error deleting permission:", error);
    return { success: false, error: "Failed to delete permission" };
  }
}

export async function deletePermissions(ids: number[]) {
  try {
    const results = {
      success: [] as number[],
      failed: [] as { id: number; error: string }[],
    };

    for (const id of ids) {
      // Check if permission has children
      const hasChildren = await prisma.permission.count({
        where: { parentId: id },
      });

      if (hasChildren > 0) {
        results.failed.push({
          id,
          error: "Cannot delete permission with child permissions",
        });
        continue;
      }

      // Check if permission is assigned to any roles
      const hasRoles = await prisma.rolePermission.count({
        where: { permissionId: id },
      });

      if (hasRoles > 0) {
        results.failed.push({
          id,
          error: "Cannot delete permission assigned to roles",
        });
        continue;
      }

      await prisma.permission.delete({
        where: { id },
      });
      results.success.push(id);
    }

    revalidatePath("/dashboard/permissions");

    if (results.failed.length > 0 && results.success.length === 0) {
      return {
        success: false,
        error: `Failed to delete ${results.failed.length} permission(s): ${results.failed.map((f) => f.error).join(", ")}`,
      };
    }

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    console.error("Error deleting permissions:", error);
    return { success: false, error: "Failed to delete permissions" };
  }
}

export async function getPermissionsForSelect() {
  try {
    const permissions = await prisma.permission.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        label: true,
        code: true,
        module: true,
      },
      orderBy: [{ module: "asc" }, { label: "asc" }],
    });

    return { success: true, data: permissions };
  } catch (error) {
    console.error("Error fetching permissions for select:", error);
    return { success: false, error: "Failed to fetch permissions" };
  }
}

export async function togglePermissionStatus(id: number, isActive: boolean) {
  try {
    const permission = await prisma.permission.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath("/dashboard/permissions");
    return { success: true, data: permission };
  } catch (error) {
    console.error("Error toggling permission status:", error);
    return { success: false, error: "Failed to update permission status" };
  }
}
