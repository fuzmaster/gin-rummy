type Props = {
  playerScore: number;
  cpuScore: number;
  round: number;
  targetScore: number;
  onQuit: () => void;
};

export default function Scoreboard({ playerScore, cpuScore, round, targetScore, onQuit }: Props) {
  return (
    <header className="scoreboard">
      <button className="btn menu-quit-btn" onClick={onQuit} aria-label="Quit to main menu">
        ☰ Menu
      </button>

      <div className="scoreboard-title">
        <h1 className="game-title">🃏 Gin Rummy</h1>
        <span className="game-target">first to {targetScore}</span>
      </div>

      <div className="scoreboard-scores">
        <div className="score-block score-block-you">
          <span className="score-label">You</span>
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
    </header>
  );
}
