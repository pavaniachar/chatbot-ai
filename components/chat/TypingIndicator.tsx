export function TypingIndicator() {
  return (
    <div className="flex w-full justify-start" data-testid="typing-indicator">
      <div className="flex items-center gap-1 rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-3">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" />
      </div>
    </div>
  );
}
