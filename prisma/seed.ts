import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
    const hash = await bcrypt.hash('admin123', 10);

    // Super Admin
    const admin = await db.user.upsert({
        where: { email: 'admin@maritimo.com' },
        update: {},
        create: {
            name: 'Administrador',
            email: 'admin@maritimo.com',
            username: 'admin',
            passwordHash: hash,
            role: 'SUPER_ADMIN',
        },
    });
    console.log('✅ Admin criado:', admin.email);

    // Admin User (secondary)
    const adminUser = await db.adminUser.upsert({
        where: { email: 'gestor@maritimo.com' },
        update: {},
        create: {
            name: 'Gestor',
            email: 'gestor@maritimo.com',
            username: 'gestor',
            passwordHash: hash,
            role: 'ADMIN',
            responsibilities: '["Alunos","Cursos"]',
        },
    });
    console.log('✅ AdminUser criado:', adminUser.email);

    // Trainer / Professor
    const trainer = await db.trainer.upsert({
        where: { email: 'professor@maritimo.com' },
        update: {},
        create: {
            name: 'João Formador',
            email: 'professor@maritimo.com',
            username: 'professor',
            passwordHash: hash,
            phone: '912345678',
            specialty: 'Segurança Marítima',
            status: 'Ativo',
            role: 'TRAINER',
        },
    });
    console.log('✅ Formador criado:', trainer.email);

    // Student
    const student = await db.student.upsert({
        where: { email: 'aluno@maritimo.com' },
        update: {},
        create: {
            name: 'Maria Aluna',
            email: 'aluno@maritimo.com',
            username: 'aluno',
            passwordHash: hash,
            phone: '923456789',
            status: 'Ativo',
            role: 'STUDENT',
        },
    });
    console.log('✅ Aluno criado:', student.email);

    console.log('\n🔑 Todos os logins usam a senha: admin123');
}

main()
    .then(() => db.$disconnect())
    .catch((e) => { console.error(e); db.$disconnect(); process.exit(1); });
