import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import bcrypt from 'bcryptjs';

// POST /api/generate-access
// Body: { type: 'student' | 'trainer', id: string }
export async function POST(request: Request) {
    try {
        const { type, id } = await request.json();
        console.log(`[API] Generating access for ${type} with id ${id}`);

        if (!type || !id) {
            return NextResponse.json({ error: 'type and id are required' }, { status: 400 });
        }

        const searchId = String(id);
        let person: any;

        if (type === 'student') {
            person = await db.student.findUnique({ where: { id: searchId } });
        } else {
            person = await db.trainer.findUnique({ where: { id: searchId } });
        }

        if (!person) {
            console.error(`Access Generation Error: ${type} with id ${searchId} not found.`);
            return NextResponse.json({ error: `${type === 'student' ? 'Aluno' : 'Formador'} não encontrado.` }, { status: 404 });
        }

        // Generate username from name
        const baseName = (person.name || 'user').toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '.');
        const nameParts = baseName.split('.');
        const username = `${nameParts[0]}.${nameParts[nameParts.length - 1] || nameParts[0]}${Math.floor(Math.random() * 99) + 1}`;

        // Generate random password
        const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#';
        let plainPassword = '';
        for (let i = 0; i < 10; i++) {
            plainPassword += chars[Math.floor(Math.random() * chars.length)];
        }

        const passwordHash = await bcrypt.hash(plainPassword, 4);
        const role = type === 'student' ? 'STUDENT' : 'TRAINER';

        if (type === 'student') {
            await db.student.update({
                where: { id: searchId },
                data: { username, passwordHash, role, accessGeneratedAt: new Date() }
            });
        } else {
            await db.trainer.update({
                where: { id: searchId },
                data: { username, passwordHash, role, accessGeneratedAt: new Date() }
            });
        }

        console.log(`[API] Success: Access generated for ${username}`);

        return NextResponse.json({
            success: true,
            username,
            password: plainPassword, // Return once — never retrievable again
            role
        });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
