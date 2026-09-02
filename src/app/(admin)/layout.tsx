import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { UserNav } from "@/components/user-nav";
import { CommandPalette } from "@/components/command-palette";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <AppSidebar />
      <SidebarInset className="h-full flex flex-col overflow-hidden bg-background">
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <UserNav />
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto bg-muted/20 dark:bg-muted/10">
          {children}
        </main>
      </SidebarInset>
      <CommandPalette />
    </SidebarProvider>
  );
}
