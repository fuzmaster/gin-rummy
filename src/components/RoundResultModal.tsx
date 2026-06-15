import { useEffect } from "react";
import type { Card, RoundResult } from "../game/types";
import { meldGroups } from "../game/melds";
import HandView from "./HandView";

// Auto-advance a finished round so the loop never stalls on a tap.
const AUTO_NEXT_MS = 2200;

type Props = {
  result: RoundResult;
  cpuHand: Card[];
  playerScore: number;
  cpuScore: number;
  isGameOver: boolean;
  onNext: () => void;
  onMenu: () => void;
};

const TYPE_LABEL: Record<string, string> = {
  gin: "Gin!",
  knock: "Knock",
  undercut: "Undercut!",
  draw: "Draw",
};

export default function RoundResultModal({ result, cpuHand, playerScore, cpuScore, isGameOver, onNext, onMenu }: Props) {
  const winnerLabel =
    result.winner === "player" ? "You win" : result.winner === "cpu" ? "CPU wins" : "No winner";
  const cpuMelds = meldGroups(cpuHand);

  // Between rounds, advance automatically; on game over, let the player choose.
  useEffect(() => {
    if (isGameOver) return;
    const timer = setTimeout(onNext, AUTO_NEXT_MS);
    return () => clearTimeout(timer);
  }, [isGameOver, onNext]);
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Round result">
      <div className="modal">
        <h2 className="modal-title">{isGameOver ? "🏆 Game Over" : "Round Over"}</h2>
        <p className="modal-result-type">{TYPE_LABEL[result.type]} — {winnerLabel} this round!</p>

        <div className="modal-cpu-reveal">
          <div className="modal-cpu-label">CPU's hand</div>
          <HandView cards={cpuHand} small meldMap={cpuMelds} label="CPU revealed hand" />
        </div>

        <table className="modal-table">
          <tbody>
            <tr>
              <th>Knocker</th>
              <td>{result.knocker === "player" ? "You" : result.knocker === "cpu" ? "CPU" : "—"}</td>
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
              <td>
                {result.winner === null
                  ? "0 (draw)"
                  : `+${result.points} → ${result.winner === "player" ? "You" : "CPU"}`}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="modal-scores">
          <span>You: <strong>{playerScore}</strong></span>
          <span>CPU: <strong>{cpuScore}</strong></span>
        </div>

        {isGameOver ? (
          <p className="modal-gameover">
            {playerScore > cpuScore ? "🎉 You win the game!" : "The CPU wins the game — better luck next time!"}
          </p>
        ) : null}

        <div className="modal-actions">
          <button className="btn btn-primary modal-btn next-pulse" onClick={onNext}>
            {isGameOver ? "Play Again" : "Next Round ▸"}
          </button>
          {isGameOver && (
            <button className="btn modal-btn" onClick={onMenu}>
              Main Menu
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
