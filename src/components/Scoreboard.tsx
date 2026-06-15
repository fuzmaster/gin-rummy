type Props = {
  playerScore: number;
  cpuScore: number;
  round: number;
  targetScore: number;
  streak: number;
  onQuit: () => void;
};

export default function Scoreboard({ playerScore, cpuScore, round, targetScore, streak, onQuit }: Props) {
  const pct = (s: number) => `${Math.min(100, Math.round((s / targetScore) * 100))}%`;

  return (
    <header className="scoreboard">
      <div className="scoreboard-top">
        <button className="btn menu-quit-btn" onClick={onQuit} aria-label="Quit to main menu">
          ☰ Menu
        </button>

        <div className="scoreboard-title">
          <h1 className="game-title">🃏 Gin Rummy</h1>
          <span className="game-target">first to {targetScore}</span>
        </div>

        <div className="scoreboard-scores">
          <div className="score-block score-block-you">
            <span className="score-label">You {streak >= 2 && <span className="streak-badge">🔥{streak}</span>}</span>
            <span className="score-value">{playerScore}</span>
          </div>
          <div className="score-block score-block-round">
            <span className="score-label">Round</span>
            <span className="score-value">{round}</span>
          </div>
          <div className="score-block score-block-cpu">
            <span className="score-label">CPU</span>
            <span className="score-value">{cpuScore}</span>
          </div>
        </div>
      </div>

      {/* Progress toward the target — visible the whole game, not just at round end. */}
      <div className="score-progress" aria-label="Progress to target score">
        <div className="progress-row">
          <span className="progress-tag you">You</span>
          <div className="progress-track">
            <div className="progress-fill you" style={{ width: pct(playerScore) }} />
          </div>
          <span className="progress-num">{playerScore}/{targetScore}</span>
        </div>
        <div className="progress-row">
          <span className="progress-tag cpu">CPU</span>
          <div className="progress-track">
            <div className="progress-fill cpu" style={{ width: pct(cpuScore) }} />
          </div>
          <span className="progress-num">{cpuScore}/{targetScore}</span>
        </div>
      </div>
    </header>
  );
}
