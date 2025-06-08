import { type NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { stat, mkdir } from 'fs/promises';

const imagesDirectory = path.join(process.cwd(), 'public/images');
const resizedImagesDirectory = path.join(process.cwd(), 'public/resized-images');

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

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  const { filename } = params;
  const { searchParams } = new URL(request.url);
  const widthParam = searchParams.get('width');
  const heightParam = searchParams.get('height');

  if (!filename) {
    return NextResponse.json({ message: 'Filename is required' }, { status: 400 });
  }
  if (!widthParam || !heightParam) {
    return NextResponse.json({ message: 'Width and height parameters are required' }, { status: 400 });
  }

  const width = parseInt(widthParam, 10);
  const height = parseInt(heightParam, 10);

  if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0 || width > 4000 || height > 4000) {
    return NextResponse.json({ message: 'Invalid width or height parameters' }, { status: 400 });
  }
  
  // Sanitize filename to prevent directory traversal
  const sanitizedFilename = path.basename(filename);
  const originalFilePath = path.join(imagesDirectory, sanitizedFilename);

  const ext = path.extname(sanitizedFilename) || '.jpg'; // Default to .jpg if no extension
  const nameWithoutExt = path.basename(sanitizedFilename, ext);
  const cachedFilename = `${nameWithoutExt}_${width}x${height}${ext}`;
  const cachedFilePath = path.join(resizedImagesDirectory, cachedFilename);

  try {
    await ensureDirectoryExists(imagesDirectory);
    await ensureDirectoryExists(resizedImagesDirectory);

    // Check if cached image exists
    try {
      await fs.access(cachedFilePath);
      const cachedImageBuffer = await fs.readFile(cachedFilePath);
      return new NextResponse(cachedImageBuffer, {
        status: 200,
        headers: { 'Content-Type': `image/${ext.slice(1)}` },
      });
    } catch (e) {
      // Cached image does not exist, proceed to generate
    }

    // Check if original image exists
    try {
      await fs.access(originalFilePath);
    } catch (e) {
      return NextResponse.json({ message: 'Original image not found' }, { status: 404 });
    }
    
    const originalImageBuffer = await fs.readFile(originalFilePath);

    const resizedImageBuffer = await sharp(originalImageBuffer)
      .resize(width, height)
      .toFormat(ext.slice(1) as keyof sharp.FormatEnum, { quality: 80 }) // Ensure format is valid
      .toBuffer();

    await fs.writeFile(cachedFilePath, resizedImageBuffer);

    return new NextResponse(resizedImageBuffer, {
      status: 200,
      headers: { 'Content-Type': `image/${ext.slice(1)}` },
    });

  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json({ message: 'Error processing image', error: (error as Error).message }, { status: 500 });
  }
}
