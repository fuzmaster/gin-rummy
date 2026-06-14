import type { Difficulty } from "../game/types";
import type { Stats } from "../storage";

type Props = {
  stats: Stats;
  targetScore: number;
  difficulty: Difficulty;
  onPlay: () => void;
  onHowTo: () => void;
  onSettings: () => void;
};

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export default function MainMenu({ stats, targetScore, difficulty, onPlay, onHowTo, onSettings }: Props) {
  const winRate =
    stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0;

  return (
    <div className="menu-screen">
      <div className="menu-card">
        <h1 className="menu-title">🃏 Gin Rummy</h1>
        <p className="menu-subtitle">First to {targetScore} · {DIFFICULTY_LABELS[difficulty]} CPU</p>

        <div className="menu-buttons">
          <button className="btn btn-primary menu-main-btn" onClick={onPlay}>
            ▶ Play
          </button>
          <button className="btn menu-main-btn" onClick={onHowTo}>
            How to Play
          </button>
          <button className="btn menu-main-btn" onClick={onSettings}>
            Settings
          </button>
        </div>

        <div className="menu-stats" aria-label="Lifetime stats">
          <div className="menu-stat">
            <span className="menu-stat-value">{stats.wins}</span>
            <span className="menu-stat-label">Wins</span>
          </div>
          <div className="menu-stat">
            <span className="menu-stat-value">{stats.losses}</span>
            <span className="menu-stat-label">Losses</span>
          </div>
          <div className="menu-stat">
            <span className="menu-stat-value">{winRate}%</span>
            <span className="menu-stat-label">Win rate</span>
          </div>
          <div className="menu-stat">
            <span className="menu-stat-value">{stats.totalPoints}</span>
            <span className="menu-stat-label">Total points</span>
          </div>
        </div>
      </div>
    </div>
  );
}
