import { useState, useCallback } from 'react';
import { IconSearch, IconLoader2, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import type { GeneratePhrasesResponse } from '../utils/types';

interface GameInputProps {
  selectedGame: string | null;
  onGameSelect: (gameName: string) => void;
  disabled?: boolean;
  userGames?: string[];
  remainingSlots?: number;
}

export default function GameInput({ 
  selectedGame, 
  onGameSelect, 
  disabled,
  userGames = [],
  remainingSlots = 4
}: GameInputProps) {
  const [inputValue, setInputValue] = useState(selectedGame || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const gameName = inputValue.trim();
    if (!gameName || disabled) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/generate-phrases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameName })
      });

      const data: GeneratePhrasesResponse = await response.json();

      if (!response.ok || !data.success) {
        if (data.limitReached) {
          setError(`Limite alcanzado (4 juegos). Tus juegos: ${data.currentGames?.join(', ')}`);
        } else {
          setError(data.error || 'Error generando frases');
        }
        return;
      }

      setSuccess(true);
      onGameSelect(data.gameName);
      
      // Limpiar éxito después de 2 segundos
      setTimeout(() => setSuccess(false), 2000);

    } catch (err) {
      setError('Error de conexion. Intenta de nuevo.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, disabled, onGameSelect]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-2 ">
      <div className="flex items-center justify-between font-jet px-1">
        <label htmlFor="game-input" className="block text-sm  text-black/70">
          A que jugaras hoy ?
        </label>
        <span className="text-xs text-[#e07b5a]">
          {remainingSlots} juego{remainingSlots !== 1 ? 's' : ''} disponible{remainingSlots !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="relative">
        <input
          id="game-input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          placeholder="Ej: Elden Ring, Silkson, Minecraft, Valorant..."
          className="w-full bg-transparent border-2 border-black/20 rounded-full pl-6 pr-14 py-3 text-black placeholder-black/40 focus:outline-none focus:border-[#e07b5a] disabled:opacity-50 disabled:cursor-not-allowed transition font-mono text-sm "
        />
        
        <button
          onClick={() => handleSubmit()}
          disabled={disabled || isLoading || !inputValue.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#e07b5a] hover:bg-[#c96a4a] disabled:bg-black/20 disabled:cursor-not-allowed transition-colors"
          title="Generar chat para este juego"
        >
          {isLoading ? (
            <IconLoader2 size={18} className="animate-spin text-white " />
          ) : success ? (
            <IconCheck size={18} className="text-white" />
          ) : (
            <IconSearch size={18} className="text-black" />
          )}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-[#e07b5a]/10 border border-[#e07b5a]/30 rounded-lg">
          <IconAlertCircle size={18} className="text-[#e07b5a] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#e07b5a]">{error}</p>
        </div>
      )}

      {/* User's games list */}
      {userGames.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {userGames.map((game) => (
            <button
              key={game}
              onClick={() => {
                setInputValue(game);
                onGameSelect(game);
              }}
              disabled={disabled}
              className={` mx-1 px-4 py-1.5 text-xs rounded-full border transition-colors font-jet ${
                selectedGame === game
                  ? 'bg-[#2d2d2d] text-white border-[#2d2d2d]'
                  : 'bg-transparent text-black border-black/30 hover:border-[#e07b5a] hover:text-[#e07b5a]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {game}
            </button>
          ))}
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <p className="text-xs text-black/50 flex items-center gap-2 font-mono">
          <IconLoader2 size={14} className="animate-spin" />
          Generando frases con IA para "{inputValue}"...
        </p>
      )}
    </div>
  );
}
