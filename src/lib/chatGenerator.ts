import type { MessageCategory, ChatMessage, MessagePattern, StreamMode } from '../utils/types';
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

function getRandomCategory(mode: StreamMode): MessageCategory {
  if (mode === 'justchatting') {
    // JC: más comentarios y reacciones, menos preguntas
    const categories: MessageCategory[] = ['comments', 'reactions', 'questions'];
    const weights = [0.75, 0.10, 0.15];
    const random = Math.random();
    let sum = 0;
    for (let i = 0; i < categories.length; i++) {
      sum += weights[i];
      if (random < sum) return categories[i];
    }
    return 'comments';
  }

  // Modo juego: gameplay y preguntas con peso mayor
  const categories: MessageCategory[] = ['gameplay', 'reactions', 'questions'];
  const weights = [0.5, 0.2, 0.3];
  const random = Math.random();
  let sum = 0;
  for (let i = 0; i < categories.length; i++) {
    sum += weights[i];
    if (random < sum) return categories[i];
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
    '😂😂😂',
    '😭😭😭',
    'el diaaaablo',
    'jajJAjjAAJAJajaJAAJA',
    'XD AJAJ ',
    'yaaaaaaa',
    'mmmmmm',
    'mmm'
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
  comments: [
    'jaja buena historia',
    'eso me pasó igual a mi',
    'no lo puedo creer',
    'sigue contando!!',
    'eso suena brutal',
    'literalmente yo',
    'cuéntame más',
    '😂😂😂',
    'el chat no puede con esto',
  ],
};

/**
 * Genera un mensaje de chat para un juego/tema específico
 */
export function generateMessage(gameName: string, mode: StreamMode = 'game'): ChatMessage {
  const patterns = getPhrasesForGame(gameName) || FALLBACK_PHRASES;
  const category = getRandomCategory(mode);

  // Para JC, si la categoria es 'comments' pero no hay frases (juego en cache sin comments), usar gameplay como fallback
  let messageArray = patterns[category as keyof MessagePattern] ?? [];
  if (!messageArray || messageArray.length === 0) {
    const fallbackCat: keyof MessagePattern = mode === 'justchatting' ? 'comments' : 'gameplay';
    messageArray = FALLBACK_PHRASES[fallbackCat] ?? FALLBACK_PHRASES.gameplay;
  }

  const content = messageArray.length > 0
    ? getRandomElement(messageArray as string[])
    : getRandomElement(FALLBACK_PHRASES.gameplay);

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
