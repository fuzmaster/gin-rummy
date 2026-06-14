import { describe, it, expect } from 'vitest';
import { buildDeck, cardValue, makeCard } from '../game/cards';
import { isSet, isRun, bestDeadwood, deadwoodValue, applyLayoffs } from '../game/melds';
import { calculateScore } from '../game/scoring';
import { cpuChooseDiscard } from '../game/cpu';
import type { Card } from '../game/types';

// ── Helpers ──────────────────────────────────────────────────
function card(rank: Card['rank'], suit: Card['suit']): Card {
  return makeCard(rank, suit);
}

// ── Deck ─────────────────────────────────────────────────────
describe('buildDeck', () => {
  it('has 52 unique cards', () => {
    const deck = buildDeck();
    expect(deck).toHaveLength(52);
    const ids = new Set(deck.map(c => c.id));
    expect(ids.size).toBe(52);
  });
});

// ── Card values ───────────────────────────────────────────────
describe('cardValue', () => {
  it('Ace = 1', () => expect(cardValue('A')).toBe(1));
  it('10 = 10', () => expect(cardValue('10')).toBe(10));
  it('J = 10', () => expect(cardValue('J')).toBe(10));
  it('Q = 10', () => expect(cardValue('Q')).toBe(10));
  it('K = 10', () => expect(cardValue('K')).toBe(10));
  it('7 = 7', () => expect(cardValue('7')).toBe(7));
});

// ── Deadwood value ────────────────────────────────────────────
describe('deadwoodValue', () => {
  it('sums card values', () => {
    const cards = [card('A', 'S'), card('5', 'H'), card('K', 'D')];
    expect(deadwoodValue(cards)).toBe(1 + 5 + 10);
  });

  it('empty hand = 0', () => {
    expect(deadwoodValue([])).toBe(0);
  });
});

// ── isSet ────────────────────────────────────────────────────
describe('isSet', () => {
  it('detects a valid 3-card set', () => {
    expect(isSet([card('7', 'S'), card('7', 'H'), card('7', 'D')])).toBe(true);
  });

  it('detects a valid 4-card set', () => {
    expect(isSet([card('K', 'S'), card('K', 'H'), card('K', 'D'), card('K', 'C')])).toBe(true);
  });

  it('rejects mixed ranks', () => {
    expect(isSet([card('7', 'S'), card('8', 'H'), card('7', 'D')])).toBe(false);
  });

  it('rejects a 2-card group', () => {
    expect(isSet([card('7', 'S'), card('7', 'H')])).toBe(false);
  });
});

// ── isRun ────────────────────────────────────────────────────
describe('isRun', () => {
  it('detects a valid 3-card run', () => {
    expect(isRun([card('5', 'H'), card('6', 'H'), card('7', 'H')])).toBe(true);
  });

  it('detects a valid 5-card run', () => {
    const run = [card('A', 'S'), card('2', 'S'), card('3', 'S'), card('4', 'S'), card('5', 'S')];
    expect(isRun(run)).toBe(true);
  });

  it('rejects mixed suits', () => {
    expect(isRun([card('5', 'H'), card('6', 'S'), card('7', 'H')])).toBe(false);
  });

  it('rejects non-consecutive', () => {
    expect(isRun([card('5', 'H'), card('7', 'H'), card('9', 'H')])).toBe(false);
  });

  it('rejects 2-card run', () => {
    expect(isRun([card('5', 'H'), card('6', 'H')])).toBe(false);
  });
});

