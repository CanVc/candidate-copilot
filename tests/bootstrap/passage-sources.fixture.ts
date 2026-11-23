import type { SavedAnswer, SavedExcerpt } from '../../frontend/src/passage-sources';

function source(id: string, fields: Partial<SavedExcerpt>): SavedExcerpt {
  return { responseLocalId: id, sourceExcerptId: `saved-${id}`, sourcePath: `content/public/${id}.md`, sourceRevision: '1'.repeat(40),
    documentId: id, sourceChunkId: `chunk-${id}`, contentHash: '2'.repeat(64), sectionTitle: `Section ${id}`,
    location: 'lines:8-10', excerpt: `Saved English excerpt ${id}`, sourceTitle: 'Titre partagé <img>', ...fields };
}
export const historical: SavedAnswer = {
  status: 'partial', language: 'en', blocks: [
    { blockId: 'one', kind: 'paragraph', text: 'Saved <em>paragraph</em>\n  Second line.', sourceIds: ['s2', 's1', 's3', 's4', 's5'] },
    { blockId: 'two', kind: 'limitation', text: 'Second passage', sourceIds: ['legacy'] },
  ], sourceExcerpts: [source('s1', { documentId: 's2', sourcePath: 'content/public/s2.md' }), source('s2', {}),
    source('s3', { sourceTitle: 'Archived title' }), source('s4', { sourceTitle: 'File four' }), source('s5', { sourceTitle: 'File five' }),
    source('legacy', { sourceTitle: null, sectionTitle: null, documentId: null, contentHash: null, sourceChunkId: null })],
};
