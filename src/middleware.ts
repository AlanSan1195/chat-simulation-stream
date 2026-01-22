import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';
import { defineMiddleware, sequence } from 'astro:middleware';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/(.*)'  // Protege TODOS los endpoints API
]);

// Middleware para headers de seguridad
const securityHeaders = defineMiddleware(async (context, next) => {
  const response = await next();
  const isDev = import.meta.env.DEV;
  
  // Prevenir clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prevenir MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Habilitar XSS protection en navegadores antiguos
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Controlar información del referrer
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Prevenir que el sitio sea embebido (más moderno que X-Frame-Options)
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy - ajustada para Clerk y recursos necesarios
  // En desarrollo permitimos conexiones WebSocket locales para HMR y herramientas
  const connectSrc = isDev 
    ? "connect-src 'self' https://*.clerk.accounts.dev https://api.clerk.com https://clerk-telemetry.com wss://*.clerk.accounts.dev ws://localhost:* ws://127.0.0.1:*"
    : "connect-src 'self' https://*.clerk.accounts.dev https://api.clerk.com https://clerk-telemetry.com wss://*.clerk.accounts.dev";
  
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://challenges.cloudflare.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://*.clerk.com https://img.clerk.com",
    "font-src 'self' data:",
    connectSrc,
    "frame-src 'self' https://challenges.cloudflare.com https://*.clerk.accounts.dev",
    "worker-src 'self' blob:",
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  return response;
});

// Middleware de autenticación con Clerk
const authMiddleware = clerkMiddleware((auth, context) => {
  // clerck nos permite extraer este metodo de redirect y de obtener el userId para seber si el usuario ha iniciado sesión o no
  const { redirectToSignIn, userId } = auth();
  
  if (!userId && isProtectedRoute(context.request)) {
    return redirectToSignIn();
  }
});

// Combinar middlewares: primero auth, luego headers de seguridad
export const onRequest = sequence(authMiddleware, securityHeaders);
