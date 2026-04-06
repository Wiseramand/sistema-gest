import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
;
import { getAnySession } from '../../../lib/auth';
import { logActivity } from '../../../lib/logger';

export async function POST(request: Request) {
    try {
        // ✅ CORRECÇÃO: Verificar autenticação ANTES de processar o ficheiro
        const session = await getAnySession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // ✅ CORRECÇÃO: Validar tipo de ficheiro — apenas imagens e PDFs
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Tipo de ficheiro não permitido (apenas Imagens e PDFs)' }, { status: 400 });
        }

        // ✅ CORRECÇÃO: Limitar tamanho — máximo 5MB
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'Ficheiro demasiado grande (máximo 5MB)' }, { status: 400 });
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

        // Log the activity
        try {
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
        } catch (e) {
            console.error('Activity Log Error:', e);
        }

        return NextResponse.json({ url, name: file.name });
    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: 'Falha no upload do ficheiro' }, { status: 500 });
    }
}
