import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatHeader } from '@/components/chat/ChatHeader';

describe('ChatHeader', () => {
  it('renders the Cadre AI branding', () => {
    render(<ChatHeader onReset={vi.fn()} />);
    expect(screen.getByText('Cadre AI')).toBeInTheDocument();
  });

  it('calls onReset when "New chat" is clicked', () => {
    const onReset = vi.fn();
    render(<ChatHeader onReset={onReset} />);
    fireEvent.click(screen.getByRole('button', { name: /new chat/i }));
    expect(onReset).toHaveBeenCalledOnce();
  });
});
