import type { AnswerBlock, ConversationResult, SourceExcerpt } from '../../src/shared/conversation-result';

// Display-only compatibility. Never use this type for admission, writes or receipt validation.
export type SavedExcerpt = Omit<SourceExcerpt, 'documentId' | 'sourceChunkId' | 'contentHash' | 'sourceTitle'> & {
  documentId: string | null; sourceChunkId: string | null; contentHash: string | null; sourceTitle: string | null;
};
export type SavedAnswer = Pick<ConversationResult, 'blocks' | 'language' | 'status'> & { sourceExcerpts: SavedExcerpt[] };
export type PassageFile = { key: string; title: string; excerpts: SavedExcerpt[] };

export function savedIndex(saved: readonly SavedExcerpt[]) {
  return new Map(saved.map(source => [source.responseLocalId, source]));
}

export function passageFiles(block: AnswerBlock, byId: ReadonlyMap<string, SavedExcerpt>): PassageFile[] {
  const files = new Map<string, PassageFile>();
  for (const id of block.sourceIds) {
    const source = byId.get(id);
    if (!source) throw new Error('Missing saved excerpt');
    const key = JSON.stringify(source.documentId === null ? [source.sourcePath, source.sourceRevision] : [source.documentId]);
    const file = files.get(key) ?? { key, title: source.sourceTitle ?? source.sourcePath.split('/').at(-1)!, excerpts: [] };
    file.excerpts.push(source);
    files.set(key, file);
  }
  const groups = [...files.values()];
  return groups.map(file => {
    const sameTitle = groups.filter(other => other.title === file.title);
    if (sameTitle.length === 1) return file;
    const source = file.excerpts[0]!;
    const samePath = sameTitle.filter(other => other.excerpts[0]!.sourcePath === source.sourcePath);
    const details: string[] = [source.sourcePath];
    if (samePath.length > 1) details.push(source.sourceRevision);
    if (source.documentId && samePath.some(other => other !== file && other.excerpts[0]!.sourceRevision === source.sourceRevision)) details.push(source.documentId);
    return { ...file, title: `${file.title} — ${details.join(' · ')}` };
  });
}
