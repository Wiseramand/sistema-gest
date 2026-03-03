import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixData() {
    console.log('--- DATA FIX START ---');

    // 1. Get all trainers
    const trainers = await prisma.trainer.findMany();
    if (trainers.length === 0) {
        console.log('No trainers found. Cannot fix courses.');
        return;
    }
    const defaultTrainer = trainers[0];

    // 2. Fix Courses with null trainerId
    const courses = await prisma.course.findMany();
    for (const c of courses) {
        if (!c.trainerId) {
            console.log(`Fixing course: ${c.title} -> Assigning to ${defaultTrainer.name}`);
            await prisma.course.update({
                where: { id: c.id },
                data: {
                    trainerId: defaultTrainer.id,
                    trainerName: defaultTrainer.name
                }
            });
        }
    }

    // 3. Fix Matriculations with missing courseId
    // Also fix studentCount in courses
    try {
        const matriculations = await (prisma as any).matriculation.findMany();
        for (const m of matriculations) {
            if (!m.courseId) {
                const course = courses.find(c => c.title === m.course);
                if (course) {
                    console.log(`Fixing matriculation for ${m.studentName} -> Linking to course ${course.title} (ID: ${course.id})`);
                    await (prisma as any).matriculation.update({
                        where: { id: m.id },
                        data: { courseId: course.id }
                    });
                }
            }
        }
    } catch (e: any) {
        console.log('Error fixing matriculations:', e.message);
    }

    console.log('--- DATA FIX END ---');
}

fixData()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
