import type { Card } from "../game/types";
import CardView from "./CardView";

type Props = {
  cards: Card[];
  selectedId?: string | null;
  markedIds?: string[];
  onSelect?: (id: string) => void;
  faceDown?: boolean;
  label?: string;
  small?: boolean;
  /** Render as an overlapping fan instead of a wrapped row. */
  fan?: boolean;
  /** Stronger overlap for the (face-down) CPU hand. */
  fanCpu?: boolean;
  /** Card id that was just drawn (plays the draw-in animation). */
  drawnId?: string | null;
  /** Card id to hide while a flying clone travels in its place. */
  hiddenId?: string | null;
  /** Map of card id -> meld group index for colour-coding melds. */
  meldMap?: Record<string, number>;
};

export default function HandView({ cards, selectedId, markedIds, onSelect, faceDown = false, label, small = false, fan = false, fanCpu = false, drawnId, hiddenId, meldMap }: Props) {
  const cls = `hand-view${fan ? " hand-fan" : ""}${fanCpu ? " hand-fan-cpu" : ""}`;
  return (
    <div className={cls} aria-label={label ?? "hand"}>
      {cards.map((card, i) => (
        <CardView
          key={card.id}
          card={card}
          index={i}
          faceDown={faceDown}
          small={small}
          selected={!faceDown && selectedId === card.id}
          marked={!faceDown && !!markedIds?.includes(card.id)}
          onClick={onSelect && !faceDown ? () => onSelect(card.id) : undefined}
          meldGroup={!faceDown ? meldMap?.[card.id] : undefined}
          drawn={!faceDown && !!drawnId && card.id === drawnId}
          hidden={!!hiddenId && card.id === hiddenId}
        />
      ))}
      {cards.length === 0 && <span className="empty-hand">No cards</span>}
    </div>
  );
}
