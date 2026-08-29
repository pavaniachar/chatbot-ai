'use client';

import { motion } from 'framer-motion';

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.2 }}
      className="flex w-full items-end gap-2 justify-start"
      data-testid="typing-indicator"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
        CA
      </div>
      <div className="flex items-center gap-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" />
      </div>
    </motion.div>
  );
}
