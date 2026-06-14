export type Suit = "S" | "H" | "D" | "C";
export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

export type Card = {
  id: string;
  suit: Suit;
  rank: Rank;
};

export type Phase =
  | "awaiting-draw"
  | "awaiting-discard"
  | "cpu-turn"
  | "round-over"
  | "game-over";

export type RoundResult = {
  winner: "player" | "cpu" | null;   // null = drawn round (no points)
  type: "gin" | "knock" | "undercut" | "draw";
  playerDeadwood: number;
  cpuDeadwood: number;
  points: number;
  knocker: "player" | "cpu" | null;
};

export type GameState = {
  phase: Phase;
  stock: Card[];
  discardPile: Card[];
  playerHand: Card[];
  cpuHand: Card[];
  selectedCard: string | null;   // card id
  playerScore: number;
  cpuScore: number;
  round: number;
  statusMessage: string;
  roundResult: RoundResult | null;
  drewFromDiscard: boolean;
  targetScore: number;   // points needed to win the game
  gameId: number;        // unique per game, used to record stats once
};
