
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
      // Still loading metadata or error
      return;
    }

    let newQuery = '';
    let zoom = 2;
    let centerQueryDone = false;

    if (hotspotRegions.length > 0 && regionMetadata) {
      // If there are specific hotspots for the selected disease/year
      const hotspotQueries = hotspotRegions.map(regionName => {
        const meta = regionMetadata[regionName];
        return meta ? `${meta.latitude},${meta.longitude}(${encodeURIComponent(regionName)})` : encodeURIComponent(regionName);
      });
      newQuery = hotspotQueries.join('|');
      zoom = 6; // Zoom in a bit if there are specific hotspots
      // If selectedRegion is one of the hotspots, center on it more specifically.
      if (selectedRegion && hotspotRegions.includes(selectedRegion) && regionMetadata[selectedRegion]) {
         const meta = regionMetadata[selectedRegion];
         newQuery = `${meta.latitude},${meta.longitude}(${encodeURIComponent(selectedRegion)})|${hotspotQueries.filter(q => !q.includes(encodeURIComponent(selectedRegion))).join('|')}`; // Prioritize selected region
         zoom = 8;
         centerQueryDone = true;
      } else if (hotspotRegions.length === 1 && regionMetadata[hotspotRegions[0]]){
        // If only one hotspot, center on it
        const meta = regionMetadata[hotspotRegions[0]];
        newQuery = `${meta.latitude},${meta.longitude}(${encodeURIComponent(hotspotRegions[0])})`;
        zoom = 8;
        centerQueryDone = true;
      }

    } else if (selectedRegion && regionMetadata && regionMetadata[selectedRegion]) {
      // If no specific hotspots for the filter, but a region is selected
      const meta = regionMetadata[selectedRegion];
      newQuery = `${meta.latitude},${meta.longitude}(${encodeURIComponent(selectedRegion)})`;
      zoom = 8; // Zoom into the selected region
      centerQueryDone = true;
    } else {
      // Default global view
      newQuery = '0,0';
      zoom = 2;
      centerQueryDone = true;
    }
    
    setMapUrl(`https://maps.google.com/maps?q=${newQuery}&hl=en&z=${zoom}&t=k&output=embed`);

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
