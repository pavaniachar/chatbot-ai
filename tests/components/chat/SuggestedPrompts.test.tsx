import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SuggestedPrompts, SUGGESTED_PROMPTS } from '@/components/chat/SuggestedPrompts';

describe('SuggestedPrompts', () => {
  it('renders every suggested prompt', () => {
    render(<SuggestedPrompts onSelect={vi.fn()} />);
    SUGGESTED_PROMPTS.forEach((prompt) => {
      expect(screen.getByText(prompt)).toBeInTheDocument();
    });
  });

  it('calls onSelect with the clicked prompt', () => {
    const onSelect = vi.fn();
    render(<SuggestedPrompts onSelect={onSelect} />);
    fireEvent.click(screen.getByText(SUGGESTED_PROMPTS[0]));
    expect(onSelect).toHaveBeenCalledWith(SUGGESTED_PROMPTS[0]);
  });
});
