import type { ChatMessage as ChatMessageType } from '../utils/types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  // Generar color de avatar basado en username
  const getAvatarColor = (username: string) => {
    const colors = [
      'bg-purple-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-pink-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-cyan-500'
    ];
    const index = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const avatarColor = getAvatarColor(message.username);
  const initial = message.username[0].toUpperCase();

  return (
    <div className="flex items-start space-x-3 py-2 px-3 hover:bg-slate-800/50 rounded-lg transition-colors animate-fade-in">
      {/* Avatar */}
      <div className={`${avatarColor} w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm`}>
        {initial}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline space-x-2">
          <span className="font-semibold text-slate-200 text-sm">{message.username}</span>
          <span className="text-xs text-slate-500">
            {new Date(message.timestamp).toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
        <p className="text-slate-300 text-sm break-words">{message.content}</p>
      </div>
    </div>
  );
}
