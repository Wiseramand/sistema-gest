import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get('studentId');

        if (!studentId) {
            return NextResponse.json({ error: 'studentId is required' }, { status: 400 });
        }

        const notifications = await (db as any).notification.findMany({
            where: { studentId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        return NextResponse.json(notifications);
    } catch (error) {
        console.error('Notifications GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { studentId, title, message, type } = body;

        if (!studentId || !title || !message) {
            return NextResponse.json({ error: 'studentId, title and message are required' }, { status: 400 });
        }

        const notification = await (db as any).notification.create({
            data: {
                studentId,
                title,
                message,
                type: type || 'INFO',
                read: false
            }
        });

        return NextResponse.json(notification);
    } catch (error) {
        console.error('Notifications POST error:', error);
        return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }
}
