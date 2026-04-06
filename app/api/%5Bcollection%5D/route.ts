import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { logActivity } from '../../../lib/logger';
import { getModel } from '../../../lib/getModel';
import { schemas } from '../../../lib/validators';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ collection: string }> }
) {
    let collectionName = 'unknown';
    try {
        const { collection } = await params;
        collectionName = collection;

        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const sensitiveCollections = ['adminusers', 'activity-logs'];
        if (sensitiveCollections.includes(collection)) {
            const role = (session.user as any).role;
            if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const model = getModel(collection);
        if (!model) return NextResponse.json({ error: `Collection '${collection}' not found` }, { status: 404 });

        const items = await model.findMany({ orderBy: { createdAt: 'desc' } });
        
        // SQLite Compatibility: Parse JSON strings back to objects
        const parsedItems = items.map((item: any) => {
            const newItem = { ...item };
            if (collection === 'courses' && typeof newItem.materials === 'string') {
                try { newItem.materials = JSON.parse(newItem.materials); } catch (e) { newItem.materials = []; }
            }
            if (collection === 'attendance' && typeof newItem.records === 'string') {
                try { newItem.records = JSON.parse(newItem.records); } catch (e) { newItem.records = []; }
            }
            if (collection === 'adminusers' && typeof newItem.responsibilities === 'string') {
                try { newItem.responsibilities = JSON.parse(newItem.responsibilities); } catch (e) { newItem.responsibilities = []; }
            }
            return newItem;
        });

        return NextResponse.json(parsedItems || []);
    } catch (error: any) {
        console.error(`API GET [${collectionName}] Error:`, error);
        return NextResponse.json({ error: 'Erro interno ao consultar dados.' }, { status: 500 });
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

        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const sensitiveCollections = ['adminusers', 'activity-logs', 'trainers', 'courses', 'classrooms'];
        if (sensitiveCollections.includes(collection)) {
            const role = (session.user as any).role;
            if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const model = getModel(collection);
        if (!model) return NextResponse.json({ error: `Collection '${collection}' not found` }, { status: 404 });

        const body = await request.json();

        // SQLite Compatibility: Stringify objects before saving
        const dataToSave = { ...body };
        if (collection === 'courses' && Array.isArray(dataToSave.materials)) {
            dataToSave.materials = JSON.stringify(dataToSave.materials);
        }
        if (collection === 'attendance' && (typeof dataToSave.records === 'object')) {
            dataToSave.records = JSON.stringify(dataToSave.records);
        }
        if (collection === 'adminusers' && Array.isArray(dataToSave.responsibilities)) {
            dataToSave.responsibilities = JSON.stringify(dataToSave.responsibilities);
        }

        // Cleanup UI-only fields
        if (collection === 'courses') delete dataToSave.materialName;
        if (dataToSave.id === '') delete dataToSave.id;

        const newItem = await model.create({ data: dataToSave });

        try {
            if (session?.user) {
                await logActivity(
                    (session.user as any).id,
                    session.user.name || 'Unknown',
                    (session.user as any).role,
                    'CREATE',
                    `Criou um item em ${collection}`,
                    collection,
                    newItem.id
                );
            }
        } catch (e) {}

        // Return parsed item
        const responseItem = { ...newItem };
        if (typeof responseItem.materials === 'string') try { responseItem.materials = JSON.parse(responseItem.materials); } catch (e) {}
        if (typeof responseItem.records === 'string') try { responseItem.records = JSON.parse(responseItem.records); } catch (e) {}
        if (typeof responseItem.responsibilities === 'string') try { responseItem.responsibilities = JSON.parse(responseItem.responsibilities); } catch (e) {}

        return NextResponse.json(responseItem);
    } catch (error: any) {
        console.error(`API POST [${collectionName}] Error:`, error.message);
        return NextResponse.json({ error: 'Erro interno ao criar registo.' }, { status: 500 });
    }
}
