# AGENTS.md — rocketchat (chat-simulation-stream)

Guía para agentes de codificación que operan en este repositorio.

---

## Stack

- **Framework:** Astro v5 (SSR mode, output: `server`)
- **UI:** React 18 (para componentes interactivos), Astro components (para páginas y layouts)
- **Estilos:** Tailwind CSS v4 via Vite plugin (`@tailwindcss/vite`) — sin PostCSS
- **Auth:** Clerk via `@clerk/astro`
- **IA:** Groq + Cerebras con failover automático (`src/lib/ai/serviceManager.ts`)
- **Deploy:** Vercel con ISR (`@astrojs/vercel`)
- **Lenguaje:** TypeScript estricto (extends `astro/tsconfigs/strict`)

---

## Comandos

```bash
# Desarrollo local
pnpm dev

# Build de producción
pnpm build

# Preview del build
pnpm preview

# Type-check (Astro + TS)
pnpm astro check
```

### Tests

Los tests son e2e generados por TestSprite en `testsprite_tests/` (Python + Playwright).
No hay framework JS/TS de tests instalado. Para ejecutar un test individual:

```bash
python testsprite_tests/TC001_Landing_page_theme_toggles_from_Twitch_to_Kick.py
```

No hay scripts de lint configurados. Usar `pnpm astro check` para validar tipos.

---

## Estructura del proyecto

```
src/
├── components/       # Componentes .astro y .tsx
├── layouts/          # Layout.astro (shell HTML completo con SEO/OG)
├── lib/
│   ├── ai/           # serviceManager, types, services/groq, services/cerebras
│   ├── chatGenerator.ts
│   ├── phraseCache.ts
│   ├── rateLimiter.ts
│   └── waveManager.ts
├── middleware.ts      # Rate limiting → Clerk auth → CSP headers
├── pages/
│   ├── api/          # Endpoints SSR (chat-stream.ts, generate-phrases.ts, chat-wave.ts)
│   └── *.astro
├── styles/
│   └── global.css    # @import tailwind + @theme tokens + @font-face
└── utils/
    └── types.ts      # Todos los tipos e interfaces compartidos
```

---

## Gestión de paquetes

Usar **pnpm** exclusivamente:

```bash
pnpm install
pnpm add <package>
pnpm add -D <package>
pnpm dlx <tool>
```

---

## TypeScript

- Modo **estricto** obligatorio (`extends astro/tsconfigs/strict`)
- Prohibido `any` e `unknown` sin justificación explícita
- Preferir inferencia de tipos siempre que sea posible
- Usar `import type` para importaciones de solo tipos:
  ```ts
  import type { APIRoute } from 'astro'
  import type { ChatMessage } from '../../utils/types'
  ```
- JSX via `react-jsx` (React 17+ automatic runtime), `jsxImportSource: "react"`
- Si los tipos no están claros, aclarar antes de continuar

---

## Estilo de código

### Imports

- Siempre ES modules (`import`/`export`) — el proyecto usa `"type": "module"`
- Importaciones de tipo explícitas con `import type`
- Sin extensión `.ts` en importaciones relativas: `'../../lib/chatGenerator'`
- Iconos de Tabler siempre con importación explícita, **nunca desde barrels**:
  ```ts
  // Correcto
  import { IconMessageCircle, IconPlayerPlay } from '@tabler/icons-react'
  // Incorrecto
  import * as Icons from '@tabler/icons-react'
  ```

### Nombrado

| Entidad | Convención |
|---|---|
| Variables y funciones | `camelCase` |
| Tipos, interfaces, clases | `PascalCase` |
| Constantes de módulo | `UPPER_SNAKE_CASE` |
| Componentes React/Astro | `PascalCase` (default export) |
| API route exports | `export const GET: APIRoute`, `POST`, etc. |

### Comentarios

- Los comentarios están en **español**
- Prefijos de módulo en logs: `[AI]`, `[API]`, `[SSE]`, etc.
- Separadores de sección: `// ============================================`
- JSDoc `/** ... */` para funciones utilitarias exportadas

---

## Manejo de errores

- `try/catch` en todos los endpoints API y llamadas a servicios IA
- Los endpoints siempre devuelven `Response` con `status` y `Content-Type: application/json` explícitos:
  ```ts
  return new Response(JSON.stringify({ error: 'mensaje' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  })
  ```
- Errores personalizados con código adjunto:
  ```ts
  const err = new Error('mensaje')
  ;(err as Error & { code: string }).code = 'INVALID_GAME'
  throw err
  ```
- Failover de servicios IA: iterar array de servicios, capturar por servicio, relanzar el último error si todos fallan
- Operaciones no críticas (ej. wave triggers): `.catch(() => { /* Silenciar errores */ })`
- Logs de error con prefijo de módulo: `console.error('[AI] Error parseando respuesta:', error)`

---

## Componentes React

- **Solo componentes funcionales** con hooks (`useState`, `useEffect`, `useRef`)
- Estado co-ubicado en el componente propietario
- Props tipadas con interfaces inline:
  ```tsx
  interface Props {
    className?: string
    mode: StreamMode
  }
  ```
- Helpers pequeños (ej. iconos SVG inline) definidos en el mismo archivo encima del export principal
- Tailwind para **todos** los estilos — sin CSS modules, sin `style={{}}` excepto para variables CSS dinámicas

### Dark mode

Clases `dark:` de Tailwind. El tema se controla vía `class` en el elemento `<html>`.

---

## Componentes Astro

- El bloque frontmatter (`---`) declara imports e interfaz `Props`
- Destructurar `Astro.props` con valores por defecto cuando aplique
- Páginas estáticas exportan `export const prerender = true`
- Todas las páginas usan `<Layout>` como wrapper (no escribir HTML shell manualmente)
- Las rutas de API exportan `export const GET: APIRoute` / `POST` etc. (sin default export)

---

## Estilos (Tailwind v4)

- `src/styles/global.css` define `@theme` tokens y `@font-face`
- Tailwind se carga como plugin Vite en `astro.config.mjs`, **no** como plugin PostCSS
- No duplicar clases; si un patrón se repite, extraer un componente
- Accesibilidad no es opcional: HTML semántico, roles ARIA, foco gestionado

---

## Variables de entorno

Las claves de API (Groq, Cerebras, Clerk) se configuran en `.env`. No commitear nunca `.env` ni archivos con secretos. Todas las variables de entorno sensibles deben ser `import.meta.env.*` en servidor únicamente (no exponer al cliente).

---

## Antes de commitear

1. `pnpm astro check` — sin errores de tipos
2. Revisar que no se incluyen archivos `.env` ni secretos
3. PRs pequeños y enfocados; título: `[rocketchat] Descripción clara y concisa`

---

## Restricciones

- No añadir dependencias hasta que sean necesarias
- No usar soluciones de estilos alternativas a Tailwind (sin CSS modules, sin styled-components)
- No usar `any` o `unknown` sin justificación
- No importar desde barrels de `@tabler/icons-react`
- No escribir el HTML shell manualmente en páginas; usar siempre `<Layout>`
