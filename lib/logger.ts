import { db } from './db';

export async function logActivity(
    userId: string,
    userName: string,
    role: string,
    action: string,
    details: string,
    targetType?: string,
    targetId?: string
) {
    try {
        await db.activityLog.create({
            data: {
                userId,
                userName,
                role,
                action,
                details,
                targetType,
                targetId,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
}
