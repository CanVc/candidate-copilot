import { expect, it } from 'vitest';
import { passageFiles, savedIndex } from '../../frontend/src/passage-sources';
import { historical } from './passage-sources.fixture';

it('projects response-local edges in saved order, not excerpt array order or title order', () => {
  const files = passageFiles(historical.blocks[0]!, savedIndex(historical.sourceExcerpts));
  expect(files.map(file => file.excerpts.map(source => source.responseLocalId))).toEqual([['s2', 's1'], ['s3'], ['s4'], ['s5']]);
  expect(files[0]!.excerpts[0]).toEqual(historical.sourceExcerpts[1]);
});
it('groups nullable historical identities by saved path AND revision without synthesizing provenance', () => {
  const legacy = historical.sourceExcerpts.at(-1)!;
  const sources = [legacy, { ...legacy, responseLocalId: 'same' }, { ...legacy, responseLocalId: 'revised', sourceRevision: 'b'.repeat(40) },
    { ...legacy, responseLocalId: 'other', sourcePath: 'content/public/other.md' as const }];
  const files = passageFiles({ ...historical.blocks[1]!, sourceIds: sources.map(s => s.responseLocalId) }, savedIndex(sources));
  expect(files.map(file => [file.title, file.excerpts.length])).toEqual([[`legacy.md — ${legacy.sourcePath} · ${legacy.sourceRevision}`, 2], [`legacy.md — ${legacy.sourcePath} · ${'b'.repeat(40)}`, 1], ['other.md', 1]]);
  expect(files.flatMap(file => file.excerpts)).toEqual(sources);
});
it('does not merge distinct saved documents that have the same title', () => {
  const sources = historical.sourceExcerpts.map(source => ({ ...source, sourceTitle: 'Même titre' }));
  const files = passageFiles(historical.blocks[0]!, savedIndex(sources));
  expect(files).toHaveLength(4);
  expect(new Set(files.map(f => f.title)).size).toBe(4);
});
