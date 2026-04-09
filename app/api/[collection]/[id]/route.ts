import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { getAnySession } from '../../../../lib/auth';
import { logActivity } from '../../../../lib/logger';

import { getModel } from '../../../../lib/getModel';
import { schemas } from '../../../../lib/validators';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ collection: string; id: string }> }
) {
    try {
        const { collection, id } = await params;

        // ✅ CORRECÇÃO: Verificar autenticação usando helper multi-portal (Admin, Professor, Aluno)
        const session = await getAnySession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

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

        // ✅ CORRECÇÃO: Verificar autenticação usando helper multi-portal (Admin, Professor, Aluno)
        const session = await getAnySession();
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
            const partialSchema = schemas[collection].partial();
            const validation = partialSchema.safeParse(body);
            if (!validation.success) {
                return NextResponse.json({ 
                    error: 'Dados inválidos ou formato incorreto', 
                    details: validation.error.format() 
                }, { status: 400 });
            }
        }

        // Specific logic for Classroom Conflict Detection in Matriculations
        if (collection === 'matriculations') {
            const { classroom, startDate, endDate, course } = body;
            
            // To properly check conflict, we need at least classroom and one date.
            // If they are missing in body, we might need to fetch the existing record.
            if (classroom || startDate || endDate) {
                const existing = await (model as any).findUnique({ where: { id } });
                const currentClassroom = classroom || existing?.classroom;
                const currentStartDate = startDate || existing?.startDate;
                const currentEndDate = endDate || existing?.endDate;
                const currentCourse = course || existing?.course;

                if (currentClassroom && currentStartDate && currentEndDate && currentClassroom !== 'Sem sala' && currentClassroom !== 'A designar') {
                    const conflict = await (model as any).findFirst({
                        where: {
                            id: { not: id }, // Exclude self
                            classroom: currentClassroom,
                            course: { not: currentCourse }, // Different course
                            OR: [
                                {
                                    AND: [
                                        { startDate: { lte: currentEndDate } },
                                        { endDate: { gte: currentStartDate } }
                                    ]
                                }
                            ]
                        }
                    });

                    if (conflict) {
                        return NextResponse.json({ 
                            error: `Conflito de Sala: A sala '${currentClassroom}' já está ocupada pelo curso '${conflict.course}' entre ${conflict.startDate} e ${conflict.endDate}.`,
                            details: `Por favor, escolha outra sala ou aguarde até ${conflict.endDate}.`
                        }, { status: 400 });
                    }
                }
            }
        }

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
        if (collection === 'courses') delete (dataToUpdate as any).materialName;

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
        } catch (logError) {
            console.error('Activity Log Error:', logError);
        }

        const responseItem = { ...updatedItem };
        if (typeof responseItem.materials === 'string') try { responseItem.materials = JSON.parse(responseItem.materials); } catch (e) {}
        if (typeof responseItem.records === 'string') try { responseItem.records = JSON.parse(responseItem.records); } catch (e) {}
        if (typeof responseItem.responsibilities === 'string') try { responseItem.responsibilities = JSON.parse(responseItem.responsibilities); } catch (e) {}

        return NextResponse.json(responseItem);
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

        // ✅ CORRECÇÃO: Verificar autenticação usando helper multi-portal (Admin, Professor, Aluno)
        const session = await getAnySession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = (session.user as any).role;
        if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

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
        } catch (logError) {
            console.error('Activity Log Error:', logError);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(`API DELETE [${collectionName}/${itemId}] Error:`, error.message);
        return NextResponse.json({ error: 'Ocorreu um erro interno ao remover o registo.' }, { status: 500 });
    }
}
