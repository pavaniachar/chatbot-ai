'use client';

import { motion } from 'framer-motion';

export const SUGGESTED_PROMPTS = [
  'What does Cadre AI do?',
  'How do I book a call with an AI strategist?',
  'How do I access my AI Results Dashboard?',
  "What's the AI Maturity Index?",
  'How do you handle data security and choosing which LLM to use?',
] as const;

export interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <div className="flex flex-1 flex-col justify-end gap-3 p-4">
      <p className="px-1 text-xs font-medium text-zinc-400">Try asking:</p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_PROMPTS.map((prompt, index) => (
          <motion.button
            key={prompt}
            type="button"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.06 }}
            onClick={() => onSelect(prompt)}
            className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900"
          >
            {prompt}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
