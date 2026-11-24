import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CREATION_UNCERTAINTY_NOTICE, type CreatedConversation } from '../../src/shared/conversation';
import { countQuestionCharacters, DEFAULT_ADMISSION_LIMITS, type CatalogIdentity } from '../../src/shared/conversation-admission';
import { canSend, claim, editDraft, emptyComposer, inputProblem, resolveRejected, settle, type ComposerState } from './composer-state';
import { createEntry, endOpening, initialScope, readAdmission, receiveOpening, submitAttempt } from './entry-transport';

import { AnswerTurn } from './AnswerTurn';

const suggestions = [
  'Comment les emplacements des objets étaient-ils vérifiés dans les réserves du musée fictif ?',
  'Quelles étapes du suivi des prêts le prototype fictif permettait-il de distinguer ?',
];
const notices = {
  checking: 'Vérification des conditions d’envoi…',
  ready: 'Conversation ouverte. Aucune question envoyée.',
  sending: 'Envoi de la question. En attente de confirmation du service local…',
  recorded: 'Le service local a enregistré un résultat simulé pour cette question.',
  failed: 'Le service local a enregistré un échec de traitement pour cette question.',
  unknown: 'Résultat inconnu : le service a peut-être enregistré la question. Elle ne sera pas renvoyée.',
  stale: 'Le catalogue a changé. L’envoi dans le périmètre choisi est bloqué.',
  scope: 'Les documents publics ne sont pas disponibles dans ce périmètre. Aucun autre périmètre ne sera utilisé.',
  processor: 'Le traitement local n’est pas disponible. Aucun modèle ne prend le relais.',
  access: 'Cette conversation n’est pas accessible.',
  identityUnavailable: 'Impossible de créer l’identifiant de la question. Aucun envoi ; le brouillon est conservé.',
  unverified: 'Impossible de vérifier que cette conversation peut recevoir une nouvelle question. Le prochain envoi est bloqué.',
  busy: 'Une autre question est en cours dans cette conversation. Aucun nouvel envoi.',
  limit: 'La limite de questions de cette conversation est atteinte. Les échanges enregistrés restent consultables.',
};
function statusText(state: ComposerState) {
  if (state.authority.kind === 'access') return state.unknown ? `${notices.access} ${notices.unknown}` : notices.access;
  if (state.pending) return state.unknown ? notices.unknown : notices.sending;
  const last = state.turns.at(-1), reason = state.authority;
  if (reason.kind === 'identityUnavailable') return notices.identityUnavailable;
  const recorded = state.lastRejection ? 'La question n’a pas été admise.' :
    last ? notices[last.result.status === 'failed' ? 'failed' : 'recorded'] : '';
  const restored = state.lastRejection?.restoredAtRevision === state.revision ? 'Son texte a été restauré dans le champ.' : '';
  const guidance = reason.kind === 'ready' && recorded ? '' : notices[reason.kind];
  const when = reason.kind === 'processor' && reason.resumeAt ? ` Reprise indiquée à partir du ${new Date(reason.resumeAt).toLocaleString('fr-FR', { timeZone: 'UTC' })} UTC.` : '';
  return [recorded, restored, guidance].filter(Boolean).join(' ') + when;
}
type Screen = 'landing' | 'creating' | 'uncertain' | 'limited' | 'rejected' | 'interrupted' | 'conversation';
const marker = '#conversation-locale'; // Non-identifying reload marker, never an access credential.
const max = DEFAULT_ADMISSION_LIMITS.maxQuestionCharacters;

function readLimit(): string {
  if (typeof location === 'undefined' || location.hash !== marker) return '';
  try {
    const value: unknown = history.state?.entryResume;
    return typeof value === 'string' && /^\d{4}-\d\d-\d\dT00:00:00\.000Z$/.test(value) &&
      new Date(value).toISOString() === value ? value : '';
  } catch { return ''; }
}
function TrustNotice() {
  return <p className="trust">Les échanges sont enregistrés localement et BC peut les relire. L’accès expire 90 jours après la création ; cela ne garantit pas l’effacement des échanges. Ici, le traitement, s’il est disponible, est simulé : aucun texte n’est envoyé à un fournisseur de modèles. Un fournisseur configuré recevrait la question et le contexte utile de la conversation.</p>;
}

