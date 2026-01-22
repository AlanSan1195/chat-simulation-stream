import type { APIRoute } from 'astro';
import { generateMessage, getRandomInterval } from '../../lib/chatGenerator';

// Vercel Serverless tiene un límite de 10s por defecto, 60s en Pro
// Usamos streaming para mantener la conexión viva
export const GET: APIRoute = async ({ request, url, locals }) => {
  // Verificar autenticación
  const auth = locals.auth?.();
  const userId = auth?.userId;

  if (!userId) {
    return new Response(JSON.stringify({ error: 'No autenticado' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const gameName = url.searchParams.get('game');

  if (!gameName || gameName.trim().length === 0) {
    return new Response(JSON.stringify({ error: 'Parámetro game requerido' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  console.log(`[SSE] Iniciando stream para juego: ${gameName}, usuario: ${userId}`);

  // Crear stream de texto para SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let messageCount = 0;
      let isAborted = false;

      const sendMessage = () => {
        if (isAborted) return;
        
        try {
          const message = generateMessage(gameName);
          const data = `data: ${JSON.stringify(message)}\n\n`;
          controller.enqueue(encoder.encode(data));
          messageCount++;
          
          // Log cada 10 mensajes para debugging
          if (messageCount % 10 === 0) {
            console.log(`[SSE] Enviados ${messageCount} mensajes para ${gameName}`);
          }
        } catch (error) {
          console.error('[SSE] Error generando mensaje:', error);
          // Enviar mensaje de error al cliente
          const errorData = `data: ${JSON.stringify({ error: 'Error generando mensaje' })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
        }
      };

      // Función para programar el siguiente mensaje
      const scheduleNext = () => {
        if (isAborted) return null;
        
        const interval = getRandomInterval(3000, 7000); // 3-7 segundos
        return setTimeout(() => {
          sendMessage();
          timeoutId = scheduleNext();
        }, interval);
      };

      // Iniciar el loop
      let timeoutId: ReturnType<typeof setTimeout> | null = scheduleNext();

      // Detectar cuando el cliente cierra la conexión
      request.signal.addEventListener('abort', () => {
        console.log(`[SSE] Conexión cerrada para ${gameName}, mensajes enviados: ${messageCount}`);
        isAborted = true;
        if (timeoutId) clearTimeout(timeoutId);
        try {
          controller.close();
        } catch {
          // Controller ya cerrado
        }
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Desactivar buffering en nginx/proxies
    }
  });
};
