
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, PieChart } from 'lucide-react';

export function DistributionChartsPlaceholder() {
  return (
    <Card className="shadow-lg flex-1 h-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <BarChart className="text-primary" /> Distribution Analysis
        </CardTitle>
        <CardDescription>
          Placeholder for bar or donut charts (e.g., distribution by division/upazila).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] bg-muted/50 rounded-b-md p-6 text-center">
        <PieChart size={48} className="text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Distribution charts will be displayed here.</p>
      </CardContent>
    </Card>
  );
}
