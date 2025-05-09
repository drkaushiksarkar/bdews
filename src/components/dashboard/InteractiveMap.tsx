import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function InteractiveMap() {
  return (
    <Card className="shadow-lg flex-1">
      <CardHeader>
        <CardTitle className="text-xl">Interactive Geospatial Map</CardTitle>
      </CardHeader>
      <CardContent className="aspect-[16/9] relative">
        <Image
          src="https://picsum.photos/1200/800"
          alt="Interactive Map Placeholder"
          layout="fill"
          objectFit="cover"
          className="rounded-md"
          data-ai-hint="world map satellite"
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-md">
          <p className="text-white text-2xl font-semibold p-4 bg-black/50 rounded-md">
            Map Area (Placeholder)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
