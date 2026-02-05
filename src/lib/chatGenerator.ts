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
  const categories: MessageCategory[] = ['gameplay', 'reactions', 'questions'];
  const weights = [0.4, 0.2, 0.4]; // 40% gameplay, 20% reactions, 40% questions
  
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
    'eres la polla alan san',
    'Bien jugado, pero no le llegas al xokas',
    'Eso estuvo genial, ojala,hagas colab',
    'Que pro pro pro pro',
    'Increible homiee',
    'Brutal he burtal!!',
    'Me encanta este juego',
    'Sigue asi crack',
    'Vas a topeee',
    'Dale con todooo',
    'A por todasss',
    'Eres un maquinaaa',
    'ibai te va a regañar',
    'illojuan ?',
    'mierdon histrico',
    ''
  ],
  reactions: [
    'JAJAJA',
    'WTF',
    'XD',
    'LOL',
    'JAJAJAJASJAJSAJSJAJSA',
    'jajaja',
    'No puede ser, ay no ',
  ],
  questions: [
    'Cuantas horas llevas?',
    'Que tal el juego?',
    'Lo recomiendas?',
    'si es tan bueno como dicen?',
    'Es dificil?',
    'Vale la pena comprarlo?',
    'Cual es tu parte favorita?',
    'Hay muchos bugs?',
    'Se puede jugar en cooperativo?',
    'Que tal los graficos?',
  ],
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
