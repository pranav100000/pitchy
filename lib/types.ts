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

export interface ResearchData {
  query: string;
  summary: string;
  keyPoints: string[];
  sources: string[];
  timestamp: number;
}

export interface ResearchResponse {
  success: boolean;
  data?: ResearchData;
  error?: string;
}

export interface PitchLength {
  id: string;
  name: string;
  duration: number; // in seconds
  description: string;
}

export interface PitchSession {
  persona: Persona;
  pitchLength: PitchLength;
  transcript: string;
  duration: number; // actual duration in seconds
  timestamp: number;
}

export interface PitchFeedback {
  score: number;
  feedback: string[];
  rawFeedback: string;
  criteria: {
    clarity: number;
    persuasiveness: number;
    structure: number;
    timeManagement: number;
    personaRelevance: number;
  };
  criteriaJustifications: {
    clarity: string;
    persuasiveness: string;
    structure: string;
    timeManagement: string;
    personaRelevance: string;
  };
}

export interface PitchFeedbackResponse {
  success: boolean;
  feedback?: PitchFeedback;
  error?: string;
}

export type GameState = 'research' | 'setup' | 'conversation-setup' | 'pitch-setup' | 'conversation' | 'feedback' | 'pitch' | 'pitch-feedback';