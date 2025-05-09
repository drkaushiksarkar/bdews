import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

export function RegionalInfoPanel() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <MapPin className="h-5 w-5 text-primary" />
          Regional Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>
          Select a district or region on the map to view detailed climate and disease trend charts.
          Currently, this panel shows placeholder information.
        </CardDescription>
        {/* Placeholder for charts */}
        <div className="mt-4 p-8 border border-dashed rounded-md text-center text-muted-foreground">
          Chart Area: Detailed trends will appear here.
        </div>
      </CardContent>
    </Card>
  );
}
