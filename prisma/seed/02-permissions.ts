/**
 * Seed Permissions
 * Run after: 01-roles.ts
 */

import type { PrismaClient } from "@prisma/client";

export async function seedPermissions(prisma: PrismaClient) {
  // Section permissions
  const sectionPermissions = [
    // Dashboard
    {
      code: "dashboard.section",
      label: "Dashboard",
      description: "Dashboard section",
      icon: "LayoutDashboard",
      module: "Dashboard",
      isSection: true,
      sequence: 1,
      showOnSidebar: true,
    },
    // User Management
    {
      code: "user.section",
      label: "User Management",
      description: "User management section",
      icon: "Users",
      module: "Users",
      isSection: true,
      sequence: 2,
      showOnSidebar: true,
    },
    // Role Management
    {
      code: "role.section",
      label: "Role Management",
      description: "Role management section",
      icon: "Shield",
      module: "Roles",
      isSection: true,
      sequence: 3,
      showOnSidebar: true,
    },
    // Permission Management
    {
      code: "permissions.section",
      label: "Permission Management",
      description: "Permission management section",
      icon: "Key",
      module: "Permissions",
      isSection: true,
      sequence: 4,
      showOnSidebar: true,
    },
    // Settings
    {
      code: "settings.section",
      label: "Settings",
      description: "Settings section",
      icon: "Settings",
      module: "Settings",
      isSection: true,
      sequence: 5,
      showOnSidebar: true,
    },
  ];

  // Create section permissions first
  await prisma.permission.createMany({
    data: sectionPermissions,
    skipDuplicates: true,
  });

  // Get section permissions to use their IDs as parentIds
  const sections = await prisma.permission.findMany({
    where: { isSection: true },
  });

  const sectionMap = new Map(sections.map((s) => [s.code, s.id]));

  // Child permissions with proper parentIds
  const childPermissions = [
    {
      code: "dashboard.view",
      label: "Overview",
      href: "/dashboard",
      description: "View dashboard overview",
      icon: "BarChart3",
      module: "dashboard",
      isSection: false,
      sequence: 1.1,
      parentId: sectionMap.get("dashboard.section"),
      showOnSidebar: true,
    },
    {
      code: "user.view",
      label: "Users",
      href: "/dashboard/users",
      description: "View users list",
      icon: "User",
      module: "user",
      isSection: false,
      sequence: 2.1,
      parentId: sectionMap.get("user.section"),
      showOnSidebar: true,
    },
    {
      code: "user.create",
      label: "Create User",
      description: "Create new user",
      module: "user",
      isSection: false,
      parentId: null,
      showOnSidebar: false,
    },
    {
      code: "user.edit",
      label: "Edit User",
      description: "Edit existing user",
      module: "user",
      isSection: false,
      parentId: null,
      showOnSidebar: false,
    },
    {
      code: "user.delete",
      label: "Delete User",
      description: "Delete user",
      module: "user",
      isSection: false,
      parentId: null,
      showOnSidebar: false,
    },
    {
      code: "role.view",
      label: "Roles",
      href: "/dashboard/roles",
      description: "View roles list",
      icon: "ShieldCheck",
      module: "role",
      isSection: false,
      sequence: 3.1,
      parentId: sectionMap.get("role.section"),
      showOnSidebar: true,
    },
    {
      code: "role.create",
      label: "Create Role",
      description: "Create new role",
      module: "role",
      isSection: false,
      parentId: null,
      showOnSidebar: false,
    },
    {
      code: "role.edit",
      label: "Edit Role",
      description: "Edit existing role",
      module: "role",
      isSection: false,
      parentId: null,
      showOnSidebar: false,
    },
    {
      code: "role.delete",
      label: "Delete Role",
      description: "Delete role",
      module: "Roles",
      isSection: false,
      parentId: null,
      showOnSidebar: false,
    },
    {
      code: "permissions.view",
      label: "Permissions",
      href: "/dashboard/permissions",
      description: "View permissions list",
      icon: "Key",
      module: "Permissions",
      isSection: false,
      sequence: 4.1,
      parentId: sectionMap.get("permissions.section"),
      showOnSidebar: true,
    },
    {
      code: "permissions.manage",
      label: "Manage Permissions",
      description: "Create, edit, and delete permissions",
      module: "Permissions",
      isSection: false,
      parentId: null,
      showOnSidebar: false,
    },
    {
      code: "settings.view",
      label: "General",
      href: "/dashboard/settings",
      description: "View general settings",
      icon: "Settings2",
      module: "Settings",
      isSection: false,
      sequence: 5.1,
      parentId: sectionMap.get("settings.section"),
      showOnSidebar: true,
    },
  ];

  // Create child permissions
  await prisma.permission.createMany({
    data: childPermissions,
    skipDuplicates: true,
  });

  console.log("✅ Permissions created");
}
