"use client";

import { ChevronDown, ChevronRight, LogOut, Terminal } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Permission } from "@/features/permissions";
import { usePermission } from "@/features/permissions";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useSidebar } from "../hooks/use-sidebar";

interface User {
  name: string | null;
  username: string;
}

interface MenuItemProps {
  permission: Permission;
  isCollapsed: boolean;
  children?: Permission[];
}

function MenuItem({ permission, isCollapsed, children }: MenuItemProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = children && children.length > 0;
  const isActive = pathname === permission.href;

  // Determine icon component - memoized to prevent recreation on re-renders
  const Icon = useMemo(
    () => (permission.icon ? getIcon(permission.icon) : Terminal),
    [permission.icon],
  );

  // Render section heading first
  const sectionHeader = permission.isSection && !isCollapsed && (
    <h2 className="mt-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground uppercase">
      {permission.label}
    </h2>
  );

  const sectionDivider = permission.isSection && isCollapsed && (
    <div className="h-px bg-border my-2" />
  );

  if (hasChildren) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
            isActive
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "hover:bg-accent",
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left">{permission.label}</span>
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </>
          )}
        </button>
        {isOpen && !isCollapsed && (
          <div className="ml-6 mt-1 space-y-1">
            {children.map((child) => (
              <Link
                key={child.id}
                href={child.href || "#"}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                  pathname === child.href
                    ? "bg-primary text-primary-foreground font-medium hover:bg-primary/90"
                    : "hover:bg-accent",
                )}
              >
                <span>{child.label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Section with children - show header and children directly
  if (permission.isSection && hasChildren) {
    return (
      <div className="space-y-1">
        {sectionHeader}
        {sectionDivider}
        {!isCollapsed && (
          <div className="ml-4 space-y-1">
            {children.map((child) => {
              const ChildIcon = child.icon ? getIcon(child.icon) : null;
              return (
                <Link
                  key={child.id}
                  href={child.href || "#"}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all",
                    pathname === child.href
                      ? "bg-primary text-primary-foreground font-medium hover:bg-primary/90"
                      : "hover:bg-accent",
                  )}
                >
                  {ChildIcon && <ChildIcon className="h-4 w-4 shrink-0" />}
                  <span>{child.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Section without children - just show the header
  if (permission.isSection) {
    return (
      <div className="px-3 py-2">
        {sectionHeader}
        {sectionDivider}
      </div>
    );
  }

  return (
    <Link
      href={permission.href || "#"}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
        isActive
          ? "bg-primary text-primary-foreground font-medium hover:bg-primary/90"
          : "hover:bg-accent",
      )}
      title={isCollapsed ? permission.label : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!isCollapsed && <span>{permission.label}</span>}
    </Link>
  );
}

export function AppSidebarClient({ user }: { user?: User | null }) {
  const { permissions, isLoading } = usePermission();
  const { isCollapsed } = useSidebar();

  // Build hierarchical menu structure
  const menuItems = useMemo(() => {
    const sidebarPermissions = permissions
      .filter((p) => p.showOnSidebar)
      .sort((a, b) => a.sequence - b.sequence);

    // Separate parent and child items
    const parentItems = sidebarPermissions.filter((p) => !p.parentId);
    const childrenMap = new Map<number, Permission[]>();

    sidebarPermissions.forEach((p) => {
      if (p.parentId) {
        const children = childrenMap.get(p.parentId) || [];
        children.push(p);
        childrenMap.set(p.parentId, children);
      }
    });

    return parentItems.map((parent) => ({
      parent,
      children: childrenMap.get(parent.id) || [],
    }));
  }, [permissions]);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r bg-background transition-all duration-300 h-screen relative",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 flex-1">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Terminal className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Dashboard</span>
              <span className="truncate text-xs">Management System</span>
            </div>
          </Link>
        )}
        {isCollapsed && (
          <Link
            href="/dashboard"
            className="flex items-center justify-center w-full"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Terminal className="size-4" />
            </div>
          </Link>
        )}
      </div>

      <div className="flex-1 px-2 py-4 overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <nav className="space-y-1 h-full">
            {menuItems.map(({ parent, children }) => (
              <MenuItem
                key={parent.id}
                permission={parent}
                isCollapsed={isCollapsed}
              >
                {children}
              </MenuItem>
            ))}
          </nav>
        )}
      </div>

      {/* Footer with user info and logout */}
      <div className="border-t p-2 shrink-0 mt-auto">
        {user ? (
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg p-2",
              isCollapsed ? "justify-center" : "px-2",
            )}
          >
            <Avatar className="h-8 w-8 rounded-lg shrink-0">
              <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-xs font-medium">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.name || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.username || ""}
                </p>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                !isCollapsed && "mr-0 ml-auto",
              )}
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex justify-center p-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
