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
    <div className="flex flex-1 flex-wrap content-start gap-2 p-4">
      {SUGGESTED_PROMPTS.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onSelect(prompt)}
          className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-indigo-500 hover:text-white"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
