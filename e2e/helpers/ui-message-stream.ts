/**
 * Builders for the AI SDK's UI message stream wire format, so tests can hand
 * `useChat` a scripted response instead of calling the real model.
 *
 * The format is server-sent events: one `data: <json>` frame per chunk, closed
 * by `data: [DONE]`. Chunk shapes come from `UIMessageChunk` in the `ai`
 * package; the headers match `UI_MESSAGE_STREAM_HEADERS`.
 */

export const UI_MESSAGE_STREAM_HEADERS = {
  'content-type': 'text/event-stream',
  'cache-control': 'no-cache',
  connection: 'keep-alive',
  'x-vercel-ai-ui-message-stream': 'v1',
  'x-accel-buffering': 'no',
} as const;

/** A single frame of the stream. Loosely typed — tests deliberately send malformed chunks. */
export type StreamChunk = Record<string, unknown>;

export function encodeStream(chunks: StreamChunk[]): string {
  const frames = chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`);
  return `${frames.join('')}data: [DONE]\n\n`;
}

/** Splits text so the reply arrives as several deltas, the way the model streams it. */
function toDeltas(text: string): string[] {
  return text.match(/\S+\s*/g) ?? [text];
}

export interface AssistantReplyOptions {
  messageId?: string;
  /** Extra chunks injected between `start-step` and `text-start`. */
  leadingChunks?: StreamChunk[];
  /** Extra chunks injected after `text-end`, before `finish-step`. */
  trailingChunks?: StreamChunk[];
}

/** A complete, well-formed assistant reply — the happy path. */
export function assistantReply(text: string, options: AssistantReplyOptions = {}): string {
  const { messageId = 'assistant-msg', leadingChunks = [], trailingChunks = [] } = options;
  return encodeStream([
    { type: 'start', messageId },
    { type: 'start-step' },
    ...leadingChunks,
    { type: 'text-start', id: 'text-0' },
    ...toDeltas(text).map((delta) => ({ type: 'text-delta', id: 'text-0', delta })),
    { type: 'text-end', id: 'text-0' },
    ...trailingChunks,
    { type: 'finish-step' },
    { type: 'finish' },
  ]);
}

/** A reply that starts, emits some text, then fails mid-stream. */
export function assistantReplyThenError(partialText: string, errorText: string): string {
  return encodeStream([
    { type: 'start', messageId: 'assistant-msg-error' },
    { type: 'start-step' },
    { type: 'text-start', id: 'text-0' },
    ...toDeltas(partialText).map((delta) => ({ type: 'text-delta', id: 'text-0', delta })),
    { type: 'error', errorText },
  ]);
}
