import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorNotice } from '@/components/chat/ErrorNotice';

describe('ErrorNotice', () => {
  it('renders the message', () => {
    render(<ErrorNotice message="Something went wrong." onRetry={vi.fn()} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong.');
  });

  it('calls onRetry when the retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorNotice message="Failed." onRetry={onRetry} />);
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
