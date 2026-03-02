import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        const user = session?.user as any;

        if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { title, ...rest } = body;

        const updatedMaterial = await db.material.update({
            where: { id },
            data: {
                ...rest,
                name: title,
            }
        });

        // Log the activity
        try {
            const { logActivity } = await import('../../../../lib/logger');
            await logActivity(
                user.id,
                user.name || 'Unknown',
                user.role,
                'UPDATE_MATERIAL',
                `Atualizou o material: ${updatedMaterial.name}`,
                'material',
                updatedMaterial.id
            );
        } catch (e) { }

        return NextResponse.json(updatedMaterial);
    } catch (error: any) {
        console.error('Update Material Error:', error);
        return NextResponse.json({ error: 'Failed to update material' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        const user = session?.user as any;

        if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await db.material.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to delete material' }, { status: 500 });
    }
}
