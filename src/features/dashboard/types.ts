export interface SidebarState {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
  items?: NavItem[];
}

export interface SidebarMenuItem {
  permission: {
    id: number;
    code: string;
    label: string;
    href: string | null;
    icon: string | null;
    isSection: boolean;
    sequence: number;
  };
  isCollapsed: boolean;
  children?: any[];
}
