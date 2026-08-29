import { describe, expect, it, vi } from 'vitest';
import { APICallError } from 'ai';
import { mapErrorToUserMessage } from '@/lib/chat/errors';

function apiError(statusCode: number) {
  return new APICallError({
    message: 'upstream failure',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    requestBodyValues: {},
    statusCode,
  });
}

describe('mapErrorToUserMessage', () => {
  it('maps 401 to a generic unavailable message with contact info', () => {
    const message = mapErrorToUserMessage(apiError(401));
    expect(message).toContain('hello@gocadre.ai');
    expect(message).not.toContain('401');
  });

  it('maps 402 to the same unavailable message, without billing detail', () => {
    const message = mapErrorToUserMessage(apiError(402));
    expect(message).toContain('hello@gocadre.ai');
    expect(message.toLowerCase()).not.toContain('budget');
    expect(message.toLowerCase()).not.toContain('credit');
  });

  it('maps 429 to a high-demand retry message', () => {
    const message = mapErrorToUserMessage(apiError(429));
    expect(message.toLowerCase()).toContain('demand');
  });

  it('maps 5xx to a generic retry message', () => {
    const message = mapErrorToUserMessage(apiError(503));
    expect(message.toLowerCase()).toContain('try again');
  });

  it('never leaks the raw error message for unrecognized errors', () => {
    const secret = 'sk-or-v1-should-never-appear';
    const message = mapErrorToUserMessage(new Error(secret));
    expect(message).not.toContain(secret);
  });

  it('logs the original error server-side without throwing', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mapErrorToUserMessage(apiError(500));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
