import type { UIMessage } from 'ai';

/** Keeps roughly the last 6 user/assistant exchanges. */
export const MAX_HISTORY_MESSAGES = 12;

export function trimHistory(messages: UIMessage[]): UIMessage[] {
  if (messages.length <= MAX_HISTORY_MESSAGES) {
    return messages;
  }
  return messages.slice(messages.length - MAX_HISTORY_MESSAGES);
}
