import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { logActivity } from '../../../lib/logger';

// GET /api/certificates
export async function GET() {
    try {
        const items = await db.certificate.findMany({ orderBy: { generatedAt: 'desc' } });
        return NextResponse.json(items);
    } catch (error) {
        return NextResponse.json([], { status: 200 });
    }
}

// POST /api/certificates — generate certificates for a completed course
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { courseTitle, matriculationIds } = body;

        if (!courseTitle || !Array.isArray(matriculationIds)) {
            return NextResponse.json({ error: 'courseTitle and matriculationIds required' }, { status: 400 });
        }

        // Fetch the relevant matriculations from DB
        const matriculations = await db.matriculation.findMany({
            where: { id: { in: matriculationIds } }
        });

        const fiveYearsFromNow = new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000);

        const newCerts = await Promise.all(
            matriculations.map((mat: any) =>
                db.certificate.create({
                    data: {
                        studentId: mat.studentId,
                        studentName: mat.studentName,
                        courseTitle,
                        matriculationId: mat.id,
                        status: 'PENDENTE',
                        validUntil: fiveYearsFromNow,
                        generatedAt: new Date(),
                    }
                })
            )
        );

        // Log the activity
        const session = await getServerSession(authOptions);
        if (session?.user) {
            await logActivity(
                (session.user as any).id,
                session.user.name || 'Unknown',
                (session.user as any).role,
                'CREATE_CERTIFICATES',
                `Gerou ${newCerts.length} certificados para o curso ${courseTitle}`,
                'certificate'
            );
        }

        return NextResponse.json({ created: newCerts.length, certificates: newCerts });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
