
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AppHeader } from '@/components/dashboard/Header';
import { InteractiveMap } from '@/components/dashboard/InteractiveMap';
import { LayerToggles } from '@/components/dashboard/LayerToggles';
import { TimeSlider } from '@/components/dashboard/TimeSlider';
import { RegionalInfoPanel } from '@/components/dashboard/RegionalInfoPanel';
import { InsightsGenerator } from '@/components/dashboard/InsightsGenerator';
import { RegionSelector } from '@/components/dashboard/RegionSelector'; // Added
import { SidebarSeparator } from '@/components/ui/sidebar';
import { DashboardProvider } from '@/context/DashboardContext';

// Create a client component to wrap content that needs context
function DashboardContent() {
  const sidebarContent = (
    <>
      <RegionSelector /> {/* Added */}
      <SidebarSeparator />
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


export default function Home() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
