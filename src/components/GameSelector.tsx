import { GAMES } from '../lib/gameData';

interface GameSelectorProps {
  selectedGame: string | null;
  onGameChange: (gameId: string) => void;
  disabled?: boolean;
}

/**
 * @deprecated Usar GameInput en su lugar
 */
export default function GameSelector({ selectedGame, onGameChange, disabled }: GameSelectorProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="game-select" className="block text-sm font-medium text-slate-300">
        Selecciona tu juego
      </label>
      <select
        id="game-select"
        value={selectedGame || ''}
        onChange={(e) => onGameChange(e.target.value)}
        disabled={disabled}
        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <option value="" disabled>
          Elige un videojuego...
        </option>
        {GAMES.map((game) => (
          <option key={game.id} value={game.id}>
            {game.icon} {game.displayName}
          </option>
        ))}
      </select>
    </div>
  );
}
