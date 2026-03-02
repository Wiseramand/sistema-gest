const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const models = ['user', 'adminUser', 'student', 'trainer', 'course', 'classroom', 'enrollment', 'inscription', 'matriculation', 'company'];
    console.log('--- Database Count Check ---');
    for (const model of models) {
        try {
            const count = await prisma[model].count();
            console.log(`${model}: ${count}`);
        } catch (e) {
            console.log(`${model}: ERROR (${e.message})`);
        }
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
