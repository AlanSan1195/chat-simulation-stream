import type { ChatMessage as ChatMessageType } from '../utils/types';

interface ChatMessageProps {
  message: ChatMessageType;
  startTime: number;
}

// Paleta de colores vibrantes para usernames (consistente por usuario)
const USERNAME_COLORS = [
  '#53FC18', // verde kick,

  '#9146FF', // morado twitch
  '#FF0000', // rojo 
  '#DAA520', // amarillo
  '#FFFC00', // amarillo neon
  '#FF8CC8', // rosa
  '#74B9FF', // azul claro
  '#8A2BE2', // morado

  '#00CEC9', // cian
  '#E17055', // naranja,
  '#00D8FF', // azul neón
];

const RANDOM_EMOJIS = [
  '😂', '💀', '🔥', '👏', '😭', '🗿', '💯', '😅',
  '🤣', '😤', '🫡', '👀', '😎', '🤯', '💪', '🎮',
  '⭐', '🚀', '😳', '🤡', '😈', '🙏', '😱', '🤩',
];

function getUsernameColor(username: string): string {
  const hash = username.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return USERNAME_COLORS[hash % USERNAME_COLORS.length];
}

function getRandomEmoji(seed: string): string {
  const hash = seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return RANDOM_EMOJIS[hash % RANDOM_EMOJIS.length];
}

function formatTimestamp(startTime: number, messageTime: number): string {
  const elapsed = Math.max(0, Math.floor((messageTime - startTime) / 1000));
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Ícono de persona con sombrero (estilo Twitch spy)
function HatAvatar({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sombrero */}
      <path d="M5 10 Q5 7 12 7 Q19 7 19 10" stroke={color} strokeWidth="1.6" fill={color} fillOpacity="0.15" />
      <rect x="4" y="9.5" width="16" height="2" rx="1" fill={color} />
      {/* Cabeza */}
      <circle cx="12" cy="15" r="4" stroke={color} strokeWidth="1.6" fill={color} fillOpacity="0.15" />
      {/* Ojos */}
      <circle cx="10.5" cy="14.5" r="0.8" fill={color} />
      <circle cx="13.5" cy="14.5" r="0.8" fill={color} />
      {/* Bigote/boca */}
      <path d="M10.5 16.5 Q12 17.5 13.5 16.5" stroke={color} strokeWidth="1" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export default function ChatMessage({ message, startTime }: ChatMessageProps) {
  const usernameColor = getUsernameColor(message.username);
  const emoji = getRandomEmoji(message.id);
  const timestamp = formatTimestamp(startTime, message.timestamp);

  return (
    <div className="flex items-start gap-0 py-1.5 px-2 hover:bg-white/5 transition-colors group">
      {/* Timestamp */}
      <span className="text-white/40 font-jet text-xs w-16 flex-shrink-0 pt-0.5 tabular-nums">
        {timestamp}
      </span>

      {/* Avatar */}
      <div className="flex-shrink-0 mx-2 mt-0.5">
        <HatAvatar color={usernameColor} />
      </div>

      {/* Username + message */}
      <div className="flex-1 min-w-0 text-sm leading-relaxed">
        <span style={{ color: usernameColor }} className="font-semibold">
          {message.username}
        </span>
        <span className="text-white/40">: </span>
        <span className="text-white/90 break-words">
          {message.content}
        </span>
        <span className="ml-1.5 text-base leading-none">{emoji}</span>
      </div>
    </div>
  );
}
