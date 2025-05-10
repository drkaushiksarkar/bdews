
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

export function KeyPerformanceIndicators() {
  return (
    <Card className="shadow-lg flex-1 h-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Activity className="text-primary" /> Key Performance Indicators
        </CardTitle>
        <CardDescription>
          Summary cards with KPIs (e.g., outbreak probability, R0, etc.).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] bg-muted/50 rounded-b-md p-6 text-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div className="p-4 bg-background rounded-lg shadow">
                <h3 className="text-sm font-medium text-muted-foreground">Outbreak Probability</h3>
                <p className="text-2xl font-bold text-primary">--%</p>
            </div>
            <div className="p-4 bg-background rounded-lg shadow">
                <h3 className="text-sm font-medium text-muted-foreground">R0 Estimate</h3>
                <p className="text-2xl font-bold text-primary">--</p>
            </div>
             <div className="p-4 bg-background rounded-lg shadow">
                <h3 className="text-sm font-medium text-muted-foreground">Cases Next Month</h3>
                <p className="text-2xl font-bold text-primary">--</p>
            </div>
             <div className="p-4 bg-background rounded-lg shadow">
                <h3 className="text-sm font-medium text-muted-foreground">Affected Population</h3>
                <p className="text-2xl font-bold text-primary">--</p>
            </div>
        </div>
        <p className="text-muted-foreground mt-4 text-xs">Key Performance Indicators will be displayed here.</p>
      </CardContent>
    </Card>
  );
}
