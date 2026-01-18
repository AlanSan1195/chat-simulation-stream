import { useEffect, useRef } from 'react';
import type { ChatMessage as ChatMessageType } from '../utils/types';
import ChatMessage from './ChatMessage';

interface ChatWindowProps {
  messages: ChatMessageType[];
  isActive: boolean;
}

export default function ChatWindow({ messages, isActive }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="pb-4">
        <h2 className="text-xl font-mono text-black tracking-wide">Chat</h2>
      </div>

      {/* Messages Container */}
      <div className="bg-[#2d2d2d] rounded-lg flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-4 space-y-1">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#666] space-y-2">
              <svg 
                className="w-16 h-16 text-[#3d3d3d]" 
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
              <p className="text-sm font-mono">Selecciona un juego e inicia el chat</p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
