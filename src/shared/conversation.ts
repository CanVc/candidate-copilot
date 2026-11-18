export interface CreatedConversation {
  conversationId: string;
  sessionToken: string;
}

// No admitted-message writer exists until Story 2.7. These states must not imply readiness.
export interface ConversationView {
  conversationId: string;
  transcript: [];
  processing: { status: 'idle' };
  admission: { available: false; reason: 'admission_unavailable' };
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
