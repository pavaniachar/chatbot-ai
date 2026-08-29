import { z } from 'zod';
import type { UIMessage } from 'ai';

const chatPartSchema = z.union([
  z.object({
    type: z.literal('text'),
    text: z.string().min(1).max(4000),
  }),
  z.object({
    type: z.literal('step-start'),
  }),
]);

const chatMessageSchema = z.object({
  id: z.string().min(1),
  role: z.enum(['user', 'assistant']),
  parts: z.array(chatPartSchema).min(1),
});

const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(50),
});

export type ParseChatRequestResult =
  | { success: true; messages: UIMessage[] }
  | { success: false; error: string };

export function parseChatRequest(body: unknown): ParseChatRequestResult {
  const result = chatRequestSchema.safeParse(body);
  if (!result.success) {
    return { success: false, error: 'Invalid request body.' };
  }
  return { success: true, messages: result.data.messages as UIMessage[] };
}
