import type { MessageCategory, ChatMessage, MessagePattern, StreamMode } from '../utils/types';
import { getPhrasesForGame } from './phraseCache';

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// ============================================
// SHUFFLE POOL DE USERNAMES POR JUEGO
// Garantiza que no se repita un username hasta
// haber rotado todos los disponibles.
// ============================================

interface UsernamePool {
  queue: string[];
  source: string[];
}

const usernamePools = new Map<string, UsernamePool>();

function shuffled<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getNextUsername(gameName: string, usernames: string[]): string {
  let pool = usernamePools.get(gameName);

  // Si no existe pool o la fuente cambió de tamaño (juego recargado), reiniciar
  if (!pool || pool.source.length !== usernames.length) {
    pool = { queue: shuffled(usernames), source: usernames };
    usernamePools.set(gameName, pool);
  }

  // Si se agotó el pool, rebarajar para la siguiente ronda
  if (pool.queue.length === 0) {
    pool.queue = shuffled(pool.source);
  }

  return pool.queue.pop()!;
}

function getRandomCategory(mode: StreamMode): MessageCategory {
  if (mode === 'justchatting') {
    // JC: más comentarios y reacciones, menos preguntas
    const categories: MessageCategory[] = ['comments', 'reactions', 'questions'];
    const weights = [0.50, 0.15, 0.25];
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
  const weights = [0.5, 0.3, 0.2];
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
  usernames: [
    'usersin_vida',
    'lag_eterno',
    'patata_gamer',
    'noobEtterno99',
    'el_delchat',
    'viewer_errandom',
    'pandagamer_x',
    'sombra67',
    'doncomedia',
    'tostadora_pro',
    'abuelitagamer',
    'capitansalami',
    'pinguinoMAAafioso',
    'coci',
    'reyattack',
    'ROCKETMAN',
    'twicki',
    'twick',
    'rockit'
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

  const usernameSource = patterns.usernames?.length ? patterns.usernames : FALLBACK_PHRASES.usernames!;

  return {
    id: crypto.randomUUID(),
    username: getNextUsername(gameName, usernameSource),
    content,
    timestamp: Date.now(),
    category
  };
}

export function getRandomInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
