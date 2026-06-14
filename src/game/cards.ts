import type { Card, Rank, Suit } from "./types";

export const SUITS: Suit[] = ["S", "H", "D", "C"];
export const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export function makeCard(rank: Rank, suit: Suit): Card {
  return { id: `${rank}${suit}`, rank, suit };
}

export function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(makeCard(rank, suit));
    }
  }
  return deck;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const RANK_ORDER: Record<Rank, number> = {
  A: 1, "2": 2, "3": 3, "4": 4, "5": 5,
  "6": 6, "7": 7, "8": 8, "9": 9, "10": 10,
  J: 11, Q: 12, K: 13,
};

export function cardValue(rank: Rank): number {
  if (rank === "A") return 1;
  if (["J", "Q", "K"].includes(rank)) return 10;
  return parseInt(rank, 10);
}

/** Sort by suit then rank (stable display order). */
export function sortHand(cards: Card[]): Card[] {
  const suitOrder: Record<Suit, number> = { S: 0, H: 1, D: 2, C: 3 };
  return [...cards].sort((a, b) => {
    const sd = suitOrder[a.suit] - suitOrder[b.suit];
    if (sd !== 0) return sd;
    return RANK_ORDER[a.rank] - RANK_ORDER[b.rank];
  });
}
