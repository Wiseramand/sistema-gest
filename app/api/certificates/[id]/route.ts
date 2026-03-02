import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { logActivity } from '../../../../lib/logger';

// PATCH /api/certificates/[id] — approve or reject
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        let updateData: any = {};

        if (body.action === 'approve') {
            updateData = {
                status: 'APROVADO',
                approvedAt: new Date(),
                approvedBy: body.approvedBy || 'Super Admin'
            };
        } else if (body.action === 'reject') {
            updateData = {
                status: 'REJEITADO',
                rejectedAt: new Date(),
                rejectionReason: body.reason || 'Sem motivo especificado'
            };
        } else if (body.action === 'update-validity') {
            if (!body.validUntil) {
                return NextResponse.json({ error: 'validUntil date is required' }, { status: 400 });
            }
            updateData = { validUntil: new Date(body.validUntil) };
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        const updated = await db.certificate.update({ where: { id }, data: updateData });

        // Log the activity
        const session = await getServerSession(authOptions);
        if (session?.user) {
            let actionType = body.action === 'approve' ? 'APPROVE_CERTIFICATE'
                : body.action === 'reject' ? 'REJECT_CERTIFICATE'
                    : 'UPDATE_CERTIFICATE_VALIDITY';
            let actionDesc = body.action === 'approve' ? `Aprovou o certificado ${id}`
                : body.action === 'reject' ? `Rejeitou o certificado ${id}`
                    : `Atualizou a validade do certificado ${id}`;

            await logActivity(
                (session.user as any).id,
                session.user.name || 'Unknown',
                (session.user as any).role,
                actionType,
                actionDesc,
                'certificate',
                id
            );
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/certificates/[id]
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await db.certificate.delete({ where: { id } });

        // Log the activity
        const session = await getServerSession(authOptions);
        if (session?.user) {
            await logActivity(
                (session.user as any).id,
                session.user.name || 'Unknown',
                (session.user as any).role,
                'DELETE_CERTIFICATE',
                `Removeu o certificado ${id}`,
                'certificate',
                id
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
