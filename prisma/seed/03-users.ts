/**
 * Seed Users
 * Run after: 01-roles.ts
 */

import type { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

interface UserSeed {
  username: string;
  name: string;
  email: string;
  plainPassword: string;
  roleName: string;
}

export async function seedUsers(prisma: PrismaClient) {
  const users: UserSeed[] = [
    {
      username: "superadmin",
      name: "Super Administrator",
      email: "superadmin@example.com",
      plainPassword: "super123",
      roleName: "SUPERADMIN",
    },
    {
      username: "admin",
      name: "Administrator",
      email: "admin@example.com",
      plainPassword: "admin123",
      roleName: "ADMIN",
    },
    {
      username: "moderator",
      name: "Moderator",
      email: "moderator@example.com",
      plainPassword: "mod123",
      roleName: "MODERATOR",
    },
    {
      username: "user",
      name: "Regular User",
      email: "user@example.com",
      plainPassword: "user123",
      roleName: "USER",
    },
  ];

  // Fetch all roles to get their IDs
  const allRoles = await prisma.role.findMany();
  const roleMap = new Map(allRoles.map((r) => [r.name, r]));

  for (const user of users) {
    // Find role by name
    const role = roleMap.get(user.roleName);

    if (!role) {
      console.error(`❌ Role ${user.roleName} not found`);
      continue;
    }

    await prisma.user.upsert({
      where: { username: user.username },
      update: {},
      create: {
        username: user.username,
        name: user.name,
        email: user.email,
        password: await bcrypt.hash(user.plainPassword, 10),
        roleId: role.id,
        status: true,
      },
    });
  }

  console.log("✅ Users created");
}
