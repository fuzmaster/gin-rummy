import type { GameState, Card } from "./types";
import { bestDeadwood } from "./melds";
import { cpuShouldTakeDiscard, cpuChooseDiscard } from "./cpu";

export type Hint =
  | { kind: "draw"; source: "stock" | "discard"; card?: Card }
  | { kind: "discard"; card: Card; thenKnock: boolean };

/**
 * Suggest the strongest move for the player in the current phase, reusing the
 * same deterministic heuristics the CPU uses. Returns null when it isn't the
 * player's decision (e.g. during the CPU turn or between rounds).
 */
export function suggestMove(state: GameState): Hint | null {
  if (state.phase === "awaiting-draw") {
    const top = state.discardPile[state.discardPile.length - 1];
    if (top && cpuShouldTakeDiscard(state.playerHand, top)) {
      return { kind: "draw", source: "discard", card: top };
    }
    return { kind: "draw", source: "stock" };
  }

  if (state.phase === "awaiting-discard") {
    // Don't suggest discarding the card just taken from the discard pile.
    const excluded =
      state.drewFromDiscard && state.lastDrawnId
        ? state.playerHand.find(c => c.id === state.lastDrawnId)
        : undefined;
    const card = cpuChooseDiscard(state.playerHand, excluded);
    const after = state.playerHand.filter(c => c.id !== card.id);
    return { kind: "discard", card, thenKnock: bestDeadwood(after).deadwood <= 10 };
  }

  return null;
}
