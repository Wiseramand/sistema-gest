import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user as any;
        const allMaterials = await db.material.findMany();

        // Filter materials based on user role
        let filteredMaterials = allMaterials;
        if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
            filteredMaterials = allMaterials.filter((m: any) =>
                m.access === 'ALL' ||
                (user.role === 'PROFESSOR' && m.access === 'PROFESSORS') ||
                (user.role === 'STUDENT' && m.access === 'STUDENTS')
            );
        }

        return NextResponse.json(filteredMaterials);
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const user = session?.user as any;

        if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const newMaterial = await db.material.create({
            data: {
                ...body,
                uploadedBy: user.id,
                uploadedByName: user.name
            }
        });

        // Log the activity
        const { logActivity } = await import('../../../lib/logger');
        await logActivity(
            user.id,
            user.name || 'Unknown',
            user.role,
            'CREATE_MATERIAL',
            `Carregou um novo material: ${newMaterial.name}`,
            'material',
            newMaterial.id
        );

        return NextResponse.json(newMaterial);
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to create material' }, { status: 500 });
    }
}