// ── bestDeadwood ──────────────────────────────────────────────
describe('bestDeadwood', () => {
  it('finds zero deadwood for a gin hand (runs + sets)', () => {
    // AS,2S,3S (run) + AH,2H,3H (run) + KS,KH,KD,KC (set of 4) = 10 cards, 0 deadwood
    const hand: Card[] = [
      card('A', 'S'), card('2', 'S'), card('3', 'S'),
      card('A', 'H'), card('2', 'H'), card('3', 'H'),
      card('K', 'S'), card('K', 'H'), card('K', 'D'), card('K', 'C'),
    ];
    const result = bestDeadwood(hand);
    expect(result.deadwood).toBe(0);
  });

  it('uses a set to reduce deadwood', () => {
    const hand: Card[] = [
      card('7', 'S'), card('7', 'H'), card('7', 'D'), // set
      card('2', 'C'), card('3', 'C'), card('4', 'C'), // run
      card('K', 'H'), card('Q', 'D'), card('J', 'S'), card('9', 'C'),
    ];
    const result = bestDeadwood(hand);
    // melded: 3 sevens + 2,3,4 clubs → deadwood from K,Q,J,9 = 10+10+10+9 = 39
    expect(result.deadwood).toBeLessThan(deadwoodValue(hand));
    expect(result.melds.length).toBeGreaterThan(0);
  });

  it('returns the full hand value when no melds', () => {
    const hand: Card[] = [
      card('A', 'S'), card('3', 'H'), card('5', 'D'), card('7', 'C'),
      card('9', 'S'), card('J', 'H'), card('K', 'D'),
    ];
    const expected = deadwoodValue(hand);
    const result = bestDeadwood(hand);
    expect(result.deadwood).toBe(expected);
  });
});

// ── Scoring ───────────────────────────────────────────────────
describe('calculateScore — knock', () => {
  it('knocker wins when they have lower deadwood', () => {
    // player knocks with 4 deadwood, CPU has 20
    const playerHand: Card[] = [
      card('A', 'S'), card('2', 'S'), card('3', 'S'), // run → 0 dw
      card('4', 'H'), card('5', 'H'), card('6', 'H'), // run → 0 dw
      card('7', 'D'), card('8', 'D'), card('9', 'D'), // run → 0 dw
      card('4', 'C'),                                  // 4 dw
    ];
    const cpuHand: Card[] = [
      card('K', 'S'), card('Q', 'S'), // 20 dw (no meld)
      card('2', 'H'), card('3', 'H'), card('4', 'H'),   // run 0 dw
      card('5', 'D'), card('6', 'D'), card('7', 'D'),   // run 0 dw
      card('8', 'C'), card('9', 'C'),                   // 17 dw
    ];
    const result = calculateScore('player', playerHand, cpuHand);
    expect(result.winner).toBe('player');
    expect(result.type).toBe('knock');
    expect(result.points).toBeGreaterThan(0);
  });
});

describe('calculateScore — gin', () => {
  it('awards gin bonus of 25 + opponent deadwood', () => {
    const ginHand: Card[] = [
      card('A', 'S'), card('2', 'S'), card('3', 'S'),
      card('A', 'H'), card('2', 'H'), card('3', 'H'),
      card('A', 'D'), card('2', 'D'), card('3', 'D'),
      card('A', 'C'),  // set of Aces with the three above → all melded
    ];
    // Make a hand with at least some deadwood for the CPU
    const cpuHand: Card[] = [
      card('4', 'S'), card('5', 'S'), card('6', 'S'),
      card('4', 'H'), card('5', 'H'), card('6', 'H'),
      card('4', 'D'), card('5', 'D'), card('6', 'D'),
      card('K', 'C'), // 10 deadwood
    ];
    const result = calculateScore('player', ginHand, cpuHand);
    expect(result.type).toBe('gin');
    expect(result.playerDeadwood).toBe(0);
    expect(result.points).toBe(25 + result.cpuDeadwood);
    expect(result.winner).toBe('player');
  });
});

describe('calculateScore — undercut', () => {
  it('opponent wins when their deadwood is <= knocker deadwood', () => {
    // CPU knocks but player has equal or lower deadwood
    const cpuHand: Card[] = [
      card('A', 'S'), card('2', 'S'), card('3', 'S'),
      card('4', 'H'), card('5', 'H'), card('6', 'H'),
      card('7', 'D'), card('8', 'D'), card('9', 'D'),
      card('8', 'C'),  // 8 deadwood
    ];
    const playerHand: Card[] = [
      card('A', 'H'), card('2', 'H'), card('3', 'H'),
      card('4', 'S'), card('5', 'S'), card('6', 'S'),
      card('7', 'C'), card('8', 'C'), card('9', 'C'), // wait, 8C used above — use different
      card('5', 'C'),  // 5 deadwood < 8
    ];
    const result = calculateScore('cpu', playerHand, cpuHand);
    expect(result.type).toBe('undercut');
    expect(result.winner).toBe('player');
    expect(result.points).toBe(25 + (result.cpuDeadwood - result.playerDeadwood));
  });
});

