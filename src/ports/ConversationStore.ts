import type { ConversationResult } from '../shared/conversation-result.ts';
import type { AdmissionLimits, AdmissionOutcome, AdmissionState, SubmissionIdentity } from '../shared/conversation-admission.ts';
import type { PublicPublication } from './ResourceCatalog.ts';
import type { CreationAllowance, CreationWindow } from '../shared/conversation.ts';

export interface StoredConversation {
  conversationId: string;
  sessionTokenHash: string;
  createdAt: string;
  modifiedAt: string;
}

export interface ConversationStore {
  readAdmissionState(conversationId: string, sessionTokenHash: string, createdAfter: string): Promise<AdmissionState | null>;
  finalize(command: AtomicFinalization): Promise<ConversationResult>;
  admit(command: AtomicAdmission): Promise<AdmissionOutcome>;
  dailyCreationKey(window: CreationWindow): Promise<string>;
  create(conversation: StoredConversation, allowance: CreationAllowance): Promise<'created' | 'rate_limited'>;
  cleanupCreationLimits(): Promise<void>;
  // This identity-only lookup authenticates before any transcript/result lookup.
  findAuthenticated(conversationId: string, sessionTokenHash: string, createdAfter: string): Promise<{ conversationId: string } | null>;
}

export interface AtomicAdmission {
  conversationId: string;
  sessionTokenHash: string;
  requestId: string;
  identity: SubmissionIdentity;
  messageId: string;
  attemptId: string;
  recover: boolean;
  limits: AdmissionLimits;
  publication: PublicPublication;
}

export interface AtomicFinalization {
  conversationId: string;
  sessionTokenHash: string;
  requestId: string;
  attemptId: string;
  result: ConversationResult;
  previousLanguage?: string;
}
