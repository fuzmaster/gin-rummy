import type { RoundResult } from "../game/types";

type Props = {
  result: RoundResult;
  playerScore: number;
  cpuScore: number;
  isGameOver: boolean;
  onNext: () => void;
};

const TYPE_LABEL: Record<string, string> = {
  gin: "Gin!",
  knock: "Knock",
  undercut: "Undercut!",
};

export default function RoundResultModal({ result, playerScore, cpuScore, isGameOver, onNext }: Props) {
  const winnerLabel = result.winner === "player" ? "You win" : "CPU wins";
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Round result">
      <div className="modal">
        <h2 className="modal-title">{isGameOver ? "🏆 Game Over" : "Round Over"}</h2>
        <p className="modal-result-type">{TYPE_LABEL[result.type]} — {winnerLabel} this round!</p>

        <table className="modal-table">
          <tbody>
            <tr>
              <th>Knocker</th>
              <td>{result.knocker === "player" ? "You" : "CPU"}</td>
            </tr>
            <tr>
              <th>Your deadwood</th>
              <td>{result.playerDeadwood}</td>
            </tr>
            <tr>
              <th>CPU deadwood</th>
              <td>{result.cpuDeadwood}</td>
            </tr>
            <tr>
              <th>Points awarded</th>
              <td>+{result.points} → {result.winner === "player" ? "You" : "CPU"}</td>
            </tr>
          </tbody>
        </table>

        <div className="modal-scores">
          <span>You: <strong>{playerScore}</strong></span>
          <span>CPU: <strong>{cpuScore}</strong></span>
        </div>

        {isGameOver ? (
          <p className="modal-gameover">
            {playerScore >= 100 ? "🎉 You reached 100 — you win the game!" : "CPU reached 100 — better luck next time!"}
          </p>
        ) : null}

        <button className="btn btn-primary modal-btn" onClick={onNext}>
          {isGameOver ? "Play Again" : "Next Round"}
        </button>
      </div>
    </div>
  );
}
