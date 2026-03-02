import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // 1. Get matriculation info before deleting
        const mat = await db.matriculation.findUnique({
            where: { id }
        });

        if (!mat) return NextResponse.json({ error: 'Matriculation not found' }, { status: 404 });

        // 2. Delete the matriculation
        await db.matriculation.delete({
            where: { id }
        });

        // 3. Update Trainer count
        if (mat.trainerId || (mat as any).trainerId) {
            const trainerMatrics = await db.matriculation.count({
                where: { trainerId: mat.trainerId || (mat as any).trainerId, status: 'ACTIVE' } as any
            });
            await db.trainer.update({
                where: { id: mat.trainerId },
                data: { students: trainerMatrics }
            }).catch(e => console.error('Failed to update trainer count:', e));
        }

        // 4. Update Course count
        if (mat.courseId) {
            const courseMatrics = await db.matriculation.count({
                where: { courseId: mat.courseId, status: 'ACTIVE' }
            });
            await db.course.update({
                where: { id: mat.courseId },
                data: { students: courseMatrics }
            }).catch(e => console.error('Failed to update course count:', e));
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to delete matriculation' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // 1. Get original to check for changes
        const original = await db.matriculation.findUnique({ where: { id } });
        if (!original) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const updated = await db.matriculation.update({
            where: { id },
            data: body
        });

        // 2. Sync if trainer, course, or status changed
        const relevantFields = ['trainerId', 'courseId', 'status'];
        const changed = relevantFields.some(f => (body as any)[f] !== undefined && (body as any)[f] !== (original as any)[f]);

        if (changed) {
            const syncList = [
                { type: 'trainer', id: (original as any).trainerId },
                { type: 'trainer', id: (updated as any).trainerId },
                { type: 'course', id: (original as any).courseId },
                { type: 'course', id: (updated as any).courseId }
            ];

            for (const item of syncList) {
                if (!item.id) continue;
                const count = await db.matriculation.count({
                    where: { [item.type + 'Id']: item.id, status: 'ACTIVE' }
                });
                await (db as any)[item.type].update({
                    where: { id: item.id },
                    data: { students: count }
                }).catch(() => { });
            }
        }

        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to update matriculation' }, { status: 500 });
    }
}
