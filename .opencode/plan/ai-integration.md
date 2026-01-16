# Plan de Integracion: Generacion de Chat con IA

> **Estado**: Pendiente de implementacion  
> **Fecha de creacion**: 2026-01-13  
> **Prioridad**: Feature futura

---

## Objetivo

Reemplazar las frases pregrabadas en `src/lib/messagePatterns.ts` con generacion dinamica mediante IA, permitiendo que el usuario escriba **cualquier videojuego** y obtenga comentarios de chat simulados contextualmente relevantes.

---

## Estado Actual

### Archivos afectados
| Archivo | Funcion actual |
|---------|----------------|
| `src/lib/gameData.ts` | 3 juegos hardcodeados (RDR2, BG3, Minecraft) |
| `src/lib/messagePatterns.ts` | ~140 frases pregrabadas por juego |
| `src/lib/chatGenerator.ts` | Seleccion aleatoria de frases existentes |
| `src/pages/api/chat-stream.ts` | SSE endpoint que usa el generador |
| `src/components/GameSelector.tsx` | Dropdown con juegos fijos |

---

## Arquitectura Propuesta: Modelo Hibrido con Cache

```
[Usuario escribe: "Elden Ring"]
         |
         v
+-------------------------+
|  GameInput.tsx (nuevo)  |  <- Reemplaza GameSelector.tsx
|  - Input de texto libre |
|  - Autocomplete opcional|
+-----------+-------------+
            |
            v
+-----------------------------------------+
|  API: /api/generate-phrases (nuevo)     |
|-----------------------------------------|
|  1. Buscar en cache (DB/KV)             |
|     +- Si existe -> retornar frases     |
|                                         |
|  2. Si no existe:                       |
|     +- Llamar API de IA                 |
|     +- Generar 50-100 frases            |
|     +- Guardar en cache                 |
|     +- Retornar frases                  |
+-----------+-----------------------------+
            |
            v
+-----------------------------------------+
|  API: /api/chat-stream (modificado)     |
|  - Recibe gameId dinamico               |
|  - Usa frases del cache                 |
|  - Seleccion aleatoria igual que ahora  |
+-----------------------------------------+
```

---

## Opciones de API de IA

### Opcion A: Google Gemini Flash (RECOMENDADA para $0)

| Caracteristica | Valor |
|----------------|-------|
| **Costo** | Gratis |
| **Limite** | 60 requests/minuto, 1500/dia |
| **Latencia** | ~300-500ms |
| **Calidad** | Buena |
| **SDK** | @google/generative-ai |

Instalacion:
pnpm add @google/generative-ai

**Configuracion requerida**:
- Crear proyecto en Google Cloud Console
- Habilitar Generative AI API
- Obtener API key
- Agregar GEMINI_API_KEY a .env

### Opcion B: Groq (Alternativa rapida gratuita)

| Caracteristica | Valor |
|----------------|-------|
| **Costo** | Gratis |
| **Limite** | 30 requests/minuto |
| **Latencia** | ~100ms (ultra-rapido) |
| **Modelo** | Llama 3.1 70B |
| **SDK** | groq-sdk |

Instalacion:
pnpm add groq-sdk

### Opcion C: OpenAI GPT-4o-mini (Bajo costo, alta calidad)

| Caracteristica | Valor |
|----------------|-------|
| **Costo** | ~$0.00015/1K tokens input |
| **Limite** | Sin limite (pay as you go) |
| **Latencia** | ~400-600ms |
| **Calidad** | Excelente |

**Costo estimado**: ~$0.001 por generacion de 50 frases

---

## Por que cuesta dinero (y como evitarlo)

### El problema
Cada llamada a la API de IA cobra por **tokens** (palabras procesadas):
- **Sin cache**: 360 mensajes/sesion x $0.0001 = ~$0.036/sesion
- **100 usuarios/dia** = $3.60/dia = **~$108/mes**

### La solucion: Cache hibrido
- **Con cache**: 1 llamada/juego x $0.001 = ~$0.001/juego nuevo
- **100 usuarios, 50 juegos unicos** = $0.05/mes = **practicamente $0**

---

## Estrategia de Cache

### Opcion 1: Cache en memoria (simple, efimero)
- **Pro**: Sin dependencias externas
- **Contra**: Se pierde al reiniciar servidor

