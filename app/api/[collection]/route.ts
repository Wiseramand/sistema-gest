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

        // ✅ CORRECÇÃO: Verificar autenticação PRIMEIRO
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // ✅ Verificar role para colecções sensíveis
        const sensitiveCollections = ['adminusers', 'activity-logs'];
        if (sensitiveCollections.includes(collection)) {
            const role = (session.user as any).role;
            if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        const model = getModel(collection);

        if (!model) return NextResponse.json({ error: `Collection '${collection}' not found` }, { status: 404 });

        const items = await model.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(items || []);
    } catch (error: any) {
        console.error(`API GET [${collectionName}] Error:`, error);
        return NextResponse.json({ error: 'Ocorreu um erro interno ao procurar os dados.' }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ collection: string }> }
) {
    let collectionName = 'unknown';
    let body: any; 
    try {
        const { collection } = await params;
        collectionName = collection;

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

        try {
            body = await request.json();
        } catch (e) {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        // Validar dados usando Zod se houver esquema definido para a coleção
        if (schemas[collection]) {
            const validation = schemas[collection].safeParse(body);
            if (!validation.success) {
                return NextResponse.json({ 
                    error: 'Dados inválidos ou em formato incorreto', 
                    details: validation.error.format() 
                }, { status: 400 });
            }
            // Substituir pelos campos verificados se necessário (opcional)
        }

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
            if (session?.user) {
                await logActivity(
                    (session.user as any).id,
                    session.user.name || 'Unknown',
                    (session.user as any).role,
                    'CREATE',
                    `Criou um novo item em ${collection}`,
                    collection,
                    newItem.id
                );
            }
        } catch (logError) {
            console.error('Activity Log Error (Non-blocking):', logError);
        }

        return NextResponse.json(newItem);
    } catch (error: any) {
        // ✅ CORRECÇÃO: Nunca expor dados do utilizador (payload) em erros
        console.error(`API POST [${collectionName}] Error:`, error.message);
        return NextResponse.json({
            error: 'Ocorreu um erro interno ao criar o registo.',
        }, { status: 500 });
    }
}
