import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { passageFiles, savedIndex, type PassageFile, type SavedAnswer, type SavedExcerpt } from './passage-sources';

const labels = { answered: 'Réponse', partial: 'Réponse partielle', clarification: 'Demande de précision', refused: 'Refus', failed: 'Échec du traitement' };
const fileCount = (n: number) => `${n} fichier${n === 1 ? '' : 's'} source${n === 1 ? '' : 's'}`;

function Excerpt({ source }: { source: SavedExcerpt }) {
  return <section className="saved-excerpt">
    {source.sectionTitle !== null && <h4>{source.sectionTitle}</h4>}
    <blockquote>{source.excerpt}</blockquote>
    <dl className="meta">{Object.entries({ Fichier: source.sourcePath, Révision: source.sourceRevision, Emplacement: source.location,
      Document: source.documentId, Fragment: source.sourceChunkId, Empreinte: source.contentHash }).map(([label, value]) =>
      <div key={label}><dt>{label}</dt><dd>{value ?? 'Non disponible'}</dd></div>)}</dl>
  </section>;
}

function FileRow({ file, sole, initiallyOpen }: { file: PassageFile; sole: boolean; initiallyOpen: boolean }) {
  const [expanded, setExpanded] = useState(initiallyOpen);
  const id = useId();
  const sections = [...new Set(file.excerpts.map(excerpt => excerpt.sectionTitle).filter(title => title !== null))];
  return <section className="file-row" data-selected={initiallyOpen || undefined}>
    <h3>{sole ? file.title : <button aria-expanded={expanded} aria-controls={id} onClick={() => setExpanded(!expanded)}>{file.title}</button>}</h3>
    {!sole && !expanded && sections.length > 0 && <p>{sections.join(' · ')}</p>}
    <div id={id} hidden={!sole && !expanded}>{file.excerpts.map(source => <Excerpt key={source.sourceExcerptId} source={source} />)}</div>
  </section>;
}

type Selection = { activation: number; blockId: string; fileKey: string | null; trigger: HTMLButtonElement };
function SourceViewer({ files, selected, panel, id, close }: {
  files: PassageFile[]; selected: Selection; panel: boolean; id: string; close: (dialog: HTMLDialogElement) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const reading = useRef<{ top: number; focus: HTMLElement | null } | null>(null);
  useLayoutEffect(() => {
    const node = dialog.current!, scroller = list.current!;
    if (panel) node.show(); else node.showModal();
    if (reading.current) {
      scroller.scrollTop = reading.current.top;
      reading.current.focus?.focus({ preventScroll: true });
    } else {
      const row = scroller.querySelector('[data-selected]');
      if (row) scroller.scrollTop += row.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
    }
    return () => {
      const focus = document.activeElement;
      reading.current = { top: scroller.scrollTop, focus: focus instanceof HTMLElement && node.contains(focus) ? focus : null };
      node.close();
    };
  }, [panel]);
  useEffect(() => {
    if (!panel) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented && dialog.current?.open) { event.preventDefault(); close(dialog.current); }
    };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [panel, close]);
  return <dialog id={id} ref={dialog} className={`source-viewer ${panel ? 'margin-panel' : 'modal-sheet'}`}
    aria-labelledby={`${id}-heading`} onCancel={event => { event.preventDefault(); close(event.currentTarget); }}
    onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); close(event.currentTarget); }
      if (!panel && event.key === 'Tab') {
        const buttons = event.currentTarget.querySelectorAll<HTMLElement>('button,[tabindex="0"]');
        const first = buttons[0]!, last = buttons[buttons.length - 1]!;
        if (event.shiftKey && event.target === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && event.target === last) { event.preventDefault(); first.focus(); }
      }
    }}>
    <div className="viewer-head"><h2 id={`${id}-heading`}>Sources du passage</h2>
      <button onClick={() => close(dialog.current!)}>Fermer</button></div>
    <div ref={list} className="viewer-files" tabIndex={0} role="region" aria-label="Fichiers cités">
      {files.map(file => <FileRow key={file.key} file={file} sole={files.length === 1} initiallyOpen={file.key === selected.fileKey} />)}
    </div>
  </dialog>;
}

export function AnswerTurn({ question, result, headingId, viewerAllowed = true, onOpenViewer }: { question: string; result: SavedAnswer; headingId?: string; viewerAllowed?: boolean; onOpenViewer?: () => void }) {
  const column = useRef<HTMLElement>(null);
  const viewerId = useId();
  const activation = useRef(0);
  const [panel, setPanel] = useState(false);
  const [selected, setSelected] = useState<Selection | null>(null);
  useLayoutEffect(() => {
    const measure = () => {
      const spare = document.body.getBoundingClientRect().right - column.current!.getBoundingClientRect().right;
      // 19rem viewer, 1rem clearance at either edge.
      setPanel(spare >= 21 * parseFloat(getComputedStyle(document.documentElement).fontSize));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(column.current!); observer.observe(document.body);
    return () => observer.disconnect();
  }, []);
  function close(dialog: HTMLDialogElement) {
    if (!selected) return;
    const { trigger } = selected;
    // If a resize swapped the trigger presentation, use its visible passage-local equivalent.
    const focus = trigger.getClientRects().length ? trigger : Array.from(trigger.parentElement!.querySelectorAll('button')).find(b => b.getClientRects().length);
    dialog.close();
    setSelected(null); focus?.focus({ preventScroll: true });
  }
  const passages = useMemo(() => {
    const byId = savedIndex(result.sourceExcerpts);
    return result.blocks.map(block => ({ block, files: passageFiles(block, byId) }));
  }, [result]);
  const active = passages.find(({ block }) => block.blockId === selected?.blockId);
  return <article ref={column} className="answer-turn" aria-label="Échange enregistré">
    <p className="sent-question">{question}</p>
    <section className="saved-answer"><h2 id={headingId} tabIndex={-1}>{labels[result.status]}</h2>
      {passages.map(({ block, files }) => {
        const showing = viewerAllowed && selected?.blockId === block.blockId;
        const props = (fileKey: string | null) => ({ 'aria-haspopup': 'dialog' as const,
          'aria-controls': showing ? viewerId : undefined,
          onClick: (event: React.MouseEvent<HTMLButtonElement>) => { onOpenViewer?.(); setSelected({ activation: ++activation.current, blockId: block.blockId, fileKey, trigger: event.currentTarget }); } });
        return <div className="answer-passage" key={block.blockId}><p lang={result.language}>{block.text}</p>
          {files.length > 0 && <div className="citations">
            {files.map(file => <button className="file-token" key={file.key} {...props(file.key)}>{file.title}</button>)}
            <button className="file-count" aria-label={`${fileCount(files.length)} pour ce passage`} {...props(null)}>
              {files.slice(0, 3).map((file, i) => <span className="file-circle" key={file.key} aria-hidden="true">{i + 1}</span>)}
              {files.length > 3 && <span aria-hidden="true">+{files.length - 3}</span>}
            </button>
          </div>}
        </div>;
      })}
    </section>
    {viewerAllowed && selected && active && <SourceViewer key={selected.activation} files={active.files} selected={selected} panel={panel} id={viewerId} close={close} />}
  </article>;
}
