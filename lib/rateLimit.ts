const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(identifier: string, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    const now = Date.now();
    const entry = attempts.get(identifier);

    if (entry && now < entry.resetAt) {
        if (entry.count >= maxAttempts) {
            const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
            return { allowed: false, retryAfter };
        }
        entry.count++;
    } else {
        attempts.set(identifier, { count: 1, resetAt: now + windowMs });
    }

    return { allowed: true };
}

export function resetRateLimit(identifier: string) {
    attempts.delete(identifier);
}
