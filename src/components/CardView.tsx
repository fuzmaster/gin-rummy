import type { Card } from "../game/types";

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

const SUIT_SYMBOL: Record<string, string> = { S: "♠", H: "♥", D: "♦", C: "♣" };
const RED_SUITS = new Set(["H", "D"]);
const MELD_COLORS = 4;

export default function CardView({ card, faceDown = false, selected = false, marked = false, onClick, small = false, meldGroup }: Props) {
  if (faceDown) {
    return (
      <div className={`card card-back${small ? " card-small" : ""}`} aria-label="face-down card" />
    );
  }

  const symbol = SUIT_SYMBOL[card.suit];
  const isRed = RED_SUITS.has(card.suit);
  const meldClass = meldGroup !== undefined ? ` card-meld card-meld-${meldGroup % MELD_COLORS}` : "";
  const markedClass = marked && !selected ? " card-marked" : "";
  return (
    <div
      className={`card${isRed ? " card-red" : " card-black"}${selected ? " card-selected" : ""}${markedClass}${small ? " card-small" : ""}${meldClass}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      aria-label={`${card.rank} of ${card.suit}${selected ? ", selected to discard" : marked ? ", marked" : ""}`}
      aria-pressed={onClick ? selected || marked : undefined}
    >
      <span className="card-corner card-tl">{card.rank}<br />{symbol}</span>
      <span className="card-center">{symbol}</span>
      <span className="card-corner card-br">{card.rank}<br />{symbol}</span>
    </div>
  );
}
