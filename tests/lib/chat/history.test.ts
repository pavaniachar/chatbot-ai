import { describe, expect, it } from 'vitest';
import type { UIMessage } from 'ai';
import { trimHistory, MAX_HISTORY_MESSAGES } from '@/lib/chat/history';

function message(id: string, role: 'user' | 'assistant'): UIMessage {
  return { id, role, parts: [{ type: 'text', text: id }] };
}

describe('trimHistory', () => {
  it('returns messages unchanged when under the limit', () => {
    const messages = [message('1', 'user'), message('2', 'assistant')];
    expect(trimHistory(messages)).toEqual(messages);
  });

  it('keeps exactly the limit when at the boundary', () => {
    const messages = Array.from({ length: MAX_HISTORY_MESSAGES }, (_, i) =>
      message(String(i), i % 2 === 0 ? 'user' : 'assistant'),
    );
    expect(trimHistory(messages)).toHaveLength(MAX_HISTORY_MESSAGES);
  });

  it('trims from the front and preserves order for a long history', () => {
    const messages = Array.from({ length: MAX_HISTORY_MESSAGES + 2 }, (_, i) =>
      message(String(i), i % 2 === 0 ? 'user' : 'assistant'),
    );
    const trimmed = trimHistory(messages);
    expect(trimmed).toHaveLength(MAX_HISTORY_MESSAGES);
    expect(trimmed[0].id).toBe('2');
    expect(trimmed[trimmed.length - 1].id).toBe(String(MAX_HISTORY_MESSAGES + 1));
  });

  it('never orphans a turn: the first kept message is a user message', () => {
    const messages = Array.from({ length: MAX_HISTORY_MESSAGES + 4 }, (_, i) =>
      message(String(i), i % 2 === 0 ? 'user' : 'assistant'),
    );
    const trimmed = trimHistory(messages);
    expect(trimmed[0].role).toBe('user');
  });
});
