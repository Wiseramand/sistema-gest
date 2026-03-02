import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

export async function GET(request: Request) {
    try {
        const matriculations = await db.matriculation.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(matriculations);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch matriculations' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { studentId, studentName, courseId, courseTitle, trainerId, ...rest } = body;

        // 1. Create the matriculation
        const newMatriculation = await db.matriculation.create({
            data: {
                studentId,
                studentName,
                courseId,
                courseTitle,
                trainerId,
                ...rest
            }
        });

        // 2. Update Trainer student count
        if (trainerId) {
            const trainerMatrics = await db.matriculation.count({
                where: { trainerId, status: 'ACTIVE' } as any
            });
            await db.trainer.update({
                where: { id: trainerId },
                data: { students: trainerMatrics }
            }).catch(e => console.error('Failed to update trainer count:', e));
        }

        // 3. Update Course student count
        if (courseId) {
            const courseMatrics = await db.matriculation.count({
                where: { courseId, status: 'ACTIVE' }
            });
            await db.course.update({
                where: { id: courseId },
                data: { students: courseMatrics }
            }).catch(e => console.error('Failed to update course count:', e));
        }

        // Log the activity
        try {
            const { logActivity } = await import('../../../lib/logger');
            await logActivity(
                (session.user as any).id,
                session.user?.name || 'Admin',
                (session.user as any).role,
                'CREATE_MATRICULATION',
                `Matriculou aluno ${studentName} no curso ${courseTitle || rest.course}`,
                'matriculation',
                newMatriculation.id
            );
        } catch (e) { }

        return NextResponse.json(newMatriculation);
    } catch (error: any) {
        console.error('Matriculation Create Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create matriculation' }, { status: 500 });
    }
}
