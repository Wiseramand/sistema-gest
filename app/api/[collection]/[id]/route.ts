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

        // ✅ CORRECÇÃO: Verificar autenticação PRIMEIRO
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const model = getModel(collection);

        if (!model) return NextResponse.json({ error: `Collection '${collection}' not found` }, { status: 404 });

        const item = await model.findUnique({ where: { id } });
        if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

        return NextResponse.json(item);
    } catch (error: any) {
        console.error('API GET Single Error:', error);
        return NextResponse.json({ error: 'Ocorreu um erro interno ao procurar o registo.' }, { status: 500 });
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

        // ✅ CORRECÇÃO: Verificar autenticação PRIMEIRO
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // ✅ Verificar role para colecções sensíveis
        const sensitiveCollections = ['adminusers', 'activity-logs', 'trainers', 'courses', 'classrooms'];
        if (sensitiveCollections.includes(collection)) {
            const role = (session.user as any).role;
            if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        const model = getModel(collection);

        if (!model) return NextResponse.json({ error: `Collection '${collection}' not found` }, { status: 404 });

        const body = await request.json();

        // Validar dados usando Zod
        if (schemas[collection]) {
            // No PATCH, criamos uma versão partial do esquema para permitir updates parciais
            const partialSchema = schemas[collection].partial();
            const validation = partialSchema.safeParse(body);
            if (!validation.success) {
                return NextResponse.json({ 
                    error: 'Dados inválidos ou formato incorreto', 
                    details: validation.error.format() 
                }, { status: 400 });
            }
        }

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
        } catch (logError) {
            console.error('Activity Log Error (Non-blocking):', logError);
        }

        return NextResponse.json(updatedItem);
    } catch (error: any) {
        console.error(`API PATCH [${collectionName}/${itemId}] Error:`, error.message);
        return NextResponse.json({ error: 'Ocorreu um erro interno ao atualizar o registo.' }, { status: 500 });
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

        // ✅ CORRECÇÃO: Verificar autenticação PRIMEIRO
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // ✅ Verificar role para todas colecções - DELETE deve ser restrito
        const role = (session.user as any).role;
        if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const model = getModel(collection);

        if (!model) return NextResponse.json({ error: `Collection '${collection}' not found` }, { status: 404 });

        await model.delete({ where: { id } });

        // Log the activity
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
        } catch (logError) {
            console.error('Activity Log Error (Non-blocking):', logError);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(`API DELETE [${collectionName}/${itemId}] Error:`, error.message);
        return NextResponse.json({ error: 'Ocorreu um erro interno ao remover o registo.' }, { status: 500 });
    }
}
