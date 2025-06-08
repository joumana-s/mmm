"use client";

import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud } from 'lucide-react';

interface UploadFormProps {
  onUploadSuccess: () => void;
}

const UploadForm: FC<UploadFormProps> = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedFile) {
      toast({ title: "No file selected", description: "Please select a JPG image to upload.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Upload failed');
      }

      toast({ title: "Upload Successful", description: `${result.filename} has been uploaded.` });
      setSelectedFile(null); // Reset file input visually by resetting state
      (event.target as HTMLFormElement).reset(); // Also reset the form element itself
      onUploadSuccess();
    } catch (error) {
      toast({ title: "Upload Error", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UploadCloud className="h-6 w-6 text-primary" />
          Upload New Image
        </CardTitle>
        <CardDescription>Upload a .jpg image to the gallery.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="imageUpload" className="mb-2 block text-sm font-medium">Select JPG Image</Label>
            <Input
              id="imageUpload"
              type="file"
              accept=".jpg,.jpeg"
              onChange={handleFileChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              disabled={isUploading}
            />
             {selectedFile && <p className="mt-2 text-sm text-muted-foreground">Selected: {selectedFile.name}</p>}
          </div>
          <Button type="submit" disabled={isUploading || !selectedFile} className="w-full">
            {isUploading ? 'Uploading...' : 'Upload Image'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UploadForm;
