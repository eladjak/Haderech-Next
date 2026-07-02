import type { ReactNode } from "react";

interface LessonContentProps {
  /** Markdown-like lesson body (headings, lists, quotes, inline emphasis). */
  content: string;
  /** Optional wrapper className. */
  className?: string;
}

/**
 * Renders lesson text written in a lightweight markdown dialect into styled,
 * RTL-friendly Hebrew reading content. Shared by every lesson surface so the
 * reading experience is identical whether a lesson has a video or is
 * text-only. Supports: # / ## / ### headings, `-` / `*` / numbered lists,
 * `>` blockquotes, `---` rules, and inline **bold**, *italic*, `code`.
 */
export function LessonContent({ content, className }: LessonContentProps) {
  return <div className={className}>{renderContent(content)}</div>;
}

function renderContent(content: string): ReactNode[] {
  const lines = content.split("\n");
  const elements: ReactNode[] = [];
  let inList = false;
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul
          key={`list-${elements.length}`}
          className="my-4 list-inside list-disc space-y-2 text-zinc-700 dark:text-zinc-300"
        >
          {listItems.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {formatInline(item)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
    inList = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Headers
    if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(
        <h3
          key={i}
          className="mb-3 mt-8 text-lg font-bold text-zinc-900 dark:text-white"
        >
          {trimmed.slice(4)}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h2
          key={i}
          className="mb-4 mt-10 text-xl font-bold text-zinc-900 dark:text-white"
        >
          {trimmed.slice(3)}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith("# ")) {
      flushList();
      elements.push(
        <h1
          key={i}
          className="mb-4 mt-10 text-2xl font-bold text-zinc-900 dark:text-white"
        >
          {trimmed.slice(2)}
        </h1>
      );
      continue;
    }

    // List items
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      inList = true;
      listItems.push(trimmed.slice(2));
      continue;
    }

    // Numbered list items
    if (/^\d+\.\s/.test(trimmed)) {
      if (!inList) {
        flushList();
        inList = true;
      }
      listItems.push(trimmed.replace(/^\d+\.\s/, ""));
      continue;
    }

    // Empty line
    if (trimmed === "") {
      flushList();
      continue;
    }

    // Horizontal rule
    if (trimmed === "---" || trimmed === "***") {
      flushList();
      elements.push(
        <hr key={i} className="my-8 border-zinc-200 dark:border-zinc-800" />
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      flushList();
      elements.push(
        <blockquote
          key={i}
          className="my-4 border-r-4 border-brand-400 bg-brand-50/50 py-3 pr-4 pl-2 text-zinc-700 dark:border-brand-500 dark:bg-brand-900/10 dark:text-zinc-300"
        >
          {formatInline(trimmed.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p
        key={i}
        className="my-3 leading-relaxed text-zinc-700 dark:text-zinc-300"
      >
        {formatInline(trimmed)}
      </p>
    );
  }

  flushList();
  return elements;
}

function formatInline(text: string): ReactNode {
  // Process **bold**, *italic*, `code` patterns
  const parts: ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const codeMatch = remaining.match(/`(.+?)`/);
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);

    const matches = [
      boldMatch ? { type: "bold", match: boldMatch } : null,
      codeMatch ? { type: "code", match: codeMatch } : null,
      italicMatch ? { type: "italic", match: italicMatch } : null,
    ]
      .filter(Boolean)
      .sort((a, b) => (a!.match.index ?? 0) - (b!.match.index ?? 0));

    if (matches.length === 0 || matches[0] === null) {
      parts.push(remaining);
      break;
    }

    const first = matches[0]!;
    const idx = first.match.index ?? 0;

    if (idx > 0) {
      parts.push(remaining.slice(0, idx));
    }

    if (first.type === "bold") {
      parts.push(
        <strong
          key={keyIdx++}
          className="font-bold text-zinc-900 dark:text-white"
        >
          {first.match[1]}
        </strong>
      );
    } else if (first.type === "code") {
      parts.push(
        <code
          key={keyIdx++}
          className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-sm text-brand-600 dark:bg-zinc-800 dark:text-brand-400"
        >
          {first.match[1]}
        </code>
      );
    } else {
      parts.push(
        <em key={keyIdx++} className="italic">
          {first.match[1]}
        </em>
      );
    }

    remaining = remaining.slice(idx + first.match[0].length);
  }

  return parts.length === 1 ? parts[0] : parts;
}
