import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        
        const updateData: any = { ...body, updatedAt: new Date() };
        if (body.responsibilities) {
            updateData.responsibilities = JSON.stringify(body.responsibilities);
        }

        const updated = await db.adminUser.update({
            where: { id },
            data: updateData
        });

        const { passwordHash: _, responsibilities, ...safe } = updated;
        return NextResponse.json({
            ...safe,
            responsibilities: typeof updated.responsibilities === 'string' ? JSON.parse(updated.responsibilities) : updated.responsibilities
        });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await db.adminUser.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
