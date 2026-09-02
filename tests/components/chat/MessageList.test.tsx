import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import type { UIMessage } from 'ai';
import { MessageList } from '@/components/chat/MessageList';

function textMessage(id: string, role: 'user' | 'assistant', text: string): UIMessage {
  return { id, role, parts: [{ type: 'text', text }] };
}

/**
 * jsdom reports 0 for every scroll dimension, so the geometry the component
 * reads has to be defined explicitly before dispatching a scroll event.
 */
function setScrollPosition(container: HTMLElement, scrollTop: number) {
  Object.defineProperty(container, 'scrollHeight', { value: 1000, configurable: true });
  Object.defineProperty(container, 'clientHeight', { value: 300, configurable: true });
  Object.defineProperty(container, 'scrollTop', { value: scrollTop, configurable: true });
  fireEvent.scroll(container);
}

const SCROLLED_TO_BOTTOM = 700; // 1000 - 300
const SCROLLED_UP = 0;

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

  describe('auto-scroll', () => {
    // The list scrolls its own container rather than calling `scrollIntoView`,
    // which would also scroll the `overflow: hidden` wrappers around it and
    // drag the conversation off the chat card.
    let scrollTo: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      scrollTo = vi.spyOn(Element.prototype, 'scrollTo').mockImplementation(() => {});
    });

    afterEach(() => {
      scrollTo.mockRestore();
    });

    it('follows new messages while the reader is at the bottom', () => {
      const messages = [textMessage('1', 'user', 'Hi')];
      const { rerender } = render(<MessageList messages={messages} status="streaming" />);

      scrollTo.mockClear();
      rerender(
        <MessageList
          messages={[...messages, textMessage('2', 'assistant', 'Hello')]}
          status="streaming"
        />,
      );

      expect(scrollTo).toHaveBeenCalled();
    });

    it('stops following once the reader scrolls up to read earlier replies', () => {
      const messages = [textMessage('1', 'user', 'Hi')];
      const { rerender } = render(<MessageList messages={messages} status="streaming" />);

      setScrollPosition(screen.getByRole('log'), SCROLLED_UP);
      scrollTo.mockClear();

      // A streamed token arrives while the reader is still scrolled up.
      rerender(
        <MessageList
          messages={[...messages, textMessage('2', 'assistant', 'Hello')]}
          status="streaming"
        />,
      );

      expect(scrollTo).not.toHaveBeenCalled();
    });

    it('resumes following after the reader jumps back to the latest message', () => {
      const messages = [textMessage('1', 'user', 'Hi')];
      const { rerender } = render(<MessageList messages={messages} status="streaming" />);

      setScrollPosition(screen.getByRole('log'), SCROLLED_UP);
      fireEvent.click(screen.getByRole('button', { name: /jump to latest/i }));
      scrollTo.mockClear();

      rerender(
        <MessageList
          messages={[...messages, textMessage('2', 'assistant', 'Hello')]}
          status="streaming"
        />,
      );

      expect(scrollTo).toHaveBeenCalled();
    });

    it('hides the jump affordance once the reader is back at the bottom', async () => {
      render(<MessageList messages={[textMessage('1', 'user', 'Hi')]} status="ready" />);
      const log = screen.getByRole('log');

      setScrollPosition(log, SCROLLED_UP);
      const jumpButton = screen.getByRole('button', { name: /jump to latest/i });

      setScrollPosition(log, SCROLLED_TO_BOTTOM);
      // The affordance animates out, so it lingers in the DOM for a frame.
      await waitForElementToBeRemoved(jumpButton);
    });
  });
});
