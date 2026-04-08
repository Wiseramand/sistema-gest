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

        // ✅ CORRECÇÃO: Validar tipo de ficheiro — Suporte alargado para documentos e vídeo
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/webp', 'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
            'application/msword', // DOC
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
            'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
            'text/plain', 'application/rtf',
            'video/mp4', 'video/webm', 'video/quicktime'
        ];
        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(docx|doc|xlsx|xls|pptx|ppt|mp4|mov|webm|txt|rtf|pdf)$/i)) {
            return NextResponse.json({ error: `Tipo de ficheiro não permitido (${file.type || 'desconhecido'}). Use PDF, Office ou Vídeos.` }, { status: 400 });
        }

        // ✅ CORRECÇÃO: Limitar tamanho — máximo 100MB para vídeos
        const MAX_SIZE = 100 * 1024 * 1024; // 100MB
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'Ficheiro demasiado grande (máximo 100MB)' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure the uploads directory exists
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (err) {
            console.error('Directory creation failed:', err);
        }

        // Clean filename more aggressively and add timestamp
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        const fileName = `${timestamp}-${safeName}`;
        const path = join(uploadDir, fileName);

        console.log(`Saving file to: ${path}`);
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
    } catch (error: any) {
        console.error('Detailed Upload Error:', error);
        return NextResponse.json({ 
            error: `Falha no upload: ${error.message || 'Erro de processamento'}`,
            details: error.stack 
        }, { status: 500 });
    }
}
