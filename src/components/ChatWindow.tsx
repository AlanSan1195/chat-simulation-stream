import { useCallback, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import type { ChatMessage as ChatMessageType } from '../utils/types';
import ChatMessage from './ChatMessage';

interface ChatWindowProps {
  messages: ChatMessageType[];
  isActive: boolean;
}

export default function ChatWindow({ messages, isActive }: ChatWindowProps) {
  const [startTime] = useState(() => Date.now());

  const itemContent = useCallback(
    (index: number, message: ChatMessageType) => (
      <ChatMessage
        message={message}
        startTime={startTime}
        isAlternate={index % 2 === 1}
      />
    ),
    [startTime],
  );

  return (
    <div className="flex flex-col h-full border-[1px] border-white/10 bg-terminal overflow-hidden rounded-sm">
      {/* Header */}
      <div className="relative flex items-center px-4 py-8 border-b border-white/10 flex-shrink-0">
        <h2 className="text-white font-jet text-sm sm:text-2xl font-medium tracking-wide absolute left-0 right-0 text-center pointer-events-none">
          Chat
        </h2>
      </div>

      {/* Messages Container */}
      <div className="flex-1 min-h-0">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center space-y-3">
            <svg
              className="w-14 h-14 text-primary opacity-40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-sm text-white/30 font-jet">Selecciona un juego e inicia el chat</p>
          </div>
        ) : (
          <Virtuoso
            style={{ height: '100%' }}
            data={messages}
            itemContent={itemContent}
            followOutput="smooth"
            increaseViewportBy={200}
          />
        )}
      </div>
    </div>
  );
}
