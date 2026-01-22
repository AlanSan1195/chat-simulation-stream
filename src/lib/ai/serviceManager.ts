import { groqService } from './services/groq';
import { cerebrasService } from './services/cerebras';
import type { AIService, AIServiceMessage } from './types';

// Lista de servicios disponibles con failover
const services: AIService[] = [
  groqService,
  cerebrasService,
];

let currentServiceIndex = 0;

// Timeout para llamadas a IA (30 segundos)
const AI_TIMEOUT_MS = 30000;

/**
 * Obtiene el siguiente servicio usando round-robin
 */
function getNextService(): AIService {
  const service = services[currentServiceIndex];
  currentServiceIndex = (currentServiceIndex + 1) % services.length;
  return service;
}

/**
 * Wrapper para agregar timeout a promesas
 */
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, serviceName: string): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Timeout: ${serviceName} no respondió en ${timeoutMs / 1000}s`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
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
      console.log(`[AI] Intentando con servicio: ${service.name}`);
      
      const streamPromise = service.chat(messages);
      const stream = await withTimeout(streamPromise, AI_TIMEOUT_MS, service.name);
      
      // Consumir el stream y concatenar la respuesta
      let fullResponse = '';
      const startTime = Date.now();
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        
        // Verificar que no llevemos demasiado tiempo consumiendo el stream
        if (Date.now() - startTime > AI_TIMEOUT_MS) {
          console.warn(`[AI] Stream de ${service.name} excedió timeout, usando respuesta parcial`);
          break;
        }
      }
      
      if (fullResponse.trim().length === 0) {
        throw new Error('Respuesta vacía del servicio de IA');
      }
      
      console.log(`[AI] Respuesta exitosa de ${service.name} (${fullResponse.length} chars)`);
      return fullResponse;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error(`[AI] Error con ${service.name}: ${errorMessage}`);
      lastError = error as Error;
      // Continuar con el siguiente servicio
    }
  }
  
  // Si todos los servicios fallaron, lanzar error descriptivo
  const errorMsg = lastError?.message || 'Error desconocido';
  console.error(`[AI] Todos los servicios fallaron. Último error: ${errorMsg}`);
  throw new Error(`Todos los servicios de IA fallaron: ${errorMsg}`);
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

REGLAS:
- Los comentarios deben ser cortos y medios (1-45 palabras máximo)
- Usa español casual/coloquial con algo de inglés gamer (POG, GG, F, etc.)
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
  "questions": ["frase1", "frase2", ... hasta 20 preguntas que haría el chat],
  "emotes": ["emote1", "emote2", ... hasta 10 combinaciones de emotes]
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
    console.error('[AI] Error parseando respuesta:', parseError);
    console.error('[AI] Respuesta raw:', response);
    throw new Error('No se pudo parsear la respuesta de la IA');
  }
}
