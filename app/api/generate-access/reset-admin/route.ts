import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const email = 'admin@maritimo.com';
    const password = 'admin';
    const hash = await bcrypt.hash(password, 10);

    let user = await db.adminUser.findUnique({
      where: { email },
    });

    if (user) {
      await db.adminUser.update({
        where: { email },
        data: { passwordHash: hash },
      });
      return NextResponse.json({ message: 'Password reset to admin', email, password });
    } else {
      await db.adminUser.create({
        data: {
          name: 'Super Admin',
          email: email,
          username: 'admin',
          passwordHash: hash,
          role: 'SUPER_ADMIN',
          responsibilities: ['Gestão total do sistema'],
        },
      });
      return NextResponse.json({ message: 'Admin user created', email, password });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
