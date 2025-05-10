
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardContext, type KpiDataItem } from '@/context/DashboardContext';
import { Activity, AlertCircle } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  isLoading?: boolean;
}

function KpiCard({ title, value, unit, isLoading }: KpiCardProps) {
  return (
    <div className="p-4 bg-background rounded-lg shadow">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      {isLoading ? (
        <Skeleton className="h-8 w-1/2 mt-1" />
      ) : (
        <p className="text-2xl font-bold text-primary">
          {value}
          {unit && <span className="text-lg font-normal">{unit}</span>}
        </p>
      )}
    </div>
  );
}

export function KeyPerformanceIndicators() {
  const { 
    selectedRegion, 
    selectedDisease, 
    kpiData, 
    dataLoading, 
    dataError 
  } = useDashboardContext();

  let currentKpis: KpiDataItem | null = null;
  if (kpiData && selectedRegion && selectedDisease && kpiData[selectedRegion] && kpiData[selectedRegion][selectedDisease]) {
    currentKpis = kpiData[selectedRegion][selectedDisease];
  }
  
  const isLoading = dataLoading || (!dataError && !kpiData);


  if (dataError) {
    return (
      <Card className="shadow-lg flex-1 h-full">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" /> Key Performance Indicators
          </CardTitle>
          <CardDescription>Error loading KPI data.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] bg-muted/50 rounded-b-md p-6 text-center">
          <p className="text-destructive">{dataError}</p>
        </CardContent>
      </Card>
    );
  }
  

  return (
    <Card className="shadow-lg flex-1 h-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Activity className="text-primary" /> Key Performance Indicators
        </CardTitle>
        <CardDescription>
          {selectedRegion && selectedDisease 
            ? `Metrics for ${selectedDisease} in ${selectedRegion}`
            : "Summary cards with KPIs (e.g., outbreak probability, R0, etc.). Select region and disease."
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col justify-center min-h-[200px] bg-muted/50 rounded-b-md p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <KpiCard 
            title="Outbreak Probability" 
            value={isLoading || !currentKpis ? '--' : (currentKpis.outbreakProbability * 100).toFixed(0)}
            unit="%"
            isLoading={isLoading}
          />
          <KpiCard 
            title="R0 Estimate" 
            value={isLoading || !currentKpis ? '--' : currentKpis.r0Estimate.toFixed(1)}
            isLoading={isLoading}
          />
          <KpiCard 
            title="Cases Next Month (Est.)" 
            value={isLoading || !currentKpis ? '--' : currentKpis.casesNextMonth.toLocaleString()}
            isLoading={isLoading}
          />
          <KpiCard 
            title="Affected Population (Est.)" 
            value={isLoading || !currentKpis ? '--' : currentKpis.affectedPopulation.toLocaleString()}
            isLoading={isLoading}
          />
        </div>
        {!isLoading && !currentKpis && selectedRegion && selectedDisease && (
           <p className="text-muted-foreground mt-4 text-xs text-center">
            No specific KPI data available for {selectedDisease} in {selectedRegion}.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
