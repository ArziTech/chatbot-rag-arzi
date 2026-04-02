import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.roleId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get role with byPassAllFeatures
  const role = await prisma.role.findUnique({
    where: { id: session.user.roleId as number },
    select: { byPassAllFeatures: true },
  });

  const byPassAllFeatures = role?.byPassAllFeatures || false;

  let permissions;

  if (byPassAllFeatures) {
    // Superadmin gets all active permissions
    permissions = await prisma.permission.findMany({
      where: { isActive: true },
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
        isActive: true,
      },
      orderBy: [{ sequence: "asc" }],
    });
  }

  return NextResponse.json({
    permissions,
    byPassAllFeatures,
  });
}
