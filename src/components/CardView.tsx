import type { Card } from "../game/types";
import CardFace, { cardLabel } from "./CardFace";

type Props = {
  card: Card;
  faceDown?: boolean;
  selected?: boolean;
  marked?: boolean;
  onClick?: () => void;
  small?: boolean;
  /** Index of the meld this card belongs to, or undefined if it's deadwood. */
  meldGroup?: number;
};

const MELD_COLORS = 4;

export default function CardView({ card, faceDown = false, selected = false, marked = false, onClick, small = false, meldGroup }: Props) {
  if (faceDown) {
    return (
      <div className={`card card-back${small ? " card-small" : ""}`} aria-label="face-down card" />
    );
  }

  const meldClass = meldGroup !== undefined ? ` card-meld card-meld-${meldGroup % MELD_COLORS}` : "";
  const markedClass = marked && !selected ? " card-marked" : "";
  return (
    <div
      className={`card${selected ? " card-selected" : ""}${markedClass}${small ? " card-small" : ""}${meldClass}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      aria-label={`${cardLabel(card)}${selected ? ", selected to discard" : marked ? ", marked" : ""}`}
      aria-pressed={onClick ? selected || marked : undefined}
    >
      <CardFace card={card} small={small} />
    </div>
  );
}
