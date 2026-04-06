import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
;
import { getAnySession } from '../../../lib/auth';

export async function GET() {
    try {
        const session = await getAnySession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const logs = await db.activityLog.findMany();
        return NextResponse.json(logs || []);
    } catch (error: any) {
        console.error('API Activity Logs GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
