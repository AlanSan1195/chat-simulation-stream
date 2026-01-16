# Chat Simulation Stream

Plataforma web para streamers principiantes que simula una audiencia interactiva en tiempo real. Genera mensajes de chat contextuales relacionados con el videojuego que estás jugando.

## Características

- 🎮 **3 Videojuegos soportados**: Red Dead Redemption 2, Baldur's Gate 3, Minecraft
- 💬 **Chat en tiempo real**: Mensajes simulados con frecuencia aleatoria (3-10 segundos)
- 🔐 **Autenticación segura**: Integración con Clerk
- ⚡ **Streaming SSE**: Server-Sent Events para actualizaciones en tiempo real
- 🎨 **UI moderna**: Diseño oscuro optimizado para gaming con Tailwind CSS

## Stack Tecnológico

- **Framework**: Astro 4.x (SSR)
- **UI**: React 19 + Tailwind CSS 4
- **Autenticación**: Clerk
- **Iconos**: Tabler Icons
- **TypeScript**: Modo estricto
- **Package Manager**: pnpm

## Requisitos Previos

- Node.js 18+ 
- pnpm 8+
- Cuenta en [Clerk.com](https://clerk.com)

## Instalación

1. **Instalar dependencias**
   ```bash
   pnpm install
   ```

2. **Configurar variables de entorno**
   
   Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

3. **Obtener API keys de Clerk**

   - Ve a [dashboard.clerk.com](https://dashboard.clerk.com)
   - Crea una nueva aplicación o selecciona una existente
   - En el sidebar, ve a "API Keys"
   - Copia las keys y pégalas en tu archivo `.env`:

   ```env
   PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxx
   CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxx
   ```

4. **Iniciar servidor de desarrollo**
   ```bash
   pnpm dev
   ```

   La aplicación estará disponible en `http://localhost:4321`

## Estructura del Proyecto

```
chat-simulation-stream/
├── src/
│   ├── components/          # Componentes React
│   │   ├── ChatMessage.tsx
│   │   ├── ChatWindow.tsx
│   │   ├── GameSelector.tsx
│   │   └── StreamerDashboard.tsx
│   ├── layouts/
│   │   └── Layout.astro
│   ├── lib/                 # Lógica de negocio
│   │   ├── chatGenerator.ts
│   │   ├── gameData.ts
│   │   └── messagePatterns.ts
│   ├── pages/
│   │   ├── api/
│   │   │   └── chat-stream.ts  # Endpoint SSE
│   │   ├── dashboard.astro     # Dashboard protegido
│   │   └── index.astro         # Landing page
│   ├── styles/
│   │   └── global.css
│   ├── utils/
│   │   └── types.ts
│   └── middleware.ts        # Protección de rutas
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Uso

1. **Iniciar sesión**: Haz clic en "Comenzar mi Stream" en la landing page
2. **Seleccionar juego**: Elige uno de los 3 videojuegos disponibles
3. **Iniciar chat**: Presiona el botón "Iniciar Chat"
4. **Ver mensajes**: Los mensajes comenzarán a aparecer automáticamente
5. **Detener chat**: Usa el botón "Detener Chat" cuando desees

## Scripts Disponibles

```bash
# Desarrollo
pnpm dev

# Build de producción
pnpm build

# Preview del build
pnpm preview
```

## Personalización

### Agregar nuevos juegos

Edita `src/lib/gameData.ts` y `src/lib/messagePatterns.ts`:

```typescript
// gameData.ts
export const GAMES: Game[] = [
  // ... juegos existentes
  {
    id: 'nuevo-juego',
    name: 'nuevo-juego',
    displayName: 'Nuevo Juego',
    icon: '🎮'
  }
];

// messagePatterns.ts
export const MESSAGE_PATTERNS: Record<GameId, MessagePattern> = {
  // ... patrones existentes
  'nuevo-juego': {
    gameplay: ['Mensaje 1', 'Mensaje 2'],
    reactions: ['Reacción 1', 'Reacción 2'],
    questions: ['Pregunta 1', 'Pregunta 2'],
    emotes: ['Emote1', 'Emote2']
  }
};
```

### Ajustar frecuencia de mensajes

Modifica el intervalo en `src/pages/api/chat-stream.ts`:

```typescript
const interval = getRandomInterval(3000, 10000); // 3-10 segundos (actual)
const interval = getRandomInterval(5000, 15000); // 5-15 segundos (ejemplo)
```

## Roadmap Futuro

- [ ] Más videojuegos
- [ ] Control de frecuencia de mensajes por el usuario
- [ ] Diferentes "modos" de audiencia (casual, competitiva, supportive)
- [ ] Persistencia de sesiones en base de datos
- [ ] Estadísticas de uso
- [ ] Integración con OBS como browser source
- [ ] Generación de mensajes con IA (opcional)
- [ ] Emotes visuales con imágenes

## Soporte

Si tienes problemas o preguntas, abre un issue en el repositorio.
