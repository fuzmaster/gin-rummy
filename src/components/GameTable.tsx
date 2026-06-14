import type { GameState } from "../game/types";
import { bestDeadwood } from "../game/melds";
import CardView from "./CardView";
import HandView from "./HandView";

type Props = {
  state: GameState;
  onDrawStock: () => void;
  onDrawDiscard: () => void;
  onSelectCard: (id: string) => void;
  onDiscard: () => void;
  onKnock: () => void;
};

export default function GameTable({ state, onDrawStock, onDrawDiscard, onSelectCard, onDiscard, onKnock }: Props) {
  const { phase, stock, discardPile, playerHand, cpuHand, selectedCard, statusMessage } = state;

  const canDraw = phase === "awaiting-draw";
  const canDiscard = phase === "awaiting-discard" && !!selectedCard;
  const canKnock = phase === "awaiting-discard" && !!selectedCard && (() => {
    const card = playerHand.find(c => c.id === selectedCard);
    if (!card) return false;
    const handAfter = playerHand.filter(c => c.id !== selectedCard);
    return bestDeadwood(handAfter).deadwood <= 10;
  })();

  const topDiscard = discardPile[discardPile.length - 1];
  const playerDW = bestDeadwood(playerHand).deadwood;

  return (
    <div className="game-table">
      {/* CPU area */}
      <section className="cpu-area" aria-label="CPU hand">
        <div className="area-label">CPU ({cpuHand.length} cards)</div>
        <HandView cards={cpuHand} faceDown label="CPU hand" />
      </section>

      {/* Center piles */}
      <section className="center-area">
        <div className="pile-group">
          <div className="pile-label">Stock ({stock.length})</div>
          <button
            className="pile-btn"
            disabled={!canDraw}
            onClick={onDrawStock}
            aria-label="Draw from stock"
          >
            {stock.length > 0 ? (
              <div className="card card-back" />
            ) : (
              <div className="card card-empty">∅</div>
            )}
          </button>
        </div>

        <div className="pile-group">
          <div className="pile-label">Discard</div>
          <button
            className="pile-btn"
            disabled={!canDraw || !topDiscard}
            onClick={onDrawDiscard}
            aria-label={topDiscard ? `Draw ${topDiscard.id} from discard` : "Discard pile empty"}
          >
            {topDiscard ? (
              <CardView card={topDiscard} />
            ) : (
              <div className="card card-empty">∅</div>
            )}
          </button>
        </div>
      </section>

      {/* Status */}
      <div className="status-message" role="status" aria-live="polite">{statusMessage}</div>

      {/* Player area */}
      <section className="player-area" aria-label="Player hand">
        <div className="area-label">Your hand — deadwood: {playerDW}</div>
        <HandView
          cards={playerHand}
          selectedId={selectedCard}
          onSelect={phase === "awaiting-discard" ? onSelectCard : undefined}
          label="Player hand"
        />
        <div className="action-buttons">
          <button className="btn" disabled={!canDraw} onClick={onDrawStock}>Draw Stock</button>
          <button className="btn" disabled={!canDraw || !topDiscard} onClick={onDrawDiscard}>Draw Discard</button>
          <button className="btn btn-primary" disabled={!canDiscard} onClick={onDiscard}>Discard</button>
          <button className="btn btn-knock" disabled={!canKnock} onClick={onKnock}>
            {canKnock && bestDeadwood(playerHand.filter(c => c.id !== selectedCard)).deadwood === 0 ? "Gin! 🎉" : "Knock"}
          </button>
        </div>
      </section>
    </div>
  );
}
