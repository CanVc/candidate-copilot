import { isProxy } from 'node:util/types';
import { WORKERS_AI_CANDIDATE, decodeWorkersAIResponse, workersAIReceiver } from '../../src/adapters/llm/workers-ai.ts';
import { D1ResourceCatalog } from '../../src/adapters/d1/publication.ts';
import { D1Retriever } from '../../src/adapters/d1/retriever.ts';
import { ModelAwareIntentPreparation, ProfessionalIntentProcessor } from '../../src/application/professional-intent-processor.ts';
import { EligibleEvidenceContinuation } from '../../src/application/generate-answer.ts';
import type { AdmittedMessage } from '../../src/shared/conversation-admission.ts';
import { completeResult } from '../../src/shared/conversation-result.ts';
import { beforeCutoff, DEFAULT_ATTEMPT_TIMING, startAttemptTimer, type OperationControls } from '../../src/shared/attempt-timing.ts';
import { DEFAULT_MODEL_CONTEXT_BUDGET, validateModelCallIntegrity } from '../../src/shared/model-context-budget.ts';
import { validateClassifyTurnResult } from '../../src/shared/professional-intent.ts';
import type { LLMProvider, AnswerGenerator, ClassificationOptions } from '../../src/ports/LLMProvider.ts';
import type { PreparedModelCall } from '../../src/ports/ModelTokenAccounting.ts';

const limits = {
  classifier: { inputBytes: 12000, maxTokens: 512, outputBytes: 2048, responseBytes: 8192 },
  generator: { inputBytes: 20000, maxTokens: 1024, outputBytes: 4096, responseBytes: 16384 },
};
type Role = keyof typeof limits;
const stages = ['unknown', 'preparation', 'authorization', 'continuation', 'finalization', 'classifier', 'generator', 'teardown'] as const;
const failures = ['unknown', 'local_deadline', 'transport', 'http_rejection', 'unusable_envelope', 'invalid_response'] as const;
type Stage = typeof stages[number];
type Failure = typeof failures[number];

