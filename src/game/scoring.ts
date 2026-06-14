import type { Card } from "./types";
import { bestDeadwood } from "./melds";

export type ScoreResult = {
  winner: "player" | "cpu";
  type: "gin" | "knock" | "undercut";
  playerDeadwood: number;
  cpuDeadwood: number;
  points: number;
  knocker: "player" | "cpu";
};

export function calculateScore(
  knocker: "player" | "cpu",
  playerHand: Card[],
  cpuHand: Card[]
): ScoreResult {
  const playerDW = bestDeadwood(playerHand).deadwood;
  const cpuDW = bestDeadwood(cpuHand).deadwood;

  const knockerDW = knocker === "player" ? playerDW : cpuDW;
  const opponentDW = knocker === "player" ? cpuDW : playerDW;
  const opponent = knocker === "player" ? "cpu" : "player";

  // Gin: knocker deadwood === 0
  if (knockerDW === 0) {
    return {
      winner: knocker,
      type: "gin",
      playerDeadwood: playerDW,
      cpuDeadwood: cpuDW,
      points: 25 + opponentDW,
      knocker,
    };
  }

  // Undercut: opponent deadwood <= knocker deadwood
  if (opponentDW <= knockerDW) {
    return {
      winner: opponent,
      type: "undercut",
      playerDeadwood: playerDW,
      cpuDeadwood: cpuDW,
      points: 25 + (knockerDW - opponentDW),
      knocker,
    };
  }

  // Normal knock
  return {
    winner: knocker,
    type: "knock",
    playerDeadwood: playerDW,
    cpuDeadwood: cpuDW,
    points: opponentDW - knockerDW,
    knocker,
  };
}
