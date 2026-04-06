import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
async function main() {
  const trainers = await db.trainer.findMany();
  console.log('Trainers Emails:');
  trainers.forEach(t => console.log(`- ${t.email}`));
  
  const students = await db.student.findMany({ take: 5 });
  console.log('Students Emails (First 5):');
  students.forEach(s => console.log(`- ${s.email}`));
}
main().finally(() => db.$disconnect());
