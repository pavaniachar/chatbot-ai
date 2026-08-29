import { describe, expect, it, vi, beforeEach } from 'vitest';

const { streamTextMock, checkMock } = vi.hoisted(() => ({
  streamTextMock: vi.fn(),
  checkMock: vi.fn(),
}));

vi.mock('ai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('ai')>();
  return {
    ...actual,
    streamText: (...args: unknown[]) => streamTextMock(...args),
  };
});

vi.mock('@openrouter/ai-sdk-provider', () => ({
  openrouter: vi.fn(() => 'mock-model'),
}));

vi.mock('@/lib/chat/rate-limit', () => ({
  chatRateLimiter: { check: checkMock },
}));

import { POST } from '@/app/api/chat/route';

function jsonRequest(body: unknown) {
  return new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.5' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/chat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    checkMock.mockReturnValue(true);
  });

  it('returns 400 for an invalid body without calling the model', async () => {
    const response = await POST(jsonRequest({ nope: true }));
    expect(response.status).toBe(400);
    expect(streamTextMock).not.toHaveBeenCalled();
  });

  it('returns 429 when the rate limiter denies the request', async () => {
    checkMock.mockReturnValue(false);
    const response = await POST(
      jsonRequest({ messages: [{ id: '1', role: 'user', parts: [{ type: 'text', text: 'Hi' }] }] }),
    );
    expect(response.status).toBe(429);
    expect(streamTextMock).not.toHaveBeenCalled();
  });

  it('calls streamText with the system prompt and a token cap for a valid request', async () => {
    const fakeResponse = new Response('ok');
    streamTextMock.mockReturnValue({
      toUIMessageStreamResponse: () => fakeResponse,
    });

    const response = await POST(
      jsonRequest({
        messages: [{ id: '1', role: 'user', parts: [{ type: 'text', text: 'What do you do?' }] }],
      }),
    );

    expect(streamTextMock).toHaveBeenCalledOnce();
    const callArgs = streamTextMock.mock.calls[0][0];
    expect(callArgs.model).toBe('mock-model');
    expect(callArgs.instructions).toContain('Cadre AI');
    expect(callArgs.maxOutputTokens).toBe(500);
    expect(response).toBe(fakeResponse);
  });
});
