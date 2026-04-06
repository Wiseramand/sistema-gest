import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const parentId = searchParams.get('parentId') || null;

        const items = await db.material.findMany({
            where: { parentId },
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

        const body = await request.json();
        const user = session.user as any;

        const item = await db.material.create({
            data: {
                name: body.name,
                description: body.description || null,
                type: body.type || null,
                url: body.url || null,
                access: body.access || 'ALL',
                isFolder: body.isFolder || false,
                parentId: body.parentId || null,
                targetRole: body.targetRole || 'BOTH',
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
            data,
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

        // Delete all children if it's a folder
        await db.material.deleteMany({ where: { parentId: id } });
        await db.material.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
