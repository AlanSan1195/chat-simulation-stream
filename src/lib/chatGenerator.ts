import type { MessageCategory, ChatMessage, MessagePattern } from '../utils/types';
import { getPhrasesForGame } from './phraseCache';

const USERNAMES = [
  'ProGaming',
  'Viewer42',
  'Player123',
  'NoobMaster',
  'GamerPro',
  'EpicPlayer',
  'LegendaryKing',
  'DarkNinja',
  'ShadowGamer',
  'DragonSlayer',
  'MasterChief',
  'PixelWarrior',
  'StreamFan',
  'LiveViewer',
  'CoolDude69',
  'xXProXx',
  'GamingTV',
  'PlayerOne',
  'RetroGamer',
  'SpeedRunner'
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateUsername(): string {
  return getRandomElement(USERNAMES);
}

function getRandomCategory(): MessageCategory {
  const categories: MessageCategory[] = ['gameplay', 'reactions', 'questions', 'emotes'];
  const weights = [0.4, 0.3, 0.2, 0.1]; // 40% gameplay, 30% reactions, 20% questions, 10% emotes
  
  const random = Math.random();
  let sum = 0;
  
  for (let i = 0; i < categories.length; i++) {
    sum += weights[i];
    if (random < sum) {
      return categories[i];
    }
  }
  
  return 'gameplay';
}

// Frases genéricas de fallback
const FALLBACK_PHRASES: MessagePattern = {
  gameplay: [
    'Nice!',
    'GG',
    'Bien jugado',
    'Eso estuvo genial',
    'Que pro',
    'Increible',
    'Brutal',
  ],
  reactions: [
    'JAJAJA',
    'XD',
    'LOL',
    'KEKW',
    'No puede ser',
  ],
  questions: [
    'Cuantas horas llevas?',
    'Que tal el juego?',
    'Lo recomiendas?',
  ],
  emotes: [
    'PogChamp',
    'LUL',
    'KEKW',
    'GG',
    'EZ',
  ]
};

/**
 * Genera un mensaje de chat para un juego específico
 * @param gameName - Nombre del juego (puede ser cualquier string)
 */
export function generateMessage(gameName: string): ChatMessage {
  // Obtener frases del cache o fallback
  const patterns = getPhrasesForGame(gameName) || FALLBACK_PHRASES;
  const category = getRandomCategory();
  const messageArray = patterns[category];
  
  // Asegurar que hay contenido
  const content = messageArray.length > 0 
    ? getRandomElement(messageArray)
    : getRandomElement(FALLBACK_PHRASES[category]);
  
  return {
    id: crypto.randomUUID(),
    username: generateUsername(),
    content,
    timestamp: Date.now(),
    category
  };
}

export function getRandomInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
