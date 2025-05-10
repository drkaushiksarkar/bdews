
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceDot } from 'recharts';
import { TrendingUp, SearchCode, AlertTriangle } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardContext, type Disease, type StlDataPoint, type ForecastDataPoint, type AnomalyDataPoint } from '@/context/DashboardContext';

const stlChartConfig = {
  original: { label: 'Original', color: 'hsl(var(--chart-1))' },
  trend: { label: 'Trend', color: 'hsl(var(--chart-2))' },
  seasonal: { label: 'Seasonal', color: 'hsl(var(--chart-3))' },
  residual: { label: 'Residual', color: 'hsl(var(--chart-4))' },
} satisfies ChartConfig;

const forecastChartConfig = {
  actual: { label: 'Actual', color: 'hsl(var(--chart-1))' },
  forecast: { label: 'Forecast', color: 'hsl(var(--chart-2))' },
  confidenceUpper: { label: 'Confidence Upper', color: 'hsl(var(--chart-2))', icon: () => null }, // Hidden from legend by null icon
  confidenceLower: { label: 'Confidence Lower', color: 'hsl(var(--chart-2))', icon: () => null }, // Hidden from legend by null icon
} satisfies ChartConfig;


const anomalyChartConfig = {
  value: { label: 'Observed Value', color: 'hsl(var(--chart-1))' },
  anomalyDot: { label: 'Anomaly', color: 'hsl(var(--destructive))' },
} satisfies ChartConfig;

