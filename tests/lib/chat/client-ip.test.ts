import { describe, expect, it } from 'vitest';
import { getClientIp } from '@/lib/chat/client-ip';

describe('getClientIp', () => {
  it('reads the first address from x-forwarded-for', () => {
    const headers = new Headers({ 'x-forwarded-for': '203.0.113.5, 70.41.3.18' });
    expect(getClientIp(headers)).toBe('203.0.113.5');
  });

  it('trims whitespace around the address', () => {
    const headers = new Headers({ 'x-forwarded-for': '  203.0.113.5  , 70.41.3.18' });
    expect(getClientIp(headers)).toBe('203.0.113.5');
  });

  it('falls back to x-real-ip when x-forwarded-for is absent', () => {
    const headers = new Headers({ 'x-real-ip': '198.51.100.7' });
    expect(getClientIp(headers)).toBe('198.51.100.7');
  });

  it('falls back to "unknown" when neither header is present', () => {
    const headers = new Headers();
    expect(getClientIp(headers)).toBe('unknown');
  });
});
