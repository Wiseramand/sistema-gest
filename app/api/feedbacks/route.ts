import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

export async function GET() {
    try {
        const items = await db.feedback.findMany();
        return NextResponse.json(items);
    } catch (error) {
        return NextResponse.json([], { status: 200 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { courseId, courseTitle, institutionFeedback, trainerFeedback, courseFeedback, comments } = body;

        if (!courseTitle || !institutionFeedback || !trainerFeedback || !courseFeedback) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newFeedback = await db.feedback.create({
            data: {
                studentId: (session.user as any).id,
                studentName: session.user.name || 'Anonymous Student',
                courseId: courseId || null,
                courseTitle,
                institutionFeedback,
                trainerFeedback,
                courseFeedback,
                comments: comments || ''
            }
        });

        // Log the activity
        const { logActivity } = await import('../../../lib/logger');
        await logActivity(
            (session.user as any).id,
            session.user.name || 'Unknown',
            (session.user as any).role,
            'FEEDBACK',
            `Enviou feedback sobre o curso ${courseTitle}`,
            'feedback',
            newFeedback.id
        );

        return NextResponse.json({ created: true, feedback: newFeedback });
    } catch (error) {
        console.error('Error recording feedback:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
