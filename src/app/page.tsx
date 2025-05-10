

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
import { DistributionChartsPlaceholder } from '@/components/dashboard/DistributionChartsPlaceholder';
import { KeyPerformanceIndicators } from '@/components/dashboard/KeyPerformanceIndicators';
import { RiskCommunicationArea } from '@/components/dashboard/RiskCommunicationArea';
import { WeatherInfoPanel } from '@/components/dashboard/WeatherInfoPanel'; // Import WeatherInfoPanel
import { SidebarSeparator } from '@/components/ui/sidebar';
import { DashboardProvider } from '@/context/DashboardContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
      <main className="flex-1 p-6 flex flex-col space-y-6 overflow-auto bg-background">
        {/* Panel 1: Geospatial Visualizations */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Geospatial Visualizations</CardTitle>
            <CardDescription>Interactive maps showing geographical data and hotspots.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 min-w-0">
              <InteractiveMap />
            </div>
            <div className="flex-1 min-w-0">
              <FoliumMapPlaceholder />
            </div>
          </CardContent>
        </Card>

        {/* Panel 2: Time Series Visualizations */}
        <Card className="shadow-lg">
           <CardHeader>
            <CardTitle className="text-xl">Time Series Analysis</CardTitle>
            <CardDescription>Detailed time-based trends, forecasts, and anomaly detection.</CardDescription>
          </CardHeader>
          <CardContent> 
            <RegionalInfoPanel />
          </CardContent>
        </Card>

        {/* Panel 3: Weather Information */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Weather Information</CardTitle>
            <CardDescription>
              Current and forecasted weather conditions for the selected region. 
              (Note: In a full system, this data could be overlaid on the map.)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WeatherInfoPanel />
          </CardContent>
        </Card>
        
        {/* Panel 4: Additional Metrics & Analytics */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Additional Metrics & Analytics</CardTitle>
            <CardDescription>Key indicators, data distributions, and risk communications.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 min-w-0 h-full">
              <DistributionChartsPlaceholder />
            </div>
            <div className="flex-1 min-w-0 h-full">
              <KeyPerformanceIndicators />
            </div>
            <div className="flex-1 min-w-0 h-full">
              <RiskCommunicationArea />
            </div>
          </CardContent>
        </Card>
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
