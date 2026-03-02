import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { logActivity } from '../../../../lib/logger';

function getModelName(collection: string) {
    if (collection.endsWith('ies')) return collection.slice(0, -3) + 'y';
    if (collection.endsWith('s')) return collection.slice(0, -1);
    return collection;
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ collection: string; id: string }> }
) {
    try {
        const { collection, id } = await params;
        const model = (db as any)[getModelName(collection)];

        if (!model) return NextResponse.json({ error: `Collection '${collection}' not found` }, { status: 404 });

        const item = await model.findUnique({ where: { id } });
        if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

        return NextResponse.json(item);
    } catch (error: any) {
        console.error('API GET Single Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ collection: string; id: string }> }
) {
    const { collection, id } = await params;
    const model = (db as any)[getModelName(collection)];

    if (!model) return NextResponse.json({ error: `Collection '${collection}' not found` }, { status: 404 });

    const body = await request.json();
    const updatedItem = await model.update({ where: { id }, data: body });

    // Log the activity
    const session = await getServerSession(authOptions);
    if (session?.user) {
        await logActivity(
            (session.user as any).id,
            session.user.name || 'Unknown',
            (session.user as any).role,
            'UPDATE',
            `Editou um item em ${collection}`,
            getModelName(collection),
            id
        );
    }

    return NextResponse.json(updatedItem);
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ collection: string; id: string }> }
) {
    const { collection, id } = await params;
    const model = (db as any)[getModelName(collection)];

    if (!model) return NextResponse.json({ error: `Collection '${collection}' not found` }, { status: 404 });

    await model.delete({ where: { id } });

    // Log the activity
    const session = await getServerSession(authOptions);
    if (session?.user) {
        await logActivity(
            (session.user as any).id,
            session.user.name || 'Unknown',
            (session.user as any).role,
            'DELETE',
            `Removeu um item de ${collection}`,
            getModelName(collection),
            id
        );
    }

    return NextResponse.json({ success: true });
}
