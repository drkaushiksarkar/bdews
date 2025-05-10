
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardContext } from '@/context/DashboardContext';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, AlertCircle } from 'lucide-react';
import type { Disease, ForecastDataPoint, RegionMetadataItem } from '@/context/DashboardContext';


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
  // Renamed from currentHotspots to avoid confusion with the derived list below. This state holds the names.
  const [identifiedHotspotNames, setIdentifiedHotspotNames] = useState<string[]>([]);
  const [dynamicDescription, setDynamicDescription] = useState("Select filters to view specific regions or disease hotspots on the map.");

  // Memoized calculation for hotspot names
  const hotspotNamesFromForecast = useMemo(() => {
    if (!forecastData || !selectedDisease || !regionMetadata) {
      return [];
    }

    const regionForecasts: { name: string; totalForecast: number }[] = [];

    for (const regionName in forecastData) {
      if (Object.prototype.hasOwnProperty.call(forecastData, regionName) &&
          regionMetadata[regionName] && // Ensure region exists in metadata
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

    if (regionForecasts.length === 0) return [];
    regionForecasts.sort((a, b) => b.totalForecast - a.totalForecast); // Sort descending by forecast

    const overallTotalForecast = regionForecasts.reduce((sum, region) => sum + region.totalForecast, 0);
    if (overallTotalForecast <= 0) return [];
    
    const targetForecastSum = overallTotalForecast * 0.80; // Target 80%
    let cumulativeForecast = 0;
    const hotspots: string[] = [];

    for (const region of regionForecasts) {
      hotspots.push(region.name);
      cumulativeForecast += region.totalForecast;
      if (cumulativeForecast >= targetForecastSum && hotspots.length > 0) { // Ensure at least one hotspot if target is met quickly
        break;
      }
    }
    return hotspots;
  }, [forecastData, selectedDisease, regionMetadata]);

  useEffect(() => {
    setIdentifiedHotspotNames(hotspotNamesFromForecast);

    if (dataLoading) {
      setDynamicDescription("Loading map data...");
      setMapUrl('https://maps.google.com/maps?q=world&hl=en&z=2&t=k&output=embed');
      return;
    }
    if (dataError || !regionMetadata) {
      setDynamicDescription(dataError ? `Error loading map data: ${dataError}` : "Region location data unavailable.");
      setMapUrl('https://maps.google.com/maps?q=world&hl=en&z=2&t=k&output=embed');
      return;
    }
    
    const validHotspotsWithGeo = identifiedHotspotNames
      .map(name => {
        const meta = regionMetadata[name];
        if (meta && typeof meta.latitude === 'number' && typeof meta.longitude === 'number' && meta.country) {
          return { name, lat: meta.latitude, lon: meta.longitude, country: meta.country };
        }
        return null;
      })
      .filter(item => item !== null) as { name: string; lat: number; lon: number; country: string }[];

    let query = '';
    let zoomLevel = 2;
    let newDescription = "Select filters to view data.";

    if (selectedDisease) {
      if (validHotspotsWithGeo.length > 0) {
        const firstHotspot = validHotspotsWithGeo[0];
        query = `${firstHotspot.lat},${firstHotspot.lon}(${encodeURIComponent(firstHotspot.name)})`;
        
        const hotspotListString = identifiedHotspotNames.join(', ');

        if (validHotspotsWithGeo.length > 1) {
          zoomLevel = 6; // Zoom out a bit more if multiple hotspots are identified, centered on primary
          newDescription = `Forecast Hotspots for ${selectedDisease} (top ~80% contributors): ${hotspotListString}. Map is centered on the primary hotspot: ${firstHotspot.name}.`;
        } else { // Single valid hotspot
          zoomLevel = 8; // Zoom in for a single hotspot region
          newDescription = `Forecast Hotspot for ${selectedDisease}: ${firstHotspot.name}. Map centered on this region.`;
        }
      } else if (identifiedHotspotNames.length > 0) { // Hotspots identified but no valid geo data for them
        query = selectedRegion && regionMetadata[selectedRegion]?.country ? encodeURIComponent(regionMetadata[selectedRegion]!.country) : 'world';
        zoomLevel = selectedRegion && regionMetadata[selectedRegion]?.country ? 5 : 2;
        newDescription = `Forecast Hotspots for ${selectedDisease}: ${identifiedHotspotNames.join(', ')}. Location data missing for precise map display. Showing overview of ${query === 'world' ? 'the world' : query}.`;
      } else { // No hotspots identified for the selected disease
        newDescription = `No significant forecast hotspots for ${selectedDisease}.`;
        if (selectedRegion && regionMetadata[selectedRegion]) {
          const meta = regionMetadata[selectedRegion];
          if (meta && typeof meta.latitude === 'number' && typeof meta.longitude === 'number') {
            query = `${meta.latitude},${meta.longitude}(${encodeURIComponent(selectedRegion)})`;
            zoomLevel = 7;
            newDescription += ` Displaying ${selectedRegion}.`;
          } else {
            query = meta.country ? encodeURIComponent(meta.country) : 'world';
            zoomLevel = meta.country ? 5 : 2;
            newDescription += ` Displaying overview of ${selectedRegion} area.`;
          }
        } else {
          query = 'world';
          zoomLevel = 2;
          newDescription += ' Select a region to view its location.';
        }
      }
    } else if (selectedRegion && regionMetadata[selectedRegion]) { // No disease selected, but a region is
      const meta = regionMetadata[selectedRegion];
      if (meta && typeof meta.latitude === 'number' && typeof meta.longitude === 'number') {
        query = `${meta.latitude},${meta.longitude}(${encodeURIComponent(selectedRegion)})`;
        zoomLevel = 7;
        newDescription = `Displaying ${selectedRegion}. Select a disease to identify potential hotspots.`;
      } else {
        query = meta.country ? encodeURIComponent(meta.country) : 'world';
        zoomLevel = meta.country ? 5 : 2;
        newDescription = `Displaying overview of ${selectedRegion} area (precise location unavailable). Select a disease for hotspots.`;
      }
    } else { // Default global view
      query = 'world';
      zoomLevel = 2;
      newDescription = "Select region and disease to view specific data and hotspots on the map.";
    }
    
    if (!query.trim()) { query = 'world'; zoomLevel = 2; } // Final fallback

    setMapUrl(`https://maps.google.com/maps?q=${query}&hl=en&z=${zoomLevel}&t=k&output=embed`);
    setDynamicDescription(newDescription);

  }, [
    selectedRegion, 
    selectedDisease, 
    regionMetadata, 
    hotspotNamesFromForecast, // Use the memoized value
    dataLoading, 
    dataError
  ]);


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
  
  return (
    <Card className="shadow-lg flex-1">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2"><MapPin /> Interactive Geospatial Map</CardTitle>
        <CardDescription>
          {dataError && !dataLoading ? <span className="text-destructive flex items-center gap-1"><AlertCircle size={16} />{dynamicDescription}</span> : dynamicDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="aspect-[16/9] relative p-0">
        {dataError && !dataLoading ? (
          <div className="flex items-center justify-center h-full bg-muted rounded-b-md">
            <p className="text-muted-foreground p-4 text-center">Could not display map due to error. Please check console for details.</p>
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
}


    