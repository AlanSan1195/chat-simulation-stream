// Tipos base para mensajes de chat
export type MessageCategory = 'gameplay' | 'reactions' | 'questions' ;

export interface MessagePattern {
  gameplay: string[];
  reactions: string[];
  questions: string[];

}

export interface ChatMessage {
  id: string;
  username: string;
  content: string;
  timestamp: number;
  category: MessageCategory;
}

// Tipos para juegos (ahora dinámicos)
export interface Game {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  isCustom?: boolean;
}

export interface StreamConfig {
  gameId: string | null;
  isActive: boolean;
  messageInterval: {
    min: number;
    max: number;
  };
}

// Tipos para servicios de IA
export interface AIServiceMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIService {
  name: string;
  chat: (messages: AIServiceMessage[]) => Promise<AsyncIterable<string>>;
}

// Tipos para cache y límites de usuario
export interface UserGameLimit {
  userId: string;
  games: string[];
  createdAt: number;
}

export interface CachedPhrases {
  gameName: string;
  phrases: MessagePattern;
  generatedAt: number;
  generatedBy: string; // userId que las generó
}

// Respuesta del endpoint generate-phrases
export interface GeneratePhrasesResponse {
  success: boolean;
  gameName: string;
  phrases?: MessagePattern;
  error?: string;
  limitReached?: boolean;
  currentGames?: string[];
}
