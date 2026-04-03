import { Navbar } from "@/features/dashboard";
import { UserPreferencesProvider } from "@/providers/user-preferences-provider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserPreferencesProvider>
      {/* <Navbar /> */}
      <main className="min-h-screen">{children}</main>
    </UserPreferencesProvider>
  );
}
