import type { Card, Difficulty } from "./types";
import { bestDeadwood } from "./melds";
import { sortHand, shuffle } from "./cards";

export type CpuConfig = {
  knockThreshold: number;       // only knock when deadwood <= this
  knockChance: number;          // probability of knocking when eligible
  randomDiscardChance: number;  // chance to discard a random card instead of the optimal one
  useDiscardPile: boolean;      // whether the CPU considers drawing from the discard pile
};

export const CPU_CONFIGS: Record<Difficulty, CpuConfig> = {
  // Easy: ignores the discard pile, plays loose, and sometimes forgets to knock.
  easy:   { knockThreshold: 10, knockChance: 0.6, randomDiscardChance: 0.5, useDiscardPile: false },
  // Medium: solid greedy play, always knocks when it legally can.
  medium: { knockThreshold: 10, knockChance: 1.0, randomDiscardChance: 0.15, useDiscardPile: true },
  // Hard: optimal discards and holds out for low-deadwood knocks to dodge undercuts.
  hard:   { knockThreshold: 7,  knockChance: 1.0, randomDiscardChance: 0.0, useDiscardPile: true },
};

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
 * CPU picks a card to discard from its current 11-card hand. With probability
 * `randomChance` it makes a weak (random deadwood) discard; otherwise it picks
 * the card that leaves the lowest deadwood.
 * `drewCard`, if given, is the card just drawn from discard and cannot be re-discarded.
 */
export function cpuChooseDiscard(hand: Card[], drewCard?: Card, randomChance = 0): Card {
  const candidates = hand.filter(c => !(drewCard && c.id === drewCard.id));

  if (randomChance > 0 && Math.random() < randomChance) {
    const deadwood = bestDeadwood(hand).deadwoodCards.filter(c => !(drewCard && c.id === drewCard.id));
    const pool = deadwood.length > 0 ? deadwood : candidates;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  let bestCard = candidates[0];
  let bestDW = Infinity;
  for (const card of candidates) {
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
 * CPU full turn: draw + discard decision, parameterised by difficulty config.
 * Returns updated hand, discard, stock, and whether CPU knocked.
 */
export function cpuTakeTurn(
  hand: Card[],
  stock: Card[],
  discardPile: Card[],
  config: CpuConfig = CPU_CONFIGS.medium
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

  if (config.useDiscardPile && topDiscard && cpuShouldTakeDiscard(hand, topDiscard)) {
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
      newStock = shuffle(rest);
      newDiscardPile = [top];
    }
    drewCard = newStock[newStock.length - 1];
    newStock = newStock.slice(0, -1);
  }

  const handWith = [...hand, drewCard];
  const discard = cpuChooseDiscard(
    handWith,
    drewFrom === "discard" ? drewCard : undefined,
    config.randomDiscardChance
  );
  const newHand = sortHand(handWith.filter(c => c.id !== discard.id));
  newDiscardPile = [...newDiscardPile, discard];

  const dw = bestDeadwood(newHand).deadwood;
  const knocked = dw <= config.knockThreshold && Math.random() < config.knockChance;

  return { newHand, newStock, newDiscardPile, knocked, discardedCard: discard, drewFrom };
}
