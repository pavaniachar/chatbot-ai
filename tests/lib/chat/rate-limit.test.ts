import { describe, expect, it } from 'vitest';
import { createRateLimiter } from '@/lib/chat/rate-limit';

describe('createRateLimiter', () => {
  it('allows requests under the limit', () => {
    const limiter = createRateLimiter({ windowMs: 1000, max: 3 });
    expect(limiter.check('a', 0)).toBe(true);
    expect(limiter.check('a', 10)).toBe(true);
    expect(limiter.check('a', 20)).toBe(true);
  });

  it('denies once the limit is reached within the window', () => {
    const limiter = createRateLimiter({ windowMs: 1000, max: 2 });
    expect(limiter.check('a', 0)).toBe(true);
    expect(limiter.check('a', 10)).toBe(true);
    expect(limiter.check('a', 20)).toBe(false);
  });

  it('allows again once the window has fully passed', () => {
    const limiter = createRateLimiter({ windowMs: 1000, max: 1 });
    expect(limiter.check('a', 0)).toBe(true);
    expect(limiter.check('a', 500)).toBe(false);
    expect(limiter.check('a', 1500)).toBe(true);
  });

  it('tracks separate keys independently', () => {
    const limiter = createRateLimiter({ windowMs: 1000, max: 1 });
    expect(limiter.check('a', 0)).toBe(true);
    expect(limiter.check('b', 0)).toBe(true);
  });

  it('evicts a key from internal state once its hits fall outside the window', () => {
    const limiter = createRateLimiter({ windowMs: 1000, max: 1 });
    expect(limiter.check('a', 0)).toBe(true);
    expect(limiter.size()).toBe(1);

    // A later check for an unrelated key sweeps stale entries, including 'a'.
    expect(limiter.check('b', 5000)).toBe(true);
    expect(limiter.size()).toBe(1);
  });

  it('does not grow internal state across many distinct keys that only ever hit once', () => {
    const limiter = createRateLimiter({ windowMs: 1000, max: 1 });
    for (let i = 0; i < 10; i += 1) {
      limiter.check(`key-${i}`, i * 100);
    }
    // All earlier keys are well outside the window by the time of this call.
    limiter.check('final', 100_000);
    expect(limiter.size()).toBe(1);
  });
});
