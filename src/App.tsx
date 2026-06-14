import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import './styles.css';
import Scoreboard from './components/Scoreboard';
import GameTable from './components/GameTable';
import RoundResultModal from './components/RoundResultModal';
import MainMenu from './components/MainMenu';
import HowToPlay from './components/HowToPlay';
import Settings from './components/Settings';
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
import {
  loadSettings,
  saveSettings,
  loadStats,
  saveStats,
  emptyStats,
  recordGame,
} from './storage';

type Action =
  | { type: 'DRAW_STOCK' }
  | { type: 'DRAW_DISCARD' }
  | { type: 'SELECT_CARD'; id: string }
  | { type: 'DISCARD' }
  | { type: 'KNOCK' }
  | { type: 'CPU_TURN' }
  | { type: 'NEW_ROUND' }
  | { type: 'NEW_GAME'; targetScore: number };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'DRAW_STOCK':    return playerDrawStock(state);
    case 'DRAW_DISCARD':  return playerDrawDiscard(state);
    case 'SELECT_CARD':   return playerSelectCard(state, action.id);
    case 'DISCARD':       return playerDiscard(state);
    case 'KNOCK':         return playerKnock(state);
    case 'CPU_TURN':      return runCpuTurn(state);
    case 'NEW_ROUND':     return newRound(state);
    case 'NEW_GAME':      return createInitialState(action.targetScore);
    default:              return state;
  }
}

type Screen = 'menu' | 'how-to-play' | 'settings' | 'game';

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, () => createInitialState());
  const [screen, setScreen] = useState<Screen>('menu');
  const [settings, setSettings] = useState(loadSettings);
  const [stats, setStats] = useState(loadStats);
  const recordedGameRef = useRef<number | null>(null);

  // Auto-trigger CPU turn after player discards
  useEffect(() => {
    if (screen === 'game' && state.phase === 'cpu-turn') {
      const timer = setTimeout(() => dispatch({ type: 'CPU_TURN' }), 800);
      return () => clearTimeout(timer);
    }
  }, [state.phase, screen]);

  // Record the result once when a game ends
  useEffect(() => {
    if (state.phase === 'game-over' && recordedGameRef.current !== state.gameId) {
      recordedGameRef.current = state.gameId;
      const playerWon = state.playerScore >= state.targetScore;
      setStats(prev => {
        const next = recordGame(prev, playerWon, state.playerScore);
        saveStats(next);
        return next;
      });
    }
  }, [state.phase, state.gameId, state.playerScore, state.targetScore]);

  const startGame = useCallback(() => {
    dispatch({ type: 'NEW_GAME', targetScore: settings.targetScore });
    setScreen('game');
  }, [settings.targetScore]);

  const handleNewRound = useCallback(() => {
    if (state.phase === 'game-over') dispatch({ type: 'NEW_GAME', targetScore: settings.targetScore });
    else dispatch({ type: 'NEW_ROUND' });
  }, [state.phase, settings.targetScore]);

  const handleTargetChange = useCallback((targetScore: number) => {
    setSettings(prev => {
      const next = { ...prev, targetScore };
      saveSettings(next);
      return next;
    });
  }, []);

  const handleResetStats = useCallback(() => {
    const next = emptyStats();
    saveStats(next);
    setStats(next);
  }, []);

  if (screen === 'menu') {
    return (
      <MainMenu
        stats={stats}
        targetScore={settings.targetScore}
        onPlay={startGame}
        onHowTo={() => setScreen('how-to-play')}
        onSettings={() => setScreen('settings')}
      />
    );
  }

  if (screen === 'how-to-play') {
    return <HowToPlay onBack={() => setScreen('menu')} />;
  }

  if (screen === 'settings') {
    return (
      <Settings
        targetScore={settings.targetScore}
        onTargetChange={handleTargetChange}
        onResetStats={handleResetStats}
        onBack={() => setScreen('menu')}
      />
    );
  }

  return (
    <div className="app">
      <Scoreboard
        playerScore={state.playerScore}
        cpuScore={state.cpuScore}
        round={state.round}
        targetScore={state.targetScore}
        onQuit={() => setScreen('menu')}
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
          onMenu={() => setScreen('menu')}
        />
      )}
    </div>
  );
}
