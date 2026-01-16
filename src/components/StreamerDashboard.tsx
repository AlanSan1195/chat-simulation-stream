import { useState, useEffect, useRef } from 'react';
import { IconPlayerPlay, IconPlayerStop, IconInfoCircle } from '@tabler/icons-react';
import type { ChatMessage } from '../utils/types';
import GameInput from './GameInput';
import ChatWindow from './ChatWindow';

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
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Panel de Control */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-6">
          <h2 className="text-xl font-bold text-slate-100">Panel de Control</h2>

          {/* Game Input */}
          <GameInput
            selectedGame={selectedGame}
            onGameSelect={handleGameSelect}
            disabled={isActive}
            userGames={userGames}
            remainingSlots={remainingSlots}
          />

          {/* Juego seleccionado */}
          {selectedGame && (
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
              <p className="text-sm text-slate-400 mb-1">Juego actual</p>
              <p className="text-lg font-semibold text-slate-200 capitalize">
                {selectedGame}
              </p>
            </div>
          )}

          {/* Botones de Control */}
          <div className="space-y-3">
            <button
              onClick={handleStartChat}
              disabled={!selectedGame || isActive}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IconPlayerPlay size={20} />
              <span>Iniciar Chat</span>
            </button>

            <button
              onClick={handleStopChat}
              disabled={!isActive}
              className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IconPlayerStop size={20} />
              <span>Detener Chat</span>
            </button>
          </div>

          {/* Estado */}
          <div className="flex items-center justify-between py-3 px-4 bg-slate-900/50 rounded-lg border border-slate-600">
            <span className="text-sm text-slate-400">Estado</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`} />
              <span className="text-sm font-medium text-slate-200">
                {isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 px-4 bg-slate-900/50 rounded-lg">
              <span className="text-sm text-slate-400">Mensajes</span>
              <span className="text-sm font-semibold text-slate-200">{messages.length}</span>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-950/30 border border-blue-800/50 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <IconInfoCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-300">Como funciona</p>
              <p className="text-xs text-blue-200/80">
                Escribe cualquier videojuego y la IA generara comentarios de chat personalizados. 
                Tienes un limite de 4 juegos. Los mensajes aparecen cada 3-7 segundos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ventana de Chat */}
      <div className="lg:col-span-2">
        <ChatWindow messages={messages} isActive={isActive} />
      </div>
    </div>
  );
}
