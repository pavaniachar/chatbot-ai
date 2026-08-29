export interface ChatHeaderProps {
  onReset: () => void;
}

export function ChatHeader({ onReset }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
          CA
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight text-zinc-900">Cadre AI</p>
          <p className="text-xs text-zinc-500">Support Assistant</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-600 transition hover:border-zinc-400 hover:text-zinc-900"
      >
        New chat
      </button>
    </header>
  );
}
