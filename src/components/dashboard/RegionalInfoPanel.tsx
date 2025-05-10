'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceDot } from 'recharts';
import { TrendingUp, SearchCode, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Helper to generate dummy time series data
const generateMonthlyData = (
  startDate: Date,
  numMonths: number,
  initialValue: number,
  trendFactor: number,
  seasonalAmplitude: number,
  noiseLevel: number
) => {
  const data = [];
  const baseDate = new Date(startDate); // Use a copy
  for (let i = 0; i < numMonths; i++) {
    const date = new Date(baseDate);
    date.setMonth(baseDate.getMonth() + i);
    const month = date.getMonth(); // 0-11

    const trend = initialValue + trendFactor * i;
    const seasonality = seasonalAmplitude * Math.sin((2 * Math.PI * month) / 11); // 12 months cycle (0-11)
    const noise = (Math.random() - 0.5) * noiseLevel;
    const value = Math.max(0, trend + seasonality + noise); // Assuming non-negative values like counts

    data.push({
      date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
      value: parseFloat(value.toFixed(2)),
    });
  }
  return data;
};

const stlChartConfig = {
  original: { label: 'Original', color: 'hsl(var(--chart-1))' },
  trend: { label: 'Trend', color: 'hsl(var(--chart-2))' },
  seasonal: { label: 'Seasonal', color: 'hsl(var(--chart-3))' },
  residual: { label: 'Residual', color: 'hsl(var(--chart-4))' },
} satisfies ChartConfig;

const forecastChartConfig = {
  actual: { label: 'Actual', color: 'hsl(var(--chart-1))' },
  forecast: { label: 'Forecast', color: 'hsl(var(--chart-2))' },
  confidence: { label: 'Confidence Interval', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig;

const anomalyChartConfig = {
  value: { label: 'Observed Value', color: 'hsl(var(--chart-1))' },
  anomalyDot: { label: 'Anomaly', color: 'hsl(var(--destructive))' }, 
} satisfies ChartConfig;


export function RegionalInfoPanel() {
  const [isMounted, setIsMounted] = useState(false);
  const [stlDecompositionData, setStlDecompositionData] = useState<any[]>([]);
  const [timeSeriesForecastData, setTimeSeriesForecastData] = useState<any[]>([]);
  const [anomalyDetectionData, setAnomalyDetectionData] = useState<any[]>([]);

  useEffect(() => {
    const clientStartDate = new Date(2021, 0, 1); 

    const originalSeriesDataForSTLRaw = generateMonthlyData(clientStartDate, 36, 50, 0.5, 10, 5);
    setStlDecompositionData(originalSeriesDataForSTLRaw.map((item, i) => {
      const dateObj = new Date(item.date);
      const month = dateObj.getMonth();
      const trend = 50 + 0.5 * i + Math.sin(i / 6) * 2;
      const seasonal = 10 * Math.sin((2 * Math.PI * month) / 11) + (Math.random() - 0.5) * 2;
      const residual = item.value - trend - seasonal; 
      return {
        date: item.date,
        original: item.value,
        trend: parseFloat(trend.toFixed(2)),
        seasonal: parseFloat(seasonal.toFixed(2)),
        residual: parseFloat(residual.toFixed(2)),
      };
    }));

    const historicalDataPoints = 24;
    const forecastDataPoints = 12;
    const fullSeriesForForecastRaw = generateMonthlyData(clientStartDate, historicalDataPoints + forecastDataPoints, 30, 0.8, 15, 8);
    setTimeSeriesForecastData(fullSeriesForForecastRaw.map((item, i) => {
      const dateObj = new Date(item.date);
      const month = dateObj.getMonth();
      if (i < historicalDataPoints) {
        return { date: item.date, actual: item.value, forecast: null, confidence: null };
      } else {
        const forecastBaseValue = 30 + 0.8 * i + 15 * Math.sin((2 * Math.PI * month) / 11);
        const forecastNoise = (Math.random() - 0.5) * 10;
        const forecastValue = Math.max(0, forecastBaseValue + forecastNoise);
        const confidenceRange = Math.random() * 10 + 8;
        return {
          date: item.date,
          actual: null,
          forecast: parseFloat(forecastValue.toFixed(2)),
          confidence: [
            parseFloat(Math.max(0, forecastValue - confidenceRange).toFixed(2)),
            parseFloat(Math.max(0, forecastValue + confidenceRange).toFixed(2)),
          ],
        };
      }
    }));
    
    const anomalyDetectionBaseDataRaw = generateMonthlyData(clientStartDate, 36, 70, -0.3, 8, 4);
    setAnomalyDetectionData(anomalyDetectionBaseDataRaw.map((item, i) => {
      let isAnomaly = false;
      let value = item.value;
      if (i === 10) { value = Math.max(0, value + 30); isAnomaly = true; }
      if (i === 25) { value = Math.max(0, value - 25); isAnomaly = true; }
      return { date: item.date, value: parseFloat(value.toFixed(2)), isAnomaly: isAnomaly };
    }));

    setIsMounted(true);
  }, []);

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

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* STL Decomposition Chart Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="h-5 w-5 text-primary" />
            STL Decomposition
          </CardTitle>
          <CardDescription>Seasonal-Trend-Loess decomposition of the selected metric.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] p-0 pr-6 pb-6">
          <ChartContainer config={stlChartConfig} className="h-full w-full">
            <LineChart data={stlDecompositionData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
            Time Series Forecast
          </CardTitle>
          <CardDescription>Forecast of the selected metric with confidence intervals.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] p-0 pr-6 pb-6">
          <ChartContainer config={forecastChartConfig} className="h-full w-full">
            <LineChart data={timeSeriesForecastData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} width={60} fontSize={12}/>
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line connectNulls type="monotone" dataKey="actual" stroke="var(--color-actual)" strokeWidth={2} dot={false} />
              <Line connectNulls type="monotone" dataKey="forecast" stroke="var(--color-forecast)" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              {/* Confidence interval rendering can be tricky; this is a simplified placeholder for the line type. 
                  Actual confidence bands often use Area charts or two lines.
                  For simplicity, if 'confidence' is an array [min, max], Recharts doesn't directly plot it as a band with Line.
                  This setup might just plot the first value of the confidence array if not handled by a custom component or Area.
                  Keeping it as a line for now as per existing structure, assuming it plots one of the bounds or it's styled to be invisible.
              */}
              <Line connectNulls type="monotone" dataKey="confidence[0]" name="Confidence Min" stroke="var(--color-confidence)" strokeOpacity={0.4} strokeWidth={1} dot={false} />
              <Line connectNulls type="monotone" dataKey="confidence[1]" name="Confidence Max" stroke="var(--color-confidence)" strokeOpacity={0.4} strokeWidth={1} dot={false} />

            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Anomaly Detection Chart Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Anomaly Detection
          </CardTitle>
          <CardDescription>Detected anomalies in the observed data.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] p-0 pr-6 pb-6">
          <ChartContainer config={anomalyChartConfig} className="h-full w-full">
            <LineChart data={anomalyDetectionData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} width={60} fontSize={12}/>
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} dot={false} />
              {anomalyDetectionData.filter(d => d.isAnomaly).map((entry, index) => (
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

