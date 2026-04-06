import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  const identifier = 'superadmin';
  console.log(`Checking for identifier: ${identifier}`);

  const admin = await db.adminUser.findFirst({
    where: {
      OR: [
        { email: identifier },
        { username: identifier }
      ]
    }
  });
  console.log('AdminUser found:', !!admin);
  if (admin) console.log('Admin Role:', admin.role);

  const user = await db.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { username: identifier }
      ]
    }
  });
  process.stdout.write(`User found: ${!!user}\n`);
  if (user) console.log('User Role:', user.role);
}

main()
  .catch(err => console.error(err))
  .finally(() => db.$disconnect());
