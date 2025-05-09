'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { CalendarClock } from 'lucide-react';
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from '@/components/ui/sidebar';


export function TimeSlider() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);


  if (!isMounted) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5" />
          Time Forecast
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="p-2 space-y-2">
            <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
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
    </SidebarGroup>
  );
}
