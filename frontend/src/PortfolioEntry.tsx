import { useEffect, useRef, useState } from 'react';
import { CREATION_UNCERTAINTY_NOTICE, type CreatedConversation } from '../../src/shared/conversation';
import { countQuestionCharacters, DEFAULT_ADMISSION_LIMITS, type CatalogIdentity } from '../../src/shared/conversation-admission';
import { createEntry, initialScope, submitInitial, type Submission } from './entry-transport';

const suggestions = [
  'Comment les emplacements des objets étaient-ils vérifiés dans les réserves du musée fictif ?',
  'Quelles étapes du suivi des prêts le prototype fictif permettait-il de distinguer ?',
];
const notices = {
  checking: 'Conversation créée. Vérification du périmètre et du traitement disponibles…',
  ready: 'Conversation ouverte. Aucune question envoyée.',
  sending: 'Envoi de la question. En attente de confirmation du service local…',
  recorded: 'Le service local a enregistré un résultat simulé pour cette question.',
  failed: 'Le service local a enregistré un échec de traitement pour cette question.',
  unknown: 'Résultat inconnu : le service a peut-être enregistré la question. Elle ne sera pas renvoyée.',
  stale: 'Le catalogue a changé. La question n’a pas été admise dans le périmètre choisi.',
  scope: 'Les documents publics ne sont pas disponibles dans ce périmètre. Aucun autre périmètre ne sera utilisé.',
  processor: 'Le traitement local n’est pas disponible. Aucun modèle ne prend le relais.',
  access: 'Cette conversation n’est pas accessible.',
  unverified: 'Impossible de vérifier que cette conversation peut recevoir une question. Aucun envoi.',
  rejected: 'Le service local n’a pas accepté cette question.',
} satisfies Record<Submission | 'checking' | 'ready' | 'sending' | 'unverified', string>;
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
  const [notice, setNotice] = useState<keyof typeof notices>('checking');
  const [question, setQuestion] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [free, setFree] = useState(false);
  const lifecycle = useRef<AbortController | null>(null);
  const gate = useRef<'landing' | 'renew' | 'locked' | 'ready'>(screen === 'interrupted' ? 'renew' : 'landing');
  const pending = useRef<{ access: CreatedConversation; scope: CatalogIdentity } | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const stop = () => { lifecycle.current?.abort(); pending.current = null; };
    const leave = () => {
      stop();
      if (location.hash === marker && !readLimit()) {
        gate.current = 'renew'; setQuestion(''); setScreen('interrupted');
      }
    };
    window.addEventListener('pagehide', leave);
    return () => { stop(); window.removeEventListener('pagehide', leave); };
  }, []);
  useEffect(() => {
    if (screen !== 'landing' && screen !== 'creating') heading.current?.focus();
  }, [screen]);

  // React renders may be batched. Claim the action before any await or state update.
  async function send(text: string) {
    if (gate.current !== 'ready' || !pending.current || !lifecycle.current || !text.trim() || countQuestionCharacters(text) > max) return;
    gate.current = 'locked';
    const { access, scope } = pending.current;
    pending.current = null;
    const { signal } = lifecycle.current;
    setSubmitted(true); setNotice('sending');
    const result = await submitInitial(access, scope, text, signal);
    if (!signal.aborted) setNotice(result);
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
    const creation = await createEntry(signal);
    if (signal.aborted) return;
    if (creation.kind === 'limited') {
      setResume(creation.resume); setScreen('limited');
      try { history.replaceState({ entryResume: creation.resume }, '', marker); } catch { /* Keep current confirmed receipt. */ }
      return;
    }
    if (creation.kind === 'rejected') { setScreen('rejected'); return; }
    if (creation.kind === 'uncertain') {
      gate.current = 'renew'; setScreen('uncertain'); return;
    }
    setSubmitted(false); setQuestion(suggestion ?? ''); setFree(suggestion === undefined); setNotice('checking'); setScreen('conversation');
    const scope = await initialScope(creation.access, signal);
    if (signal.aborted) return;
    if (typeof scope === 'string') { setNotice(scope); return; }
    pending.current = { access: creation.access, scope }; gate.current = 'ready';
    if (suggestion === undefined) setNotice('ready');
    else await send(suggestion);
  }

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
      <header className="identity"><span className="badge" aria-hidden="true">BC</span><div>
        <h1 tabIndex={-1} ref={heading}>BC — nom non renseigné</h1>
        <p>Fonction non renseignée</p><p className="meta">Lieu non renseigné</p>
      </div></header>
      <details className="guide" open><summary>Quelques repères</summary>
        <p>Vous pouvez préciser votre contexte ou interroger directement les documents fictifs. Ne partagez pas de mots de passe, de clés API, de journaux confidentiels ni de données personnelles sensibles. Le traitement, lorsqu’il est disponible, est simulé ici, sans fournisseur externe.</p>
      </details>
      <TrustNotice />
      <section className="receipt" aria-label="État de la conversation"><p role="status">{notices[notice]}</p></section>
      {free ? <form className="composer" onSubmit={event => { event.preventDefault(); void send(question); }}>
        <label htmlFor="question">Votre première question</label>
        <textarea id="question" value={question} required readOnly={submitted || notice !== 'ready'}
          aria-describedby="count" onChange={event => setQuestion(event.currentTarget.value)} />
        <div><span className="meta" id="count">{countQuestionCharacters(question)} / {max} caractères</span>
          <button disabled={notice !== 'ready' || !question.trim() || countQuestionCharacters(question) > max}>Envoyer</button></div>
      </form> : <p><strong>Question choisie :</strong> {question}</p>}
    </> : <>
      <h1 ref={heading} tabIndex={-1}>{screen === 'limited' ? 'Limite de création atteinte' : 'Accès à la conversation'}</h1>
      {screen === 'limited' ? <><p>Reprise autorisée à partir du <time dateTime={resume}>{new Date(resume).toLocaleString('fr-FR', { timeZone: 'UTC' })} UTC</time>.</p><a href="/">Retour à l’entrée sans créer de conversation</a></> : screen === 'rejected' ? <><p>La conversation n’a pas été créée. Aucune question envoyée.</p><a href="/">Retour à l’entrée</a></> : <>
        <p>{screen === 'uncertain' ? CREATION_UNCERTAINTY_NOTICE : 'Cette page ne reprend pas un accès interrompu. La création a peut-être abouti. Aucun envoi ni aucune création ne sont relancés. Une nouvelle conversation peut consommer une autre autorisation.'}</p>
        <button onClick={() => void enter()}>Créer une nouvelle conversation vide</button>
      </>}
    </>}
    <footer><a href="/?diagnostic">Diagnostic technique local</a></footer>
  </main>;
}
