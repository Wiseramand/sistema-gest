import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import bcrypt from 'bcryptjs';
;
import { getAnySession } from '../../../lib/auth';

export async function GET() {
    try {
        // ✅ CORRECÇÃO: Verificar autenticação
        const session = await getAnySession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const role = (session.user as any).role;
        if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const admins = await db.adminUser.findMany();
        
        const safe = admins.map((a: any) => {
            const { passwordHash: _ph, ...rest } = a;
            // Parse responsibilities if it's a string (SQLite case)
            if (typeof rest.responsibilities === 'string') {
                try { rest.responsibilities = JSON.parse(rest.responsibilities); }
                catch { rest.responsibilities = []; }
            }
            return rest;
        });

        return NextResponse.json(safe);
    } catch {
        return NextResponse.json({ error: 'Erro ao encontrar administradores' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getAnySession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const userRole = (session.user as any).role;
        if (userRole !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();

        // Generate credentials logic...
        const baseName = (body.name || 'admin').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '.');
        const parts = baseName.split('.');
        const username = `${parts[0]}.${parts[parts.length - 1] || parts[0]}${Math.floor(Math.random() * 99) + 1}`;
        const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#';
        let plainPassword = '';
        for (let i = 0; i < 10; i++) plainPassword += chars[Math.floor(Math.random() * chars.length)];
        const passwordHash = await bcrypt.hash(plainPassword, 12);

        const newAdmin = await db.adminUser.create({
            data: {
                name: body.name,
                email: body.email,
                role: body.role || 'ADMIN',
                responsibilities: JSON.stringify(body.responsibilities || []),
                username,
                passwordHash,
            }
        });

        const { passwordHash: _, responsibilities, ...rest } = newAdmin;
        return NextResponse.json({ 
            ...rest, 
            responsibilities: JSON.parse(newAdmin.responsibilities as string),
            plainPassword 
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
