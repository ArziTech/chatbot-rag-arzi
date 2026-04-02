import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.roleId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if role bypasses all features
  const role = await prisma.role.findUnique({
    where: { id: session.user.roleId as number },
    select: { byPassAllFeatures: true },
  });

  let permissions;

  if (role?.byPassAllFeatures) {
    // Superadmin gets all sidebar permissions
    permissions = await prisma.permission.findMany({
      where: {
        showOnSidebar: true,
        isActive: true,
      },
      orderBy: [{ sequence: "asc" }],
    });
  } else {
    // Get permissions through role permissions
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId: session.user.roleId as number },
      select: { permissionId: true },
    });

    const permissionIds = rolePermissions.map((rp) => rp.permissionId);

    permissions = await prisma.permission.findMany({
      where: {
        id: { in: permissionIds },
        showOnSidebar: true,
        isActive: true,
      },
      orderBy: [{ sequence: "asc" }],
    });
  }

  // Build tree structure for menu
  const buildMenuTree = (
    perms: typeof permissions,
    parentId: number | null = null,
  ): any[] => {
    return perms
      .filter((p) => p.parentId === parentId)
      .map((permission) => ({
        id: permission.id,
        code: permission.code,
        title: permission.label,
        url: permission.href || "#",
        icon: permission.icon || null,
        isSection: permission.isSection,
        children: buildMenuTree(perms, permission.id),
      }));
  };

  const menuTree = buildMenuTree(permissions);

  return NextResponse.json({ menu: menuTree });
}
