export interface RateLimiter {
  check(key: string, now?: number): boolean;
}

export function createRateLimiter({
  windowMs,
  max,
}: {
  windowMs: number;
  max: number;
}): RateLimiter {
  const hits = new Map<string, number[]>();

  return {
    check(key: string, now: number = Date.now()): boolean {
      const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      if (recent.length >= max) {
        hits.set(key, recent);
        return false;
      }
      recent.push(now);
      hits.set(key, recent);
      return true;
    },
  };
}

/**
 * Per-instance approximation. On Vercel serverless this resets per
 * function instance rather than globally — acceptable for a demo; a
 * production deployment would use Upstash/Redis instead.
 */
export const chatRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 20,
});
