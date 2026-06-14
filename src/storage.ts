/* ============================================================
   Persistence — settings & lifetime stats (localStorage).
   All access is guarded so the app still works if storage is
   unavailable (private mode, disabled cookies, SSR, etc.).
   ============================================================ */

import type { Difficulty } from "./game/types";

export type Settings = {
  targetScore: number;
  difficulty: Difficulty;
};

export type Stats = {
  wins: number;
  losses: number;
  gamesPlayed: number;
  totalPoints: number; // lifetime points the player has scored
};

export const TARGET_SCORES = [50, 100, 250] as const;
export const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

const SETTINGS_KEY = "gin-rummy-settings";
const STATS_KEY = "gin-rummy-stats";

const DEFAULT_SETTINGS: Settings = { targetScore: 100, difficulty: "medium" };
const DEFAULT_STATS: Stats = { wins: 0, losses: 0, gamesPlayed: 0, totalPoints: 0 };

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Settings>;
      const target = Number(parsed.targetScore);
      const difficulty = parsed.difficulty;
      return {
        targetScore: (TARGET_SCORES as readonly number[]).includes(target)
          ? target
          : DEFAULT_SETTINGS.targetScore,
        difficulty:
          difficulty && DIFFICULTIES.includes(difficulty)
            ? difficulty
            : DEFAULT_SETTINGS.difficulty,
      };
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}

export function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<Stats>;
      return {
        wins: Number(p.wins) || 0,
        losses: Number(p.losses) || 0,
        gamesPlayed: Number(p.gamesPlayed) || 0,
        totalPoints: Number(p.totalPoints) || 0,
      };
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_STATS };
}

export function saveStats(stats: Stats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    /* ignore */
  }
}

export function emptyStats(): Stats {
  return { ...DEFAULT_STATS };
}

/** Apply a finished game's outcome to the running stats and return a new object. */
export function recordGame(stats: Stats, playerWon: boolean, playerPoints: number): Stats {
  return {
    wins: stats.wins + (playerWon ? 1 : 0),
    losses: stats.losses + (playerWon ? 0 : 1),
    gamesPlayed: stats.gamesPlayed + 1,
    totalPoints: stats.totalPoints + playerPoints,
  };
}
