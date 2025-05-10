
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardContext, type WeatherDataItem } from '@/context/DashboardContext';
import { Thermometer, CloudRain, Droplets, AlertCircle, Info } from 'lucide-react';

interface WeatherDetailProps {
  icon: React.ElementType;
  label: string;
  value?: string | number;
  unit?: string;
  description?: string;
  forecast?: string;
  isLoading?: boolean;
  source?: string;
}

function WeatherDetailCard({ icon: Icon, label, value, unit, description, forecast, isLoading, source }: WeatherDetailProps) {
  return (
    <div className="p-4 bg-card rounded-lg shadow flex-1 min-w-[200px]">
      <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
        <Icon className="h-5 w-5 mr-2 text-primary" />
        {label}
      </div>
      {isLoading ? (
        <>
          <Skeleton className="h-8 w-1/2 my-1" />
          <Skeleton className="h-4 w-3/4 mt-1" />
        </>
      ) : (
        <>
          <p className="text-3xl font-bold text-foreground">
            {value ?? '--'}
            {unit && <span className="text-xl font-normal ml-1">{unit}</span>}
          </p>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          {forecast && <p className="text-xs text-muted-foreground mt-1">Forecast: {forecast}</p>}
          {source && <p className="text-xs text-muted-foreground mt-2 italic">Source: {source}</p>}
        </>
      )}
    </div>
  );
}

export function WeatherInfoPanel() {
  const {
    selectedRegion,
    weatherData,
    dataLoading,
    dataError
  } = useDashboardContext();

  const currentWeatherData: WeatherDataItem | null | undefined = weatherData && selectedRegion ? weatherData[selectedRegion] : null;
  const isLoading = dataLoading || (!dataError && !weatherData);

  if (dataError && !isLoading) { // Show error only if not loading and error exists
    return (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-md text-destructive">
            <div className="flex items-center gap-2 font-semibold">
                <AlertCircle size={18} /> Error Loading Weather Data
            </div>
            <p className="text-sm mt-1">{dataError}</p>
        </div>
    );
  }
  
  if (isLoading) {
     return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <WeatherDetailCard icon={Thermometer} label="Temperature" isLoading={true} />
        <WeatherDetailCard icon={CloudRain} label="Rainfall" isLoading={true} />
        <WeatherDetailCard icon={Droplets} label="Humidity" isLoading={true} />
      </div>
     );
  }
  
  if (!selectedRegion) {
    return (
        <div className="p-4 bg-muted/50 border rounded-md text-muted-foreground">
            <div className="flex items-center gap-2 font-semibold">
                <Info size={18} /> Select a Region
            </div>
            <p className="text-sm mt-1">Please select a region to view its weather information.</p>
        </div>
    );
  }

  if (!currentWeatherData) {
     return (
        <div className="p-4 bg-muted/50 border rounded-md text-muted-foreground">
            <div className="flex items-center gap-2 font-semibold">
                <Info size={18} /> No Weather Data
            </div>
            <p className="text-sm mt-1">Weather data is not available for {selectedRegion}.</p>
        </div>
    );
  }


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <WeatherDetailCard
        icon={Thermometer}
        label="Temperature"
        value={currentWeatherData.temperature.value}
        unit={currentWeatherData.temperature.unit}
        forecast={currentWeatherData.temperature.forecast}
        source={currentWeatherData.temperature.source}
        isLoading={isLoading}
      />
      <WeatherDetailCard
        icon={CloudRain}
        label="Rainfall"
        value={currentWeatherData.rainfall.value}
        unit={currentWeatherData.rainfall.unit}
        description={currentWeatherData.rainfall.description}
        forecast={currentWeatherData.rainfall.forecast_24h_prob !== undefined ? `${(currentWeatherData.rainfall.forecast_24h_prob * 100).toFixed(0)}% chance (24h)` : undefined}
        source={currentWeatherData.rainfall.source}
        isLoading={isLoading}
      />
      <WeatherDetailCard
        icon={Droplets}
        label="Humidity"
        value={currentWeatherData.humidity.value}
        unit={currentWeatherData.humidity.unit}
        description={`Comfort Level: ${currentWeatherData.humidity.comfort_level || 'N/A'}`}
        source={currentWeatherData.humidity.source}
        isLoading={isLoading}
      />
    </div>
  );
}
