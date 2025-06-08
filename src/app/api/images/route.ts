import { type NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const imagesDirectory = path.join(process.cwd(), 'public/images');

export async function GET(request: NextRequest) {
  try {
    await fs.mkdir(imagesDirectory, { recursive: true });
    const filenames = await fs.readdir(imagesDirectory);
    const imageFiles = filenames.filter(file => /\.(jpe?g|png|gif|webp)$/i.test(file));
    return NextResponse.json(imageFiles);
  } catch (error) {
    console.error('Error listing images:', error);
    return NextResponse.json({ message: 'Error listing images', error: (error as Error).message }, { status: 500 });
  }
}
