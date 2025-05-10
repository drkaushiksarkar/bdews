
'use client';

import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { CalendarClock } from 'lucide-react';
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from '@/components/ui/sidebar';
import { useDashboardContext } from '@/context/DashboardContext';
import { Skeleton } from '@/components/ui/skeleton';


export function TimeSlider() {
  const { selectedYear, setSelectedYear, dataLoading, dataError } = useDashboardContext();
  const [isMounted, setIsMounted] = useState(false);
  const [sliderValue, setSliderValue] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    setIsMounted(true);
    if (selectedYear !== undefined) {
      setSliderValue(selectedYear);
    }
  }, [selectedYear]);

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value[0]);
  };

  const handleSliderCommit = (value: number[]) => {
    setSelectedYear(value[0]);
  };


  if (!isMounted || dataLoading) {
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
                <Skeleton className="h-5 w-12" />
            </div>
            <Skeleton className="h-5 w-full" />
            <p className="text-xs text-center text-muted-foreground">
                Loading time forecast options...
            </p>
          </div>
           <div className="p-2 space-y-2 group-data-[collapsible=icon]:not-hidden hidden justify-center">
            <Skeleton className="h-6 w-6" />
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (dataError) {
     return (
      <SidebarGroup>
        <SidebarGroupLabel className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5" />
          Time Forecast
        </SidebarGroupLabel>
        <SidebarGroupContent className="group-data-[collapsible=icon]:hidden">
          <div className="p-4">
            <p className="text-xs text-center text-destructive">Error loading time options.</p>
          </div>
        </SidebarGroupContent>
         <SidebarGroupContent className="group-data-[collapsible=icon]:not-hidden hidden justify-center p-2">
           <CalendarClock className="h-6 w-6 text-destructive" />
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
            <span className="text-sm font-bold text-primary">{sliderValue}</span>
          </div>
          <Slider
            id="time-slider"
            min={2021} // Min year from dummy data
            max={2023} // Max year from dummy data (actuals) + some forecast years
            step={1}
            value={[sliderValue]}
            onValueChange={handleSliderChange}
            onValueCommit={handleSliderCommit} // Use onValueCommit to update context only when interaction ends
            className="w-full"
          />
          <p className="text-xs text-center text-muted-foreground">
            Adjust slider to view historical and predicted data.
          </p>
        </div>
      </SidebarGroupContent>
       <SidebarGroupContent className="group-data-[collapsible=icon]:not-hidden hidden justify-center p-2">
         <CalendarClock className="h-6 w-6 text-sidebar-foreground" />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
