
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquareWarning, FileText } from 'lucide-react';

export function RiskCommunicationArea() {
  return (
    <Card className="shadow-lg flex-1 h-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <MessageSquareWarning className="text-primary" /> Risk Communication
        </CardTitle>
        <CardDescription>
          Embedded markdown or alerts section for risk communication.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] bg-muted/50 rounded-b-md p-6 text-center">
        <FileText size={48} className="text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Alerts and markdown content will be displayed here.</p>
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm text-left w-full">
          <p className="font-semibold">Example Alert:</p>
          <p>High risk of Dengue outbreak in Dhaka North next 7 days. Advise increased vector control measures.</p>
        </div>
      </CardContent>
    </Card>
  );
}
