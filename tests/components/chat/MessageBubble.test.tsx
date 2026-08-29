import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageBubble } from '@/components/chat/MessageBubble';

describe('MessageBubble', () => {
  it('right-aligns user messages', () => {
    render(<MessageBubble role="user" text="Hello there" />);
    const bubble = screen.getByText('Hello there').closest('[data-role="user"]');
    expect(bubble).toHaveClass('justify-end');
  });

  it('left-aligns assistant messages', () => {
    render(<MessageBubble role="assistant" text="Hi, how can I help?" />);
    const bubble = screen.getByText('Hi, how can I help?').closest('[data-role="assistant"]');
    expect(bubble).toHaveClass('justify-start');
  });

  it('renders markdown formatting in assistant replies', () => {
    render(<MessageBubble role="assistant" text="Here are **bold** words" />);
    expect(screen.getByText('bold').tagName).toBe('STRONG');
  });

  it('shows a streaming cursor while isStreaming is true', () => {
    render(<MessageBubble role="assistant" text="Thinking" isStreaming />);
    expect(screen.getByTestId('streaming-cursor')).toBeInTheDocument();
  });

  it('omits the streaming cursor otherwise', () => {
    render(<MessageBubble role="assistant" text="Done" />);
    expect(screen.queryByTestId('streaming-cursor')).not.toBeInTheDocument();
  });
});
