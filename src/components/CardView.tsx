import type { Card } from "../game/types";

type Props = {
  card: Card;
  faceDown?: boolean;
  selected?: boolean;
  onClick?: () => void;
  small?: boolean;
};

const SUIT_SYMBOL: Record<string, string> = { S: "♠", H: "♥", D: "♦", C: "♣" };
const RED_SUITS = new Set(["H", "D"]);

export default function CardView({ card, faceDown = false, selected = false, onClick, small = false }: Props) {
  if (faceDown) {
    return (
      <div className={`card card-back${small ? " card-small" : ""}`} aria-label="face-down card" />
    );
  }

  const symbol = SUIT_SYMBOL[card.suit];
  const isRed = RED_SUITS.has(card.suit);
  return (
    <div
      className={`card${isRed ? " card-red" : " card-black"}${selected ? " card-selected" : ""}${small ? " card-small" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      aria-label={`${card.rank} of ${card.suit}${selected ? ", selected" : ""}`}
    >
      <span className="card-corner card-tl">{card.rank}<br />{symbol}</span>
      <span className="card-center">{symbol}</span>
      <span className="card-corner card-br">{card.rank}<br />{symbol}</span>
    </div>
  );
}
