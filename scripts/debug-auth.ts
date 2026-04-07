
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function check() {
    console.log("--- DEBUGGING SUPERADMIN LOGIN ---");
    const identifier = 'superadmin';
    const password = 'Admin@2026!';

    try {
        const admin = await prisma.adminUser.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { username: identifier }
                ]
            }
        });

        if (!admin) {
            console.log("AdminUser 'superadmin' NOT FOUND in database.");
            return;
        }

        console.log("AdminUser found:", {
            id: admin.id,
            email: admin.email,
            username: admin.username,
            hasPasswordHash: !!admin.passwordHash,
            role: admin.role
        });

        if (admin.passwordHash) {
            const match = await bcrypt.compare(password, admin.passwordHash);
            console.log("Bcrypt comparison result:", match);
            
            // Bcrypt hashes usually start with $2a$ or $2b$.
            console.log("Hash starts with:", admin.passwordHash.substring(0, 10));
        }

    } catch (e) {
        console.error("Error during check:", e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
