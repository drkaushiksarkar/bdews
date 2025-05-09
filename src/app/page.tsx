import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AppHeader } from '@/components/dashboard/Header';
import { InteractiveMap } from '@/components/dashboard/InteractiveMap';
import { LayerToggles } from '@/components/dashboard/LayerToggles';
import { TimeSlider } from '@/components/dashboard/TimeSlider';
import { RegionalInfoPanel } from '@/components/dashboard/RegionalInfoPanel';
import { InsightsGenerator } from '@/components/dashboard/InsightsGenerator';
import { SidebarSeparator } from '@/components/ui/sidebar';

export default function Home() {
  const sidebarContent = (
    <>
      <LayerToggles />
      <SidebarSeparator />
      <TimeSlider />
      <SidebarSeparator />
      <InsightsGenerator />
    </>
  );

  const mainContent = (
    <>
      <AppHeader />
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        <InteractiveMap />
        <RegionalInfoPanel />
      </main>
    </>
  );

  return (
    <DashboardLayout
      sidebarContent={sidebarContent}
      mainContent={mainContent}
    />
  );
}
