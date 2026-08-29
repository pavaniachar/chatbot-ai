import { describe, expect, it } from 'vitest';
import { getClientIp } from '@/lib/chat/client-ip';

describe('getClientIp', () => {
  it('prefers x-real-ip over x-forwarded-for when both are present', () => {
    const headers = new Headers({
      'x-forwarded-for': '203.0.113.5',
      'x-real-ip': '198.51.100.7',
    });
    expect(getClientIp(headers)).toBe('198.51.100.7');
  });

  it('falls back to the last hop of x-forwarded-for when x-real-ip is absent', () => {
    const headers = new Headers({ 'x-forwarded-for': '203.0.113.5, 70.41.3.18' });
    expect(getClientIp(headers)).toBe('70.41.3.18');
  });

  it('trims whitespace around the address', () => {
    const headers = new Headers({ 'x-forwarded-for': '  203.0.113.5  ,  70.41.3.18  ' });
    expect(getClientIp(headers)).toBe('70.41.3.18');
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
