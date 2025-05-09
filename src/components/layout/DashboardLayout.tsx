import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LayoutDashboard } from 'lucide-react';

interface DashboardLayoutProps {
  sidebarContent: ReactNode;
  mainContent: ReactNode;
}

export function DashboardLayout({ sidebarContent, mainContent }: DashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true} variant="inset" collapsible="icon">
      <Sidebar side="left" className="border-r">
        <SidebarHeader className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <LayoutDashboard className="w-6 h-6 text-primary" />
            <h1 className="text-lg font-semibold text-foreground group-data-[collapsible=icon]:hidden">
              Controls
            </h1>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <ScrollArea className="flex-grow">
          <SidebarContent className="p-0">
            {sidebarContent}
          </SidebarContent>
        </ScrollArea>
        <SidebarSeparator />
        <SidebarFooter className="p-4">
          <p className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            © {new Date().getFullYear()} Climate Health Insights
          </p>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        {mainContent}
      </SidebarInset>
    </SidebarProvider>
  );
}