export default function PortfolioEntry() {
  const [resume, setResume] = useState(readLimit);
  const [screen, setScreen] = useState<Screen>(() => resume ? 'limited' : typeof location !== 'undefined' && location.hash === marker ? 'interrupted' : 'landing');
  const [state, render] = useState(emptyComposer);
  const current = useRef(state);
  const [viewer, setViewer] = useState<string | null>(null);
  const lifecycle = useRef<AbortController | null>(null);
  const gate = useRef<'landing' | 'renew' | 'locked'>(screen === 'interrupted' ? 'renew' : 'landing');
  const session = useRef<{ access: CreatedConversation; scope: CatalogIdentity } | null>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const refusalCard = useRef<HTMLElement>(null);
  const sendButton = useRef<HTMLButtonElement>(null);
  const returnLink = useRef<HTMLAnchorElement>(null);
  const focusBeforeDenial = useRef<Element | null>(null);
  useLayoutEffect(() => {
    const previous = focusBeforeDenial.current;
    if (previous && !previous.isConnected) returnLink.current?.focus();
    focusBeforeDenial.current = null;
  }, [state.authority.kind]);
  const heading = useRef<HTMLHeadingElement>(null);
  // Event handlers and transport callbacks share the same synchronous owner;
  // rendering may be batched, but the next action always sees the latest edit/claim.
  function update(next: ComposerState) {
    if (next.authority.kind === 'access') {
      focusBeforeDenial.current = document.activeElement;
      lifecycle.current?.abort(); session.current = null; setViewer(null);
      next = { ...emptyComposer(), authority: next.authority, unknown: next.unknown };
    }
    current.current = next; render(next);
  }
  useEffect(() => {
    const stop = () => { endOpening(lifecycle); session.current = null; };
    const leave = () => {
      const wasOpen = lifecycle.current !== null;
      stop();
      if (wasOpen && !readLimit()) {
        gate.current = 'renew'; update(emptyComposer()); setViewer(null); setScreen('interrupted');
      }
    };
    window.addEventListener('pagehide', leave);
    return () => { stop(); window.removeEventListener('pagehide', leave); };
  }, []);
  useEffect(() => {
    if (screen !== 'landing' && screen !== 'creating') heading.current?.focus();
  }, [screen]);

  async function send() {
    const owner = session.current, signal = lifecycle.current?.signal;
    if (!owner || !signal || signal.aborted) return;
    const state = current.current, next = claim(state, owner.access.conversationId, owner.scope);
    if (next === state) return;
    if (document.activeElement === sendButton.current) field.current?.focus({ preventScroll: true });
    update(next);
    if (!next.pending) return;
    const attempt = next.pending;
    const result = await submitAttempt(owner.access, attempt, next.turns, signal);
    if (signal.aborted || session.current !== owner || current.current.pending !== attempt) return;
    const settled = settle(current.current, attempt, result);
    update(settled);
    if (!settled.pending && settled.authority.kind === 'checking') {
      const { authority, confirmedTurns } = await readAdmission(owner.access, settled.turns, signal,
        result.kind === 'rejected' ? { refused: attempt } : {});
      if (signal.aborted || session.current !== owner || current.current.turns !== settled.turns) return;
      if ('refusalContradicted' in authority) {
        // Only automatic restoration leaves the captured edit revision intact.
        const text = current.current.revision === attempt.revision ? '' : current.current.text;
        if (refusalCard.current?.contains(document.activeElement)) field.current?.focus({ preventScroll: true });
        update({ ...current.current, text, authority, pending: attempt, unknown: true, rejected: null, lastRejection: null, refusedLength: state.refusedLength });
      } else update({ ...current.current, authority, turns: confirmedTurns ?? settled.turns });
    }
  }
  async function enter(suggestion?: string) {
    if (gate.current !== 'landing' && !(gate.current === 'renew' && suggestion === undefined)) return;
    gate.current = 'locked';
    try { history.replaceState(null, '', marker); }
    catch { setScreen('rejected'); return; }
    const controller = new AbortController();
    lifecycle.current = controller;
    const { signal } = controller;
    setScreen('creating');
    await receiveOpening(lifecycle, controller, createEntry(signal), creation => {
      if (creation.kind === 'limited') {
        setResume(creation.resume); setScreen('limited');
        try { history.replaceState({ entryResume: creation.resume }, '', marker); } catch { /* Keep current confirmed receipt. */ }
        return;
      }
      if (creation.kind === 'rejected') { setScreen('rejected'); return; }
      if (creation.kind === 'uncertain') {
        gate.current = 'renew'; setScreen('uncertain'); return;
      }
      update(emptyComposer(suggestion)); setScreen('conversation');
      return receiveOpening(lifecycle, controller, initialScope(creation.access, signal), scope => {
        if ('kind' in scope) { update({ ...current.current, authority: scope }); return; }
        session.current = { access: creation.access, scope };
        update({ ...current.current, authority: { kind: 'ready' } });
        if (suggestion !== undefined) return send();
      });
    });
  }

  const problem = session.current ? inputProblem(state, state.authority.kind === 'ready' && !state.pending) : null;
  const sendHint = state.pending ? (state.unknown ? 'Résultat inconnu' : 'En attente •••') :
    state.authority.kind === 'ready' ? null : {
      checking: 'Vérification en cours', limit: 'Limite atteinte', scope: 'Documents indisponibles', stale: 'Catalogue modifié',
      processor: 'Traitement indisponible', access: 'Accès indisponible', busy: 'Conversation occupée',
      unverified: 'Envoi non vérifié', identityUnavailable: 'Identifiant indisponible',
    }[state.authority.kind];
  function resolve(attempt: NonNullable<ComposerState['rejected']>['attempt'], action: 'restore' | 'discard') {
    update(resolveRejected(current.current, attempt, action));
    field.current?.focus();
  }
  const latest = state.turns.at(-1);
  const rejected = state.rejected;
  const footer = <footer><a href="/?diagnostic">Diagnostic technique local</a></footer>;
  return <main className={screen === 'conversation' ? 'conversation' : 'landing'}>
    {screen === 'landing' || screen === 'creating' ? <>
      <p className="meta">Version locale de développement</p>
      <h1>Candidate Copilot, le portfolio interactif de BC</h1>
      <p>BC a conçu ce portfolio pour explorer un travail documenté en posant une question. Pour cet essai, les documents publics racontent une mission fictive dans un musée, et non le parcours réel de BC.</p>
      <TrustNotice />
      <section className="card" aria-labelledby="entry-heading">
        <h2 id="entry-heading">Par où souhaitez-vous commencer ?</h2>
        <p>Choisissez une question pour l’envoyer à l’ouverture de la conversation.</p>
        {suggestions.map(q => <button className="suggestion" key={q} disabled={screen === 'creating'} onClick={() => void enter(q)}>{q}</button>)}
        <button className="free" disabled={screen === 'creating'} onClick={() => void enter()}>Entrée libre — ouvrir sans envoyer de question</button>
      </section>
      {screen === 'creating' && <p role="status">Ouverture de la conversation…</p>}
    </> : screen === 'conversation' ? <>
      <div className="reading-pane">
        <header className="identity"><span className="badge" aria-hidden="true">BC</span><div>
          <h1 tabIndex={-1} ref={heading}>BC — nom non renseigné</h1>
          <p>Fonction non renseignée</p><p className="meta">Lieu non renseigné</p>
        </div></header>
        <details className="guide" open><summary>Quelques repères</summary>
          <p>Vous pouvez préciser votre contexte ou interroger directement les documents fictifs. Ne partagez pas de mots de passe, de clés API, de journaux confidentiels ni de données personnelles sensibles. Le traitement, lorsqu’il est disponible, est simulé ici, sans fournisseur externe.</p>
        </details>
        <TrustNotice />
        {state.turns.map(({ question, result }) => <AnswerTurn key={result.requestId} question={question} result={result}
          headingId={`answer-${result.requestId}`} viewerAllowed={viewer === result.requestId} onOpenViewer={() => setViewer(result.requestId)} />)}
        {state.pending && <article className="pending-turn" aria-label="Question envoyée, résultat non confirmé">
          <p className="sent-question">{state.pending.body.question}</p>
          {!state.unknown && <span aria-hidden="true" className="waiting"><span className="assistant-badge">Assistant</span> ••• </span>}
        </article>}
        <section className="receipt" aria-label="État de la conversation"><p role="status" className={state.pending && !state.unknown ? 'visually-hidden' : undefined}>{statusText(state)}</p></section>
        {state.authority.kind === 'access' && <a ref={returnLink} href="/">Retour à l’entrée sans créer de conversation</a>}
        {rejected && <section ref={refusalCard} className="card rejected" aria-label="Question non admise"><h2>Question non admise</h2>
          <p>{rejected.attempt.body.question}</p>
          {rejected.reason.kind === 'invalid' && <p>Le service a refusé cette question en raison de sa longueur ({countQuestionCharacters(rejected.attempt.body.question)} caractères).</p>}
          <p>{state.text !== '' ? 'Votre brouillon est conservé. Pour restaurer cette question, videz d’abord le champ.' : 'Vous pouvez restaurer cette question dans le champ vide.'}</p>
          <button type="button" disabled={state.text !== ''} onClick={() => resolve(rejected.attempt, 'restore')}>Restaurer la question</button>{' '}
          <button type="button" onClick={() => resolve(rejected.attempt, 'discard')}>Écarter la question non admise</button>
        </section>}
        {footer}
      </div>
      <form className="composer" onSubmit={event => { event.preventDefault(); void send(); }}>
        <label htmlFor="question">{!state.pending && !state.turns.length ? 'Votre première question' : 'Votre prochaine question'}</label>
        {latest && <button type="button" className="read-latest" onClick={() => document.getElementById(`answer-${latest.result.requestId}`)?.focus()}>Lire le dernier résultat</button>}
        <textarea ref={field} id="question" value={state.text} required readOnly={!session.current}
          aria-invalid={!!state.text && !!problem} aria-describedby={problem ? "count input-guidance" : "count"} rows={3}
          onChange={event => update(editDraft(current.current, event.currentTarget.value))} />
        {problem && <p id="input-guidance">{problem}</p>}
        <div><span className="meta" id="count">{countQuestionCharacters(state.text)} / {max} caractères{sendHint && <small className="send-hint">{sendHint}</small>}</span>
          <button ref={sendButton} disabled={!canSend(state)}>{rejected ? 'Écarter l’essai précédent et envoyer' : 'Envoyer'}</button></div>
      </form>
    </> : <>
      <h1 ref={heading} tabIndex={-1}>{screen === 'limited' ? 'Limite de création atteinte' : 'Accès à la conversation'}</h1>
      {screen === 'limited' ? <><p>Reprise autorisée à partir du <time dateTime={resume}>{new Date(resume).toLocaleString('fr-FR', { timeZone: 'UTC' })} UTC</time>.</p><a href="/">Retour à l’entrée sans créer de conversation</a></> : screen === 'rejected' ? <><p>La conversation n’a pas été créée. Aucune question envoyée.</p><a href="/">Retour à l’entrée</a></> : <>
        <p>{screen === 'uncertain' ? CREATION_UNCERTAINTY_NOTICE : 'Cette page ne reprend pas un accès interrompu. La création a peut-être abouti. Aucun envoi ni aucune création ne sont relancés. Une nouvelle conversation peut consommer une autre autorisation.'}</p>
        <button onClick={() => void enter()}>Créer une nouvelle conversation vide</button>
      </>}
    </>}
    {screen !== 'conversation' && footer}
  </main>;
}
