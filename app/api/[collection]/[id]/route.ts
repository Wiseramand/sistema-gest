import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { logActivity } from '../../../../lib/logger';

function getModelName(collection: string) {
    const mapping: { [key: string]: string } = {
        'students': 'student',
        'trainers': 'trainer',
        'courses': 'course',
        'classrooms': 'classroom',
        'inscriptions': 'inscription',
        'matriculations': 'matriculation',
        'companies': 'company',
        'feedbacks': 'feedback',
        'activity-logs': 'activityLog',
        'attendance': 'attendance',
        'materials': 'material',
        'adminusers': 'adminUser'
    };
    return mapping[collection] || collection.replace(/s$/, '');
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
    let collectionName = 'unknown';
    let itemId = 'unknown';
    try {
        const { collection, id } = await params;
        collectionName = collection;
        itemId = id;
        const model = (db as any)[getModelName(collection)];

        if (!model) return NextResponse.json({ error: `Collection '${collection}' not found` }, { status: 404 });

        const body = await request.json();
        const sanitizedData = { ...body };
        // Remove id and materialName as they shouldn't be in the update data
        delete sanitizedData.id;
        if (collection === 'courses') {
            delete (sanitizedData as any).materialName;
        }

        const updatedItem = await model.update({
            where: { id },
            data: sanitizedData
        });

        // Log the activity
        try {
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
        } catch (logError) {
            console.error('Activity Log Error (Non-blocking):', logError);
        }

        return NextResponse.json(updatedItem);
    } catch (error: any) {
        console.error(`API PATCH [${collectionName}/${itemId}] Error:`, error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ collection: string; id: string }> }
) {
    let collectionName = 'unknown';
    let itemId = 'unknown';
    try {
        const { collection, id } = await params;
        collectionName = collection;
        itemId = id;
        const model = (db as any)[getModelName(collection)];

        if (!model) return NextResponse.json({ error: `Collection '${collection}' not found` }, { status: 404 });

        await model.delete({ where: { id } });

        // Log the activity
        try {
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
        } catch (logError) {
            console.error('Activity Log Error (Non-blocking):', logError);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(`API DELETE [${collectionName}/${itemId}] Error:`, error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
