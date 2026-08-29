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

  it('renders a mailto link without target="_blank" so it opens the mail client', () => {
    render(
      <ErrorNotice
        message="Reach us at [hello@gocadre.ai](mailto:hello@gocadre.ai)"
        onRetry={vi.fn()}
      />
    );
    const link = screen.getByRole('link', { name: 'hello@gocadre.ai' });
    expect(link).toHaveAttribute('href', 'mailto:hello@gocadre.ai');
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });

  it('opens an external contact link in a new tab', () => {
    render(
      <ErrorNotice
        message="Or the [contact form](https://cadreai.com/contact)"
        onRetry={vi.fn()}
      />
    );
    const link = screen.getByRole('link', { name: 'contact form' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
