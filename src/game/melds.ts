import type { Card } from "./types";
import { RANK_ORDER, cardValue } from "./cards";

/** Returns true if the cards form a valid set (3–4 cards same rank). */
export function isSet(cards: Card[]): boolean {
  if (cards.length < 3 || cards.length > 4) return false;
  const rank = cards[0].rank;
  return cards.every(c => c.rank === rank);
}

/** Returns true if the cards form a valid run (3+ same suit, consecutive rank). */
export function isRun(cards: Card[]): boolean {
  if (cards.length < 3) return false;
  const suit = cards[0].suit;
  if (!cards.every(c => c.suit === suit)) return false;
  const sorted = [...cards].sort((a, b) => RANK_ORDER[a.rank] - RANK_ORDER[b.rank]);
  for (let i = 1; i < sorted.length; i++) {
    if (RANK_ORDER[sorted[i].rank] !== RANK_ORDER[sorted[i - 1].rank] + 1) return false;
  }
  return true;
}

/** Returns true if a group of cards forms a valid meld. */
export function isMeld(cards: Card[]): boolean {
  return isSet(cards) || isRun(cards);
}

type Meld = Card[];

/** Generate all valid melds from a hand. */
function findAllMelds(hand: Card[]): Meld[] {
  const melds: Meld[] = [];

  // Check sets: group by rank
  const byRank = new Map<string, Card[]>();
  for (const c of hand) {
    const arr = byRank.get(c.rank) ?? [];
    arr.push(c);
    byRank.set(c.rank, arr);
  }
  for (const [, group] of byRank) {
    if (group.length >= 3) {
      melds.push([...group]);
      if (group.length === 4) {
        // also push all 4-choose-3 subsets
        for (let i = 0; i < 4; i++) {
          melds.push(group.filter((_, idx) => idx !== i));
        }
      }
    }
  }

  // Check runs: group by suit
  const bySuit = new Map<string, Card[]>();
  for (const c of hand) {
    const arr = bySuit.get(c.suit) ?? [];
    arr.push(c);
    bySuit.set(c.suit, arr);
  }
  for (const [, group] of bySuit) {
    if (group.length < 3) continue;
    const sorted = [...group].sort((a, b) => RANK_ORDER[a.rank] - RANK_ORDER[b.rank]);
    // Find all consecutive subsequences of length >= 3
    for (let start = 0; start < sorted.length; start++) {
      for (let end = start + 2; end < sorted.length; end++) {
        const slice = sorted.slice(start, end + 1);
        if (isRun(slice)) melds.push(slice);
      }
    }
  }

  return melds;
}

/** Compute total deadwood value from a set of unmelded cards. */
export function deadwoodValue(cards: Card[]): number {
  return cards.reduce((sum, c) => sum + cardValue(c.rank), 0);
}

/**
 * Find the best arrangement of melds that minimises deadwood.
 * Returns { melds, deadwood, deadwoodCards }.
 */
export function bestDeadwood(hand: Card[]): {
  melds: Meld[];
  deadwood: number;
  deadwoodCards: Card[];
} {
  const allMelds = findAllMelds(hand);

  let best = {
    melds: [] as Meld[],
    deadwood: deadwoodValue(hand),
    deadwoodCards: [...hand],
  };

  function search(meldsSoFar: Meld[], remaining: Card[]) {
    const dw = deadwoodValue(remaining);
    if (dw < best.deadwood) {
      best = { melds: meldsSoFar, deadwood: dw, deadwoodCards: remaining };
    }

    for (const meld of allMelds) {
      // Only use this meld if all its cards are still in remaining
      if (!meld.every(c => remaining.find(r => r.id === c.id))) continue;
      const afterMeld = remaining.filter(r => !meld.find(m => m.id === r.id));
      search([...meldsSoFar, meld], afterMeld);
    }
  }

  search([], hand);
  return best;
}
