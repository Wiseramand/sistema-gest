const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const db = new PrismaClient();

async function testPassword() {
  const identifier = 'superadmin';
  const providedPassword = 'Admin@2026!';

  console.log('--- START DIAGNOSTIC ---');
  console.log(`Checking password for: ${identifier}`);

  try {
    const admin = await db.adminUser.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ]
      }
    });

    if (!admin) {
      console.log('RESULT: ADMIN_NOT_FOUND_IN_DB');
      return;
    }

    console.log(`Admin found: ${admin.username} (ID: ${admin.id})`);
    
    if (!admin.passwordHash) {
      console.log('RESULT: NO_HASH_FOUND');
      return;
    }

    console.log('Hash found, comparing...');
    const isMatch = await bcrypt.compare(providedPassword, admin.passwordHash);
    
    console.log('---------------------------');
    console.log('FINAL RESULT: ' + (isMatch ? 'MATCH_SUCCESS' : 'MATCH_FAILED'));
    console.log('---------------------------');

  } catch (err) {
    console.log('DIAGNOSTIC_ERROR: ' + err.message);
  }
}

testPassword()
  .then(() => {
    console.log('--- END DIAGNOSTIC ---');
    process.exit(0);
  })
  .catch(err => {
    console.error('FATAL_ERROR:', err);
    process.exit(1);
  });
