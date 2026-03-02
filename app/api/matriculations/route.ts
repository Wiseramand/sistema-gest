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

        // Sanitize and map fields
        const data: any = {
            studentId: body.studentId,
            studentName: body.studentName,
            courseId: body.courseId,
            courseTitle: body.courseTitle || body.course,
            trainerId: body.trainerId,
            course: body.course,
            classroom: body.classroom,
            classroomId: body.classroomId,
            trainer: body.trainer,
            schedule: body.schedule,
            duration: body.duration,
            startDate: body.startDate,
            endDate: body.endDate,
            paymentStatus: body.paymentStatus,
            amountDue: typeof body.amountDue === 'number' && !isNaN(body.amountDue) ? body.amountDue : 0
        };

        // Remove undefined fields
        Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

        // 1. Create the matriculation
        const newMatriculation = await db.matriculation.create({
            data
        });

        // 2. Update Trainer student count
        if (data.trainerId) {
            const trainerMatrics = await db.matriculation.count({
                where: { trainerId: data.trainerId, status: 'ACTIVE' } as any
            });
            await db.trainer.update({
                where: { id: data.trainerId },
                data: { students: trainerMatrics }
            }).catch(e => console.error('Failed to update trainer count:', e));
        }

        // 3. Update Course student count
        if (data.courseId) {
            const courseMatrics = await db.matriculation.count({
                where: { courseId: data.courseId, status: 'ACTIVE' } as any
            });
            await db.course.update({
                where: { id: data.courseId },
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
                `Matriculou aluno ${data.studentName} no curso ${data.courseTitle || data.course}`,
                'matriculation',
                newMatriculation.id
            );
        } catch (e) { }

        return NextResponse.json(newMatriculation);
    } catch (error: any) {
        console.error('Matriculation Create Error:', error);
        return NextResponse.json({
            error: 'Failed to create matriculation',
            details: error.message,
            code: error.code // Prisma error codes are useful
        }, { status: 500 });
    }
}
