
'use client';

import { useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useDashboardContext } from '@/context/DashboardContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

export function RegionSelector() {
  const { 
    selectedRegion, 
    setSelectedRegion, 
    availableRegions 
  } = useDashboardContext();

  if (!availableRegions.length) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Region
        </SidebarGroupLabel>
        <SidebarGroupContent className="group-data-[collapsible=icon]:hidden">
          <div className="p-4 space-y-2">
            <Skeleton className="h-8 w-full" />
            <p className="text-xs text-center text-muted-foreground">Loading regions...</p>
          </div>
        </SidebarGroupContent>
         <SidebarGroupContent className="group-data-[collapsible=icon]:not-hidden hidden justify-center p-2">
           <Globe className="h-6 w-6 text-sidebar-foreground" />
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center gap-2">
        <Globe className="h-5 w-5" />
        Region
      </SidebarGroupLabel>
      <SidebarGroupContent className="group-data-[collapsible=icon]:hidden">
        <div className="p-4">
          <Select
            value={selectedRegion || ''}
            onValueChange={(value) => setSelectedRegion(value || undefined)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a region" />
            </SelectTrigger>
            <SelectContent>
              {availableRegions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </SidebarGroupContent>
      <SidebarGroupContent className="group-data-[collapsible=icon]:not-hidden hidden justify-center p-2">
         <Globe className="h-6 w-6 text-sidebar-foreground" />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
