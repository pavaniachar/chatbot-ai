'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
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
    <div className="flex h-dvh flex-col bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900">
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
  );
}
