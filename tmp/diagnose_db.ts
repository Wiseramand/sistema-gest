import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnose() {
    console.log('--- DIAGNOSTIC START ---');

    // 1. Check Trainers
    const trainers = await prisma.trainer.findMany();
    console.log(`Found ${trainers.length} trainers.`);
    trainers.forEach(t => console.log(`Trainer ID: ${t.id}, Name: ${t.name}`));

    // 2. Check Courses
    const courses = await prisma.course.findMany();
    console.log(`\nFound ${courses.length} courses.`);
    courses.forEach(c => {
        console.log(`Course: ${c.title}, Trainer ID: ${c.trainerId}, Trainer Name: ${c.trainerName}`);
        console.log(`Materials: ${JSON.stringify(c.materials).substring(0, 100)}...`);
    });

    // 3. Check Matriculations/Enrollments
    // (Assuming Matriculation is the one that links students to courses)
    try {
        const matriculations = await (prisma as any).matriculation.findMany();
        console.log(`\nFound ${matriculations.length} matriculations.`);
        matriculations.slice(0, 5).forEach((m: any) => {
            console.log(`Matriculation: Student ${m.studentName}, Course ${m.course}, CourseID ${m.courseId || 'MISSING'}`);
        });
    } catch (e) {
        console.log('Matriculation table error or missing.');
    }

    console.log('--- DIAGNOSTIC END ---');
}

diagnose()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
