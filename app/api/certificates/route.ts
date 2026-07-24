import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { getAnySession } from '../../../lib/auth';
import { logActivity } from '../../../lib/logger';

// Helper function to create certificate safely even if DB schema lacks new columns
async function safeCreateCertificate(data: any) {
    try {
        return await db.certificate.create({ data });
    } catch (err: any) {
        console.warn('Initial certificate creation failed, trying fallback without optional fields:', err?.message);
        // If certification column does not exist in DB table yet, omit it and retry
        if (data.certification !== undefined) {
            const { certification, ...fallbackData } = data;
            return await db.certificate.create({ data: fallbackData });
        }
        throw err;
    }
}

// GET /api/certificates
export async function GET() {
    try {
        const items = await db.certificate.findMany({ orderBy: { generatedAt: 'desc' } });
        return NextResponse.json(items, {
            headers: {
                'Cache-Control': 'no-store, max-age=0'
            }
        });
    } catch (error) {
        console.error('Error fetching certificates:', error);
        return NextResponse.json([], { status: 200 });
    }
}

// POST /api/certificates — generate certificates for a completed course or manually
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { courseTitle, matriculationIds, studentName, certification, validUntil, status } = body;

        // 1. Manual Certificate Creation directly for a student
        if (studentName && courseTitle) {
            const certData: any = {
                studentId: body.studentId || `std_${Date.now()}`,
                studentName,
                courseTitle,
                status: status || 'APROVADO',
                certification: certification || 'Bahamas',
                validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000),
                generatedAt: new Date(),
                approvedAt: status === 'APROVADO' ? new Date() : null,
                approvedBy: status === 'APROVADO' ? (body.approvedBy || 'Super Admin') : null,
            };

            const cert = await safeCreateCertificate(certData);

            const session = await getAnySession();
            if (session?.user) {
                await logActivity(
                    (session.user as any).id,
                    session.user.name || 'Unknown',
                    (session.user as any).role,
                    'CREATE_CERTIFICATE_MANUAL',
                    `Emitiu certificado manual para ${studentName} - ${courseTitle}`,
                    'certificate',
                    cert.id
                );
            }

            return NextResponse.json({ created: 1, certificates: [cert] });
        }

        // 2. Course/Matriculation Certificate Generation
        if (!courseTitle || !Array.isArray(matriculationIds) || matriculationIds.length === 0) {
            return NextResponse.json({ error: 'courseTitle e matriculationIds válidos são obrigatórios' }, { status: 400 });
        }

        // Fetch the relevant matriculations from DB
        const matriculations = await db.matriculation.findMany({
            where: { id: { in: matriculationIds } }
        });

        if (matriculations.length === 0) {
            // Fallback: create single certificate if matriculationIds contains custom student IDs
            const newCerts = await Promise.all(
                matriculationIds.map((matId: string) =>
                    safeCreateCertificate({
                        studentId: matId,
                        studentName: 'Formando Registado',
                        courseTitle,
                        matriculationId: matId,
                        status: 'PENDENTE',
                        validUntil: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000),
                        generatedAt: new Date(),
                        certification: certification || 'Bahamas',
                    })
                )
            );
            return NextResponse.json({ created: newCerts.length, certificates: newCerts });
        }

        const fiveYearsFromNow = new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000);

        const newCerts = await Promise.all(
            matriculations.map((mat: any) =>
                safeCreateCertificate({
                    studentId: mat.studentId || mat.id,
                    studentName: mat.studentName || mat.student || 'Formando Registado',
                    courseTitle,
                    matriculationId: mat.id,
                    status: 'PENDENTE',
                    validUntil: fiveYearsFromNow,
                    generatedAt: new Date(),
                    certification: certification || 'Bahamas',
                })
            )
        );

        // Log the activity
        const session = await getAnySession();
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
    } catch (error: any) {
        console.error('Error generating certificates:', error);
        return NextResponse.json({
            error: error?.message || 'Erro interno do servidor ao gerar certificado'
        }, { status: 500 });
    }
}
