import { groqService } from './services/groq';
import { cerebrasService } from './services/cerebras';
import type { AIService, AIServiceMessage } from './types';

// Lista de servicios disponibles con failover
const services: AIService[] = [
  groqService,
  cerebrasService,
];

let currentServiceIndex = 0;

/**
 * Obtiene el siguiente servicio usando round-robin
 */
function getNextService(): AIService {
  const service = services[currentServiceIndex];
  currentServiceIndex = (currentServiceIndex + 1) % services.length;
  return service;
}

/**
 * Intenta usar un servicio de IA con failover automático
 */
export async function chatWithAI(messages: AIServiceMessage[]): Promise<string> {
  let lastError: Error | null = null;
  
  // Intentar con cada servicio hasta que uno funcione
  for (let i = 0; i < services.length; i++) {
    const service = getNextService();
    
    try {
      console.log(`[AI] Usando servicio: ${service.name}`);
      const stream = await service.chat(messages);
      
      // Consumir el stream y concatenar la respuesta
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk;
      }
      
      return fullResponse;
    } catch (error) {
      console.error(`[AI] Error con ${service.name}:`, error);
      lastError = error as Error;
      // Continuar con el siguiente servicio
    }
  }
  
  throw lastError || new Error('Todos los servicios de IA fallaron');
}

/**
 * Genera frases de chat para un juego específico usando IA
 */
export async function generateGamePhrases(gameName: string): Promise<{
  gameplay: string[];
  reactions: string[];
  questions: string[];
  emotes: string[];
}> {
  const systemPrompt = `Eres un generador de comentarios de chat de Twitch/YouTube para streams de videojuegos.
Genera comentarios auténticos, variados y entretenidos que los espectadores escribirían durante un stream.

VALIDACIÓN OBLIGATORIA:
- PRIMERO verifica si el input es un videojuego real y conocido.
- Si el input NO es un videojuego (por ejemplo: palabras aleatorias, insultos, frases, contenido sexual, violento o inapropiado, nombres de personas, marcas no relacionadas, comandos, código, etc.), devuelve EXACTAMENTE este JSON y nada más:
  {"error": "INVALID_GAME", "reason": "breve descripción de por qué no es válido"}
- Solo procede a generar frases si el input es claramente un videojuego o franquicia de videojuegos reconocible.

REGLAS para generar frases (solo si el input es un videojuego válido):
- Los comentarios deben ser cortos y medios (1-65 palabras máximo)
- Usa español casual y coloquial
- Incluye variedad: comentarios sobre gameplay, reacciones, preguntas y emotes
- Usa jerga de gamers y cultura de internet
- Incluye emotes populares como: 🤯, 🕹️, 😂, ❤️, 🥲, 🤬,🤓
- Algunos pueden tener emojis pero no abuses
- Varía entre comentarios serios, graciosos, preguntas y reacciones
- NO repitas frases
- Adapta el contenido específicamente al juego mencionado`;

  const userPrompt = `Genera comentarios de chat de Twitch para el videojuego: "${gameName}"

Devuelve EXACTAMENTE este formato JSON (sin markdown, solo el JSON):
{
  "gameplay": ["frase1", "frase2", ... hasta 50 frases sobre gameplay/mecánicas],
  "reactions": ["frase1", "frase2", ... hasta 15 frases de reacciones cortas],
  "questions": ["frase1", "frase2", ... hasta 30 preguntas que haría el chat],
  "emotes": ["emote1", "emote2", ... hasta 20 emotes populares usados en Twitch/YouTube]
}`;

  const response = await chatWithAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]);

  // Parsear la respuesta JSON
  try {
    // Limpiar posibles caracteres extra
    const cleanResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const parsed = JSON.parse(cleanResponse);

    // Detectar rechazo por input inválido
    if (parsed.error === 'INVALID_GAME') {
      const invalidError = new Error(parsed.reason || 'Input no válido');
      (invalidError as Error & { code: string }).code = 'INVALID_GAME';
      throw invalidError;
    }
    
    // Validar estructura
    if (!parsed.gameplay || !parsed.reactions || !parsed.questions || !parsed.emotes) {
      throw new Error('Estructura JSON inválida');
    }
    
    return {
      gameplay: Array.isArray(parsed.gameplay) ? parsed.gameplay : [],
      reactions: Array.isArray(parsed.reactions) ? parsed.reactions : [],
      questions: Array.isArray(parsed.questions) ? parsed.questions : [],
      emotes: Array.isArray(parsed.emotes) ? parsed.emotes : [],
    };
  } catch (parseError) {
    // Re-lanzar errores de validación sin envolverlos
    if ((parseError as Error & { code?: string }).code === 'INVALID_GAME') {
      throw parseError;
    }
    console.error('[AI] Error parseando respuesta:', parseError);
    console.error('[AI] Respuesta raw:', response);
    throw new Error('No se pudo parsear la respuesta de la IA');
  }
}
