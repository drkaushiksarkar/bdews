
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


export function RegionalInfoPanel() {
  const { selectedYear } = useDashboardContext();
  const [isMounted, setIsMounted] = useState(false);
  const [allStlDecompositionData, setAllStlDecompositionData] = useState<any[]>([]);
  const [allTimeSeriesForecastData, setAllTimeSeriesForecastData] = useState<any[]>([]);
  const [allAnomalyDetectionData, setAllAnomalyDetectionData] = useState<any[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
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

        const stlJson = await stlResponse.json();
        const forecastJson = await forecastResponse.json();
        const anomalyJson = await anomalyResponse.json();

        setAllStlDecompositionData(stlJson);
        setAllTimeSeriesForecastData(forecastJson.map((item: any) => ({
          ...item,
          confidenceLower: item.confidence ? item.confidence[0] : null,
          confidenceUpper: item.confidence ? item.confidence[1] : null,
        })));
        setAllAnomalyDetectionData(anomalyJson);
        setDataError(null);
      } catch (error) {
        console.error("Failed to load chart data:", error);
        setDataError(error instanceof Error ? error.message : "An unknown error occurred while fetching data.");
      } finally {
        setIsMounted(true);
      }
    }
    fetchData();
  }, []);

  const filteredStlData = useMemo(() => {
    if (!selectedYear || !allStlDecompositionData.length) return allStlDecompositionData;
    const yearStr = selectedYear.toString();
    return allStlDecompositionData.filter(item => item.date && item.date.endsWith(yearStr));
  }, [selectedYear, allStlDecompositionData]);

  const filteredForecastData = useMemo(() => {
    if (!selectedYear || !allTimeSeriesForecastData.length) return allTimeSeriesForecastData;
    const yearStr = selectedYear.toString();
    // For forecast data, we want to show actual data from the selected year
    // and forecast data that *starts* in or after the selected year if the actual data for that point is null
    return allTimeSeriesForecastData.filter(item => {
      if (!item.date) return false;
      const itemYear = item.date.split(' ')[1];
      if (item.actual !== null) {
        return itemYear === yearStr;
      }
      // If actual is null, it's a forecast point. Include if forecast year is >= selected year
      return parseInt(itemYear) >= selectedYear;
    });
  }, [selectedYear, allTimeSeriesForecastData]);

  const filteredAnomalyData = useMemo(() => {
    if (!selectedYear || !allAnomalyDetectionData.length) return allAnomalyDetectionData;
    const yearStr = selectedYear.toString();
    return allAnomalyDetectionData.filter(item => item.date && item.date.endsWith(yearStr));
  }, [selectedYear, allAnomalyDetectionData]);


  if (!isMounted) {
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
                    Error Loading Data
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p>Could not load chart data: {dataError}</p>
                <p>Please ensure the data files are present in the `/public/data/` directory and are accessible.</p>
            </CardContent>
        </Card>
    );
  }


  return (
    <div className="grid grid-cols-1 gap-6">
      {/* STL Decomposition Chart Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="h-5 w-5 text-primary" />
            STL Decomposition {selectedYear && `(${selectedYear})`}
          </CardTitle>
          <CardDescription>Seasonal-Trend-Loess decomposition of the selected metric.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] p-0 pr-6 pb-6">
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
        </CardContent>
      </Card>

      {/* Time Series Forecasting Chart Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <SearchCode className="h-5 w-5 text-primary" />
            Time Series Forecast {selectedYear && `(Actuals for ${selectedYear}, Forecast beyond)`}
          </CardTitle>
          <CardDescription>Forecast of the selected metric with confidence intervals.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] p-0 pr-6 pb-6">
          <ChartContainer config={forecastChartConfig} className="h-full w-full">
            <LineChart data={filteredForecastData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} width={60} fontSize={12}/>
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line connectNulls type="monotone" dataKey="actual" stroke="var(--color-actual)" strokeWidth={2} dot={false} />
              <Line connectNulls type="monotone" dataKey="forecast" stroke="var(--color-forecast)" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              <Line connectNulls type="monotone" dataKey="confidenceLower" stroke="var(--color-confidenceLower)" strokeOpacity={0.3} strokeWidth={1} dot={false} name="Confidence Lower" />
              <Line connectNulls type="monotone" dataKey="confidenceUpper" stroke="var(--color-confidenceUpper)" strokeOpacity={0.3} strokeWidth={1} dot={false} name="Confidence Upper" />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Anomaly Detection Chart Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Anomaly Detection {selectedYear && `(${selectedYear})`}
          </CardTitle>
          <CardDescription>Detected anomalies in the observed data.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] p-0 pr-6 pb-6">
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
        </CardContent>
      </Card>
    </div>
  );
}
