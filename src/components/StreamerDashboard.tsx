import { useState, useEffect, useRef } from 'react';
import { IconInfoCircle } from '@tabler/icons-react';
import type { ChatMessage } from '../utils/types';
import GameInput from './GameInput';
import ChatWindow from './ChatWindow';
import '../styles/global.css';

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <polygon points="22 11 22 13 21 13 21 14 20 14 20 15 18 15 18 16 16 16 16 17 15 17 15 18 13 18 13 19 11 19 11 20 10 20 10 21 8 21 8 22 6 22 6 23 3 23 3 22 2 22 2 2 3 2 3 1 6 1 6 2 8 2 8 3 10 3 10 4 11 4 11 5 13 5 13 6 15 6 15 7 16 7 16 8 18 8 18 9 20 9 20 10 21 10 21 11 22 11"/>
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <polygon points="23 2 23 22 22 22 22 23 15 23 15 22 14 22 14 2 15 2 15 1 22 1 22 2 23 2"/>
      <polygon points="9 2 10 2 10 22 9 22 9 23 2 23 2 22 1 22 1 2 2 2 2 1 9 1 9 2"/>
    </svg>
  );
}



export default function StreamerDashboard() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userGames, setUserGames] = useState<string[]>([]);
  const [remainingSlots, setRemainingSlots] = useState(4);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Cargar info del usuario al montar
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const response = await fetch('/api/generate-phrases');
        if (response.ok) {
          const data = await response.json();
          setUserGames(data.games || []);
          setRemainingSlots(data.remainingSlots ?? 4);
        }
      } catch (error) {
        console.error('Error cargando info del usuario:', error);
      }
    };

    loadUserInfo();
  }, []);

  const handleGameSelect = (gameName: string) => {
    setSelectedGame(gameName);
    // Actualizar la lista de juegos del usuario
    if (!userGames.includes(gameName.toLowerCase())) {
      setUserGames(prev => [...prev, gameName.toLowerCase()]);
      setRemainingSlots(prev => Math.max(0, prev - 1));
    }
  };

  const handleStartChat = () => {
    if (!selectedGame) return;

    setIsActive(true);
    setMessages([]);

    // Crear conexión SSE con el nombre del juego
    const eventSource = new EventSource(`/api/chat-stream?game=${encodeURIComponent(selectedGame)}`);
    
    eventSource.onmessage = (event) => {
      const newMessage: ChatMessage = JSON.parse(event.data);
      setMessages((prev) => [...prev, newMessage]);
    };

    eventSource.onerror = () => {
      console.error('Error en conexión SSE');
      handleStopChat();
    };

    eventSourceRef.current = eventSource;
  };

  const handleStopChat = () => {
    setIsActive(false);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 lg:grid-rows-1 lg:flex-1 lg:min-h-0 h-full gap-5 lg:gap-x-12">
      {/* Panel de Control - Left side */}
      <div className="flex-shrink-0 space-y-7 flex flex-col overflow-y-auto border border-black/20 p-4 md:p-6  bg-black/15 dark:bg-transparent dark:shadow-none dark:border-0 rounded-sm">
        {/* Logo/Title */}
        <div>
          <p className="text-5xl font-rocket">Rocket</p>
          <h1 className="text-3xl text-primary uppercase font-departure">
            {isActive && selectedGame ? `Streaming: ${selectedGame}` : 'No hay stream activo'}
          </h1>
        </div>

        {/* Panel de Control Title */}
        <h2 className="text-xl font-jet font-semibold">Panel de Control</h2>

        {/* Game Input */}
        <GameInput
          selectedGame={selectedGame}
          onGameSelect={handleGameSelect}
          disabled={isActive}
          userGames={userGames}
          remainingSlots={remainingSlots}
        />

        {/* Play/Stop Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleStartChat}
            disabled={!selectedGame || isActive}
            className={`w-12 h-12 flex items-center justify-center transition-all rounded-sm ${
              !selectedGame || isActive
                ? 'bg-primary/60 cursor-not-allowed'
                : 'bg-primary hover:bg-primary hover:scale-105'
            }`}
            title="Iniciar Chat"
          >
            <PlayIcon className={!selectedGame || isActive ? 'text-bg-primary/50' : 'text-bg-primary'} />
          </button>

          <button
            onClick={handleStopChat}
            disabled={!isActive}
            className={`w-12 h-12 flex items-center justify-center transition-all rounded-sm ${
              !isActive
                ? 'bg-primary/60 cursor-not-allowed'
                : 'bg-primary hover:scale-105'
            }`}
            title="Detener Chat"
          >
            <PauseIcon className={!isActive ? 'text-bg-primary/50' : 'text-bg-primary'} />
          </button>
        </div>

        {/* Info Card */}
        <div className="flex gap-2 px-3 py-3 border rounded-sm border-black/15 dark:border-white/10 bg-terminal dark:bg-white/5 dark:hover:bg-white/10 transition-colors text-xs select-none">
          <div className="space-y-1">
            <div className="flex gap-x-1 items-center">
              <IconInfoCircle className="text-primary mt-0.5" size={16} />
              <p className="text-lg font-departure font-semibold text-primary">Como funciona</p>
            </div>
            <p className="text-white font-jet leading-relaxed opacity-40">
              Escribe cualquier videojuego y la IA generara comentarios de chat personalizados.
              Tienes un limite de 4 juegos. Los mensajes aparecen cada 2-5 segundos.
            </p>
          </div>
        </div>
      </div>

      {/* Ventana de Chat - Right side */}
      <div className="lg:col-span-2 h-[500px] lg:h-full overflow-hidden">
        <ChatWindow messages={messages} isActive={isActive} />
      </div>
    </div>
  );
}
