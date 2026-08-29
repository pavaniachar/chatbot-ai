export interface ChatHeaderProps {
  onReset: () => void;
}

export function ChatHeader({ onReset }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-4 py-3 backdrop-blur">
      <div>
        <p className="text-sm font-semibold tracking-tight text-white">Cadre AI</p>
        <p className="text-xs text-zinc-400">Support Assistant</p>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="rounded-lg border border-zinc-700 px-2.5 py-1 text-xs text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
      >
        New chat
      </button>
    </header>
  );
}
