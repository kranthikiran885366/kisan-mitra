import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');
    const type = data.get('type') || 'general';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${type}_${timestamp}.${extension}`;
    
    const path = join(process.cwd(), 'public', 'uploads', filename);
    await writeFile(path, buffer);

    return NextResponse.json({
      success: true,
      data: {
        filename,
        url: `/uploads/${filename}`,
        size: file.size,
        type: file.type
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}