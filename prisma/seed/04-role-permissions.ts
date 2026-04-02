/**
 * Seed Role Permissions
 * Run after: 01-roles.ts, 02-permissions.ts
 */

import type { PrismaClient } from "@prisma/client";

interface RolePermissionConfig {
  roleName: string;
  permissionCodes: string[];
}

export async function seedRolePermissions(prisma: PrismaClient) {
  const rolePermissionsConfig: RolePermissionConfig[] = [
    {
      roleName: "SUPERADMIN",
      permissionCodes: ["*"], // All permissions
    },
    {
      roleName: "ADMIN",
      permissionCodes: [
        "dashboard.section",
        "dashboard.view",
        "user.section",
        "user.view",
        "user.create",
        "user.edit",
        "user.delete",
        "role.section",
        "role.view",
        "permissions.section",
        "permissions.view",
        "permissions.manage",
        "settings.section",
        "settings.view",
      ],
    },
    {
      roleName: "MODERATOR",
      permissionCodes: [
        "dashboard.section",
        "dashboard.view",
        "user.section",
        "user.view",
        "user.create",
        "user.edit",
        "role.section",
        "role.view",
        "settings.section",
        "settings.view",
      ],
    },
    {
      roleName: "USER",
      permissionCodes: ["dashboard.section", "dashboard.view"],
    },
  ];

  // Fetch all roles and permissions
  const allRoles = await prisma.role.findMany();
  const roleMap = new Map(allRoles.map((r) => [r.name, r]));

  const allPermissions = await prisma.permission.findMany();
  const permissionMap = new Map(allPermissions.map((p) => [p.code, p]));

  for (const config of rolePermissionsConfig) {
    // Find role by name
    const role = roleMap.get(config.roleName);

    if (!role) {
      console.error(`❌ Role ${config.roleName} not found`);
      continue;
    }

    if (config.permissionCodes.includes("*")) {
      // Superadmin gets all permissions
      for (const permission of allPermissions) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
      }
    } else {
      // Other roles get specific permissions
      for (const code of config.permissionCodes) {
        const permission = permissionMap.get(code);

        if (!permission) {
          console.error(`❌ Permission ${code} not found`);
          continue;
        }

        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
      }
    }
  }

  console.log("✅ Role permissions created");
}
