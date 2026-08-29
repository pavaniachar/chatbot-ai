'use client';

import ReactMarkdown, { type Components } from 'react-markdown';
import { motion } from 'framer-motion';

const markdownComponents: Components = {
  a: ({ href, children }) => {
    const isExternal = !!href && !href.startsWith('mailto:') && !href.startsWith('tel:');
    return (
      <a href={href} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined}>
        {children}
      </a>
    );
  },
};

export interface MessageBubbleProps {
  role: 'user' | 'assistant';
  text: string;
  isStreaming?: boolean;
}

export function MessageBubble({ role, text, isStreaming = false }: MessageBubbleProps) {
  const isUser = role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      data-role={role}
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-zinc-200 text-zinc-900'
            : 'border border-zinc-200 bg-zinc-50 text-zinc-800'
        }`}
      >
        <div className="[&_p]:my-1 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold [&_a]:underline">
          <ReactMarkdown components={markdownComponents}>{text}</ReactMarkdown>
        </div>
        {isStreaming && (
          <span
            data-testid="streaming-cursor"
            className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-zinc-400 align-middle"
          />
        )}
      </div>
    </motion.div>
  );
}
