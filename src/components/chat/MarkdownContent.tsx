"use client";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownContentProps {
  content: string;
  role?: "user" | "assistant";
}

// Helper: detect if a string is predominantly Arabic
function isArabic(text: string): boolean {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  return arabicRegex.test(text);
}

export default function MarkdownContent({ content, role = "assistant" }: MarkdownContentProps) {
  const arabic = isArabic(content);

  return (
    <div
      className={`markdown-body text-sm leading-[1.9] ${arabic ? "font-ui" : "font-sans"}`}
      dir={arabic ? "rtl" : "ltr"}
      style={{
        textAlign: "start",
        wordBreak: "break-word",
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="font-display text-lg font-bold my-3 pb-1 border-b border-[color:var(--line)]" style={{ color: "var(--accent)" }}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="font-display text-base font-bold my-2.5" style={{ color: "var(--accent)" }}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-display text-sm font-semibold my-2" style={{ color: "var(--accent)" }}>
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="my-1.5 leading-[1.9]">{children}</p>,
          ul: ({ children }) => (
            <ul className="my-2.5 space-y-1.5 ps-5 list-disc marker:text-[color:var(--accent)] text-start" dir={arabic ? "rtl" : "ltr"}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2.5 space-y-1.5 ps-5 list-decimal marker:text-[color:var(--accent)] marker:font-semibold text-start" dir={arabic ? "rtl" : "ltr"}>
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-[1.9] ps-1 text-start">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote
              className="my-3 rounded-xl border-s-4 p-3 pe-4 italic font-text text-base"
              style={{
                borderColor: "var(--accent)",
                background: "color-mix(in srgb, var(--accent) 8%, var(--panel))",
                color: "var(--ink)",
              }}
            >
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-3 border-t border-[color:var(--line)]" />,
          strong: ({ children }) => <strong className="font-semibold text-[color:var(--accent)]">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[color:var(--accent)] underline underline-offset-4 hover:opacity-80 transition-opacity"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-[color:var(--line)]">
              <table className="w-full border-collapse text-xs text-start">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-[color:var(--panel)] border-b border-[color:var(--line)]">{children}</thead>,
          th: ({ children }) => <th className="p-2.5 font-semibold text-[color:var(--accent)] text-start">{children}</th>,
          td: ({ children }) => <td className="p-2.5 border-b border-[color:var(--line)] text-start">{children}</td>,
          pre: ({ children }) => (
            <pre
              dir="ltr"
              className="my-2.5 overflow-x-auto rounded-xl border border-[color:var(--line)] bg-neutral-950 p-3 text-xs text-neutral-100 font-mono text-left"
            >
              {children}
            </pre>
          ),
          code: ({ children, className }) => {
            const isCodeBlock = className && className.includes("language-");
            if (isCodeBlock) {
              return <code>{children}</code>;
            }
            return (
              <code
                dir="ltr"
                className="mx-1 inline-block rounded-md border border-[color:var(--line)] bg-[color:var(--solid)] px-1.5 py-0.5 font-mono text-xs text-amber-300"
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
