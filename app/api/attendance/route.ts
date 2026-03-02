import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const course = searchParams.get('course');
        const date = searchParams.get('date');

        const where: any = {};
        if (course) where.courseId = course;
        if (date) where.date = date;

        const results = await db.attendance.findMany({ where });
        return NextResponse.json(results);
    } catch (error: any) {
        console.error('Error fetching attendances:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { courseId, date, trainerId, records } = body;

        if (!courseId || !date || !records) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Upsert: update if the courseId + date combo already exists, otherwise create
        const attendance = await db.attendance.upsert({
            where: { courseId_date: { courseId, date } },
            update: { records, trainerId: trainerId ?? undefined, updatedAt: new Date() },
            create: { courseId, date, trainerId, records }
        });

        // Log the activity
        try {
            const { getServerSession } = await import('next-auth');
            const { authOptions } = await import('../../../lib/auth');
            const { logActivity } = await import('../../../lib/logger');
            const session = await getServerSession(authOptions);

            if (session?.user) {
                await logActivity(
                    (session.user as any).id,
                    session.user.name || 'Unknown',
                    (session.user as any).role,
                    'ATTENDANCE',
                    `Registou presença para o curso ${courseId} na data ${date}`,
                    'course',
                    courseId
                );
            }
        } catch (logErr) {
            console.error('Failed to log attendance activity:', logErr);
        }

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error: any) {
        console.error('Error saving attendance:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
