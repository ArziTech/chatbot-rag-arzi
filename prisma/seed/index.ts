/**
 * Prisma Database Seed
 *
 * This is the main entry point for seeding the database.
 * It imports and runs all seed modules in sequence.
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { seedRoles } from "./01-roles";
import { seedPermissions } from "./02-permissions";
import { seedUsers } from "./03-users";
import { seedRolePermissions } from "./04-role-permissions";

const connectionString = process.env.DATABASE_URL || "";

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...");

  // Run seeds in order
  await seedRoles(prisma);
  await seedPermissions(prisma);
  await seedUsers(prisma);
  await seedRolePermissions(prisma);

  // ==================== CREDENTIALS ====================
  console.log("\n📋 Account Credentials:");
  console.log("─".repeat(50));
  console.log("🔑 SUPERADMIN - username: superadmin, password: super123");
  console.log("🔑 ADMIN      - username: admin, password: admin123");
  console.log("🔑 MODERATOR  - username: moderator, password: mod123");
  console.log("🔑 USER       - username: user, password: user123");
  console.log("─".repeat(50));
  console.log("✅ Seed completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
