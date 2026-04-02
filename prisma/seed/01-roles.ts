/**
 * Seed Roles
 * Run after: (none - first in sequence)
 */

import type { PrismaClient } from "@prisma/client";

export async function seedRoles(prisma: PrismaClient) {
  const roles = [
    {
      name: "SUPERADMIN",
      description: "Super administrator with full bypass access",
      byPassAllFeatures: true,
      isActive: true,
    },
    {
      name: "ADMIN",
      description: "Administrator with management access",
      byPassAllFeatures: false,
      isActive: true,
    },
    {
      name: "MODERATOR",
      description: "Moderator with enhanced permissions",
      byPassAllFeatures: false,
      isActive: true,
    },
    {
      name: "USER",
      description: "Regular user with limited access",
      byPassAllFeatures: false,
      isActive: true,
    },
  ];

  await prisma.role.createMany({
    data: roles,
    skipDuplicates: true,
  });

  console.log("✅ Roles created");
}
