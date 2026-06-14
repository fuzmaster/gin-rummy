import type { Card } from "../game/types";
import CardView from "./CardView";

type Props = {
  cards: Card[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  faceDown?: boolean;
  label?: string;
  small?: boolean;
  /** Map of card id -> meld group index for colour-coding melds. */
  meldMap?: Record<string, number>;
};

export default function HandView({ cards, selectedId, onSelect, faceDown = false, label, small = false, meldMap }: Props) {
  return (
    <div className="hand-view" aria-label={label ?? "hand"}>
      {cards.map(card => (
        <CardView
          key={card.id}
          card={card}
          faceDown={faceDown}
          small={small}
          selected={!faceDown && selectedId === card.id}
          onClick={onSelect && !faceDown ? () => onSelect(card.id) : undefined}
          meldGroup={!faceDown ? meldMap?.[card.id] : undefined}
        />
      ))}
      {cards.length === 0 && <span className="empty-hand">No cards</span>}
    </div>
  );
}
