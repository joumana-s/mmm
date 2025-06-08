"use client";

import type { FC } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  images: string[];
  selectedImage: string | null;
  onImageSelect: (imageName: string) => void;
}

const ImageGallery: FC<ImageGalleryProps> = ({ images, selectedImage, onImageSelect }) => {
  if (!images.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Images</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No images available. Upload some images to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Images</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 p-1">
            {images.map((imageName) => (
              <button
                key={imageName}
                onClick={() => onImageSelect(imageName)}
                className={cn(
                  "relative aspect-square w-full overflow-hidden rounded-md border-2 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  selectedImage === imageName ? "border-primary ring-2 ring-primary" : "border-transparent hover:border-muted-foreground"
                )}
                aria-label={`Select image ${imageName}`}
              >
                <Image
                  src={`/images/${imageName}`}
                  alt={imageName}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 ease-in-out group-hover:scale-105"
                  data-ai-hint="photo thumbnail"
                />
                {selectedImage === imageName && (
                  <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground h-8 w-8"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ImageGallery;
