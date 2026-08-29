export interface ErrorNoticeProps {
  message: string;
  onRetry: () => void;
}

export function ErrorNotice({ message, onRetry }: ErrorNoticeProps) {
  return (
    <div
      role="alert"
      className="mx-4 mb-2 flex items-center justify-between gap-3 rounded-xl border border-red-900 bg-red-950/50 px-4 py-2.5 text-sm text-red-200"
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onRetry}
        className="shrink-0 rounded-lg border border-red-800 px-2.5 py-1 text-xs font-medium text-red-100 transition hover:bg-red-900"
      >
        Retry
      </button>
    </div>
  );
}
