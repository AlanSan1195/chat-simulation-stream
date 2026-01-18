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
    <div className="grid lg:grid-cols-3 gap-12   ">
      {/* Panel de Control - Left side */}
      <div className=" space-y-9 flex flex-col">
        {/* Logo/Title */}
        <div className="">
          <div className="flex items-center gap-1">
            <p className="text-2xl  " style={{ fontFamily: 'rocket' }}>Rocket</p>
          </div>
          <h1 className="text-3xl text-primary uppercase" style={{ fontFamily: 'rocket' }}>
            {
              isActive && selectedGame ? `Streaming: ${selectedGame}` : 'No hay stream activo'
            }
          </h1>
        </div>

        {/* Panel de Control Title */}
        <h2 className="text-xl font-jet font-semibold  ">Panel de Control</h2>

        {/* Game Input */}
        <GameInput
          selectedGame={selectedGame}
          onGameSelect={handleGameSelect}
          disabled={isActive}
          userGames={userGames}
          remainingSlots={remainingSlots}
        />

        {/* Play/Stop Buttons */}
        <div className="flex items-center gap-4 ">
          <button
            onClick={handleStartChat}
            disabled={!selectedGame || isActive}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              !selectedGame || isActive
                ? 'bg-primary/30 cursor-not-allowed'
                : 'bg-primary/90 hover:bg-primary hover:scale-105'
            }`}
            title="Iniciar Chat"
          >
            <IconPlayerPlay 
              size={28} 
              className={!selectedGame || isActive ? 'text-terciary/50' : 'text-terciary'} 
            />
          </button>

          <button
            onClick={handleStopChat}
            disabled={!isActive}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              !isActive
                ? 'bg-primary/30 cursor-not-allowed'
                : 'bg-primary hover:scale-105'
            }`}
            title="Detener Chat"
          >
            <IconPlayerStop 
              size={28} 
              className={!isActive ? 'text-terciary/50' : 'text-terciary'} 
            />
          </button>
        </div>

        {/* Info Card */}
        <div className=" border border-primary dark:border-primary/20 rounded-lg p-2  ">
          <div className="flexgap-3">
        
            <div className="space-y-1">
              <div className='flex gap-x-1'>
                <IconInfoCircle className="text-primary dark:text-primary/60 mt-0.5" size={16} />
                <p className="text-sm font-jet font-semibold text-primary dark:text-primary/60 ">Como funciona</p>
              </div>
              <p className="text-xs text-primary/70 dark:text-primary/30 font-jet leading-relaxed">
                Escribe cualquier videojuego y la IA generara comentarios de chat personalizados. 
                Tienes un limite de 4 juegos. Los mensajes aparecen cada 2-5 segundos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ventana de Chat - Right side */}
      <div className="grid lg:col-span-2 ">
        <ChatWindow messages={messages} isActive={isActive} />
      </div>


    </div>
  );
}
