import type { Card } from "../game/types";
import CardView from "./CardView";

type Props = {
  cards: Card[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  faceDown?: boolean;
  label?: string;
};

export default function HandView({ cards, selectedId, onSelect, faceDown = false, label }: Props) {
  return (
    <div className="hand-view" aria-label={label ?? "hand"}>
      {cards.map(card => (
        <CardView
          key={card.id}
          card={card}
          faceDown={faceDown}
          selected={!faceDown && selectedId === card.id}
          onClick={onSelect && !faceDown ? () => onSelect(card.id) : undefined}
        />
      ))}
      {cards.length === 0 && <span className="empty-hand">No cards</span>}
    </div>
  );
}
