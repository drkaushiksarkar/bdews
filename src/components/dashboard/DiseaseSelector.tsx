
'use client';

import { Bug } from 'lucide-react'; 
import { useDashboardContext } from '@/context/DashboardContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import type { Disease } from '@/context/DashboardContext';

export function DiseaseSelector() {
  const { 
    selectedDisease, 
    setSelectedDisease, 
    availableDiseases,
    dataLoading, // Use from context
    dataError    // Use from context
  } = useDashboardContext();

  if (dataLoading) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Disease
        </SidebarGroupLabel>
        <SidebarGroupContent className="group-data-[collapsible=icon]:hidden">
          <div className="p-4 space-y-2">
            <Skeleton className="h-8 w-full" />
            <p className="text-xs text-center text-muted-foreground">Loading diseases...</p>
          </div>
        </SidebarGroupContent>
         <SidebarGroupContent className="group-data-[collapsible=icon]:not-hidden hidden justify-center p-2">
           <Bug className="h-6 w-6 text-sidebar-foreground" />
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }
  
  if (dataError && !availableDiseases.length) { // Show error only if diseases couldn't be determined due to broader data error
     return (
      <SidebarGroup>
        <SidebarGroupLabel className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Disease
        </SidebarGroupLabel>
        <SidebarGroupContent className="group-data-[collapsible=icon]:hidden">
          <div className="p-4">
            <p className="text-xs text-center text-destructive">
              Error loading disease options.
            </p>
          </div>
        </SidebarGroupContent>
         <SidebarGroupContent className="group-data-[collapsible=icon]:not-hidden hidden justify-center p-2">
           <Bug className="h-6 w-6 text-destructive" />
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }


  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center gap-2">
        <Bug className="h-5 w-5" />
        Disease
      </SidebarGroupLabel>
      <SidebarGroupContent className="group-data-[collapsible=icon]:hidden">
        <div className="p-4">
          <Select
            value={selectedDisease || ''}
            onValueChange={(value) => setSelectedDisease(value as Disease || undefined)}
            disabled={availableDiseases.length === 0 || dataLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a disease" />
            </SelectTrigger>
            <SelectContent>
              {availableDiseases.map((disease) => (
                <SelectItem key={disease} value={disease}>
                  {disease}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </SidebarGroupContent>
      <SidebarGroupContent className="group-data-[collapsible=icon]:not-hidden hidden justify-center p-2">
         <Bug className="h-6 w-6 text-sidebar-foreground" />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
