export function getClientIp(headers: Headers): string {
  // x-real-ip is set by a trusted reverse proxy hop and can't be directly
  // overridden by the client, so it takes precedence when present.
  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  // x-forwarded-for is a client-appendable, comma-separated hop list. A
  // proxy that appends (rather than replaces) the header means the *last*
  // entry is the one added by our own infrastructure — the first entry can
  // be set to anything by the client and would otherwise let them mint a
  // fresh rate-limit bucket per request.
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    const hops = forwardedFor
      .split(',')
      .map((hop) => hop.trim())
      .filter(Boolean);
    if (hops.length > 0) {
      return hops[hops.length - 1]!;
    }
  }

  return 'unknown';
}
