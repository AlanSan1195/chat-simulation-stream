// ============================================
// RATE LIMITER — ventana deslizante en memoria
// ============================================
//
// Dos mecanismos independientes:
// 1. Rate limit por IP: limita requests/ventana a cualquier ruta protegida
// 2. Un stream SSE activo por usuario: si llega uno nuevo, cancela el anterior

// ============================================
// 1. RATE LIMIT POR IP (ventana deslizante)
// ============================================

interface RateLimitEntry {
  timestamps: number[];
}

const ipRateLimits = new Map<string, RateLimitEntry>();

/** Intervalo de limpieza de entradas expiradas (5 min) */
const CLEANUP_INTERVAL = 5 * 60 * 1000;

/** Ventana de tiempo para contar requests (1 min) */
const WINDOW_MS = 60 * 1000;

/** Maximo de requests por IP dentro de la ventana */
const MAX_REQUESTS_PER_WINDOW = 60;

/**
 * Verifica si una IP puede hacer un request.
 * Retorna `true` si esta permitido, `false` si excede el limite.
 */
export function checkIpRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipRateLimits.get(ip);

  if (!entry) {
    ipRateLimits.set(ip, { timestamps: [now] });
    return true;
  }

  // Filtrar timestamps fuera de la ventana
  entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS);
  entry.timestamps.push(now);

  return entry.timestamps.length <= MAX_REQUESTS_PER_WINDOW;
}

/**
 * Obtiene cuantos requests quedan para una IP en la ventana actual.
 */
export function getRemainingRequests(ip: string): number {
  const now = Date.now();
  const entry = ipRateLimits.get(ip);

  if (!entry) return MAX_REQUESTS_PER_WINDOW;

  const active = entry.timestamps.filter((t) => now - t < WINDOW_MS);
  return Math.max(0, MAX_REQUESTS_PER_WINDOW - active.length);
}

// ============================================
// 2. STREAM SSE ACTIVO POR USUARIO
// ============================================
//
// Cada usuario puede tener como máximo 1 stream SSE abierto.
// Si llega una nueva conexión del mismo usuario, el stream anterior
// se cancela automáticamente antes de abrir el nuevo.
// Esto evita cualquier race condition: no hay contadores, no hay slots.

const activeControllers = new Map<string, AbortController>();

/**
 * Registra un nuevo stream SSE para un usuario.
 * Si ya existía uno activo, lo cancela primero.
 * Devuelve el AbortController que el stream debe usar para su cleanup.
 */
export function registerStream(userId: string): AbortController {
  // Cancelar el stream anterior si existe
  activeControllers.get(userId)?.abort();

  const controller = new AbortController();
  activeControllers.set(userId, controller);
  return controller;
}

/**
 * Elimina el registro del stream cuando termina.
 * Solo borra si el controller coincide con el registrado actualmente
 * (evita borrar el de un stream más nuevo que ya lo reemplazó).
 */
export function unregisterStream(userId: string, controller: AbortController): void {
  if (activeControllers.get(userId) === controller) {
    activeControllers.delete(userId);
  }
}

/**
 * Devuelve true si el usuario tiene un stream SSE activo.
 * Usado por chat-wave para validar que hay un stream al que enviar oleadas.
 */
export function hasActiveStream(userId: string): boolean {
  return activeControllers.has(userId);
}

// ============================================
// LIMPIEZA PERIODICA
// ============================================

/**
 * Elimina entradas expiradas del rate limiter de IPs.
 * Se ejecuta automaticamente cada CLEANUP_INTERVAL.
 */
function cleanup(): void {
  const now = Date.now();

  for (const [ip, entry] of ipRateLimits) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS);
    if (entry.timestamps.length === 0) {
      ipRateLimits.delete(ip);
    }
  }
}

// Ejecutar limpieza periodica solo en server (no en build)
if (typeof globalThis.setInterval === 'function') {
  const cleanupId = setInterval(cleanup, CLEANUP_INTERVAL);
  // Permitir que el proceso termine sin esperar al intervalo
  if (typeof cleanupId === 'object' && 'unref' in cleanupId) {
    cleanupId.unref();
  }
}

// ============================================
// CONSTANTES EXPORTADAS (para headers)
// ============================================

export const RATE_LIMIT_WINDOW_MS = WINDOW_MS;
export const RATE_LIMIT_MAX_REQUESTS = MAX_REQUESTS_PER_WINDOW;
