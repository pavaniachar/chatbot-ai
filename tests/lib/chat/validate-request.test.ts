import { describe, expect, it } from 'vitest';
import { parseChatRequest } from '@/lib/chat/validate-request';

function validBody(messageCount = 1) {
  return {
    messages: Array.from({ length: messageCount }, (_, i) => ({
      id: String(i),
      role: 'user' as const,
      parts: [{ type: 'text', text: `message ${i}` }],
    })),
  };
}

describe('parseChatRequest', () => {
  it('accepts a well-formed body', () => {
    const result = parseChatRequest(validBody());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.messages).toHaveLength(1);
    }
  });

  it('rejects a body with no messages field', () => {
    const result = parseChatRequest({ nope: true });
    expect(result.success).toBe(false);
  });

  it('rejects an empty messages array', () => {
    const result = parseChatRequest({ messages: [] });
    expect(result.success).toBe(false);
  });

  it('rejects more than 50 messages', () => {
    const result = parseChatRequest(validBody(51));
    expect(result.success).toBe(false);
  });

  it('rejects a message missing a role', () => {
    const result = parseChatRequest({
      messages: [{ id: '1', parts: [{ type: 'text', text: 'hi' }] }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects a message with an empty parts array', () => {
    const result = parseChatRequest({
      messages: [{ id: '1', role: 'user', parts: [] }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects a completely malformed body', () => {
    const result = parseChatRequest('not an object');
    expect(result.success).toBe(false);
  });

  it('rejects a message with role "system"', () => {
    const result = parseChatRequest({
      messages: [{ id: '1', role: 'system', parts: [{ type: 'text', text: 'hi' }] }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects a message part with type "file"', () => {
    const result = parseChatRequest({
      messages: [
        {
          id: '1',
          role: 'user',
          parts: [{ type: 'file', url: 'https://example.com/image.png', mediaType: 'image/png' }],
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects a text part longer than 4000 characters', () => {
    const result = parseChatRequest({
      messages: [{ id: '1', role: 'user', parts: [{ type: 'text', text: 'a'.repeat(4001) }] }],
    });
    expect(result.success).toBe(false);
  });

  it('accepts a text part at exactly the 4000 character limit', () => {
    const result = parseChatRequest({
      messages: [{ id: '1', role: 'user', parts: [{ type: 'text', text: 'a'.repeat(4000) }] }],
    });
    expect(result.success).toBe(true);
  });
});
