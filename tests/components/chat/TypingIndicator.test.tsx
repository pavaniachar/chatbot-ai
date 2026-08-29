import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TypingIndicator } from '@/components/chat/TypingIndicator';

describe('TypingIndicator', () => {
  it('renders', () => {
    render(<TypingIndicator />);
    expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
  });
});
