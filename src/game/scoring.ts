import type { Card } from "./types";
import { bestDeadwood, deadwoodValue, applyLayoffs } from "./melds";

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
  const knockerHand = knocker === "player" ? playerHand : cpuHand;
  const defenderHand = knocker === "player" ? cpuHand : playerHand;
  const opponent = knocker === "player" ? "cpu" : "player";

  const knockerBest = bestDeadwood(knockerHand);
  const defenderBest = bestDeadwood(defenderHand);
  const knockerDW = knockerBest.deadwood;

  // Gin: knocker melds the whole hand. No lay-offs are permitted.
  if (knockerDW === 0) {
    const playerDeadwood = knocker === "player" ? 0 : defenderBest.deadwood;
    const cpuDeadwood = knocker === "player" ? defenderBest.deadwood : 0;
    return {
      winner: knocker,
      type: "gin",
      playerDeadwood,
      cpuDeadwood,
      points: 25 + defenderBest.deadwood,
      knocker,
    };
  }

  // Knock: the defender may lay off deadwood onto the knocker's melds first.
  const defenderDW = deadwoodValue(applyLayoffs(defenderBest.deadwoodCards, knockerBest.melds));
  const playerDeadwood = knocker === "player" ? knockerDW : defenderDW;
  const cpuDeadwood = knocker === "player" ? defenderDW : knockerDW;

  // Undercut: defender's (post-layoff) deadwood is equal or lower.
  if (defenderDW <= knockerDW) {
    return {
      winner: opponent,
      type: "undercut",
      playerDeadwood,
      cpuDeadwood,
      points: 25 + (knockerDW - defenderDW),
      knocker,
    };
  }

  // Normal knock.
  return {
    winner: knocker,
    type: "knock",
    playerDeadwood,
    cpuDeadwood,
    points: defenderDW - knockerDW,
    knocker,
  };
}