export class PilotObservation {
  stage: Stage = 'unknown';
  #diagnostic?: Readonly<{ stage: Stage; kind: Failure; httpStatus?: number }>;
  get diagnostic() { return this.#diagnostic; }
  noteProcessingFailure(invalidResult: boolean) {
    this.note(invalidResult && (this.stage === 'classifier' || this.stage === 'generator') ? 'invalid_response' : 'unknown');
  }
  note(kind: Failure, status?: number) {
    // JS boundaries: compare by identity to local literals, never coerce caller data.
    const stage = stages.find(s => s === this.stage) ?? 'unknown';
    const safeStatus = typeof status === 'number' && Number.isInteger(status) && status >= 100 && status <= 599 && status !== 200;
    this.#diagnostic ??= Object.freeze(kind === 'http_rejection' && safeStatus ? { stage, kind, httpStatus: status } :
      { stage, kind: failures.find(k => k === kind && k !== 'http_rejection') ?? 'unknown' });
  }
}
export function reservePilotInput(previous: number, role: Role, serialized: string): number {
  const bytes = Buffer.byteLength(serialized);
  if (bytes > limits[role].inputBytes || previous + bytes > 28000) throw new Error('dispatch denied');
  return previous + bytes;
}
interface Attempt {
  observation: PilotObservation;
  parent: AbortSignal;
  consume(): void;
  attempts: Record<Role, number>;
  send(body: string, responseBytes: number, signal: AbortSignal): Promise<unknown>;
}
export async function processQuestion(db: D1Database, message: AdmittedMessage, attempt: Attempt) {
  const { observation } = attempt;
  observation.stage = 'preparation';
  const descriptor = (role: Role) => workersAIReceiver(role, { model: WORKERS_AI_CANDIDATE,
    budget: { ...DEFAULT_MODEL_CONTEXT_BUDGET, output: limits[role].outputBytes } }, limits[role]);
  const classifier = descriptor('classifier'), generator = descriptor('generator');
  let mayGenerate = false, inputBytes = 0, reservedTokens = 0, reservedResponse = 0, reservedOutput = 0;
  async function invoke(role: Role, call: PreparedModelCall, controls?: ClassificationOptions) {
    const d = role === 'classifier' ? classifier : generator, bound = limits[role];
    validateModelCallIntegrity(d, call);
    const signal = controls?.signal;
    inputBytes = reservePilotInput(inputBytes, role, call.serializedInput);
    if (!signal || signal.aborted || !controls.check || attempt.attempts[role] !== 0 || (role === 'generator' && !mayGenerate) ||
        (reservedTokens += bound.maxTokens) > 1536 ||
        (reservedResponse += bound.responseBytes) > 24576 || (reservedOutput += bound.outputBytes) > 6144) throw new Error('dispatch denied');
    const data = JSON.parse(call.data);
    if (data.question !== message.question || data.conversationContext.length || (role === 'generator' && (!data.sourceChunks.length ||
        !data.sourceChunks.every((s: { documentId: string }) => message.submittedScope.eligibleDocumentIds.includes(s.documentId))))) throw new Error('projection');
    controls.check();
    if (role === 'classifier') attempt.consume(); // exclusive, directory-fsynced BEFORE either attempt
    controls.check(); attempt.attempts[role]++;
    observation.stage = role;
    const raw = await attempt.send(call.serializedInput, bound.responseBytes, signal);
    controls.check();
    try {
      const decoded = decodeWorkersAIResponse(raw, d, bound.outputBytes, isProxy);
      if (role === 'classifier') {
        const { decision } = validateClassifyTurnResult(decoded);
        mayGenerate = decision === 'answer' || decision === 'redirect';
      }
      return decoded;
    } catch { observation.note('invalid_response'); return null; }
  }
  const provider: LLMProvider & AnswerGenerator = { receiver: classifier, answerReceiver: generator,
    classify: (c, o) => invoke('classifier', c, o), generateAnswer: (c, o) => invoke('generator', c, o),
    generate: async () => { throw new Error('disabled'); } };
  const continuation = new EligibleEvidenceContinuation(new D1Retriever(db), provider);
  const processor = new ProfessionalIntentProcessor(provider, new ModelAwareIntentPreparation(new D1ResourceCatalog(db), provider),
    { async continue(input) {
      observation.stage = 'continuation';
      const output = await continuation.continue(input);
      if (typeof output !== 'symbol' && 'failure' in output) observation.noteProcessingFailure(output.failure === 'invalid_result');
      return output;
    } });
  const { classifierMs, attemptMs, finalizeReserveMs } = DEFAULT_ATTEMPT_TIMING;
  const clock = { now: () => new Date(performance.timeOrigin + performance.now()) }, start = clock.now().getTime();
  // Observe only the clock checks and timer belonging to this particular cutoff.
  // Parent interruption also aborts the child signal, but is not a deadline.
  function bounded<T>(end: number, run: (controls: OperationControls) => Promise<T>, parent: AbortSignal) {
    const deadline = () => { if (!parent.aborted) observation.note('local_deadline'); };
    return beforeCutoff({ now() {
      const now = clock.now();
      if (now.getTime() >= end) deadline();
      return now;
    } }, (expire, ms) => startAttemptTimer(() => { deadline(); expire(); }, ms), end, run, parent);
  }
  const output = await bounded(start + attemptMs - finalizeReserveMs, controls => processor.process(message, {
    ...controls, precedingMessages: [], contextAvailable: true,
    withinClassification: run => bounded(start + classifierMs, run, controls.signal),
  }), attempt.parent);
  if ('failure' in output) {
    observation.noteProcessingFailure(output.failure === 'invalid_result');
    return { status: output.failure };
  }
  observation.stage = 'finalization';
  const result = completeResult(message, output.draft, output.sources);
  if (clock.now().getTime() >= start + attemptMs) { observation.note('local_deadline'); throw new Error('deadline'); }
  return { status: result.status, result };
}
