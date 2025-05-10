'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardContext } from '@/context/DashboardContext';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, AlertCircle } from 'lucide-react';
import type { Disease, ForecastDataPoint } from '@/context/DashboardContext';


export function InteractiveMap() {
  const {
    selectedRegion,
    selectedDisease,
    forecastData,
    regionMetadata,
    dataLoading,
    dataError
  } = useDashboardContext();

  const [mapUrl, setMapUrl] = useState('https://maps.google.com/maps?q=world&hl=en&z=2&t=k&output=embed');
  const [currentHotspots, setCurrentHotspots] = useState<string[]>([]);

  const forecastBasedHotspotRegions = useMemo(() => {
    if (!forecastData || !selectedDisease || !regionMetadata) {
      return [];
    }

    const regionForecasts: { name: string; totalForecast: number }[] = [];

    for (const regionName in forecastData) {
      if (Object.prototype.hasOwnProperty.call(forecastData, regionName) &&
          regionMetadata[regionName] &&
          forecastData[regionName]?.[selectedDisease]) {

        const diseaseData: ForecastDataPoint[] = forecastData[regionName][selectedDisease];
        let currentRegionTotalForecast = 0;

        diseaseData.forEach(dp => {
          if (dp.forecast !== null && typeof dp.forecast === 'number') {
            currentRegionTotalForecast += dp.forecast;
          }
        });

        if (currentRegionTotalForecast > 0) {
          regionForecasts.push({ name: regionName, totalForecast: currentRegionTotalForecast });
        }
      }
    }

    if (regionForecasts.length === 0) {
      return [];
    }

    regionForecasts.sort((a, b) => b.totalForecast - a.totalForecast);

    const overallTotalForecast = regionForecasts.reduce((sum, region) => sum + region.totalForecast, 0);
    if (overallTotalForecast <= 0) {
        return [];
    }

    const targetForecastSum = overallTotalForecast * 0.80;
    let cumulativeForecast = 0;
    const hotspots: string[] = [];

    for (const region of regionForecasts) {
      hotspots.push(region.name);
      cumulativeForecast += region.totalForecast;
      if (cumulativeForecast >= targetForecastSum) {
        break;
      }
    }
    return hotspots;
  }, [forecastData, selectedDisease, regionMetadata]);

  useEffect(() => {
    setCurrentHotspots(forecastBasedHotspotRegions);

    if (!regionMetadata) {
      setMapUrl('https://maps.google.com/maps?q=world&hl=en&z=2&t=k&output=embed');
      return;
    }

    let query = '';
    let zoomLevel = 2;

    const validHotspotsForMap = forecastBasedHotspotRegions
      .map(regionName => {
        const meta = regionMetadata[regionName];
        if (meta && typeof meta.latitude === 'number' && typeof meta.longitude === 'number') {
          return {
            name: regionName,
            lat: meta.latitude,
            lon: meta.longitude,
          };
        }
        console.warn(`InteractiveMap: Missing or invalid metadata for hotspot region: ${regionName}.`);
        return null;
      })
      .filter(item => item !== null) as { name: string; lat: number; lon: number }[];

    if (validHotspotsForMap.length > 0) {
      const firstHotspot = validHotspotsForMap[0];
      query = `${firstHotspot.lat},${firstHotspot.lon}(${encodeURIComponent(firstHotspot.name)})`;
      if (validHotspotsForMap.length === 1) {
        zoomLevel = 7; // Zoom in for a single hotspot
      } else {
        zoomLevel = 5; // Wider zoom if there are multiple hotspots conceptually (map centers on first)
      }
    } else if (selectedRegion && regionMetadata[selectedRegion]) {
      const meta = regionMetadata[selectedRegion];
      if (typeof meta.latitude === 'number' && typeof meta.longitude === 'number') {
        query = `${meta.latitude},${meta.longitude}(${encodeURIComponent(selectedRegion)})`;
        zoomLevel = 7;
      } else {
        console.warn(`InteractiveMap: Missing or invalid metadata for selected region: ${selectedRegion}`);
        query = 'world';
        zoomLevel = 2;
      }
    } else {
      query = 'world';
      zoomLevel = 2;
    }
    
    if (!query.trim()) {
        query = 'world'; 
        zoomLevel = 2;
    }

    // Use 'q' for place search, 'll' for lat/lon center with 'q' for marker (optional)
    // For simplicity and reliability with embed, focusing on 'q' for the main point.
    const newMapUrl = `https://maps.google.com/maps?q=${query}&hl=en&z=${zoomLevel}&t=k&output=embed`;
    setMapUrl(newMapUrl);

  }, [selectedRegion, regionMetadata, forecastBasedHotspotRegions]);


  if (dataLoading) {
    return (
      <Card className="shadow-lg flex-1">
        <CardHeader>
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="aspect-[16/9] relative p-0">
          <Skeleton className="absolute top-0 left-0 w-full h-full rounded-b-md" />
        </CardContent>
      </Card>
    );
  }

  if (dataError) {
     return (
      <Card className="shadow-lg flex-1">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2"><MapPin/> Interactive Geospatial Map</CardTitle>
          <CardDescription className="text-destructive flex items-center gap-1"><AlertCircle size={16} />Error loading map data: {dataError}</CardDescription>
        </CardHeader>
        <CardContent className="aspect-[16/9] relative flex items-center justify-center bg-muted rounded-b-md">
          <p className="text-muted-foreground">Could not display map.</p>
        </CardContent>
      </Card>
    );
  }

  let descriptionText = "Select filters to view specific regions or disease hotspots on the map.";
  if (selectedDisease) {
    if (currentHotspots.length > 0) {
      descriptionText = `Forecast Hotspots for ${selectedDisease} (top ~80% contributors): ${currentHotspots.join(', ')}. Map is centered on ${currentHotspots[0]}.`;
    } else {
      descriptionText = `No significant forecast hotspots identified for ${selectedDisease}.`;
      if (selectedRegion) {
        descriptionText += ` Map showing ${selectedRegion}.`;
      } else {
        descriptionText += ` Select a region to view its location.`;
      }
    }
  } else if (selectedRegion) {
    descriptionText = `Displaying ${selectedRegion}. Select a disease to identify potential hotspots.`;
  }


  return (
    <Card className="shadow-lg flex-1">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2"><MapPin /> Interactive Geospatial Map</CardTitle>
        <CardDescription>
          {descriptionText}
        </CardDescription>
      </CardHeader>
      <CardContent className="aspect-[16/9] relative p-0">
        <iframe
          key={mapUrl} 
          src={mapUrl}
          width="100%"
          height="100%"
          className="absolute top-0 left-0 w-full h-full border-0 rounded-b-md"
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Interactive Geospatial Map"
          data-ai-hint="geospatial map"
        ></iframe>
      </CardContent>
    </Card>
  );
}
