
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
    // selectedYear, // No longer directly used for hotspot calculation logic
    forecastData, 
    regionMetadata,
    dataLoading,
    dataError 
  } = useDashboardContext();
  
  const [mapUrl, setMapUrl] = useState('https://maps.google.com/maps?q=0,0&hl=en&z=2&t=k&output=embed');
  const [currentHotspots, setCurrentHotspots] = useState<string[]>([]);

  const forecastBasedHotspotRegions = useMemo(() => {
    if (!forecastData || !selectedDisease || !regionMetadata) {
      return [];
    }

    const regionForecasts: { name: string; totalForecast: number }[] = [];

    for (const regionName in forecastData) {
      if (Object.prototype.hasOwnProperty.call(forecastData, regionName) &&
          regionMetadata[regionName] && // Ensure metadata exists for potential plotting
          forecastData[regionName]?.[selectedDisease]) {
            
        const diseaseData: ForecastDataPoint[] = forecastData[regionName][selectedDisease];
        let currentRegionTotalForecast = 0;
        
        diseaseData.forEach(dp => {
          // Sum forecast values (dp.actual is null for forecasts)
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

    // Sort regions by total forecast in descending order
    regionForecasts.sort((a, b) => b.totalForecast - a.totalForecast);

    const overallTotalForecast = regionForecasts.reduce((sum, region) => sum + region.totalForecast, 0);
    if (overallTotalForecast <= 0) { // Avoid division by zero or if all forecasts are non-positive
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
      return;
    }

    let query = '';
    let zoomLevel = 2;

    // Use forecastBasedHotspotRegions to determine what to plot
    const plotDataRegions = forecastBasedHotspotRegions;

    const validPlotData = plotDataRegions
      .map(regionName => {
        const meta = regionMetadata[regionName];
        if (meta && typeof meta.latitude === 'number' && typeof meta.longitude === 'number') {
          return {
            name: regionName,
            lat: meta.latitude,
            lon: meta.longitude,
            queryString: `${meta.latitude},${meta.longitude}(${encodeURIComponent(regionName)})`
          };
        }
        console.warn(`InteractiveMap: Missing or invalid metadata for hotspot region: ${regionName}. Latitude: ${meta?.latitude}, Longitude: ${meta?.longitude}`);
        return null; 
      })
      .filter(item => item !== null) as { name: string; lat: number; lon: number; queryString: string }[];


    if (validPlotData.length > 0) {
      // Prioritize selected region if it's part of the plot data (either a hotspot or explicitly selected)
      const selectedRegionInPlotData = selectedRegion && validPlotData.find(h => h.name === selectedRegion);

      if (selectedRegionInPlotData) {
        const selectedQuery = selectedRegionInPlotData.queryString;
        const otherQueries = validPlotData
          .filter(h => h.name !== selectedRegion)
          .map(h => h.queryString);
        query = [selectedQuery, ...otherQueries].join('|');
        zoomLevel = 8; // Zoom in more if selected region is primary focus
      } else {
        query = validPlotData.map(h => h.queryString).join('|');
        zoomLevel = validPlotData.length === 1 ? 8 : 6; // Zoom more for single item, less for multiple
      }
    } else if (selectedRegion && regionMetadata[selectedRegion]) {
      // No hotspots, but a region is selected
      const meta = regionMetadata[selectedRegion];
      if (typeof meta.latitude === 'number' && typeof meta.longitude === 'number') {
        query = `${meta.latitude},${meta.longitude}(${encodeURIComponent(selectedRegion)})`;
        zoomLevel = 8;
      } else {
        console.warn(`InteractiveMap: Missing or invalid metadata for selected region: ${selectedRegion}`);
        query = '0,0'; 
        zoomLevel = 2;
      }
    } else {
      // Default global view
      query = '0,0';
      zoomLevel = 2;
    }
    
    if (!query.trim()) { 
        query = '0,0';
        zoomLevel = 2;
    }
    
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

  let descriptionText = "Select a disease to identify forecast hotspots.";
  if (selectedDisease) {
    if (currentHotspots.length > 0) {
      descriptionText = `Forecast Hotspots for ${selectedDisease} (top ~80% contributors): ${currentHotspots.join(', ')}.`;
    } else {
      descriptionText = `No significant forecast hotspots identified for ${selectedDisease} based on the 80% contribution rule, or insufficient forecast data.`;
    }
  }
  
  if (selectedRegion) {
      if (selectedDisease && currentHotspots.includes(selectedRegion)) {
         // Already mentions hotspots, add that this region is one
         // descriptionText = descriptionText.replace('.', `, with ${selectedRegion} being a key area.`);
      } else if (selectedDisease && currentHotspots.length > 0 && !currentHotspots.includes(selectedRegion)){
          descriptionText += ` Map currently focused on ${selectedRegion}.`;
      } else if (!selectedDisease) {
          descriptionText = `Displaying ${selectedRegion}. Select a disease to identify hotspots.`;
      } else { // selectedDisease but no hotspots, and selectedRegion
          descriptionText += ` Map currently focused on ${selectedRegion}.`;
      }
  } else if (!selectedDisease) { // No region, no disease
      descriptionText = "Select filters to view specific regions or disease hotspots.";
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
