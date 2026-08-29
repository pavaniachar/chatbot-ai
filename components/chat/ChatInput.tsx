'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

const MAX_TEXTAREA_HEIGHT_PX = 140;

export interface ChatInputProps {
  onSubmit: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSubmit, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const contentHeight = textarea.scrollHeight;
    textarea.style.height = `${Math.min(contentHeight, MAX_TEXTAREA_HEIGHT_PX)}px`;
    textarea.style.overflowY = contentHeight > MAX_TEXTAREA_HEIGHT_PX ? 'auto' : 'hidden';
  }, [value]);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form
      className="flex items-end gap-2 border-t border-zinc-200 bg-white p-3"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
        placeholder="Ask about Cadre AI's services, pricing, or how to get started..."
        className="min-w-0 flex-1 resize-none overflow-y-hidden rounded-2xl border border-zinc-300 bg-white px-3.5 py-2.5 text-base text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-50 sm:text-sm"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="shrink-0 rounded-full bg-zinc-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Send
      </button>
    </form>
  );
}
