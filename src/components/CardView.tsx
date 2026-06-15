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
  /** Animate this card flying into the hand (just drawn). */
  drawn?: boolean;
  /** Animate this card being placed onto the discard pile, from the given side. */
  placedBy?: "player" | "cpu" | null;
  /** Hide this card (while a flying clone travels in its place). */
  hidden?: boolean;
};

const MELD_COLORS = 4;

export default function CardView({ card, faceDown = false, selected = false, marked = false, onClick, small = false, meldGroup, drawn = false, placedBy = null, hidden = false }: Props) {
  if (faceDown) {
    return (
      <div className={`card card-back${small ? " card-small" : ""}`} aria-label="face-down card" />
    );
  }

  const meldClass = meldGroup !== undefined ? ` card-meld card-meld-${meldGroup % MELD_COLORS}` : "";
  const markedClass = marked && !selected ? " card-marked" : "";
  const animClass = drawn
    ? " card-drawn"
    : placedBy === "player"
      ? " card-place-player"
      : placedBy === "cpu"
        ? " card-place-cpu"
        : "";
  return (
    <div
      data-card-id={card.id}
      className={`card${selected ? " card-selected" : ""}${markedClass}${small ? " card-small" : ""}${meldClass}${animClass}${hidden ? " card-hidden" : ""}`}
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
