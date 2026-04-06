import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const parentId = searchParams.get('parentId') || null;

        const items = await db.material.findMany({
            where: { parentId: parentId === '' ? null : parentId },
            orderBy: [{ isFolder: 'desc' }, { createdAt: 'desc' }],
        });

        return NextResponse.json(items);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const contentType = request.headers.get('content-type') || '';
        const user = session.user as any;
        
        let data: any = {};

        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            const file = formData.get('file') as File | null;
            
            data = {
                name: formData.get('name') as string,
                description: formData.get('description') as string || null,
                type: formData.get('type') as string || 'PDF',
                targetRole: formData.get('targetRole') as string || 'BOTH',
                isFolder: formData.get('isFolder') === 'true',
                parentId: formData.get('parentId') as string || null,
            };

            if (file && !data.isFolder) {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);

                const uploadDir = join(process.cwd(), 'public', 'uploads');
                try {
                    await mkdir(uploadDir, { recursive: true });
                } catch (e) {}

                const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
                const path = join(uploadDir, fileName);
                await writeFile(path, buffer);
                
                data.url = `/uploads/${fileName}`;
            } else {
                data.url = formData.get('url') as string || null;
            }
        } else {
            data = await request.json();
        }

        const item = await db.material.create({
            data: {
                name: data.name,
                description: data.description,
                type: data.type,
                url: data.url,
                isFolder: data.isFolder || false,
                parentId: data.parentId === '' ? null : data.parentId,
                targetRole: data.targetRole || 'BOTH',
                uploadedBy: user.id || null,
                uploadedByName: user.name || 'Admin',
            }
        });

        return NextResponse.json(item);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { id, ...data } = body;
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const updated = await db.material.update({
            where: { id },
            data: {
                ...data,
                parentId: data.parentId === '' ? null : data.parentId,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        // Recursive delete children
        await db.material.deleteMany({ where: { parentId: id } });
        await db.material.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