export function RegionalInfoPanel() {
  const { 
    selectedYear, 
    selectedRegion, 
    selectedDisease, 
    stlData: allStlDecompositionData,
    forecastData: allTimeSeriesForecastData,
    anomalyData: allAnomalyDetectionData,
    dataLoading,
    dataError
  } = useDashboardContext();
  

  const getCurrentRegionDiseaseData = <T,>(
    dataContainer: Record<string, Record<Disease, T[]>> | null,
    region?: string,
    disease?: Disease
  ): T[] => {
    if (!dataContainer || !region || !disease || !dataContainer[region] || !dataContainer[region][disease]) {
      return [];
    }
    return dataContainer[region][disease];
  };

  const stlDataForSelectedRegionDisease = useMemo(() => {
    return getCurrentRegionDiseaseData<StlDataPoint>(allStlDecompositionData, selectedRegion, selectedDisease);
  }, [allStlDecompositionData, selectedRegion, selectedDisease]);

  const filteredStlData = useMemo(() => {
    if (!selectedYear || !stlDataForSelectedRegionDisease.length) return stlDataForSelectedRegionDisease;
    const yearStr = selectedYear.toString();
    return stlDataForSelectedRegionDisease.filter(item => item.date && item.date.endsWith(yearStr));
  }, [selectedYear, stlDataForSelectedRegionDisease]);

  const forecastDataForSelectedRegionDisease = useMemo(() => {
    return getCurrentRegionDiseaseData<ForecastDataPoint>(allTimeSeriesForecastData, selectedRegion, selectedDisease);
  }, [allTimeSeriesForecastData, selectedRegion, selectedDisease]);

  const filteredForecastData = useMemo(() => {
    if (!selectedYear || !forecastDataForSelectedRegionDisease.length) return forecastDataForSelectedRegionDisease;
    const yearStr = selectedYear.toString();
    return forecastDataForSelectedRegionDisease.filter(item => {
      if (!item.date) return false;
      const itemYear = item.date.split(' ')[1]; // Assuming "Mon YYYY" format
      if (!itemYear) return false; // basic check

      // For actual data, filter by exact year
      if (item.actual !== null) { 
        return itemYear === yearStr;
      }
      // For forecast data (actual is null), include data from the selected year onwards
      // This ensures future forecasts are shown if the selectedYear is in the past/present
      return parseInt(itemYear) >= selectedYear; 
    });
  }, [selectedYear, forecastDataForSelectedRegionDisease]);

  const anomalyDataForSelectedRegionDisease = useMemo(() => {
    return getCurrentRegionDiseaseData<AnomalyDataPoint>(allAnomalyDetectionData, selectedRegion, selectedDisease);
  }, [allAnomalyDetectionData, selectedRegion, selectedDisease]);

  const filteredAnomalyData = useMemo(() => {
    if (!selectedYear || !anomalyDataForSelectedRegionDisease.length) return anomalyDataForSelectedRegionDisease;
    const yearStr = selectedYear.toString();
    return anomalyDataForSelectedRegionDisease.filter(item => item.date && item.date.endsWith(yearStr));
  }, [selectedYear, anomalyDataForSelectedRegionDisease]);


  if (dataLoading) {
    return (
      <div className="grid grid-cols-1 gap-6">
        {[1, 2, 3].map(key => (
          <Card key={key} className="shadow-lg">
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="h-[400px] p-0 pr-6 pb-6 flex items-center justify-center">
              <Skeleton className="h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (dataError) {
    return (
        <Card className="shadow-lg col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Error Loading Chart Data
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p>Could not load chart data: {dataError}</p>
                <p>Please ensure the data files are present in the `/public/data/` directory, are correctly formatted as JSON objects with regions and diseases as keys, and are accessible.</p>
            </CardContent>
        </Card>
    );
  }

  if (!selectedRegion || !selectedDisease) {
     return (
         <Card className="shadow-lg col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <SearchCode className="h-5 w-5" />
                    Regional Data
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p>Please select a region and a disease to view detailed charts.</p>
            </CardContent>
        </Card>
     );
  }
  
  const displayedRegion = selectedRegion || "Selected Region";
  const displayedDisease = selectedDisease || "Selected Disease";


  return (
    <div className="grid grid-cols-1 gap-6">
      {/* STL Decomposition Chart Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="h-5 w-5 text-primary" />
            STL Decomposition - {displayedRegion} - {displayedDisease} {selectedYear && `(${selectedYear})`}
          </CardTitle>
          <CardDescription>Seasonal-Trend-Loess decomposition for {displayedDisease.toLowerCase()} in {displayedRegion}.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] p-0 pr-6 pb-6">
          {filteredStlData.length > 0 ? (
            <ChartContainer config={stlChartConfig} className="h-full w-full">
              <LineChart data={filteredStlData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} width={60} fontSize={12}/>
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="original" stroke="var(--color-original)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="trend" stroke="var(--color-trend)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="seasonal" stroke="var(--color-seasonal)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="residual" stroke="var(--color-residual)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">No STL data available for {displayedDisease} in {displayedRegion} for {selectedYear || 'the selected year'}.</div>
          )}
        </CardContent>
      </Card>

      {/* Time Series Forecasting Chart Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <SearchCode className="h-5 w-5 text-primary" />
            Time Series Forecast - {displayedRegion} - {displayedDisease} {selectedYear && `(Data from ${selectedYear})`}
          </CardTitle>
          <CardDescription>Forecast for {displayedDisease.toLowerCase()} in {displayedRegion} with confidence intervals.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] p-0 pr-6 pb-6">
         {filteredForecastData.length > 0 ? (
            <ChartContainer config={forecastChartConfig} className="h-full w-full">
              <LineChart data={filteredForecastData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} width={60} fontSize={12}/>
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line connectNulls type="monotone" dataKey="actual" stroke="var(--color-actual)" strokeWidth={2} dot={false} />
                <Line connectNulls type="monotone" dataKey="forecast" stroke="var(--color-forecast)" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                {/* Confidence Interval Area/Lines */}
                <Line connectNulls type="monotone" dataKey="confidenceLower" stroke="var(--color-forecast)" strokeOpacity={0.3} strokeWidth={1} dot={false} name="Confidence Lower" legendType="none" />
                <Line connectNulls type="monotone" dataKey="confidenceUpper" stroke="var(--color-forecast)" strokeOpacity={0.3} strokeWidth={1} dot={false} name="Confidence Upper" legendType="none" />
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">No forecast data available for {displayedDisease} in {displayedRegion} for {selectedYear || 'the selected year'}.</div>
          )}
        </CardContent>
      </Card>

      {/* Anomaly Detection Chart Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Anomaly Detection - {displayedRegion} - {displayedDisease} {selectedYear && `(${selectedYear})`}
          </CardTitle>
          <CardDescription>Detected anomalies in {displayedDisease.toLowerCase()} data for {displayedRegion}.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] p-0 pr-6 pb-6">
          {filteredAnomalyData.length > 0 ? (
            <ChartContainer config={anomalyChartConfig} className="h-full w-full">
              <LineChart data={filteredAnomalyData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} width={60} fontSize={12}/>
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} dot={false} />
                {filteredAnomalyData.filter(d => d.isAnomaly).map((entry, index) => (
                  <ReferenceDot
                    key={`anomaly-dot-${index}`}
                    x={entry.date}
                    y={entry.value}
                    r={6}
                    fill="var(--color-anomalyDot)" // Use the color from chartConfig
                    stroke="hsl(var(--background))" // Ensure contrast with background
                    strokeWidth={2}
                    ifOverflow="extendDomain"
                    aria-label={`Anomaly at ${entry.date} with value ${entry.value}`}
                  />
                ))}
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">No anomaly data available for {displayedDisease} in {displayedRegion} for {selectedYear || 'the selected year'}.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
