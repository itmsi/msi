"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { FC, ReactNode } from "react";
import { useRef, useEffect, useState } from "react";

// ─── Scrollable Wrapper (for tables, code blocks) ────────────────────────────

const ScrollableWrapper: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className = "",
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkOverflow = () => {
      if (el) {
        setIsOverflowing(el.scrollWidth > el.clientWidth + 2);
      }
    };

    checkOverflow();

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(el);

    return () => observer.disconnect();
  }, [children]);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={scrollRef}
        className="overflow-x-auto
          [&::-webkit-scrollbar]:h-1.5
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-gray-300
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:hover:bg-gray-400
        "
      >
        {children}
      </div>

      {/* Scroll indicator: gradient + arrow */}
      {isOverflowing && (
        <>
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/70 to-transparent rounded-r-xl" />
          <div className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-3.5 h-3.5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Custom code block renderer ──────────────────────────────────────────────

const CodeBlock: FC<{ className?: string; children?: ReactNode }> = ({
  className,
  children,
}) => {
  const code = String(children).replace(/\n$/, "");
  return (
    <div className="my-3">
      <ScrollableWrapper className="rounded-xl border border-gray-800">
        <pre className="bg-gray-900 text-gray-100 p-4 text-sm leading-relaxed font-mono">
          <code className={className}>{code}</code>
        </pre>
      </ScrollableWrapper>
    </div>
  );
};

// ─── Main MarkdownText component ─────────────────────────────────────────────

export function MarkdownText({ content }: { content: string }) {
  if (!content) return null;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Paragraphs
        p({ children }) {
          return <p className="text-sm text-gray-800 font-secondary leading-relaxed mb-2 last:mb-0">{children}</p>;
        },
        // Bold
        strong({ children }) {
          return <strong className="font-primary-bold text-gray-900">{children}</strong>;
        },
        // Lists
        ul({ children }) {
          return <ul className="list-disc pl-5 mb-2 space-y-1 last:mb-0">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="list-decimal pl-5 mb-2 space-y-1 last:mb-0">{children}</ol>;
        },
        li({ children }) {
          return <li className="text-sm text-gray-800 font-secondary leading-relaxed">{children}</li>;
        },
        // Headings
        h1({ children }) {
          return <h1 className="text-base font-primary-bold text-gray-900 mb-2 mt-3 first:mt-0">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-sm font-primary-bold text-gray-900 mb-1 mt-3 first:mt-0">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-sm font-primary-bold text-gray-900 mb-1 mt-2 first:mt-0">{children}</h3>;
        },
        // Links
        a({ href, children }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0253a5] hover:text-[#003061] underline decoration-[#0253a5]/30 hover:decoration-[#0253a5] transition-all"
            >
              {children}
            </a>
          );
        },
        // Code (inline)
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          if (match || String(children).includes("\n")) {
            return <CodeBlock className={className}>{children as string}</CodeBlock>;
          }
          return (
            <code
              className="bg-gray-100 text-[#0253a5] px-1.5 py-0.5 rounded-md text-xs font-mono"
              {...props}
            >
              {children}
            </code>
          );
        },
        // Blockquotes
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-[#0253a5] bg-gray-50 py-2 px-4 my-2 rounded-r-lg">
              {children}
            </blockquote>
          );
        },
        // Tables
        table({ children }) {
          return (
            <ScrollableWrapper className="my-3 rounded-xl">
              <table className="min-w-full border-collapse border border-gray-200">{children}</table>
            </ScrollableWrapper>
          );
        },
        th({ children }) {
          return (
            <th className="px-4 py-2.5 bg-gray-50 text-left text-xs font-primary-bold text-gray-600 uppercase tracking-wider whitespace-nowrap border border-gray-200">
              {children}
            </th>
          );
        },
        td({ children }) {
          return (
            <td className="px-4 py-2.5 text-sm text-gray-600 font-secondary whitespace-nowrap border border-gray-200">
              {children}
            </td>
          );
        },
        hr() {
          return <hr className="my-4 border-gray-200" />;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
