import { useMemo, useState } from "react";
import type { GameState } from "../game/types";
import { bestDeadwood } from "../game/melds";
import { RANK_ORDER } from "../game/cards";
import CardView from "./CardView";
import HandView from "./HandView";

const SUIT_ORDER: Record<string, number> = { S: 0, H: 1, D: 2, C: 3 };

type Props = {
  state: GameState;
  onDrawStock: () => void;
  onDrawDiscard: () => void;
  onSelectCard: (id: string) => void;
  onDiscard: () => void;
  onKnock: () => void;
};

export default function GameTable({ state, onDrawStock, onDrawDiscard, onSelectCard, onDiscard, onKnock }: Props) {
  const { phase, stock, discardPile, playerHand, cpuHand, selectedCard, markedCards, statusMessage } = state;
  const [sortMode, setSortMode] = useState<"suit" | "rank">("suit");

  // Best arrangement: melds laid out on the table, deadwood kept in hand.
  const best = useMemo(() => bestDeadwood(playerHand), [playerHand]);
  const playerDW = best.deadwood;

  const meldMap = useMemo(() => {
    const m: Record<string, number> = {};
    best.melds.forEach((meld, i) => meld.forEach(c => { m[c.id] = i; }));
    return m;
  }, [best]);

  const deadwoodCards = useMemo(() => {
    if (sortMode === "suit") return best.deadwoodCards;
    return [...best.deadwoodCards].sort(
      (a, b) => RANK_ORDER[a.rank] - RANK_ORDER[b.rank] || SUIT_ORDER[a.suit] - SUIT_ORDER[b.suit]
    );
  }, [best, sortMode]);

  const handAfterDiscardDW = useMemo(() => {
    if (!selectedCard) return null;
    return bestDeadwood(playerHand.filter(c => c.id !== selectedCard)).deadwood;
  }, [playerHand, selectedCard]);

  const canDraw = phase === "awaiting-draw";
  const canDiscard = phase === "awaiting-discard" && !!selectedCard;
  const canKnock =
    phase === "awaiting-discard" && handAfterDiscardDW !== null && handAfterDiscardDW <= 10;
  const isGin = canKnock && handAfterDiscardDW === 0;
  const onSelect = phase === "awaiting-discard" ? onSelectCard : undefined;

  const topDiscard = discardPile[discardPile.length - 1];

  return (
    <div className="game-table">
      {/* CPU area */}
      <section className="cpu-area" aria-label="CPU hand">
        <div className="area-label">CPU · {cpuHand.length} cards</div>
        <HandView cards={cpuHand} faceDown fan fanCpu label="CPU hand" />
      </section>

      {/* Player melds laid out on the felt */}
      <section className="melds-area" aria-label="Your melds">
        {best.melds.length === 0 ? (
          <span className="melds-empty">No melds yet — build runs &amp; sets</span>
        ) : (
          best.melds.map((meld, i) => (
            <HandView
              key={i}
              cards={meld}
              selectedId={selectedCard}
              markedIds={markedCards}
              onSelect={onSelect}
              fan
              meldMap={meldMap}
              label={`Meld ${i + 1}`}
            />
          ))
        )}
      </section>

      {/* Center piles */}
      <section className="center-area">
        <div className="pile-group">
          <div className="pile-label">Stock</div>
          <button
            className="pile-btn"
            disabled={!canDraw}
            onClick={onDrawStock}
            aria-label={`Draw from stock, ${stock.length} cards left`}
          >
            {stock.length > 0 ? (
              <div className="card card-back stock-card"><span className="stock-count">{stock.length}</span></div>
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

      {/* Player deadwood + controls */}
      <section className="player-area" aria-label="Your hand">
        <div className="area-header">
          <span className={`deadwood-chip${playerDW <= 10 ? " deadwood-chip-low" : ""}`}>
            Deadwood <strong>{playerDW}</strong>
            {playerDW === 0 ? " · Gin!" : playerDW <= 10 ? " · can knock" : ""}
          </span>
          <button
            className="btn btn-sort"
            onClick={() => setSortMode(m => (m === "suit" ? "rank" : "suit"))}
            aria-label={`Sort deadwood by ${sortMode === "suit" ? "rank" : "suit"}`}
          >
            ⇄ Sort
          </button>
        </div>
        <HandView
          cards={deadwoodCards}
          selectedId={selectedCard}
          markedIds={markedCards}
          onSelect={onSelect}
          fan
          label="Your deadwood"
        />
        {deadwoodCards.length === 0 && <div className="melds-empty">All melded — knock for Gin!</div>}
        {phase === "awaiting-discard" && markedCards.length > 1 && selectedCard && (
          <div className="discard-hint">
            {markedCards.length} cards marked · Discard removes <strong>{selectedCard}</strong> (the lifted card)
          </div>
        )}
        <div className="action-buttons">
          <button className="btn" disabled={!canDraw} onClick={onDrawStock}>🂠 Draw Stock</button>
          <button className="btn" disabled={!canDraw || !topDiscard} onClick={onDrawDiscard}>♻ Draw Discard</button>
          <button className="btn btn-primary" disabled={!canDiscard} onClick={onDiscard}>Discard</button>
          <button
            className={`btn btn-knock${canKnock ? " btn-knock-ready" : ""}`}
            disabled={!canKnock}
            onClick={onKnock}
          >
            {isGin ? "Gin! 🎉" : "Knock"}
          </button>
        </div>
      </section>
    </div>
  );
}
