
"use client";

import { useState, useEffect, useCallback } from 'react';
import ImageGallery from '@/components/image-tools/image-gallery';
import UploadForm from '@/components/image-tools/upload-form';
import ResizeForm from '@/components/image-tools/resize-form';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ImageIcon } from 'lucide-react';

const initialPlaceholderImages = ['placeholder1.jpg', 'placeholder2.jpg', 'placeholder3.jpg'];

export default function ImageResizerPage() {
  const [images, setImages] = useState<string[]>(initialPlaceholderImages);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [, setGeneratedUrl] = useState<string | null>(null); // URL state managed here for potential broader use
  const { toast } = useToast();

  const fetchImages = useCallback(async () => {
    try {
      const response = await fetch('/api/images');
      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || 'Failed to fetch images');
      }
      const fetchedImageList: string[] = await response.json();
      // Combine initial placeholders with fetched images, ensuring no duplicates.
      // The primary source of truth for available images should be fetchedImageList if the API call is successful.
      // The Set automatically handles deduplication if initialPlaceholderImages are also in fetchedImageList.
      setImages(prevImages => {
        // If fetchedImageList successfully gets the images from public/images (including the placeholders now),
        // this logic should correctly update the list.
        const currentPlaceholdersNotInFetched = initialPlaceholderImages.filter(p => !fetchedImageList.includes(p));
        const combinedAndDeduplicated = Array.from(new Set([...currentPlaceholdersNotInFetched, ...fetchedImageList]));

        // This condition is a bit complex: if fetch returns empty AND we previously had placeholders, try to keep them.
        // However, if fetch is successful and returns what's in public/images, that should be the source.
        if (fetchedImageList.length === 0 && prevImages.some(img => initialPlaceholderImages.includes(img))) {
            // If API returns nothing, but we had placeholders, try to merge with previous non-placeholder images.
            const prevNonPlaceholders = prevImages.filter(img => !initialPlaceholderImages.includes(img));
            return Array.from(new Set([...initialPlaceholderImages, ...prevNonPlaceholders]));
        }
        return combinedAndDeduplicated;
      });
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
      // On error, attempt to show initial placeholders plus any previously known non-placeholder images.
      setImages(prevImages => {
        const prevNonPlaceholders = prevImages.filter(img => !initialPlaceholderImages.includes(img));
        return Array.from(new Set([...initialPlaceholderImages, ...prevNonPlaceholders]));
      });
    }
  }, [toast]); // initialPlaceholderImages is a module-level const, stable.

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleImageSelect = (imageName: string) => {
    setSelectedImage(prevSelected => prevSelected === imageName ? null : imageName);
  };

  const handleUploadSuccess = () => {
    fetchImages(); // Refresh image list after successful upload
    setSelectedImage(null); // Deselect any currently selected image
  };

  const handleUrlGenerated = (url: string) => {
    setGeneratedUrl(url);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-headline font-bold text-primary flex items-center justify-center gap-3">
          <ImageIcon className="h-10 w-10" />
          Image Resizer & Placeholder Generator
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Upload, select, and resize images to generate placeholder URLs.
        </p>
      </header>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 xl:col-span-4 space-y-8">
          <UploadForm onUploadSuccess={handleUploadSuccess} />
        </div>

        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
           <ImageGallery images={images} selectedImage={selectedImage} onImageSelect={handleImageSelect} />
           <Separator className="my-6" />
           <ResizeForm selectedImage={selectedImage} onUrlGenerated={handleUrlGenerated} />
        </div>
      </div>

      <footer className="mt-12 pt-8 border-t text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Image Resizer App. Built with Next.js and ShadCN UI.</p>
      </footer>
    </div>
  );
}
