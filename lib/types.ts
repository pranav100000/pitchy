export interface Persona {
  id: string;
  name: string;
  description: string;
  avatar: string;
  systemPrompt: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  icon: string;
  initialContext: string;
  objectives: string[];
}

export interface ConversationExchange {
  user: string;
  assistant: string;
  timestamp: number;
}

export interface SessionFeedback {
  score: number;
  feedback: string[];
  rawFeedback: string;
}

export interface OpenAIResponse {
  success: boolean;
  response?: string;
  error?: string;
}

export interface TranscriptionResponse {
  success: boolean;
  text?: string;
  error?: string;
}

export interface FeedbackResponse {
  success: boolean;
  score?: number;
  feedback?: string[];
  rawFeedback?: string;
  error?: string;
}

export type GameState = 'setup' | 'conversation' | 'feedback';