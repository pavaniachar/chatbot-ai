import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { UIMessage } from 'ai';
import { MessageList } from '@/components/chat/MessageList';

function textMessage(id: string, role: 'user' | 'assistant', text: string): UIMessage {
  return { id, role, parts: [{ type: 'text', text }] };
}

describe('MessageList', () => {
  it('renders each message in order', () => {
    const messages = [
      textMessage('1', 'user', 'Hi'),
      textMessage('2', 'assistant', 'Hello, how can I help?'),
    ];
    render(<MessageList messages={messages} status="ready" />);
    expect(screen.getByText('Hi')).toBeInTheDocument();
    expect(screen.getByText('Hello, how can I help?')).toBeInTheDocument();
  });

  it('shows a typing indicator while a request is submitted', () => {
    render(<MessageList messages={[textMessage('1', 'user', 'Hi')]} status="submitted" />);
    expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
  });

  it('does not show a typing indicator once streaming has begun', () => {
    render(<MessageList messages={[textMessage('1', 'user', 'Hi')]} status="streaming" />);
    expect(screen.queryByTestId('typing-indicator')).not.toBeInTheDocument();
  });

  it('marks the last assistant message as streaming when status is streaming', () => {
    const messages = [
      textMessage('1', 'user', 'Hi'),
      textMessage('2', 'assistant', 'Thinking'),
    ];
    render(<MessageList messages={messages} status="streaming" />);
    expect(screen.getByTestId('streaming-cursor')).toBeInTheDocument();
  });

  it('exposes the conversation as an assistive-tech live region', () => {
    render(<MessageList messages={[textMessage('1', 'user', 'Hi')]} status="ready" />);
    expect(screen.getByRole('log', { name: /conversation/i })).toBeInTheDocument();
  });
});
