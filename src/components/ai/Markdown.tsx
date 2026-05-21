import { Fragment, type ReactNode } from 'react';

export interface MarkdownProps {
  text: string;
}

/**
 * Lightweight markdown renderer tuned for short Gemini responses.
 * Handles: headings (#, ##, ###), bullets (-, *), numbered lists (1.),
 * bold (**…**), italic (*…*), inline code (`…`), tables (| col | col |),
 * and paragraphs. Not a general-purpose markdown parser — kept tiny.
 */
export function Markdown({ text }: MarkdownProps) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Blank line → skip
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Heading
    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = headingMatch[2];
      const HeadingTag = (`h${Math.min(level + 1, 6)}`) as 'h2' | 'h3' | 'h4';
      const sizeClass =
        level === 1 ? 'text-base font-display font-semibold mt-2 mb-1'
        : level === 2 ? 'text-sm font-display font-semibold mt-2 mb-1'
        : 'text-xs font-display font-semibold uppercase tracking-wide text-slate-500 mt-2 mb-0.5';
      blocks.push(
        <HeadingTag key={`h-${i}`} className={sizeClass}>
          {renderInline(content)}
        </HeadingTag>,
      );
      i++;
      continue;
    }

    // Table — lines starting with | and a separator row of |---|
    if (line.trim().startsWith('|') && i + 1 < lines.length && /^\s*\|[-:\s|]+\|\s*$/.test(lines[i + 1])) {
      const header = parseTableRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(parseTableRow(lines[i]));
        i++;
      }
      blocks.push(
        <div key={`tbl-${i}`} className="my-2 overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                {header.map((cell, j) => (
                  <th
                    key={j}
                    className="border-b border-slate-200 px-2 py-1 text-left font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                  >
                    {renderInline(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri}>
                  {r.map((cell, ci) => (
                    <td
                      key={ci}
                      className="border-b border-slate-100 px-2 py-1 align-top text-slate-700 dark:border-slate-800 dark:text-slate-300"
                    >
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // Bulleted list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      blocks.push(
        <ul key={`ul-${i}`} className="my-1 list-disc space-y-0.5 pl-5 text-sm">
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // Numbered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      blocks.push(
        <ol key={`ol-${i}`} className="my-1 list-decimal space-y-0.5 pl-5 text-sm">
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // Paragraph (collect adjacent non-blank, non-special lines)
    const para: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{1,6})\s/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !lines[i].trim().startsWith('|')
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={`p-${i}`} className="my-1 text-sm text-slate-700 dark:text-slate-200">
        {renderInline(para.join(' '))}
      </p>,
    );
  }

  return <div>{blocks}</div>;
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());
}

const INLINE_TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;

function renderInline(text: string): ReactNode {
  const parts = text.split(INLINE_TOKEN);
  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              key={i}
              className="rounded bg-slate-100 px-1 font-mono text-[11px] text-slate-800 dark:bg-slate-800 dark:text-slate-200"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith('*') && part.endsWith('*') && part.length > 1) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
