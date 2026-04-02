import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/user-nav";
import { auth } from "@/lib/auth";

export async function Navbar() {
  let session = null;

  try {
    session = await auth();
  } catch (error) {
    // If there's an error reading the session (e.g., invalid JWT),
    // treat the user as not authenticated
    console.error("Error reading session:", error);
    session = null;
  }

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold">
            StarterKit
          </Link>
          <div className="flex gap-4 text-sm">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground"
            >
              Home
            </Link>
            {session?.user && (
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground"
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {session?.user ? (
            <UserNav user={session.user} />
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
