export interface CreationWindow { day: number; expiresAt: number }
export interface CreationAllowance extends CreationWindow { dailyKey: string; pseudonym: string; limit: number }

export interface CreatedConversation {
  conversationId: string;
  sessionToken: string;
}

export interface ConversationView {
  conversationId: string;
  transcript: Array<Omit<import('./conversation-admission.ts').AdmittedMessage, 'submissionIdentity' | 'contextAnchorMessageId'> & { status: 'completed' | 'in_progress' | 'interrupted' }>;
  processing: { status: 'idle' } | { status: 'in_progress'; requestId: string };
  admission: { available: true } | { available: false; reason: 'processing_unavailable' | 'conversation_busy' | 'turn_limit_reached' | 'scope_unavailable'; resumeAt?: string };
}

export const CREATION_UNCERTAINTY_NOTICE = 'La création a peut-être abouti, mais son accès n’a pas pu être reçu. Démarrez explicitement une nouvelle conversation ; cela peut consommer une autre autorisation. Aucune question ne sera envoyée automatiquement.';

export class ConversationUnavailable extends Error {
  readonly code = 'conversation_unavailable';
  constructor() { super('conversation_unavailable'); this.name = 'ConversationUnavailable'; }
}
export class ConversationDependencyUnavailable extends Error {
  readonly code = 'conversation_dependency_unavailable';
  constructor() { super('conversation_dependency_unavailable'); this.name = 'ConversationDependencyUnavailable'; }
}

export class ConversationRateLimited extends Error {
  readonly code = 'rate_limited';
  readonly expiresAt: number;
  constructor(expiresAt: number) { super('rate_limited'); this.name = 'ConversationRateLimited'; this.expiresAt = expiresAt; }
}
