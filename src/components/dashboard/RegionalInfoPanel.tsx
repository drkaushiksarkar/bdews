
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceDot } from 'recharts';
import { TrendingUp, SearchCode, AlertTriangle } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardContext } from '@/context/DashboardContext';

const stlChartConfig = {
  original: { label: 'Original', color: 'hsl(var(--chart-1))' },
  trend: { label: 'Trend', color: 'hsl(var(--chart-2))' },
  seasonal: { label: 'Seasonal', color: 'hsl(var(--chart-3))' },
  residual: { label: 'Residual', color: 'hsl(var(--chart-4))' },
} satisfies ChartConfig;

const forecastChartConfig = {
  actual: { label: 'Actual', color: 'hsl(var(--chart-1))' },
  forecast: { label: 'Forecast', color: 'hsl(var(--chart-2))' },
  confidenceUpper: { label: 'Confidence Upper', color: 'hsl(var(--chart-2))', icon: () => null },
  confidenceLower: { label: 'Confidence Lower', color: 'hsl(var(--chart-2))', icon: () => null },
} satisfies ChartConfig;

const anomalyChartConfig = {
  value: { label: 'Observed Value', color: 'hsl(var(--chart-1))' },
  anomalyDot: { label: 'Anomaly', color: 'hsl(var(--destructive))' },
} satisfies ChartConfig;

interface StlDataPoint { date: string; original: number; trend: number; seasonal: number; residual: number; }
interface ForecastDataPoint { date: string; actual: number | null; forecast: number | null; confidence: [number, number] | null; confidenceLower?: number | null; confidenceUpper?: number | null; }
interface AnomalyDataPoint { date: string; value: number; isAnomaly: boolean; }

type StlChartDataContainer = Record<string, StlDataPoint[]>;
type ForecastChartDataContainer = Record<string, ForecastDataPoint[]>;
type AnomalyChartDataContainer = Record<string, AnomalyDataPoint[]>;


