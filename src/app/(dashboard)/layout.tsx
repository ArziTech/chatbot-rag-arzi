import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar, SiteHeader } from "@/features/dashboard";
import { PermissionProvider } from "@/providers/permission-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="[--header-height:calc(--spacing(14))] h-screen overflow-hidden">
      <TooltipProvider>
        <PermissionProvider>
          <SidebarProvider className="flex flex-col h-screen overflow-hidden">
            <SiteHeader />
            <div className="flex flex-1 overflow-hidden min-h-0">
              <AppSidebar />
              <SidebarInset className="flex  h-full pt-4 flex-col relative overflow-hidden">
                {children}
              </SidebarInset>
            </div>
          </SidebarProvider>
        </PermissionProvider>
      </TooltipProvider>
    </div>
  );
}
