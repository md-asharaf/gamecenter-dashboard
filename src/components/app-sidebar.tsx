"use client";

import { LayoutDashboard, FolderKanban, Gamepad2, Settings, Users, LogOut, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { useAuth } from "@/providers/auth-provider";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  show: boolean;
  exact?: boolean;
}

export function AppSidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const { user, logout } = useAuth();

  const handleLogout = () => {
    toast.success("Logout successful.");
    logout();
  };

  const navItems: NavItem[] = [
    {
      title: "Overview",
      url: "/",
      exact: true,
      icon: LayoutDashboard,
      show: true,
    },
    {
      title: "Projects",
      url: "/projects",
      icon: FolderKanban,
      show: true,
    },
    {
      title: "Admins",
      url: "/users",
      icon: Users,
      show: user?.role === "SUPER_ADMIN",
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      show: true,
    },
  ];

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="h-16 flex items-center justify-center border-b px-4">
        <Link href="/projects" className="flex items-center gap-2 font-semibold">
          <div className="rounded-md bg-primary p-1">
            <Gamepad2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg">GameCenter</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.filter(i => i.show).map((item) => {
                const isActive = item.exact ? pathname === item.url : pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton isActive={isActive} tooltip={item.title} render={<Link href={item.url} />}>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              tooltip="Toggle Theme"
            >
              {mounted && theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span>Toggle Theme</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
              <LogOut className="text-red-500" />
              <span className="text-red-500">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
