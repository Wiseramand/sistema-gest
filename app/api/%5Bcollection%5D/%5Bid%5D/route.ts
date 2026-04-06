import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { logActivity } from '../../../../lib/logger';
import { getModel } from '../../../../lib/getModel';
import { schemas } from '../../../../lib/validators';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ collection: string; id: string }> }
) {
    try {
        const { collection, id } = await params;

        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const model = getModel(collection);
        if (!model) return NextResponse.json({ error: `Collection '${collection}' not found` }, { status: 404 });

        const item = await model.findUnique({ where: { id } });
        if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

        // SQLite Compatibility: Parse JSON strings
        const responseItem = { ...item };
        if (collection === 'courses' && typeof responseItem.materials === 'string') try { responseItem.materials = JSON.parse(responseItem.materials); } catch (e) {}
        if (collection === 'attendance' && typeof responseItem.records === 'string') try { responseItem.records = JSON.parse(responseItem.records); } catch (e) {}
        if (collection === 'adminusers' && typeof responseItem.responsibilities === 'string') try { responseItem.responsibilities = JSON.parse(responseItem.responsibilities); } catch (e) {}

        return NextResponse.json(responseItem);
    } catch (error: any) {
        console.error('API GET Single Error:', error);
        return NextResponse.json({ error: 'Erro interno ao consultar registo.' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ collection: string; id: string }> }
) {
    let collectionName = 'unknown';
    try {
        const { collection, id } = await params;
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

        // SQLite Compatibility: Stringify
        const dataToUpdate = { ...body };
        if (collection === 'courses' && Array.isArray(dataToUpdate.materials)) {
            dataToUpdate.materials = JSON.stringify(dataToUpdate.materials);
        }
        if (collection === 'attendance' && (typeof dataToUpdate.records === 'object')) {
            dataToUpdate.records = JSON.stringify(dataToUpdate.records);
        }
        if (collection === 'adminusers' && Array.isArray(dataToUpdate.responsibilities)) {
            dataToUpdate.responsibilities = JSON.stringify(dataToUpdate.responsibilities);
        }

        delete dataToUpdate.id;
        if (collection === 'courses') delete dataToUpdate.materialName;

        const updatedItem = await model.update({
            where: { id },
            data: dataToUpdate
        });

        try {
            if (session?.user) {
                await logActivity(
                    (session.user as any).id,
                    session.user.name || 'Unknown',
                    (session.user as any).role,
                    'UPDATE',
                    `Editou um item em ${collection}`,
                    collection,
                    id
                );
            }
        } catch (e) {}

        // Return parsed
        const responseItem = { ...updatedItem };
        if (typeof responseItem.materials === 'string') try { responseItem.materials = JSON.parse(responseItem.materials); } catch (e) {}
        if (typeof responseItem.records === 'string') try { responseItem.records = JSON.parse(responseItem.records); } catch (e) {}
        if (typeof responseItem.responsibilities === 'string') try { responseItem.responsibilities = JSON.parse(responseItem.responsibilities); } catch (e) {}

        return NextResponse.json(responseItem);
    } catch (error: any) {
        console.error(`API PATCH [${collectionName}] Error:`, error.message);
        return NextResponse.json({ error: 'Erro interno ao atualizar registo.' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ collection: string; id: string }> }
) {
    try {
        const { collection, id } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const role = (session.user as any).role;
        if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const model = getModel(collection);
        if (!model) return NextResponse.json({ error: `Collection '${collection}' not found` }, { status: 404 });

        await model.delete({ where: { id } });

        try {
            if (session?.user) {
                await logActivity(
                    (session.user as any).id,
                    session.user.name || 'Unknown',
                    (session.user as any).role,
                    'DELETE',
                    `Removeu um item de ${collection}`,
                    collection,
                    id
                );
            }
        } catch (e) {}

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: 'Erro interno ao remover registo.' }, { status: 500 });
    }
}
