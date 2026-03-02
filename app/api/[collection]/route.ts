import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { logActivity } from '../../../lib/logger';

function getModelName(collection: string) {
    if (collection.endsWith('ies')) return collection.slice(0, -3) + 'y';
    if (collection.endsWith('s')) return collection.slice(0, -1);
    return collection;
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ collection: string }> }
) {
    try {
        const collection = (await params).collection;
        const model = (db as any)[getModelName(collection)];

        if (!model) return NextResponse.json({ error: `Collection '${collection}' not found` }, { status: 404 });

        const items = await model.findMany();
        return NextResponse.json(items || []);
    } catch (error: any) {
        console.error('API GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ collection: string }> }
) {
    try {
        const collection = (await params).collection;
        const model = (db as any)[getModelName(collection)];

        if (!model) return NextResponse.json({ error: `Collection '${collection}' not found` }, { status: 404 });

        const body = await request.json();
        const newItem = await model.create({ data: body });

        // Log the activity
        const session = await getServerSession(authOptions);
        if (session?.user) {
            await logActivity(
                (session.user as any).id,
                session.user.name || 'Unknown',
                (session.user as any).role,
                'CREATE',
                `Criou um novo item em ${collection}`,
                getModelName(collection),
                newItem.id
            );
        }

        return NextResponse.json(newItem);
    } catch (error: any) {
        console.error('API POST Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