### Opcion 2: Vercel KV / Upstash Redis (persistente, gratis)
- **Limite gratis**: 10K requests/dia, 256MB storage
- **Pro**: Persistente, compartido entre usuarios

### Opcion 3: SQLite/Turso (persistente, escalable)
- **Pro**: Base de datos real, queries SQL
- **Contra**: Mas setup inicial

---

## Nuevos Archivos a Crear

src/
+-- lib/
|   +-- aiService.ts          # Cliente de IA (Gemini/Groq/OpenAI)
|   +-- phraseCache.ts        # Sistema de cache
|   +-- phraseGenerator.ts    # Logica de generacion + cache
|
+-- pages/api/
|   +-- generate-phrases.ts   # Endpoint para generar frases
|
+-- components/
    +-- GameInput.tsx         # Input de texto libre para juego

---

## Archivos a Modificar

### 1. src/components/GameSelector.tsx -> GameInput.tsx
- Cambiar de dropdown a input de texto
- Agregar debounce para evitar llamadas excesivas
- Mostrar loading state mientras genera

### 2. src/pages/api/chat-stream.ts
- Aceptar cualquier gameName (no solo IDs predefinidos)
- Buscar frases en cache dinamico
- Fallback a frases genericas si no hay cache

### 3. src/components/StreamerDashboard.tsx
- Manejar estado de generacion de frases
- Mostrar feedback al usuario ("Generando chat para Elden Ring...")

### 4. src/utils/types.ts
- Hacer GameId dinamico (string en lugar de literal union)
- Agregar tipos para respuesta de IA

---

## Variables de Entorno Nuevas

GEMINI_API_KEY=tu_api_key_aqui
# O alternativamente:
GROQ_API_KEY=tu_api_key_aqui
OPENAI_API_KEY=tu_api_key_aqui

# Para cache persistente (opcional)
KV_REST_API_URL=...
KV_REST_API_TOKEN=...

---

## Flujo de Implementacion (Orden Sugerido)

### Fase 1: Setup de IA
1. [ ] Elegir proveedor de IA (Gemini recomendado)
2. [ ] Crear cuenta y obtener API key
3. [ ] Crear src/lib/aiService.ts
4. [ ] Probar generacion basica

### Fase 2: Sistema de Cache
5. [ ] Crear src/lib/phraseCache.ts
6. [ ] Implementar cache en memoria (MVP)
7. [ ] Crear endpoint /api/generate-phrases

### Fase 3: Integracion UI
8. [ ] Crear src/components/GameInput.tsx
9. [ ] Modificar StreamerDashboard.tsx
10. [ ] Actualizar chat-stream.ts para usar cache

### Fase 4: Optimizaciones
11. [ ] Agregar rate limiting
12. [ ] Implementar cache persistente (Redis/KV)
13. [ ] Pre-generar juegos populares (Top 50)
14. [ ] Agregar fallback para errores de API

---

## Estimacion de Costos Finales

| Escenario | API | Costo/mes |
|-----------|-----|-----------|
| Hobby (10 usuarios, 50 juegos unicos) | Gemini Flash | **$0** |
| Pequeno (100 usuarios, 200 juegos) | Gemini Flash | **$0** |
| Mediano (1000 usuarios, 500 juegos) | Gemini Flash | **$0** (dentro de limites) |
| Grande (10K+ usuarios) | GPT-4o-mini | ~$5-20/mes |

**Con el modelo hibrido (generar una vez, cachear), el costo es practicamente $0 para uso normal.**

---

## Preguntas Pendientes (Resolver antes de implementar)

1. Que API preferir? Gemini (gratis) vs OpenAI (mejor calidad, costo minimo)
2. Cache persistente? En memoria (simple) vs Redis/KV (persistente)
3. Limites por usuario? Maximo de juegos custom por usuario free?
4. Pre-generar juegos populares? Incluir Top 50-100 juegos al hacer build?
5. Fallback? Que hacer si la API falla? Frases genericas?

---

## Referencias

- Google Gemini API Docs: https://ai.google.dev/docs
- Groq API Docs: https://console.groq.com/docs
- Vercel KV: https://vercel.com/docs/storage/vercel-kv
- Upstash Redis: https://upstash.com/
