'use client';

import { useEffect, useRef } from 'react';
import type { UIMessage, ChatStatus } from 'ai';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

export interface MessageListProps {
  messages: UIMessage[];
  status: ChatStatus;
}

export function MessageList({ messages, status }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  const visibleMessages = messages.filter((message) => message.role !== 'system');

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
      {visibleMessages.map((message, index) => (
        <MessageBubble
          key={message.id}
          role={message.role as 'user' | 'assistant'}
          text={getMessageText(message)}
          isStreaming={
            status === 'streaming' &&
            index === visibleMessages.length - 1 &&
            message.role === 'assistant'
          }
        />
      ))}
      {status === 'submitted' && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
