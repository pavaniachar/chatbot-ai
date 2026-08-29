export interface RateLimiter {
  check(key: string, now?: number): boolean;
  /** Number of keys currently tracked. Exposed for tests verifying eviction. */
  size(): number;
}

export function createRateLimiter({
  windowMs,
  max,
}: {
  windowMs: number;
  max: number;
}): RateLimiter {
  const hits = new Map<string, number[]>();

  // Sweeps every tracked key, not just the one being checked, so that a key
  // whose hits have all aged out of the window is deleted entirely rather
  // than left behind as a stale (or empty) array. Without this, distinct-IP
  // traffic would grow the map for the life of the server instance even
  // though most keys go cold after a single burst.
  function pruneAll(now: number) {
    for (const [existingKey, timestamps] of hits) {
      const recent = timestamps.filter((t) => now - t < windowMs);
      if (recent.length === 0) {
        hits.delete(existingKey);
      } else if (recent.length !== timestamps.length) {
        hits.set(existingKey, recent);
      }
    }
  }

  return {
    check(key: string, now: number = Date.now()): boolean {
      pruneAll(now);

      const recent = hits.get(key) ?? [];
      if (recent.length >= max) {
        return false;
      }

      recent.push(now);
      hits.set(key, recent);
      return true;
    },
    size(): number {
      return hits.size;
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
