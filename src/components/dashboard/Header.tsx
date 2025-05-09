import { SidebarTrigger } from '@/components/ui/sidebar';
import { Globe } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-6 shadow-sm">
      <SidebarTrigger className="md:hidden" />
      <div className="flex items-center gap-2">
        <Globe className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Climate Health Insights
        </h1>
      </div>
    </header>
  );
}
