import type { APIRoute } from 'astro';
import { generateMessage, getRandomInterval } from '../../lib/chatGenerator';
import type { StreamMode } from '../../utils/types';

const INTERVAL_MIN_BOUND = 500;
const INTERVAL_MAX_BOUND = 30_000;

export const GET: APIRoute = async ({ request, url }) => {
  const gameName = url.searchParams.get('game');
  const mode = (url.searchParams.get('mode') ?? 'game') as StreamMode;

  if (!gameName || gameName.trim().length === 0) {
    return new Response('Invalid game parameter', { status: 400 });
  }

  const rawMin = Number(url.searchParams.get('min'));
  const rawMax = Number(url.searchParams.get('max'));
  const intervalMin = Number.isFinite(rawMin) && rawMin >= INTERVAL_MIN_BOUND ? rawMin : 2000;
  const intervalMax = Number.isFinite(rawMax) && rawMax <= INTERVAL_MAX_BOUND && rawMax > intervalMin ? rawMax : 4000;

  // Crear stream de texto para SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const sendMessage = () => {
        try {
          const message = generateMessage(gameName, mode);
          const data = `data: ${JSON.stringify(message)}\n\n`;
          controller.enqueue(encoder.encode(data));
        } catch (error) {
          console.error('Error generando mensaje:', error);
        }
      };

      // Función para programar el siguiente mensaje
      const scheduleNext = () => {
        const interval = getRandomInterval(intervalMin, intervalMax);
        return setTimeout(() => {
          sendMessage();
          timeoutId = scheduleNext();
        }, interval);
      };

      // Iniciar el loop
      let timeoutId = scheduleNext();

      // Detectar cuando el cliente cierra la conexión
      request.signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
};
