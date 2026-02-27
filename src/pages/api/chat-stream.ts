import type { APIRoute } from 'astro';
import { generateMessage, getRandomInterval } from '../../lib/chatGenerator';
import type { StreamMode } from '../../utils/types';

const INTERVAL_MIN_BOUND = 500;
const INTERVAL_MAX_BOUND = 30_000;
const HEARTBEAT_INTERVAL = 30_000;

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

      // Heartbeat: comentario SSE cada 30s para mantener viva la conexion
      // contra proxies y balanceadores que cortan conexiones idle
      const heartbeatId = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch {
          // El stream ya fue cerrado, ignorar
        }
      }, HEARTBEAT_INTERVAL);

      const scheduleNext = () => {
        const interval = getRandomInterval(intervalMin, intervalMax);
        return setTimeout(() => {
          sendMessage();
          timeoutId = scheduleNext();
        }, interval);
      };

      let timeoutId = scheduleNext();

      request.signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        clearInterval(heartbeatId);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  });
};
