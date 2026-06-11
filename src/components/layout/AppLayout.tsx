import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

interface AppLayoutProps {
  children: React.ReactNode;
  fullBleed?: boolean;
}

export function AppLayout({ children, fullBleed = false }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto flex flex-col min-h-0">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
            <SidebarTrigger />
            <div className="flex-1" />
            <AppHeader />
          </header>
          <div className={fullBleed ? 'flex-1 min-h-0 overflow-hidden' : 'p-6'}>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
