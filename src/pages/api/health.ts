import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'ok' as 'ok' | 'error',
    services: {
      groq: {
        configured: !!import.meta.env.GROQ_API_KEY,
        keyPrefix: import.meta.env.GROQ_API_KEY?.substring(0, 8) + '...' || 'NOT SET'
      },
      cerebras: {
        configured: !!import.meta.env.CEREBRAS_API_KEY,
        keyPrefix: import.meta.env.CEREBRAS_API_KEY?.substring(0, 8) + '...' || 'NOT SET'
      },
      clerk: {
        configured: !!import.meta.env.CLERK_SECRET_KEY,
        keyPrefix: import.meta.env.CLERK_SECRET_KEY?.substring(0, 8) + '...' || 'NOT SET'
      }
    },
    errors: [] as string[]
  };

  // Verificar configuración
  if (!import.meta.env.GROQ_API_KEY) {
    checks.errors.push('GROQ_API_KEY no está configurada');
  }
  if (!import.meta.env.CEREBRAS_API_KEY) {
    checks.errors.push('CEREBRAS_API_KEY no está configurada');
  }
  if (!import.meta.env.CLERK_SECRET_KEY) {
    checks.errors.push('CLERK_SECRET_KEY no está configurada');
  }

  if (checks.errors.length > 0) {
    checks.status = 'error';
  }

  return new Response(JSON.stringify(checks, null, 2), {
    status: checks.status === 'ok' ? 200 : 503,
    headers: { 'Content-Type': 'application/json' }
  });
};
