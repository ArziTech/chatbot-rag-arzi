import { auth } from "@/lib/auth";
import { AppSidebarClient } from "./app-sidebar-client";

export async function AppSidebar() {
  const session = await auth();

  return (
    <AppSidebarClient
      user={
        session?.user
          ? {
              name: session.user.name,
              username: (session.user as { username?: string }).username || "",
            }
          : null
      }
    />
  );
}
