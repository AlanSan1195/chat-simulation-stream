import { useState, useEffect, useRef } from 'react';
import { IconPlayerPlay, IconPlayerStop, IconInfoCircle } from '@tabler/icons-react';
import type { ChatMessage } from '../utils/types';
import GameInput from './GameInput';
import ChatWindow from './ChatWindow';
import '../styles/global.css';

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
    <div className="grid lg:grid-cols-2 gap-12 items-start">
      {/* Panel de Control - Left side */}
      <div className="space-y-8">
        {/* Logo/Title */}
        <div className="">
          <div className="flex items-center gap-1">
            <p className="text-xl  text-black ml-1 " style={{ fontFamily: 'rocket' }}>Rocket</p>
          </div>
          <h1 className="text-5xl text-primary" style={{ fontFamily: 'rocket' }}>
            Chat simulator
          </h1>
        </div>

        {/* Panel de Control Title */}
        <h2 className="text-xl font-jet text-black ">Panel de Control</h2>

        {/* Game Input */}
        <GameInput
          selectedGame={selectedGame}
          onGameSelect={handleGameSelect}
          disabled={isActive}
          userGames={userGames}
          remainingSlots={remainingSlots}
        />

        {/* Play/Stop Buttons */}
        <div className="flex items-center gap-4 pt-4">
          <button
            onClick={handleStartChat}
            disabled={!selectedGame || isActive}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              !selectedGame || isActive
                ? 'bg-[#e07b5a]/30 cursor-not-allowed'
                : 'bg-[#e07b5a]/40 hover:bg-[#e07b5a]/60'
            }`}
            title="Iniciar Chat"
          >
            <IconPlayerPlay 
              size={28} 
              className={!selectedGame || isActive ? 'text-[#e07b5a]/50' : 'text-[#e07b5a]'} 
            />
          </button>

          <button
            onClick={handleStopChat}
            disabled={!isActive}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              !isActive
                ? 'bg-[#e07b5a]/30 cursor-not-allowed'
                : 'bg-[#e07b5a] hover:bg-[#c96a4a]'
            }`}
            title="Detener Chat"
          >
            <IconPlayerStop 
              size={28} 
              className={!isActive ? 'text-[#e07b5a]/50' : 'text-white'} 
            />
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-[#e8a090]/40 border border-[#e07b5a]/30 rounded-lg p-4 mt-8">
          <div className="flex items-start gap-3">
            <IconInfoCircle className="text-[#e07b5a] flex-shrink-0 mt-0.5" size={18} />
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#e07b5a]">Como funciona</p>
              <p className="text-xs text-[#c96a4a]/80 font-mono leading-relaxed">
                Escribe cualquier videojuego y la IA generara comentarios de chat personalizados. 
                Tienes un limite de 4 juegos. Los mensajes aparecen cada 2-5 segundos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ventana de Chat - Right side */}
      <div className="lg:pt-8">
        <ChatWindow messages={messages} isActive={isActive} />
      </div>
    </div>
  );
}
