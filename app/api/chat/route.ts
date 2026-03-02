import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { authOptions } from '../../../lib/auth';

async function getSessionUser(request: NextRequest) {
    // Try getServerSession first
    try {
        const session = await getServerSession(authOptions);
        console.log('[Chat Auth] getServerSession result:', session ? 'found' : 'null');
        if (session?.user) {
            return session.user as any;
        }
    } catch (err) {
        console.error('[Chat Auth] getServerSession error:', err);
    }

    // Fallback: read JWT token directly from cookies
    try {
        const token = await getToken({ req: request });
        console.log('[Chat Auth] getToken result:', token ? 'found' : 'null');
        if (token) {
            return {
                id: token.id,
                name: token.name,
                email: token.email,
                role: token.role,
                responsibilities: token.responsibilities,
            };
        }
    } catch (err) {
        console.error('[Chat Auth] getToken error:', err);
    }

    return null;
}

export async function GET(request: NextRequest) {
    try {
        const user = await getSessionUser(request);
        if (!user) {
            console.error('[Chat GET] Unauthorized - no session found');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const allMessages = await db.chatMessage.findMany({
            orderBy: { timestamp: 'asc' }
        });

        // Filter messages:
        // - Admins see all.
        // - Students/Professors see:
        //   1. Messages they sent.
        //   2. Messages sent to them (specifically by their ID).
        //   3. Messages sent to 'admin' IF they are the sender (to see their own outgoing support requests).
        let filteredMessages = allMessages;
        if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
            filteredMessages = allMessages.filter((m: any) =>
                m.senderId === user.id ||
                m.recipientId === user.id ||
                (m.recipientId === 'admin' && m.senderId === user.id)
            );
        }

        return NextResponse.json(filteredMessages);
    } catch (error) {
        console.error('[Chat GET] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getSessionUser(request);
        if (!user) {
            console.error('[Chat POST] Unauthorized - no session found');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const newMessage = await db.chatMessage.create({
            data: {
                ...body,
                senderId: user.id,
                senderName: user.name,
                senderRole: user.role,
                timestamp: new Date()
            }
        });

        return NextResponse.json(newMessage);
    } catch (error) {
        console.error('[Chat POST] Error:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}

