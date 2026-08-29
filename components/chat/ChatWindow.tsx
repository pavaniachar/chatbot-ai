'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { MotionConfig } from 'framer-motion';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { SuggestedPrompts } from './SuggestedPrompts';
import { ChatInput } from './ChatInput';
import { ErrorNotice } from './ErrorNotice';

export function ChatWindow() {
  const { messages, sendMessage, status, error, clearError, regenerate, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  const isBusy = status === 'submitted' || status === 'streaming';

  const handleSubmit = (text: string) => {
    sendMessage({ text });
  };

  const handleReset = () => {
    setMessages([]);
    clearError();
  };

  const handleRetry = () => {
    clearError();
    regenerate();
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-dvh w-full flex-col overflow-hidden bg-white sm:h-[85dvh] sm:max-h-[820px] sm:w-full sm:max-w-2xl sm:rounded-3xl sm:border sm:border-zinc-200 sm:shadow-xl sm:shadow-zinc-900/10">
        <ChatHeader onReset={handleReset} />
        <div className="flex flex-1 flex-col overflow-hidden">
          {messages.length === 0 ? (
            <SuggestedPrompts onSelect={handleSubmit} />
          ) : (
            <MessageList messages={messages} status={status} />
          )}
        </div>
        {error && <ErrorNotice message={error.message} onRetry={handleRetry} />}
        <ChatInput onSubmit={handleSubmit} disabled={isBusy} />
      </div>
    </MotionConfig>
  );
}
