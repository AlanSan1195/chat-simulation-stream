import type { APIRoute } from 'astro';
import { generateGamePhrases } from '../../lib/ai';
import { 
  getCachedPhrases, 
  setCachedPhrases, 
  canUserAddGame, 
  addGameToUser,
  getUserGames,
  getRemainingSlots,
  userHasGame,
  normalizeGameName
} from '../../lib/phraseCache';
import type { GeneratePhrasesResponse } from '../../utils/types';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Obtener userId de Clerk
    const auth = locals.auth?.();
    const userId = auth?.userId;

    if (!userId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No autenticado',
        gameName: ''
      } as GeneratePhrasesResponse), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Obtener el nombre del juego del body
    const body = await request.json();
    const { gameName } = body as { gameName: string };

    if (!gameName || typeof gameName !== 'string' || gameName.trim().length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Nombre de juego requerido',
        gameName: ''
      } as GeneratePhrasesResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const normalizedGame = normalizeGameName(gameName);

    // Verificar si ya existe en cache global (cualquier usuario lo generó)
    const existingPhrases = getCachedPhrases(normalizedGame);
    if (existingPhrases) {
      // Agregar a la lista del usuario si no lo tiene
      if (!userHasGame(userId, normalizedGame)) {
        if (!canUserAddGame(userId)) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Has alcanzado el límite de 4 juegos',
            gameName: normalizedGame,
            limitReached: true,
            currentGames: getUserGames(userId)
          } as GeneratePhrasesResponse), {
            status: 429,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        addGameToUser(userId, normalizedGame);
      }

      return new Response(JSON.stringify({
        success: true,
        gameName: normalizedGame,
        phrases: existingPhrases,
        currentGames: getUserGames(userId)
      } as GeneratePhrasesResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar límite de juegos del usuario
    if (!userHasGame(userId, normalizedGame) && !canUserAddGame(userId)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Has alcanzado el límite de 4 juegos. No puedes agregar más.',
        gameName: normalizedGame,
        limitReached: true,
        currentGames: getUserGames(userId)
      } as GeneratePhrasesResponse), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generar nuevas frases con IA
    console.log(`[API] Generando frases para: ${gameName} (usuario: ${userId})`);
    
    const phrases = await generateGamePhrases(gameName);

    // Guardar en cache
    setCachedPhrases(normalizedGame, phrases, userId);
    addGameToUser(userId, normalizedGame);

    console.log(`[API] Frases generadas exitosamente para: ${gameName}`);

    return new Response(JSON.stringify({
      success: true,
      gameName: normalizedGame,
      phrases,
      currentGames: getUserGames(userId)
    } as GeneratePhrasesResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[API] Error generando frases:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor',
      gameName: ''
    } as GeneratePhrasesResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// GET para obtener info del usuario
export const GET: APIRoute = async ({ locals }) => {
  const auth = locals.auth?.();
  const userId = auth?.userId;

  if (!userId) {
    return new Response(JSON.stringify({
      authenticated: false,
      games: [],
      remainingSlots: 0
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({
    authenticated: true,
    games: getUserGames(userId),
    remainingSlots: getRemainingSlots(userId)
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
