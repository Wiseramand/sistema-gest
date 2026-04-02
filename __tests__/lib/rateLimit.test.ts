import { checkRateLimit, resetRateLimit } from '../../lib/rateLimit';

describe('Rate Limit Utility', () => {
    afterEach(() => {
        resetRateLimit('test-ip');
    });

    it('deve permitir acesso na primeira tentativa', () => {
        const { allowed } = checkRateLimit('test-ip', 5, 1000);
        expect(allowed).toBe(true);
    });

    it('deve bloquear após ultrapassar limite de tentativas', () => {
        for (let i = 0; i < 5; i++) {
            checkRateLimit('test-ip', 5, 1000);
        }
        const { allowed, retryAfter } = checkRateLimit('test-ip', 5, 1000);
        expect(allowed).toBe(false);
        expect(retryAfter).toBeGreaterThan(0);
    });
});
