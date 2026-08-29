'use client';

import { motion } from 'framer-motion';

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.2 }}
      role="status"
      className="flex w-full items-end gap-2 justify-start"
      data-testid="typing-indicator"
    >
      <span className="sr-only">Cadre AI is typing…</span>
      <div aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
        CA
      </div>
      <div aria-hidden="true" className="flex items-center gap-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s] motion-reduce:animate-none" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s] motion-reduce:animate-none" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 motion-reduce:animate-none" />
      </div>
    </motion.div>
  );
}
