import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body = await request.json();

        const notification = await (db as any).notification.update({
            where: { id },
            data: { read: body.read ?? true }
        });

        return NextResponse.json(notification);
    } catch (error) {
        console.error('Notification PATCH error:', error);
        return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        await (db as any).notification.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
    }
}
