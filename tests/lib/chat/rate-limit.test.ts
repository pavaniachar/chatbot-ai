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
});
