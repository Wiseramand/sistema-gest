import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function testPassword() {
  const identifier = 'superadmin';
  const providedPassword = 'Admin@2026!';

  console.log(`Checking password for: ${identifier}`);

  const admin = await db.adminUser.findFirst({
    where: {
      OR: [
        { email: identifier },
        { username: identifier }
      ]
    }
  });

  if (!admin) {
    console.log('Admin not found in DB');
    return;
  }

  console.log('Admin found:', admin.username);
  console.log('Checking password logic...');

  if (!admin.passwordHash) {
    console.log('No password hash found for this user!');
    return;
  }

  console.log('--- PASSWORD COMPARISON ---');
  const isMatch = await bcrypt.compare(providedPassword, admin.passwordHash);
  console.log('RESULT: ' + (isMatch ? 'MATCH' : 'FAIL'));
  console.log('---------------------------');
}

testPassword()
  .catch(err => console.error(err))
  .finally(() => db.$disconnect());
