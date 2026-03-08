import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const identifier = searchParams.get('identifier');

    if (!identifier) {
        return NextResponse.json({ error: "Identifier required" }, { status: 400 });
    }

    const collections = ['user', 'adminUser', 'student', 'trainer'] as const;

    for (const col of collections) {
        let user = await (db as any)[col].findUnique({ where: { email: identifier } });
        if (!user) {
            user = await (db as any)[col].findUnique({ where: { username: identifier } });
        }

        if (user) {
            return NextResponse.json({ role: user.role });
        }
    }

    return NextResponse.json({ error: "User not found" }, { status: 404 });
}
