import type { APIRoute } from 'astro';
import { generateMessage, getRandomInterval } from '../../lib/chatGenerator';

export const GET: APIRoute = async ({ request, url }) => {
  const gameName = url.searchParams.get('game');

  if (!gameName || gameName.trim().length === 0) {
    return new Response('Invalid game parameter', { status: 400 });
  }

  // Crear stream de texto para SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const sendMessage = () => {
        try {
          const message = generateMessage(gameName);
          const data = `data: ${JSON.stringify(message)}\n\n`;
          controller.enqueue(encoder.encode(data));
        } catch (error) {
          console.error('Error generando mensaje:', error);
        }
      };

      // Función para programar el siguiente mensaje
      const scheduleNext = () => {
        const interval = getRandomInterval(3000, 7000); // 3-7 segundos
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
