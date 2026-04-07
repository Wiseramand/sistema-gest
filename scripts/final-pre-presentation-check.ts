import { getAuthOptions } from "../lib/auth";
import bcrypt from "bcryptjs";
import { db } from "../lib/db";

async function verify() {
    console.log("--- FINAL PRE-PRESENTATION VERIFICATION ---");
    
    const credentials = {
        email: "superadmin",
        password: "Admin@2026!"
    };

    const authOptions = getAuthOptions('admin');
    const authorize = authOptions.providers[0].authorize;

    if (typeof authorize !== 'function') {
        console.error("Authorize is not a function");
        process.exit(1);
    }

    try {
        console.log(`Testing login for: ${credentials.email}...`);
        
        // Simular a busca que o authorize faz
        const userInDb = await db.adminUser.findFirst({
            where: {
                OR: [
                    { email: credentials.email },
                    { username: credentials.email }
                ]
            }
        });

        if (!userInDb) {
            console.error("❌ FAILURE: User not found in database.");
        } else {
            console.log("✅ User found in DB. Checking password...");
            const hash = userInDb.passwordHash;
            if (!hash) {
                console.error("❌ FAILURE: User has no passwordHash.");
            } else {
                const isValid = await bcrypt.compare(credentials.password, hash);
                console.log(`Password valid: ${isValid}`);
                if (isValid) {
                    console.log("✅ SUCCESS: Manual bcrypt match!");
                } else {
                    console.error("❌ FAILURE: Bcrypt mismatch.");
                    console.log("Input:", credentials.password);
                    console.log("Hash in DB:", hash);
                }
            }
        }

        const user = await (authorize as any)(credentials);
        
        if (user) {
            console.log("✅ SUCCESS: Authorize function returned user!");
            console.log("User details:", JSON.stringify(user, null, 2));
        } else {
            console.error("❌ FAILURE: Authorize function returned null.");
        }
    } catch (error: any) {
        console.error("❌ ERROR during login simulation:", error.message);
    }

    process.exit(0);
}

verify();