export function RegionalInfoPanel() {
  const { selectedYear, selectedRegion, setAvailableRegions, setSelectedRegion } = useDashboardContext();
  const [isMounted, setIsMounted] = useState(false);
  
  const [allStlDecompositionData, setAllStlDecompositionData] = useState<StlChartDataContainer>({});
  const [allTimeSeriesForecastData, setAllTimeSeriesForecastData] = useState<ForecastChartDataContainer>({});
  const [allAnomalyDetectionData, setAllAnomalyDetectionData] = useState<AnomalyChartDataContainer>({});
  
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function fetchData() {
      try {
        const [stlResponse, forecastResponse, anomalyResponse] = await Promise.all([
          fetch('/data/stl-decomposition-data.json'),
          fetch('/data/time-series-forecast-data.json'),
          fetch('/data/anomaly-detection-data.json'),
        ]);

        if (!stlResponse.ok) throw new Error(`Failed to fetch STL data: ${stlResponse.statusText}`);
        if (!forecastResponse.ok) throw new Error(`Failed to fetch forecast data: ${forecastResponse.statusText}`);
        if (!anomalyResponse.ok) throw new Error(`Failed to fetch anomaly data: ${anomalyResponse.statusText}`);

        const stlJson: StlChartDataContainer = await stlResponse.json();
        const forecastJson: ForecastChartDataContainer = await forecastResponse.json();
        const anomalyJson: AnomalyChartDataContainer = await anomalyResponse.json();
        
        if (!active) return;

        const regions = Object.keys(stlJson);
        setAvailableRegions(regions);
        // Initial selectedRegion setting is handled by DashboardContext's useEffect
        // based on availableRegions update.

        setAllStlDecompositionData(stlJson);
        
        const processedForecastJson: ForecastChartDataContainer = {};
        for (const region in forecastJson) {
          processedForecastJson[region] = forecastJson[region].map((item: any) => ({
            ...item,
            confidenceLower: item.confidence ? item.confidence[0] : null,
            confidenceUpper: item.confidence ? item.confidence[1] : null,
          }));
        }
        setAllTimeSeriesForecastData(processedForecastJson);
        setAllAnomalyDetectionData(anomalyJson);
        setDataError(null);
      } catch (error) {
        if (!active) return;
        console.error("Failed to load chart data:", error);
        setDataError(error instanceof Error ? error.message : "An unknown error occurred while fetching data.");
      } finally {
        if (active) {
          setIsMounted(true);
        }
      }
    }
    fetchData();
    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Runs once on mount to fetch all data

  const getCurrentRegionData = <T,>(dataContainer: Record<string, T[]>): T[] => {
    if (!selectedRegion || !dataContainer[selectedRegion]) return [];
    return dataContainer[selectedRegion];
  };

  const filteredStlData = useMemo(() => {
    const currentRegionStlData = getCurrentRegionData(allStlDecompositionData);
    if (!selectedYear || !currentRegionStlData.length) return currentRegionStlData;
    const yearStr = selectedYear.toString();
    return currentRegionStlData.filter(item => item.date && item.date.endsWith(yearStr));
  }, [selectedYear, selectedRegion, allStlDecompositionData]);

  const filteredForecastData = useMemo(() => {
    const currentRegionForecastData = getCurrentRegionData(allTimeSeriesForecastData);
    if (!selectedYear || !currentRegionForecastData.length) return currentRegionForecastData;
    const yearStr = selectedYear.toString();
    return currentRegionForecastData.filter(item => {
      if (!item.date) return false;
      const itemYear = item.date.split(' ')[1];
      if (item.actual !== null) { // For data points with actual values
        return itemYear === yearStr; // Only show actuals for the selected year
      }
      // For data points with forecast values (actual is null)
      // Show forecasts if their year is the selected year or any future year relative to actuals.
      // Given data structure, forecast starts where actuals end. So if selectedYear has forecasts, show them.
      return parseInt(itemYear) >= selectedYear; 
    });
  }, [selectedYear, selectedRegion, allTimeSeriesForecastData]);

  const filteredAnomalyData = useMemo(() => {
    const currentRegionAnomalyData = getCurrentRegionData(allAnomalyDetectionData);
    if (!selectedYear || !currentRegionAnomalyData.length) return currentRegionAnomalyData;
    const yearStr = selectedYear.toString();
    return currentRegionAnomalyData.filter(item => item.date && item.date.endsWith(yearStr));
  }, [selectedYear, selectedRegion, allAnomalyDetectionData]);


  if (!isMounted || !selectedRegion) {
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
         <Card className="shadow-lg col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <SearchCode className="h-5 w-5" />
                    Regional Data
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p>{isMounted && !selectedRegion ? "No regions available or selected." : "Loading data and regions..."}</p>
            </CardContent>
        </Card>
      </div>
    );
  }

  if (dataError) {
    return (
        <Card className="shadow-lg col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Error Loading Data
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p>Could not load chart data: {dataError}</p>
                <p>Please ensure the data files are present in the `/public/data/` directory, are correctly formatted as JSON objects with regions as keys, and are accessible.</p>
            </CardContent>
        </Card>
    );
  }
  
  const displayedRegion = selectedRegion || "Selected Region";


  return (
    <div className="grid grid-cols-1 gap-6">
      {/* STL Decomposition Chart Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="h-5 w-5 text-primary" />
            STL Decomposition - {displayedRegion} {selectedYear && `(${selectedYear})`}
          </CardTitle>
          <CardDescription>Seasonal-Trend-Loess decomposition of the selected metric.</CardDescription>
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
            <div className="flex items-center justify-center h-full text-muted-foreground">No STL data available for {displayedRegion} in {selectedYear || 'the selected year'}.</div>
          )}
        </CardContent>
      </Card>

      {/* Time Series Forecasting Chart Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <SearchCode className="h-5 w-5 text-primary" />
            Time Series Forecast - {displayedRegion} {selectedYear && `(Data for ${selectedYear})`}
          </CardTitle>
          <CardDescription>Forecast of the selected metric with confidence intervals.</CardDescription>
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
                <Line connectNulls type="monotone" dataKey="confidenceLower" stroke="var(--color-confidenceLower)" strokeOpacity={0.3} strokeWidth={1} dot={false} name="Confidence Band" legendType="none"/>
                <Line connectNulls type="monotone" dataKey="confidenceUpper" stroke="var(--color-confidenceUpper)" strokeOpacity={0.3} strokeWidth={1} dot={false} name="Confidence Band" legendType="none"/>
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">No forecast data available for {displayedRegion} in {selectedYear || 'the selected year'}.</div>
          )}
        </CardContent>
      </Card>

      {/* Anomaly Detection Chart Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Anomaly Detection - {displayedRegion} {selectedYear && `(${selectedYear})`}
          </CardTitle>
          <CardDescription>Detected anomalies in the observed data.</CardDescription>
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
                    fill="var(--color-anomalyDot)"
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                    ifOverflow="extendDomain"
                    aria-label={`Anomaly at ${entry.date} with value ${entry.value}`}
                  />
                ))}
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">No anomaly data available for {displayedRegion} in {selectedYear || 'the selected year'}.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

