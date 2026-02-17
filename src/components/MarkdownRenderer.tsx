import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
    return (
        <div className={`prose prose-invert max-w-none 
      prose-headings:font-['Poppins',sans-serif] prose-headings:font-semibold
      prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
      prose-p:text-[var(--text-secondary)] prose-p:font-['Inter',sans-serif] prose-p:leading-7
      prose-a:text-[var(--brand)] prose-a:no-underline hover:prose-a:underline
      prose-strong:text-[var(--text-primary)]
      prose-ul:my-4 prose-li:my-1 prose-li:text-[var(--text-secondary)]
      prose-code:text-[var(--brand)] prose-code:bg-[var(--chip-bg)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-[''] prose-code:after:content-['']
      prose-pre:bg-[var(--bg-elev-1)] prose-pre:border prose-pre:border-[var(--divider)]
      prose-blockquote:border-l-[var(--brand)] prose-blockquote:bg-[var(--chip-bg)] prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
      ${className}`}
        >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
            </ReactMarkdown>
        </div>
    );
}
