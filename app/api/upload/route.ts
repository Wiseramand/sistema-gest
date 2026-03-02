import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure the uploads directory exists
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (err) {
            // Ignore if directory already exists
        }

        // Clean filename and add timestamp to avoid collisions
        const timestamp = Date.now();
        const fileName = `${timestamp}-${file.name.replace(/\s+/g, '_')}`;
        const path = join(uploadDir, fileName);

        await writeFile(path, buffer);
        const url = `/uploads/${fileName}`;

        // Log the activity (optional, but good for admin uploads)
        try {
            const { getServerSession } = await import('next-auth');
            const { authOptions } = await import('../../../lib/auth');
            const { logActivity } = await import('../../../lib/logger');
            const session = await getServerSession(authOptions);
            if (session?.user) {
                await logActivity(
                    (session.user as any).id,
                    session.user.name || 'Unknown',
                    (session.user as any).role,
                    'UPLOAD',
                    `Fez upload do ficheiro: ${file.name}`,
                    'file',
                    fileName
                );
            }
        } catch (e) { }

        return NextResponse.json({ url, name: file.name });
    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}
