import ReactMarkdown, { type Components } from 'react-markdown';

const markdownComponents: Components = {
  a: ({ href, children }) => {
    const isExternal = !!href && !href.startsWith('mailto:') && !href.startsWith('tel:');
    return (
      <a
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className="underline"
      >
        {children}
      </a>
    );
  },
};

export interface ErrorNoticeProps {
  message: string;
  onRetry: () => void;
}

export function ErrorNotice({ message, onRetry }: ErrorNoticeProps) {
  return (
    <div
      role="alert"
      className="mx-4 mb-2 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700"
    >
      <div className="[&_p]:my-0">
        <ReactMarkdown components={markdownComponents}>{message}</ReactMarkdown>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="shrink-0 rounded-full border border-red-300 px-2.5 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100"
      >
        Retry
      </button>
    </div>
  );
}
