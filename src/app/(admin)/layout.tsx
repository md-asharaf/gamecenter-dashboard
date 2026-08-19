import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { UserNav } from "@/components/user-nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <SidebarTrigger className="-ml-1" />
          <UserNav />
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto bg-zinc-50/50 dark:bg-zinc-950/50">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
