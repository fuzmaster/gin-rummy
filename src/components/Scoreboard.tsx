type Props = {
  playerScore: number;
  cpuScore: number;
  round: number;
};

export default function Scoreboard({ playerScore, cpuScore, round }: Props) {
  return (
    <header className="scoreboard">
      <h1 className="game-title">🃏 Gin Rummy</h1>
      <div className="score-block">
        <span className="score-label">You</span>
        <span className="score-value">{playerScore}</span>
      </div>
      <div className="score-block">
        <span className="score-label">Round</span>
        <span className="score-value">{round}</span>
      </div>
      <div className="score-block">
        <span className="score-label">CPU</span>
        <span className="score-value">{cpuScore}</span>
      </div>
    </header>
  );
}
