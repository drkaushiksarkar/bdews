'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { CalendarClock } from 'lucide-react';
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from '@/components/ui/sidebar';


export function TimeSlider() {
  const [currentYear, setCurrentYear] = useState<number | undefined>(undefined);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    setIsMounted(true);
  }, []);


  if (!isMounted || currentYear === undefined) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5" />
          Time Forecast
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="p-4 space-y-4 group-data-[collapsible=icon]:hidden">
            <div className="flex justify-between items-center">
                <Label htmlFor="time-slider-loading" className="text-sm font-medium">Selected Year:</Label>
                <div className="h-5 w-12 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="h-5 w-full bg-muted rounded animate-pulse"></div>
            <CardDescription className="text-xs text-center">
                Loading time forecast options...
            </CardDescription>
          </div>
           <div className="p-2 space-y-2 group-data-[collapsible=icon]:not-hidden hidden justify-center">
            <div className="h-6 w-6 bg-muted rounded animate-pulse mx-auto"></div>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center gap-2">
        <CalendarClock className="h-5 w-5" />
        Time Forecast
      </SidebarGroupLabel>
      <SidebarGroupContent className="group-data-[collapsible=icon]:hidden">
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <Label htmlFor="time-slider" className="text-sm font-medium">Selected Year:</Label>
            <span className="text-sm font-bold text-primary">{currentYear}</span>
          </div>
          <Slider
            id="time-slider"
            min={2000}
            max={2050}
            step={1}
            defaultValue={[currentYear]}
            onValueChange={(value) => setCurrentYear(value[0])}
            className="w-full"
          />
          <CardDescription className="text-xs text-center">
            Adjust slider to view historical and predicted data.
          </CardDescription>
        </div>
      </SidebarGroupContent>
       <SidebarGroupContent className="group-data-[collapsible=icon]:not-hidden hidden justify-center p-2">
         <CalendarClock className="h-6 w-6 text-sidebar-foreground" />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

