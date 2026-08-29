import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const sendMessage = vi.fn();
const setMessages = vi.fn();
const clearError = vi.fn();
const regenerate = vi.fn();

let mockState: {
  messages: Array<{ id: string; role: 'user' | 'assistant'; parts: Array<{ type: 'text'; text: string }> }>;
  status: 'ready' | 'submitted' | 'streaming' | 'error';
  error: Error | undefined;
};

vi.mock('@ai-sdk/react', () => ({
  useChat: () => ({
    messages: mockState.messages,
    status: mockState.status,
    error: mockState.error,
    sendMessage,
    setMessages,
    clearError,
    regenerate,
  }),
}));

import { ChatWindow } from '@/components/chat/ChatWindow';

describe('ChatWindow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState = { messages: [], status: 'ready', error: undefined };
  });

  it('shows suggested prompts when there are no messages', () => {
    render(<ChatWindow />);
    expect(screen.getByText('What does Cadre AI do?')).toBeInTheDocument();
  });

  it('sends a message when the input is submitted', () => {
    render(<ChatWindow />);
    const textarea = screen.getByPlaceholderText(/ask about cadre ai/i);
    fireEvent.change(textarea, { target: { value: 'Tell me about pricing' } });
    fireEvent.keyDown(textarea, { key: 'Enter' });
    expect(sendMessage).toHaveBeenCalledWith({ text: 'Tell me about pricing' });
  });

  it('renders messages instead of suggested prompts once a conversation exists', () => {
    mockState.messages = [{ id: '1', role: 'user', parts: [{ type: 'text', text: 'Hi' }] }];
    render(<ChatWindow />);
    expect(screen.getByText('Hi')).toBeInTheDocument();
    expect(screen.queryByText('What does Cadre AI do?')).not.toBeInTheDocument();
  });

  it('shows an error notice and retries on click', () => {
    mockState.error = new Error('Something went wrong.');
    render(<ChatWindow />);
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong.');
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(clearError).toHaveBeenCalledOnce();
    expect(regenerate).toHaveBeenCalledOnce();
  });

  it('disables the input while a response is streaming', () => {
    mockState.status = 'streaming';
    render(<ChatWindow />);
    expect(screen.getByPlaceholderText(/ask about cadre ai/i)).toBeDisabled();
  });

  it('resets the conversation when "New chat" is clicked', () => {
    mockState.messages = [{ id: '1', role: 'user', parts: [{ type: 'text', text: 'Hi' }] }];
    render(<ChatWindow />);
    fireEvent.click(screen.getByRole('button', { name: /new chat/i }));
    expect(setMessages).toHaveBeenCalledWith([]);
    expect(clearError).toHaveBeenCalledOnce();
  });
});
