"use client";

import type { FC, FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Crop, ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface ResizeFormProps {
  selectedImage: string | null;
  onUrlGenerated: (url: string) => void;
}

const ResizeForm: FC<ResizeFormProps> = ({ selectedImage, onUrlGenerated }) => {
  const [width, setWidth] = useState('300');
  const [height, setHeight] = useState('200');
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);
  
  useEffect(() => {
    // Reset URL when selected image changes
    setGeneratedUrl(null);
  }, [selectedImage]);


  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!selectedImage) {
      toast({ title: "No Image Selected", description: "Please select an image from the gallery first.", variant: "destructive" });
      return;
    }
    if (!width || !height || parseInt(width) <= 0 || parseInt(height) <= 0) {
      toast({ title: "Invalid Dimensions", description: "Please enter valid positive numbers for width and height.", variant: "destructive" });
      return;
    }

    const url = `${baseUrl}/api/image/${selectedImage}?width=${width}&height=${height}`;
    setGeneratedUrl(url);
    onUrlGenerated(url);
    toast({ title: "URL Generated", description: "Placeholder URL is ready." });
  };

  const handleCopyToClipboard = async () => {
    if (generatedUrl) {
      try {
        await navigator.clipboard.writeText(generatedUrl);
        toast({ title: "Copied!", description: "URL copied to clipboard." });
      } catch (err) {
        toast({ title: "Copy Failed", description: "Could not copy URL to clipboard.", variant: "destructive" });
      }
    }
  };

  if (!selectedImage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crop className="h-6 w-6 text-primary" />
            Resize Image
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Select an image from the gallery to resize it and generate a placeholder URL.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
           <Crop className="h-6 w-6 text-primary" />
           Resize: <span className="font-normal text-muted-foreground truncate max-w-[200px] sm:max-w-xs">{selectedImage}</span>
        </CardTitle>
        <CardDescription>Set dimensions for your placeholder image.</CardDescription>
      </CardHeader>
      <CardContent>
        {selectedImage && (
            <div className="mb-4 p-2 border rounded-md bg-muted/50 flex justify-center items-center h-40">
                <Image 
                    src={`/images/${selectedImage}`} 
                    alt={`Preview of ${selectedImage}`}
                    width={150}
                    height={150}
                    className="max-h-full max-w-full object-contain rounded"
                    data-ai-hint="selected image"
                />
            </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="width">Width (px)</Label>
              <Input
                id="width"
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="e.g., 300"
                min="1"
                max="4000"
                required
              />
            </div>
            <div>
              <Label htmlFor="height">Height (px)</Label>
              <Input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g., 200"
                min="1"
                max="4000"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full">Generate Placeholder URL</Button>
        </form>

        {generatedUrl && (
          <div className="mt-6 space-y-3 p-4 border rounded-md bg-secondary/50">
            <Label htmlFor="generatedUrlInput" className="font-semibold text-foreground">Generated URL:</Label>
            <div className="flex items-center gap-2">
              <Input id="generatedUrlInput" type="text" value={generatedUrl} readOnly className="bg-background"/>
              <Button variant="outline" size="icon" onClick={handleCopyToClipboard} aria-label="Copy URL">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a href={generatedUrl} target="_blank" rel="noopener noreferrer" aria-label="Open URL in new tab">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
            <div className="mt-4 p-2 border rounded-md bg-background flex justify-center items-center h-48">
              <Image
                key={generatedUrl} // Force re-render if URL changes for same dimensions but different image
                src={generatedUrl}
                alt="Generated placeholder image"
                width={parseInt(width) > 400 ? 400 : parseInt(width)} // Limit preview size
                height={parseInt(height) > 400 ? (400 * parseInt(height))/parseInt(width) : parseInt(height)}
                className="max-h-full max-w-full object-contain rounded shadow-md"
                data-ai-hint="placeholder image"
                unoptimized // Important for URLs that are dynamically generated and not known at build time
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResizeForm;
