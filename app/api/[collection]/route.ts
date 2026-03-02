import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { logActivity } from '../../../lib/logger';

function getModelName(collection: string) {
    let name = collection;
    if (collection.endsWith('ies')) name = collection.slice(0, -3) + 'y';
    else if (collection.endsWith('s')) name = collection.slice(0, -1);

    // Capitalize first letter to match Prisma PascalCase models
    return name.charAt(0).toUpperCase() + name.slice(1);
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ collection: string }> }
) {
    let collectionName = 'unknown';
    try {
        const { collection } = await params;
        collectionName = collection;
        const model = (db as any)[getModelName(collection)];

        if (!model) return NextResponse.json({ error: `Collection '${collection}' not found` }, { status: 404 });

        const items = await model.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(items || []);
    } catch (error: any) {
        console.error(`API GET [${collectionName}] Error:`, error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ collection: string }> }
) {
    let collectionName = 'unknown';
    try {
        const { collection } = await params;
        collectionName = collection;
        const model = (db as any)[getModelName(collection)];

        if (!model) return NextResponse.json({ error: `Collection '${collection}' not found` }, { status: 404 });

        const body = await request.json();

        // Sanitize data for specific models if needed
        const sanitizedData = { ...body };
        // Remove id if it's an empty string (Prisma creation fails if id is empty string)
        if (sanitizedData.id === '') delete sanitizedData.id;
        // Remove materialName which is a UI-only field in Courses
        if (collection === 'courses') {
            delete (sanitizedData as any).materialName;
        }

        const newItem = await model.create({ data: sanitizedData });

        // Log the activity (don't let logging failure block the main action)
        try {
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
        } catch (logError) {
            console.error('Activity Log Error (Non-blocking):', logError);
        }

        return NextResponse.json(newItem);
    } catch (error: any) {
        console.error(`API POST [${collectionName}] Error:`, error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message,
            targetCollection: collectionName
        }, { status: 500 });
    }
}
