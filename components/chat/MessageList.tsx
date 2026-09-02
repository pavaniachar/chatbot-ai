'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { UIMessage, ChatStatus } from 'ai';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

const NEAR_BOTTOM_THRESHOLD_PX = 80;

/** A message the chat surface actually renders — `system` never reaches the UI. */
type DisplayMessage = UIMessage & { role: 'user' | 'assistant' };

function isDisplayMessage(message: UIMessage): message is DisplayMessage {
  return message.role === 'user' || message.role === 'assistant';
}

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Held in a ref, not state: the auto-scroll effect needs the latest value
  // without re-running when it changes, which would itself trigger a scroll.
  const isPinnedToBottomRef = useRef(true);

  // Scrolls the conversation panel and nothing else. `scrollIntoView` would be
  // the obvious call here, but it scrolls *every* scrollable ancestor — and an
  // `overflow: hidden` wrapper still scrolls from script. Once the thread grew
  // past a few turns that dragged the whole list up out of the chat card,
  // leaving the header and composer framing a blank panel.
  const scrollToLatest = () => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  };

  useEffect(() => {
    // Streaming produces a new `messages` array per token, so this effect runs
    // on every delta. Following the stream is only wanted while the reader is
    // already at the bottom — otherwise each token would yank them back down
    // mid-sentence while they scroll up to re-read an earlier reply.
    if (!isPinnedToBottomRef.current) return;
    scrollToLatest();
  }, [messages, status]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const hasScrolledAway = distanceFromBottom > NEAR_BOTTOM_THRESHOLD_PX;
    isPinnedToBottomRef.current = !hasScrolledAway;
    setShowScrollButton(hasScrolledAway);
  };

  const scrollToBottom = () => {
    // Re-pin explicitly: without this, jumping back would scroll once and then
    // never follow the stream again.
    isPinnedToBottomRef.current = true;
    setShowScrollButton(false);
    scrollToLatest();
  };

  const visibleMessages = messages.filter(isDisplayMessage);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-6 bg-gradient-to-b from-white to-transparent"
      />
      <div
        ref={containerRef}
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-label="Conversation with Cadre AI support assistant"
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
      >
        {visibleMessages.map((message, index) => (
          <MessageBubble
            key={message.id}
            role={message.role}
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
            <span aria-hidden="true">↓</span> Jump to latest
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
