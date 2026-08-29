'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { UIMessage, ChatStatus } from 'ai';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

const NEAR_BOTTOM_THRESHOLD_PX = 80;

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollButton(distanceFromBottom > NEAR_BOTTOM_THRESHOLD_PX);
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const visibleMessages = messages.filter((message) => message.role !== 'system');

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-6 bg-gradient-to-b from-white to-transparent" />
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
      >
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
        <AnimatePresence>
          {status === 'submitted' && <TypingIndicator key="typing" />}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            onClick={scrollToBottom}
            className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 shadow-md transition hover:border-zinc-400 hover:text-zinc-900"
          >
            ↓ Jump to latest
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