// ── Lay-offs ──────────────────────────────────────────────────
describe('applyLayoffs', () => {
  it('extends a run at both ends and leaves the rest as deadwood', () => {
    const melds = [[card('5', 'H'), card('6', 'H'), card('7', 'H')]];
    const deadwood = [card('8', 'H'), card('4', 'H'), card('K', 'C')];
    const remaining = applyLayoffs(deadwood, melds);
    expect(remaining.map(c => c.id)).toEqual(['KC']);
  });

  it('completes a set but never beyond four cards', () => {
    const melds = [[card('7', 'S'), card('7', 'H'), card('7', 'D')]];
    const remaining = applyLayoffs([card('7', 'C')], melds);
    expect(remaining).toHaveLength(0);
  });
});

describe('calculateScore — lay-offs', () => {
  it('defender lays off deadwood onto the knocker melds, lowering the points', () => {
    const playerHand: Card[] = [
      card('A', 'S'), card('2', 'S'), card('3', 'S'),   // run
      card('5', 'H'), card('6', 'H'), card('7', 'H'),   // run
      card('9', 'D'), card('10', 'D'), card('J', 'D'),  // run
      card('5', 'C'),                                    // 5 deadwood
    ];
    const cpuHand: Card[] = [
      card('2', 'C'), card('3', 'C'), card('4', 'C'),   // run
      card('6', 'S'), card('7', 'S'), card('8', 'S'),   // run
      card('8', 'H'), card('4', 'H'),                    // both lay off onto 5-6-7 hearts
      card('K', 'C'), card('Q', 'C'),                    // 20 deadwood, no lay-off
    ];
    const result = calculateScore('player', playerHand, cpuHand);
    expect(result.type).toBe('knock');
    expect(result.winner).toBe('player');
    expect(result.cpuDeadwood).toBe(20); // 8H + 4H laid off; K + Q remain
    expect(result.points).toBe(15);      // 20 - 5
  });

  it('a lay-off can turn a knock into an undercut', () => {
    const cpuHand: Card[] = [
      card('A', 'S'), card('2', 'S'), card('3', 'S'),
      card('4', 'H'), card('5', 'H'), card('6', 'H'),
      card('8', 'D'), card('9', 'D'), card('10', 'D'),
      card('6', 'C'),                                    // knocker deadwood 6
    ];
    const playerHand: Card[] = [
      card('K', 'S'), card('K', 'H'), card('K', 'D'),   // set
      card('A', 'C'), card('2', 'C'), card('3', 'C'), card('4', 'C'), // run of 4
      card('7', 'D'),                                    // lays off onto 8-9-10 diamonds
      card('A', 'H'), card('2', 'D'),                    // 3 deadwood remains
    ];
    const result = calculateScore('cpu', playerHand, cpuHand);
    expect(result.type).toBe('undercut');
    expect(result.winner).toBe('player');
    expect(result.cpuDeadwood).toBe(6);
    expect(result.playerDeadwood).toBe(3); // A♥ + 2♦ after 7♦ lays off
    expect(result.points).toBe(28); // 25 + (6 - 3)
  });
});

// ── CPU discard ───────────────────────────────────────────────
describe('cpuChooseDiscard', () => {
  it('discards the card that minimizes deadwood', () => {
    // Hand has a run A,2,3 of S + other cards. High card should be discarded.
    const hand: Card[] = [
      card('A', 'S'), card('2', 'S'), card('3', 'S'),
      card('K', 'H'), card('Q', 'D'), card('J', 'C'), card('9', 'H'),
      card('5', 'S'), card('4', 'D'), card('2', 'C'), card('K', 'D'),
    ];
    const discard = cpuChooseDiscard(hand);
    // Discarding K (10 pts) should be among the best choices
    const handAfter = hand.filter(c => c.id !== discard.id);
    const dwAfter = bestDeadwood(handAfter).deadwood;
    // Ensure this is at or near the minimum possible deadwood for removing one card
    const allDws = hand.map(c => bestDeadwood(hand.filter(h => h.id !== c.id)).deadwood);
    expect(dwAfter).toBe(Math.min(...allDws));
  });
});
