import { createHash } from 'node:crypto';
import { chunkIdPreimage, contentHashPreimage, type PublicChunk, type SearchDocument } from '../../src/shared/public-evidence.ts';
import { markdownBlocks, type MarkdownBlock } from './markdown-blocks.ts';

export function sha256(text: string): string { return createHash('sha256').update(text, 'utf8').digest('hex'); }
export function chunkDocument(document: SearchDocument, text: string): PublicChunk[] {
  const blocks = markdownBlocks(text);
  // Only opening blockquotes (before substantive prose) are repeated. Titles
  // and blank lines may precede them; later quoted evidence is not context.
  const opening: MarkdownBlock[] = [];
  for (const block of blocks) {
    if (block.quote) opening.push(block);
    else if (block.text.trim() && !block.sectionStart) break;
  }
  const chunks: PublicChunk[] = [];
  let sectionTitle: string | null = null;
  let packed: MarkdownBlock[] = [];
  let size = 0;
  const flush = () => {
    if (!packed.length) return;
    const start = packed[0]!.start;
    const end = packed.at(-1)!.end;
    const contexts = opening.filter((block) => block.end < start);
    let passageText = '';
    for (const block of packed) passageText += block.text;
    const contextText = contexts.map((block) => block.text).join('');
    const context = contexts.map((block) => ({ start: block.start, end: block.end }));
    const location = `lines:${start}-${end}${context.map((r) => `;context:${r.start}-${r.end}`).join('')}`;
    const ordinal = chunks.length;
    const fields = { documentId: document.documentId, sourcePath: document.sourcePath, sourceTitle: document.sourceTitle,
      sectionTitle, location, text: contextText + passageText, metadata: document.metadata };
    chunks.push({ ...fields, sourceRevision: document.sourceRevision, ordinal, passage: { start, end }, context,
      chunkId: sha256(chunkIdPreimage(document.documentId, ordinal)), contentHash: sha256(contentHashPreimage(fields)) });
    packed = []; size = 0;
  };
  for (const block of blocks) {
    if (block.sectionStart) { flush(); sectionTitle = block.heading; }
    if (packed.length && size + block.text.length > 2_000) flush();
    packed.push(block); size += block.text.length;
  }
  flush();
  return chunks;
}
