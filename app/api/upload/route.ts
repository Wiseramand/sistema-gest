import { NextResponse } from 'next/server';
import { getAnySession } from '../../../lib/auth';
import { logActivity } from '../../../lib/logger';
import { uploadToCloudinary, generateCloudinarySignature } from '../../../lib/cloudinary';

// GET for generating upload signatures (to bypass 4.5MB limit)
export async function GET() {
    try {
        const session = await getAnySession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const params = {
            folder: 'materials',
        };
        
        const signData = generateCloudinarySignature(params);
        return NextResponse.json(signData);
    } catch (error: any) {
        console.error('Signature Error:', error);
        return NextResponse.json({ error: 'Failed to generate signature' }, { status: 500 });
    }
}

// POST for small files (< 4MB) or compatibility
export async function POST(request: Request) {
    try {
        const session = await getAnySession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Check size for proxy
        if (file.size > 4 * 1024 * 1024) {
            return NextResponse.json({ error: 'Ficheiro muito grande para upload via API. Use o modo direto.' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const result: any = await uploadToCloudinary(buffer, file.name);
        const url = result.secure_url;

        // Log the activity
        try {
            if (session?.user) {
                await logActivity(
                    (session.user as any).id,
                    session.user.name || 'Unknown',
                    (session.user as any).role,
                    'UPLOAD',
                    `Fez upload via Cloudinary: ${file.name}`,
                    'file',
                    result.public_id
                );
            }
        } catch (e) {
            console.error('Activity Log Error:', e);
        }

        return NextResponse.json({ url, name: file.name, publicId: result.public_id });
    } catch (error: any) {
        console.error('Detailed Upload Error:', error);
        return NextResponse.json({ 
            error: `Falha no upload: ${error.message || 'Erro de processamento'}`
        }, { status: 500 });
    }
}
