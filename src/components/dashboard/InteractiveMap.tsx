import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function InteractiveMap() {
  return (
    <Card className="shadow-lg flex-1">
      <CardHeader>
        <CardTitle className="text-xl">Interactive Geospatial Map</CardTitle>
      </CardHeader>
      <CardContent className="aspect-[16/9] relative">
        <iframe
          src="https://maps.google.com/maps?q=0,0&hl=en&z=2&t=k&output=embed"
          width="100%"
          height="100%"
          className="absolute top-0 left-0 w-full h-full border-0 rounded-md"
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Satellite Map"
        ></iframe>
      </CardContent>
    </Card>
  );
}
