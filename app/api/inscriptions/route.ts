import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export async function GET() {
    try {
        const inscriptions = await db.inscription.findMany({ orderBy: { createdAt: 'desc' } });
        return NextResponse.json(inscriptions);
    } catch (error: any) {
        console.error('Error fetching inscriptions:', error);
        return NextResponse.json([], { status: 200 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, phone, course, message } = body;

        const newInscription = await db.inscription.create({
            data: { name, email, phone, course, message, status: 'PENDING' }
        });

        return NextResponse.json({ success: true, data: newInscription });
    } catch (error: any) {
        console.error('Inscription error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
