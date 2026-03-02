import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const admins = await db.adminUser.findMany();
        // Don't expose password hashes
        const safe = admins.map((a: any) => {
            const { passwordHash: _ph, ...rest } = a;
            return rest;
        });

        return NextResponse.json(safe);
    } catch {
        return NextResponse.json([], { status: 200 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Generate username
        const baseName = (body.name || 'admin').toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '.');
        const parts = baseName.split('.');
        const username = `${parts[0]}.${parts[parts.length - 1] || parts[0]}${Math.floor(Math.random() * 99) + 1}`;

        // Generate password
        const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#';
        let plainPassword = '';
        for (let i = 0; i < 10; i++) plainPassword += chars[Math.floor(Math.random() * chars.length)];

        const passwordHash = await bcrypt.hash(plainPassword, 4);

        const newAdmin = await db.adminUser.create({
            data: {
                name: body.name,
                email: body.email,
                role: body.role || 'ADMIN',
                responsibilities: body.responsibilities || [],
                username,
                passwordHash,
            }
        });

        const { passwordHash: _, ...safeAdmin } = newAdmin;
        return NextResponse.json({ ...safeAdmin, plainPassword });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
