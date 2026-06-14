import type { Card } from "./types";
import { bestDeadwood } from "./melds";
import { sortHand } from "./cards";

/**
 * CPU decides whether to take the top discard card.
 * Takes it if it reduces (or doesn't increase) deadwood.
 */
export function cpuShouldTakeDiscard(hand: Card[], topDiscard: Card): boolean {
  const currentDW = bestDeadwood(hand).deadwood;

  // Try each card in hand as the one to discard after taking topDiscard
  const handWith = [...hand, topDiscard];
  for (let i = 0; i < handWith.length; i++) {
    const trial = handWith.filter((_, idx) => idx !== i);
    if (bestDeadwood(trial).deadwood <= currentDW) return true;
  }
  return false;
}

/**
 * CPU picks the best card to discard from its current 11-card hand.
 * Returns the card that, when removed, leaves the lowest deadwood.
 * Also returns the drawn card reference if it came from discard (to avoid re-discarding it).
 */
export function cpuChooseDiscard(hand: Card[], drewCard?: Card): Card {
  let bestCard = hand[0];
  let bestDW = Infinity;

  for (const card of hand) {
    // Don't discard the card just drawn from discard pile
    if (drewCard && card.id === drewCard.id) continue;
    const trial = hand.filter(c => c.id !== card.id);
    const dw = bestDeadwood(trial).deadwood;
    if (dw < bestDW) {
      bestDW = dw;
      bestCard = card;
    }
  }
  return bestCard;
}

/**
 * CPU full turn: draw + discard decision.
 * Returns updated hand, discard, stock, and whether CPU knocked.
 */
export function cpuTakeTurn(
  hand: Card[],
  stock: Card[],
  discardPile: Card[]
): {
  newHand: Card[];
  newStock: Card[];
  newDiscardPile: Card[];
  knocked: boolean;
  discardedCard: Card;
  drewFrom: "stock" | "discard";
} {
  let newStock = [...stock];
  let newDiscardPile = [...discardPile];
  let drewFrom: "stock" | "discard" = "stock";
  let drewCard: Card | undefined;

  const topDiscard = newDiscardPile[newDiscardPile.length - 1];

  if (topDiscard && cpuShouldTakeDiscard(hand, topDiscard)) {
    // Take from discard
    newDiscardPile = newDiscardPile.slice(0, -1);
    drewCard = topDiscard;
    drewFrom = "discard";
  } else {
    // Draw from stock
    if (newStock.length === 0) {
      // Reshuffle discard except top card
      const top = newDiscardPile[newDiscardPile.length - 1];
      const rest = newDiscardPile.slice(0, -1);
      newStock = rest.sort(() => Math.random() - 0.5);
      newDiscardPile = [top];
    }
    drewCard = newStock[newStock.length - 1];
    newStock = newStock.slice(0, -1);
  }

  const handWith = [...hand, drewCard];
  const discard = cpuChooseDiscard(handWith, drewFrom === "discard" ? drewCard : undefined);
  const newHand = sortHand(handWith.filter(c => c.id !== discard.id));
  newDiscardPile = [...newDiscardPile, discard];

  const dw = bestDeadwood(newHand).deadwood;
  const knocked = dw <= 10;

  return { newHand, newStock, newDiscardPile, knocked, discardedCard: discard, drewFrom };
}
