import { useCallback, useEffect, useReducer } from 'react';
import './styles.css';
import Scoreboard from './components/Scoreboard';
import GameTable from './components/GameTable';
import RoundResultModal from './components/RoundResultModal';
import {
  createInitialState,
  newRound,
  playerDrawStock,
  playerDrawDiscard,
  playerSelectCard,
  playerDiscard,
  playerKnock,
  runCpuTurn,
} from './game/engine';
import type { GameState } from './game/types';

type Action =
  | { type: 'DRAW_STOCK' }
  | { type: 'DRAW_DISCARD' }
  | { type: 'SELECT_CARD'; id: string }
  | { type: 'DISCARD' }
  | { type: 'KNOCK' }
  | { type: 'CPU_TURN' }
  | { type: 'NEW_ROUND' }
  | { type: 'NEW_GAME' };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'DRAW_STOCK':    return playerDrawStock(state);
    case 'DRAW_DISCARD':  return playerDrawDiscard(state);
    case 'SELECT_CARD':   return playerSelectCard(state, action.id);
    case 'DISCARD':       return playerDiscard(state);
    case 'KNOCK':         return playerKnock(state);
    case 'CPU_TURN':      return runCpuTurn(state);
    case 'NEW_ROUND':     return newRound(state);
    case 'NEW_GAME':      return createInitialState();
    default:              return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  // Auto-trigger CPU turn after player discards
  useEffect(() => {
    if (state.phase === 'cpu-turn') {
      const timer = setTimeout(() => dispatch({ type: 'CPU_TURN' }), 800);
      return () => clearTimeout(timer);
    }
  }, [state.phase]);

  const handleNewRound = useCallback(() => {
    if (state.phase === 'game-over') dispatch({ type: 'NEW_GAME' });
    else dispatch({ type: 'NEW_ROUND' });
  }, [state.phase]);

  return (
    <div className="app">
      <Scoreboard
        playerScore={state.playerScore}
        cpuScore={state.cpuScore}
        round={state.round}
      />
      <GameTable
        state={state}
        onDrawStock={() => dispatch({ type: 'DRAW_STOCK' })}
        onDrawDiscard={() => dispatch({ type: 'DRAW_DISCARD' })}
        onSelectCard={(id) => dispatch({ type: 'SELECT_CARD', id })}
        onDiscard={() => dispatch({ type: 'DISCARD' })}
        onKnock={() => dispatch({ type: 'KNOCK' })}
      />
      {(state.phase === 'round-over' || state.phase === 'game-over') && state.roundResult && (
        <RoundResultModal
          result={state.roundResult}
          cpuHand={state.cpuHand}
          playerScore={state.playerScore}
          cpuScore={state.cpuScore}
          isGameOver={state.phase === 'game-over'}
          onNext={handleNewRound}
        />
      )}
    </div>
  );
}
