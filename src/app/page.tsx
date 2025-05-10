

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AppHeader } from '@/components/dashboard/Header';
import { InteractiveMap } from '@/components/dashboard/InteractiveMap';
import { LayerToggles } from '@/components/dashboard/LayerToggles';
import { TimeSlider } from '@/components/dashboard/TimeSlider';
import { RegionalInfoPanel } from '@/components/dashboard/RegionalInfoPanel';
import { InsightsGenerator } from '@/components/dashboard/InsightsGenerator';
import { RegionSelector } from '@/components/dashboard/RegionSelector'; 
import { DiseaseSelector } from '@/components/dashboard/DiseaseSelector';
import { FoliumMapPlaceholder } from '@/components/dashboard/FoliumMapPlaceholder';
import { SidebarSeparator } from '@/components/ui/sidebar';
import { DashboardProvider } from '@/context/DashboardContext';

// Create a client component to wrap content that needs context
function DashboardContent() {
  const sidebarContent = (
    <>
      <RegionSelector /> 
      <SidebarSeparator />
      <DiseaseSelector />
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
      <main className="flex-1 p-6 flex flex-col space-y-6 overflow-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <InteractiveMap />
          </div>
          <div className="flex-1 min-w-0">
            <FoliumMapPlaceholder />
          </div>
        </div>
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

