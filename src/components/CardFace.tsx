import type { Card } from "../game/types";

const SUIT_SYMBOL: Record<string, string> = { S: "♠", H: "♥", D: "♦", C: "♣" };
const RED_SUITS = new Set(["H", "D"]);

// Pip column x-positions and the suit-symbol layout per rank, in a 100×140 viewBox.
const L = 30;
const C = 50;
const R = 70;

const PIPS: Record<string, [number, number][]> = {
  A: [[C, 70]],
  "2": [[C, 30], [C, 110]],
  "3": [[C, 30], [C, 70], [C, 110]],
  "4": [[L, 30], [R, 30], [L, 110], [R, 110]],
  "5": [[L, 30], [R, 30], [C, 70], [L, 110], [R, 110]],
  "6": [[L, 30], [R, 30], [L, 70], [R, 70], [L, 110], [R, 110]],
  "7": [[L, 30], [R, 30], [C, 50], [L, 70], [R, 70], [L, 110], [R, 110]],
  "8": [[L, 30], [R, 30], [C, 50], [L, 70], [R, 70], [C, 90], [L, 110], [R, 110]],
  "9": [[L, 30], [R, 30], [L, 57], [R, 57], [C, 70], [L, 83], [R, 83], [L, 110], [R, 110]],
  "10": [[L, 30], [R, 30], [L, 57], [R, 57], [C, 50], [L, 83], [R, 83], [C, 90], [L, 110], [R, 110]],
};

const FACE_RANKS = new Set(["J", "Q", "K"]);
const FACE_LABEL: Record<string, string> = { J: "Jack", Q: "Queen", K: "King" };

type Props = {
  card: Card;
  small?: boolean;
};

/** Renders a playing-card face as scalable SVG (corner indices + pips / court figure). */
export default function CardFace({ card }: Props) {
  const symbol = SUIT_SYMBOL[card.suit];
  const isRed = RED_SUITS.has(card.suit);
  const color = isRed ? "var(--red)" : "var(--black)";
  const isFace = FACE_RANKS.has(card.rank);

  return (
    <svg
      className="card-face"
      viewBox="0 0 100 140"
      preserveAspectRatio="none"
      role="img"
      aria-hidden="true"
    >
      {/* Corner index — top-left, and mirrored bottom-right. */}
      {[false, true].map((mirror) => (
        <g key={mirror ? "br" : "tl"} transform={mirror ? "rotate(180 50 70)" : undefined} fill={color}>
          <text x="13" y="26" className="card-index-rank" textAnchor="middle">{card.rank}</text>
          <text x="13" y="41" className="card-index-suit" textAnchor="middle">{symbol}</text>
        </g>
      ))}

      {isFace ? (
        <g>
          <rect
            x="26" y="28" width="48" height="84" rx="5"
            fill={isRed ? "rgba(204,34,34,0.08)" : "rgba(17,17,17,0.06)"}
            stroke={color} strokeWidth="1.5"
          />
          <text x="50" y="62" className="card-face-suit" textAnchor="middle" fill={color}>{symbol}</text>
          <text x="50" y="98" className="card-face-letter" textAnchor="middle" fill={color}>{card.rank}</text>
        </g>
      ) : (
        PIPS[card.rank].map(([x, y], i) => (
          <text
            key={i}
            x={x}
            y={y}
            className="card-pip"
            textAnchor="middle"
            dominantBaseline="central"
            fill={color}
            transform={y > 70 ? `rotate(180 ${x} ${y})` : undefined}
          >
            {symbol}
          </text>
        ))
      )}
    </svg>
  );
}

export function cardLabel(card: Card): string {
  const rank = FACE_RANKS.has(card.rank) ? FACE_LABEL[card.rank] : card.rank === "A" ? "Ace" : card.rank;
  const suit = { S: "Spades", H: "Hearts", D: "Diamonds", C: "Clubs" }[card.suit];
  return `${rank} of ${suit}`;
}
