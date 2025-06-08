import { type NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { stat, mkdir } from 'fs/promises';

const imagesDirectory = path.join(process.cwd(), 'public/images');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg'];

async function ensureDirectoryExists(directoryPath: string) {
  try {
    await stat(directoryPath);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      await mkdir(directoryPath, { recursive: true });
    } else {
      throw error;
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDirectoryExists(imagesDirectory);
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'No image file provided' }, { status: 400 });
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json({ message: 'Invalid file type. Only JPG images are allowed.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: `File size exceeds limit of ${MAX_FILE_SIZE / (1024*1024)}MB` }, { status: 400 });
    }
    
    // Sanitize filename - basic sanitization
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = path.join(imagesDirectory, sanitizedFilename);
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await fs.writeFile(filePath, buffer);

    return NextResponse.json({ message: 'Image uploaded successfully', filename: sanitizedFilename });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ message: 'Error uploading image', error: (error as Error).message }, { status: 500 });
  }
}
