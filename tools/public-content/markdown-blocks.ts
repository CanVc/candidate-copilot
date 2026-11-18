export interface MarkdownBlock { start: number; end: number; text: string; heading: string | null; sectionStart: boolean; quote: boolean }
interface Fence { marker: string; length: number }
function fenceStart(line: string): Fence | null {
  const m = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line.replace(/\r?\n$/, ''));
  if (!m || (m[1]![0] === '`' && m[2]!.includes('`'))) return null;
  return { marker: m[1]![0]!, length: m[1]!.length };
}
function fenceEnd(line: string, fence: Fence): boolean {
  const m = /^ {0,3}(`+|~+)[ \t]*$/.exec(line.replace(/\r?\n$/, ''));
  return !!m && m[1]![0] === fence.marker && m[1]!.length >= fence.length;
}
const quote = (line: string) => /^ {0,3}>/.test(line);
const list = (line: string) => /^ {0,3}(?:[-+*]|\d{1,9}[.)])(?:[ \t]+|$)/.test(line.replace(/\r?\n$/, ''));
const isHeading = (line: string) => /^ {0,3}#{1,6}(?:[ \t]|$)/.test(line.replace(/\r?\n$/, ''));
const heading = (line: string) => {
  const m = /^ {0,3}#{1,6}(?:[ \t]+(.+?)|[ \t]*)$/.exec(line.replace(/\r?\n$/, ''));
  return m ? (m[1] ?? '').replace(/(?:^|[ \t]+)#+[ \t]*$/, '').trim() || null : null;
};
// Conservative containers include lazy continuation and indented descendants.
// Blank lines end a container only when the next line cannot belong to it.
// Their contents are already indivisible, so descendant fences need no parsing.
export function markdownBlocks(text: string): MarkdownBlock[] {
  const front = /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.exec(text);
  if (!front) throw new Error('FRONTMATTER_INVALID');
  const lines = text.match(/[^\n]*\n|[^\n]+$/g) ?? [];
  const first = (front[0].match(/\n/g) ?? []).length + (front[0].endsWith('\n') ? 0 : 1);
  const blocks: MarkdownBlock[] = [];
  let i = first;
  while (i < lines.length) {
    const start = i;
    const line = lines[i]!;
    const isQuote = quote(line);
    const isList = list(line);
    const fence = fenceStart(line);
    if (fence) {
      i++;
      while (i < lines.length) { if (fenceEnd(lines[i++]!, fence)) break; }
    } else if (isQuote || isList) {
      while (i < lines.length) {
        const current = lines[i]!;
        const explicit = isQuote ? quote(current) : list(current) || /^[ \t]+\S/.test(current);
        // Blank lines explicitly inside a quote stay in the container.
        if (i > start && !current.trim()) {
          let next = i + 1;
          while (next < lines.length && !lines[next]!.trim()) next++;
          const resumes = next < lines.length && (isQuote ? quote(lines[next]!) : list(lines[next]!) || /^[ \t]+\S/.test(lines[next]!));
          if (!resumes) break;
        }
        if (i > start && !explicit && (isHeading(current) || fenceStart(current) || (isQuote ? list(current) : quote(current)))) break;
        i++;
      }
    } else { i++; }
    let blockText = '';
    // Do not spread an unbounded fence/container into an argument list.
    for (let n = start; n < i; n++) blockText += lines[n]!;
    blocks.push({ start: start + 1, end: i, text: blockText,
      heading: !fence && !isQuote && !isList ? heading(line) : null,
      sectionStart: !fence && !isQuote && !isList && isHeading(line), quote: isQuote });
  }
  return blocks;
}
