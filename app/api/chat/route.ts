import { streamText, convertToModelMessages } from 'ai';
import { openrouter } from '@openrouter/ai-sdk-provider';
import { SYSTEM_PROMPT } from '@/lib/chat/system-prompt';
import { trimHistory } from '@/lib/chat/history';
import { chatRateLimiter } from '@/lib/chat/rate-limit';
import { getClientIp } from '@/lib/chat/client-ip';
import { parseChatRequest } from '@/lib/chat/validate-request';
import { mapErrorToUserMessage } from '@/lib/chat/errors';

export const maxDuration = 30;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid request body.', { status: 400 });
  }

  const parsed = parseChatRequest(body);

  if (!parsed.success) {
    return new Response(parsed.error, { status: 400 });
  }

  const clientIp = getClientIp(req.headers);
  if (!chatRateLimiter.check(clientIp)) {
    return new Response("You're sending messages quickly — try again shortly.", {
      status: 429,
    });
  }

  const trimmed = trimHistory(parsed.messages);
  const modelMessages = await convertToModelMessages(trimmed);

  const result = streamText({
    model: openrouter('anthropic/claude-sonnet-4.5'),
    instructions: SYSTEM_PROMPT,
    messages: modelMessages,
    maxOutputTokens: 500,
    onError: ({ error }) => {
      console.error('[chat] streamText error', error);
    },
  });

  return result.toUIMessageStreamResponse({
    onError: mapErrorToUserMessage,
  });
}
