import type { ChatMessage as ChatMessageType } from '../utils/types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  // Determinar tipo de icono basado en username
  const getIcon = (username: string) => {
    const index = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 2;
    // Alternar entre flor y robot
    return index === 0 ? 'flower' : 'robot';
  };

  const iconType = getIcon(message.username);

  return (
    <div className="flex items-start gap-3 py-2 px-2 hover:bg-[#1a1a1a]/50 rounded transition-colors animate-fade-in">
      {/* Icon */}
      <div className="flex-shrink-0 text-[#e07b5a] mt-0.5">
        {iconType === 'flower' ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="3" />
            <circle cx="12" cy="5" r="2.5" />
            <circle cx="12" cy="19" r="2.5" />
            <circle cx="5" cy="12" r="2.5" />
            <circle cx="19" cy="12" r="2.5" />
            <circle cx="7" cy="7" r="2" />
            <circle cx="17" cy="7" r="2" />
            <circle cx="7" cy="17" r="2" />
            <circle cx="17" cy="17" r="2" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="4" y="6" width="16" height="12" rx="2" />
            <circle cx="9" cy="12" r="1.5" fill="currentColor" />
            <circle cx="15" cy="12" r="1.5" fill="currentColor" />
            <line x1="8" y1="4" x2="8" y2="6" />
            <line x1="16" y1="4" x2="16" y2="6" />
          </svg>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <p className="text-white/90 text-sm break-words leading-relaxed">
          {message.content}
        </p>
      </div>
    </div>
  );
}
