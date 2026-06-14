import type { GameState, Card } from "./types";
import { buildDeck, shuffle, sortHand } from "./cards";
import { bestDeadwood } from "./melds";
import { calculateScore } from "./scoring";
import { cpuTakeTurn } from "./cpu";

const WIN_SCORE = 100;

function reshuffleIfNeeded(stock: Card[], discardPile: Card[]): { stock: Card[]; discardPile: Card[] } {
  if (stock.length > 0) return { stock, discardPile };
  if (discardPile.length <= 1) return { stock, discardPile };
  const top = discardPile[discardPile.length - 1];
  const rest = shuffle(discardPile.slice(0, -1));
  return { stock: rest, discardPile: [top] };
}

/** End the current round with no points (stock exhausted with no play possible). */
function drawnRound(state: GameState): GameState {
  return {
    ...state,
    phase: "round-over",
    selectedCard: null,
    roundResult: {
      winner: null,
      type: "draw",
      playerDeadwood: bestDeadwood(state.playerHand).deadwood,
      cpuDeadwood: bestDeadwood(state.cpuHand).deadwood,
      points: 0,
      knocker: null,
    },
    statusMessage: "Stock exhausted — the round is a draw. No points awarded.",
  };
}

export function createInitialState(): GameState {
  return newRound({
    phase: "awaiting-draw",
    stock: [],
    discardPile: [],
    playerHand: [],
    cpuHand: [],
    selectedCard: null,
    playerScore: 0,
    cpuScore: 0,
    round: 0,
    statusMessage: "",
    roundResult: null,
    drewFromDiscard: false,
  });
}

export function newRound(state: GameState): GameState {
  const deck = shuffle(buildDeck());
  const playerHand = sortHand(deck.splice(0, 10));
  const cpuHand = sortHand(deck.splice(0, 10));
  const discardPile = [deck.splice(0, 1)[0]];
  const stock = deck;
  return {
    ...state,
    phase: "awaiting-draw",
    stock,
    discardPile,
    playerHand,
    cpuHand,
    selectedCard: null,
    roundResult: null,
    drewFromDiscard: false,
    round: state.round + 1,
    statusMessage: "Your turn — draw a card.",
  };
}

export function playerDrawStock(state: GameState): GameState {
  if (state.phase !== "awaiting-draw") return state;
  const { stock, discardPile } = reshuffleIfNeeded(state.stock, state.discardPile);
  if (stock.length === 0) return drawnRound(state);
  const drawn = stock[stock.length - 1];
  const newStock = stock.slice(0, -1);
  return {
    ...state,
    stock: newStock,
    discardPile,
    playerHand: sortHand([...state.playerHand, drawn]),
    phase: "awaiting-discard",
    drewFromDiscard: false,
    statusMessage: `You drew ${drawn.id} from stock. Select a card to discard.`,
  };
}

export function playerDrawDiscard(state: GameState): GameState {
  if (state.phase !== "awaiting-draw") return state;
  if (state.discardPile.length === 0) return state;
  const drawn = state.discardPile[state.discardPile.length - 1];
  const newDiscardPile = state.discardPile.slice(0, -1);
  return {
    ...state,
    discardPile: newDiscardPile,
    playerHand: sortHand([...state.playerHand, drawn]),
    phase: "awaiting-discard",
    drewFromDiscard: true,
    statusMessage: `You drew ${drawn.id} from discard. Select a card to discard.`,
  };
}

export function playerSelectCard(state: GameState, cardId: string): GameState {
  return { ...state, selectedCard: cardId };
}

export function playerDiscard(state: GameState): GameState {
  if (state.phase !== "awaiting-discard" || !state.selectedCard) return state;
  const card = state.playerHand.find(c => c.id === state.selectedCard);
  if (!card) return state;
  // Can't discard a card drawn from discard pile back onto it (same card)
  if (state.drewFromDiscard && card.id === state.discardPile[state.discardPile.length - 1]?.id) {
    return { ...state, statusMessage: "You can't discard the card you just drew from the discard pile." };
  }
  const newHand = state.playerHand.filter(c => c.id !== card.id);
  return {
    ...state,
    playerHand: newHand,
    discardPile: [...state.discardPile, card],
    selectedCard: null,
    phase: "cpu-turn",
    drewFromDiscard: false,
    statusMessage: `You discarded ${card.id}. CPU is thinking…`,
  };
}

export function playerKnock(state: GameState): GameState {
  if (state.phase !== "awaiting-discard" || !state.selectedCard) return state;
  const card = state.playerHand.find(c => c.id === state.selectedCard);
  if (!card) return state;
  const newHand = state.playerHand.filter(c => c.id !== card.id);
  const dw = bestDeadwood(newHand).deadwood;
  if (dw > 10) return { ...state, statusMessage: "You can't knock — deadwood is more than 10." };

  const result = calculateScore("player", newHand, state.cpuHand);
  const newPlayerScore = state.playerScore + (result.winner === "player" ? result.points : 0);
  const newCpuScore = state.cpuScore + (result.winner === "cpu" ? result.points : 0);
  const phase = newPlayerScore >= WIN_SCORE || newCpuScore >= WIN_SCORE ? "game-over" : "round-over";

  return {
    ...state,
    playerHand: newHand,
    discardPile: [...state.discardPile, card],
    selectedCard: null,
    phase,
    playerScore: newPlayerScore,
    cpuScore: newCpuScore,
    roundResult: result,
    statusMessage: dw === 0 ? "Gin! You win this round!" : "You knocked!",
  };
}

export function runCpuTurn(state: GameState): GameState {
  if (state.phase !== "cpu-turn") return state;

  // If the CPU can neither draw from stock nor refill it, the round is a draw.
  if (state.stock.length === 0 && state.discardPile.length <= 1) {
    return drawnRound(state);
  }

  const { newHand, newStock, newDiscardPile, knocked, discardedCard, drewFrom } =
    cpuTakeTurn(state.cpuHand, state.stock, state.discardPile);

  const drewMsg = drewFrom === "discard" ? "discard" : "stock";

  if (knocked) {
    const result = calculateScore("cpu", state.playerHand, newHand);
    const newPlayerScore = state.playerScore + (result.winner === "player" ? result.points : 0);
    const newCpuScore = state.cpuScore + (result.winner === "cpu" ? result.points : 0);
    const phase = newPlayerScore >= WIN_SCORE || newCpuScore >= WIN_SCORE ? "game-over" : "round-over";
    return {
      ...state,
      cpuHand: newHand,
      stock: newStock,
      discardPile: newDiscardPile,
      phase,
      playerScore: newPlayerScore,
      cpuScore: newCpuScore,
      roundResult: result,
      statusMessage: `CPU drew from ${drewMsg}, discarded ${discardedCard.id}, and knocked!`,
    };
  }

  return {
    ...state,
    cpuHand: newHand,
    stock: newStock,
    discardPile: newDiscardPile,
    phase: "awaiting-draw",
    statusMessage: `CPU drew from ${drewMsg} and discarded ${discardedCard.id}. Your turn — draw a card.`,
  };
}
