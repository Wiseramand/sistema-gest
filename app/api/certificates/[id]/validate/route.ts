import { NextResponse } from 'next/server';
import { db } from '../../../../../lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const certificate = await db.certificate.findUnique({ where: { id } });

        if (!certificate) {
            return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
        }

        // Only return approved or pending certificates for validation?
        // Returning all but status might be good to show if it's rejected.
        return NextResponse.json(certificate);
    } catch (error) {
        console.error('Error validating certificate:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
