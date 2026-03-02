const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Check if SUPER_ADMIN already exists
    const existing = await prisma.adminUser.findFirst({
        where: { role: 'SUPER_ADMIN' }
    });

    if (existing) {
        console.log('✅ SUPER_ADMIN already exists, skipping seed.');
        return;
    }

    const passwordHash = await bcrypt.hash('Admin@2026!', 10);

    await prisma.adminUser.create({
        data: {
            name: 'Super Admin',
            email: 'admin@sistema.com',
            username: 'superadmin',
            passwordHash,
            role: 'SUPER_ADMIN',
            responsibilities: ['Gestão total do sistema'],
        }
    });

    console.log('✅ SUPER_ADMIN criado com sucesso!');
    console.log('   📧 Email: admin@sistema.com');
    console.log('   👤 Username: superadmin');
    console.log('   🔑 Password: Admin@2026!');
    console.log('   ⚠️  Altere a password após o primeiro login!');
}

main()
    .catch(e => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
