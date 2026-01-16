# Chat Simulation Stream

Plataforma web para streamers principiantes que simula una audiencia interactiva en tiempo real. Genera mensajes de chat contextuales por videojuego usando frases dinámicas con IA 

## ✅ Puntos clave 

- **Chat en tiempo real** con SSE: el frontend recibe mensajes sin recargar la página.
- **IA con failover**: si falla un proveedor, se intenta con otro.
- **Cache en memoria**: frases y juegos por usuario viven en memoria (no persistente).
- **Límite por usuario**: máximo 4 juegos generados por cuenta.
- **Rutas protegidas**: `/dashboard` y `/api/*` requieren sesión con Clerk.

## 🧭 Flujo principal

1. El usuario inicia sesión en `/sign-in` o `/sign-up`.
2. Ingresa el nombre del juego en el dashboard.
3. El backend genera frases con IA y las cachea.
4. El frontend abre el stream SSE y recibe mensajes cada 2–6 segundos.

## ✨ Características

- 🎮 **Juegos dinámicos**: cualquier juego; fallback con 3 juegos hardcodeados.
- 💬 **Chat simulado**: mensajes con categorías (gameplay, reactions, questions, emotes).
- 🔐 **Autenticación**: Clerk protege dashboard y APIs.



## 🧩 Stack tecnológico

- **Framework**: Astro 5 (SSR)
- **UI**: React 19 + Tailwind CSS 4
- **Auth**: Clerk
- **IA**: Groq + Cerebras (failover)
- **TypeScript**: modo estricto
- **Package Manager**: pnpm

## ✅ Requisitos previos

- Node.js 18+
- pnpm 8+
- Cuenta en https://clerk.com

## ⚙️ Configuración

1. Crea un archivo `.env` en la raíz.
2. Agrega las variables de Clerk (obligatorias):

```env
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxx
```

3. (Opcional) Para generar frases con IA agrega:

```env
GROQ_API_KEY=xxxxxxxxxxxxxxxxxxxxxxx
CEREBRAS_API_KEY=xxxxxxxxxxxxxxxxxxxxxxx
```

## ▶️ Instalación y ejecución

```bash
pnpm install
pnpm dev
```

La app queda en `http://localhost:4321`.

## 🧪 Scripts disponibles

```bash
pnpm dev
pnpm build
pnpm preview
```

## 🔌 Endpoints principales

- **GET `/api/chat-stream?game=...`** → Stream SSE con mensajes.
- **POST `/api/generate-phrases`** → Genera frases con IA y guarda en cache.
- **GET `/api/generate-phrases`** → Devuelve juegos del usuario y slots restantes.

## 🔐 Rutas de la app

- `/` → Landing.
- `/dashboard` → Panel protegido.
- `/sign-in` y `/sign-up` → Autenticación con Clerk.

## 🗂️ Estructura del proyecto (resumen)

```
chat-simulation-stream/
├── src/
│   ├── components/          # UI React
│   ├── layouts/             # Layouts Astro
│   ├── lib/                 # Lógica de negocio
│   │   ├── ai/              # Servicios IA + failover
│   │   ├── chatGenerator.ts # Generador de mensajes
│   │   ├── messagePatterns.ts
│   │   └── phraseCache.ts   # Cache y límites por usuario
│   ├── pages/
│   │   ├── api/             # Endpoints
│   │   ├── dashboard.astro
│   │   └── index.astro
│   ├── styles/
│   └── middleware.ts        # Protección de rutas
├── api/                     # Servidor Bun opcional
└── astro.config.mjs
```

## 🧠 Conceptos clave para estudio

- **SSE (Server-Sent Events)**: conexión abierta desde el backend para enviar eventos en vivo.
- **Cache en memoria**: datos que viven mientras el servidor está en ejecución.
- **Normalización**: se guarda el nombre del juego en minúsculas para comparar fácil.
- **Failover**: si un proveedor de IA falla, se usa el siguiente.
- **Límites por usuario**: 4 juegos como máximo por cuenta.

## 🛠️ Personalización rápida

### Agregar un juego hardcodeado

1. Añade frases en `MESSAGE_PATTERNS`.
2. Mapea el nombre en `hardcodedMapping`.

Archivos clave: [src/lib/messagePatterns.ts](src/lib/messagePatterns.ts) y [src/lib/phraseCache.ts](src/lib/phraseCache.ts).

### Ajustar la frecuencia de mensajes

Modifica el rango en [src/pages/api/chat-stream.ts](src/pages/api/chat-stream.ts). El valor actual es de 2–6 segundos.

### Cambiar el límite por usuario

Edita `MAX_GAMES_PER_USER` en [src/lib/phraseCache.ts](src/lib/phraseCache.ts).

## 🧩 Servicio opcional (Bun)

La carpeta [api/](api/) contiene un servidor Bun alterno con SSE en `/chat`. Úsalo solo si quieres separar el streaming de IA del SSR principal.

## 🤝 Soporte
Si tienes problemas o preguntas, abre un issue en el repositorio.

## Agradecimientos
-Gracias a la herramienta de @midu para tirar de modelos y tener capa gratuita siempre me parecio genial usarla para este tipo de servicios de froma gratuita tambien.