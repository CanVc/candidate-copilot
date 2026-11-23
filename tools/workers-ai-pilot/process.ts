import { isProxy } from 'node:util/types';
import { WORKERS_AI_CANDIDATE, decodeWorkersAIResponse, workersAIReceiver } from '../../src/adapters/llm/workers-ai.ts';
import { D1ResourceCatalog } from '../../src/adapters/d1/publication.ts';
import { D1Retriever } from '../../src/adapters/d1/retriever.ts';
import { ModelAwareIntentPreparation, ProfessionalIntentProcessor } from '../../src/application/professional-intent-processor.ts';
import { EligibleEvidenceContinuation } from '../../src/application/generate-answer.ts';
import type { AdmittedMessage } from '../../src/shared/conversation-admission.ts';
import { completeResult } from '../../src/shared/conversation-result.ts';
import { beforeCutoff, DEFAULT_ATTEMPT_TIMING, startAttemptTimer } from '../../src/shared/attempt-timing.ts';
import { DEFAULT_MODEL_CONTEXT_BUDGET, validateModelCallIntegrity } from '../../src/shared/model-context-budget.ts';
import { validateClassifyTurnResult } from '../../src/shared/professional-intent.ts';
import type { LLMProvider, AnswerGenerator, ClassificationOptions } from '../../src/ports/LLMProvider.ts';
import type { PreparedModelCall } from '../../src/ports/ModelTokenAccounting.ts';

const limits = {
  classifier: { inputBytes: 12000, maxTokens: 512, outputBytes: 2048, responseBytes: 8192 },
  generator: { inputBytes: 20000, maxTokens: 1024, outputBytes: 4096, responseBytes: 16384 },
};
type Role = keyof typeof limits;
export function reservePilotInput(previous: number, role: Role, serialized: string): number {
  const bytes = Buffer.byteLength(serialized);
  if (bytes > limits[role].inputBytes || previous + bytes > 28000) throw new Error('dispatch denied');
  return previous + bytes;
}
interface Attempt {
  parent: AbortSignal;
  consume(): void;
  attempts: Record<Role, number>;
  send(body: string, responseBytes: number, signal: AbortSignal): Promise<unknown>;
}
export async function processQuestion(db: D1Database, message: AdmittedMessage, attempt: Attempt) {
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
    const raw = await attempt.send(call.serializedInput, bound.responseBytes, signal);
    controls.check();
    try {
      const decoded = decodeWorkersAIResponse(raw, d, bound.outputBytes, isProxy);
      if (role === 'classifier') {
        const { decision } = validateClassifyTurnResult(decoded);
        mayGenerate = decision === 'answer' || decision === 'redirect';
      }
      return decoded;
    } catch { return null; }
  }
  const provider: LLMProvider & AnswerGenerator = { receiver: classifier, answerReceiver: generator,
    classify: (c, o) => invoke('classifier', c, o), generateAnswer: (c, o) => invoke('generator', c, o),
    generate: async () => { throw new Error('disabled'); } };
  const processor = new ProfessionalIntentProcessor(provider, new ModelAwareIntentPreparation(new D1ResourceCatalog(db), provider),
    new EligibleEvidenceContinuation(new D1Retriever(db), provider));
  const { classifierMs, attemptMs, finalizeReserveMs } = DEFAULT_ATTEMPT_TIMING;
  const clock = { now: () => new Date(performance.timeOrigin + performance.now()) }, start = clock.now().getTime();
  const output = await beforeCutoff(clock, startAttemptTimer, start + attemptMs - finalizeReserveMs, controls => processor.process(message, {
    ...controls, precedingMessages: [], contextAvailable: true,
    withinClassification: run => beforeCutoff(clock, startAttemptTimer, start + classifierMs, run, controls.signal),
  }), attempt.parent);
  if ('failure' in output) return { status: output.failure };
  const result = completeResult(message, output.draft, output.sources);
  if (clock.now().getTime() >= start + attemptMs) throw new Error('deadline');
  return { status: result.status, result };
}
