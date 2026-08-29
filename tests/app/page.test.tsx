import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@ai-sdk/react', () => ({
  useChat: () => ({
    messages: [],
    status: 'ready',
    error: undefined,
    sendMessage: vi.fn(),
    setMessages: vi.fn(),
    clearError: vi.fn(),
    regenerate: vi.fn(),
  }),
}));

import Home from '@/app/page';

describe('Home', () => {
  it('renders the Cadre AI chat surface', () => {
    render(<Home />);
    expect(screen.getByText('Cadre AI')).toBeInTheDocument();
    expect(screen.getByText('What does Cadre AI do?')).toBeInTheDocument();
  });
});
