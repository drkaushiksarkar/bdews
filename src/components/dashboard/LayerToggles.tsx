'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Layers, Thermometer, CloudRain, Droplets, Leaf, Users } from 'lucide-react';
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenuItem, SidebarMenu } from '@/components/ui/sidebar';

const layers = [
  { id: 'temperature', label: 'Temperature', icon: Thermometer },
  { id: 'rainfall', label: 'Rainfall', icon: CloudRain },
  { id: 'humidity', label: 'Humidity', icon: Droplets },
  { id: 'vegetation', label: 'Vegetation Index', icon: Leaf },
  { id: 'population', label: 'Population Density', icon: Users },
];

export function LayerToggles() {
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    temperature: true,
    rainfall: false,
  });

  const handleLayerChange = (layerId: string) => {
    setActiveLayers((prev) => ({ ...prev, [layerId]: !prev[layerId] }));
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center gap-2">
        <Layers className="h-5 w-5" />
        Map Layers
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {layers.map((layer) => (
            <SidebarMenuItem key={layer.id} className="p-0">
              <Label
                htmlFor={layer.id}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-sidebar-accent cursor-pointer w-full group-data-[collapsible=icon]:justify-center"
              >
                <layer.icon className="h-5 w-5 text-sidebar-foreground group-hover/menu-item:text-sidebar-accent-foreground" />
                <span className="text-sm group-data-[collapsible=icon]:hidden flex-1">{layer.label}</span>
                 <Checkbox
                  id={layer.id}
                  checked={activeLayers[layer.id] || false}
                  onCheckedChange={() => handleLayerChange(layer.id)}
                  className="group-data-[collapsible=icon]:hidden"
                />
              </Label>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
