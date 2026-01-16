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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="game-input" className="block text-sm font-medium text-slate-300">
          Escribe el nombre del juego
        </label>
        <span className="text-xs text-slate-500">
          {remainingSlots} slot{remainingSlots !== 1 ? 's' : ''} disponible{remainingSlots !== 1 ? 's' : ''}
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
          placeholder="Ej: Elden Ring, Hollow Knight, Valorant..."
          className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-4 pr-12 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition"
        />
        
        <button
          onClick={() => handleSubmit()}
          disabled={disabled || isLoading || !inputValue.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors"
          title="Generar chat para este juego"
        >
          {isLoading ? (
            <IconLoader2 size={18} className="animate-spin text-slate-300" />
          ) : success ? (
            <IconCheck size={18} className="text-green-400" />
          ) : (
            <IconSearch size={18} className="text-slate-200" />
          )}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-950/50 border border-red-800/50 rounded-lg">
          <IconAlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* User's games list */}
      {userGames.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">Tus juegos:</p>
          <div className="flex flex-wrap gap-2">
            {userGames.map((game) => (
              <button
                key={game}
                onClick={() => {
                  setInputValue(game);
                  onGameSelect(game);
                }}
                disabled={disabled}
                className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                  selectedGame === game
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {game}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <p className="text-xs text-slate-400 flex items-center gap-2">
          <IconLoader2 size={14} className="animate-spin" />
          Generando frases con IA para "{inputValue}"...
        </p>
      )}
    </div>
  );
}
