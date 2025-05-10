'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardContext } from '@/context/DashboardContext';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, AlertCircle } from 'lucide-react';

export function InteractiveMap() {
  const { 
    selectedRegion, 
    selectedDisease, 
    selectedYear, 
    anomalyData, 
    regionMetadata,
    dataLoading,
    dataError 
  } = useDashboardContext();
  
  const [mapUrl, setMapUrl] = useState('https://maps.google.com/maps?q=0,0&hl=en&z=2&t=k&output=embed');
  const [currentHotspots, setCurrentHotspots] = useState<string[]>([]);

  const hotspotRegions = useMemo(() => {
    if (!anomalyData || !selectedDisease || !selectedYear || !regionMetadata) {
      return [];
    }
    
    const hotspots: string[] = [];
    const yearStr = selectedYear.toString();

    for (const regionName in anomalyData) {
      if (anomalyData[regionName] && anomalyData[regionName][selectedDisease]) {
        const hasAnomaly = anomalyData[regionName][selectedDisease].some(
          (entry) => entry.date.endsWith(yearStr) && entry.isAnomaly
        );
        // We also need to ensure metadata exists to be able to plot it
        if (hasAnomaly && regionMetadata[regionName]) {
          hotspots.push(regionName);
        }
      }
    }
    return hotspots;
  }, [anomalyData, selectedDisease, selectedYear, regionMetadata]);

  useEffect(() => {
    setCurrentHotspots(hotspotRegions);
    
    if (!regionMetadata) {
      // Metadata might still be loading or there was an error fetching it.
      // Don't attempt to construct a new map URL without it.
      // The map will either show its default or the previously set URL.
      return;
    }

    let query = '';
    let zoomLevel = 2;

    const validHotspotPlotData = hotspotRegions
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
        console.warn(`InteractiveMap: Missing or invalid (lat/lon not numbers) metadata for hotspot region: ${regionName}. Latitude: ${meta?.latitude}, Longitude: ${meta?.longitude}`);
        return null; 
      })
      .filter(Boolean);

    if (validHotspotPlotData.length > 0) {
      query = validHotspotPlotData.map(h => h!.queryString).join('|');
      zoomLevel = 6; // Default zoom for multiple hotspots

      const selectedRegionIsHotspot = selectedRegion && validHotspotPlotData.find(h => h!.name === selectedRegion);

      if (selectedRegionIsHotspot) {
        // Prioritize selected region if it's a hotspot
        const selectedQuery = selectedRegionIsHotspot.queryString;
        const otherQueries = validHotspotPlotData
          .filter(h => h!.name !== selectedRegion)
          .map(h => h!.queryString);
        query = [selectedQuery, ...otherQueries].join('|');
        zoomLevel = 8;
      } else if (validHotspotPlotData.length === 1) {
        // If only one valid hotspot, zoom in on it (query is already just that one)
        zoomLevel = 8;
      }
    } else if (selectedRegion && regionMetadata[selectedRegion]) {
      // No valid hotspots to plot, but a region is selected
      const meta = regionMetadata[selectedRegion];
      if (typeof meta.latitude === 'number' && typeof meta.longitude === 'number') {
        query = `${meta.latitude},${meta.longitude}(${encodeURIComponent(selectedRegion)})`;
        zoomLevel = 8;
      } else {
        console.warn(`InteractiveMap: Missing or invalid metadata for selected region: ${selectedRegion}`);
        query = '0,0'; // Fallback
        zoomLevel = 2;
      }
    } else {
      // Default global view if no hotspots and no selected region with valid meta
      query = '0,0';
      zoomLevel = 2;
    }
    
    if (!query.trim()) { // Final safety net for empty query
        query = '0,0';
        zoomLevel = 2;
    }
    
    // Ensure the 'q' parameter contains the locations. Labels are already URI encoded.
    // Do not encode the entire 'query' string here, as it contains special characters like '|', '(', ')', ','
    // which are part of the Google Maps query syntax.
    const newMapUrl = `https://maps.google.com/maps?q=${query}&hl=en&z=${zoomLevel}&t=k&output=embed`;
    
    // console.log("Setting map URL:", newMapUrl); // For debugging
    setMapUrl(newMapUrl);

  }, [selectedRegion, selectedDisease, selectedYear, anomalyData, regionMetadata, hotspotRegions]);


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

  return (
    <Card className="shadow-lg flex-1">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2"><MapPin /> Interactive Geospatial Map</CardTitle>
        <CardDescription>
          {currentHotspots.length > 0 
            ? `Displaying hotspots for ${selectedDisease || 'selected disease'} in ${selectedYear || 'selected year'}: ${currentHotspots.join(', ')}.`
            : selectedRegion 
              ? `Displaying ${selectedRegion}. No specific hotspots identified for the current filters.`
              : "Select filters to view specific regions or hotspots."}
        </CardDescription>
      </CardHeader>
      <CardContent className="aspect-[16/9] relative p-0">
        <iframe
          key={mapUrl} // Force re-render of iframe when URL changes
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
