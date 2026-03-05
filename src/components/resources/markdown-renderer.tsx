/**
 * Simple Markdown Renderer
 * Handles: ##, **, *, -, numbered lists, paragraphs
 * No external dependencies required.
 */

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // H1
    if (line.startsWith("# ")) {
      elements.push(
        <h1
          key={key++}
          className="mb-4 mt-8 text-2xl font-bold text-zinc-900 first:mt-0 dark:text-white"
        >
          {parseInline(line.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    // H2
    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={key++}
          className="mb-3 mt-6 text-xl font-bold text-zinc-900 dark:text-white"
        >
          {parseInline(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    // H3
    if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={key++}
          className="mb-2 mt-5 text-base font-semibold text-zinc-800 dark:text-zinc-200"
        >
          {parseInline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    // H4
    if (line.startsWith("#### ")) {
      elements.push(
        <h4
          key={key++}
          className="mb-2 mt-4 text-sm font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300"
        >
          {parseInline(line.slice(5))}
        </h4>
      );
      i++;
      continue;
    }

    // Horizontal rule
    if (line.trim() === "---") {
      elements.push(
        <hr key={key++} className="my-6 border-zinc-200 dark:border-zinc-700" />
      );
      i++;
      continue;
    }

    // Unordered list block
    if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("  - ") || line.startsWith("  * ") || line.match(/^- \[[ x]\]/)) {
      const items: React.ReactNode[] = [];
      while (
        i < lines.length &&
        (lines[i].startsWith("- ") || lines[i].startsWith("* ") || lines[i].startsWith("  - ") || lines[i].startsWith("  * "))
      ) {
        const itemLine = lines[i];
        const isNested = itemLine.startsWith("  ");
        const text = itemLine.replace(/^  [-*] /, "").replace(/^[-*] /, "");

        // Checkbox item
        if (text.startsWith("[ ] ") || text.startsWith("[x] ") || text.startsWith("[X] ")) {
          const checked = text.startsWith("[x]") || text.startsWith("[X]");
          items.push(
            <li key={i} className={`flex items-start gap-2 ${isNested ? "mr-4" : ""}`}>
              <span className={`mt-0.5 h-4 w-4 shrink-0 rounded border text-center text-xs leading-none ${checked ? "border-brand-500 bg-brand-500 text-white" : "border-zinc-300 dark:border-zinc-600"}`}>
                {checked ? "✓" : ""}
              </span>
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                {parseInline(text.slice(4))}
              </span>
            </li>
          );
        } else {
          items.push(
            <li key={i} className={`text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 ${isNested ? "mr-4" : ""}`}>
              {parseInline(text)}
            </li>
          );
        }
        i++;
      }
      elements.push(
        <ul key={key++} className="mb-4 list-none space-y-1.5 pe-4">
          {items}
        </ul>
      );
      continue;
    }

    // Ordered list block
    if (line.match(/^\d+\. /)) {
      const items: React.ReactNode[] = [];
      let num = 1;
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        const text = lines[i].replace(/^\d+\. /, "");
        items.push(
          <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
              {num++}
            </span>
            <span className="pt-0.5">{parseInline(text)}</span>
          </li>
        );
        i++;
      }
      elements.push(
        <ol key={key++} className="mb-4 space-y-2">
          {items}
        </ol>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <blockquote
          key={key++}
          className="my-4 border-r-4 border-brand-400 bg-brand-50 py-3 pe-4 ps-4 italic text-zinc-700 dark:border-brand-600 dark:bg-brand-900/10 dark:text-zinc-300"
        >
          {quoteLines.map((l, j) => (
            <p key={j} className="text-sm leading-relaxed">
              {parseInline(l)}
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    // Empty line – paragraph break
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Regular paragraph
    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("- ") &&
      !lines[i].startsWith("* ") &&
      !lines[i].startsWith("> ") &&
      !lines[i].match(/^\d+\. /) &&
      lines[i].trim() !== "---"
    ) {
      paragraphLines.push(lines[i]);
      i++;
    }

    if (paragraphLines.length > 0) {
      elements.push(
        <p
          key={key++}
          className="mb-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300"
        >
          {paragraphLines.map((l, j) => (
            <span key={j}>
              {j > 0 && <br />}
              {parseInline(l)}
            </span>
          ))}
        </p>
      );
    }
  }

  return (
    <div className={`prose-hebrew rtl ${className}`} dir="rtl">
      {elements}
    </div>
  );
}

/** Parse inline markdown: **bold**, *italic*, `code` */
function parseInline(text: string): React.ReactNode {
  if (!text) return null;

  const parts: React.ReactNode[] = [];
  let remaining = text;
  let idx = 0;

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*/);
    if (boldMatch) {
      if (boldMatch[1]) parts.push(<span key={idx++}>{boldMatch[1]}</span>);
      parts.push(<strong key={idx++} className="font-semibold text-zinc-900 dark:text-white">{boldMatch[2]}</strong>);
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Italic: *text*
    const italicMatch = remaining.match(/^(.*?)\*(.+?)\*/);
    if (italicMatch) {
      if (italicMatch[1]) parts.push(<span key={idx++}>{italicMatch[1]}</span>);
      parts.push(<em key={idx++} className="italic">{italicMatch[2]}</em>);
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Code: `text` (using split approach to avoid backtick regex issues in JSX)
    const codeMatch = remaining.match(/^([\s\S]*?)`([^`]+)`/);
    if (codeMatch) {
      if (codeMatch[1]) parts.push(<span key={idx++}>{codeMatch[1]}</span>);
      parts.push(
        <code
          key={idx++}
          className="rounded bg-zinc-100 px-1 py-0.5 text-xs font-mono text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
        >
          {codeMatch[2]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // No more markup – emit the rest as plain text
    parts.push(<span key={idx++}>{remaining}</span>);
    break;
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}
