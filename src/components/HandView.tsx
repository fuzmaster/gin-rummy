import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
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
  /** Measure the container and overlap cards just enough to fit (keeps cards big). */
  dynamicFit?: boolean;
  /** Card id that was just drawn (plays the draw-in animation). */
  drawnId?: string | null;
  /** Card id to hide while a flying clone travels in its place. */
  hiddenId?: string | null;
  /** Card id to spotlight as the suggested move (Hint). */
  hintedId?: string | null;
  /** Map of card id -> meld group index for colour-coding melds. */
  meldMap?: Record<string, number>;
};

export default function HandView({ cards, selectedId, markedIds, onSelect, faceDown = false, label, small = false, fan = false, fanCpu = false, dynamicFit = false, drawnId, hiddenId, hintedId, meldMap }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [overlap, setOverlap] = useState<number | null>(null);
  const count = cards.length;

  // Pick the smallest overlap that still fits all cards in the container, so
  // cards stay as large and spread out as possible (good for small hands / kids).
  useLayoutEffect(() => {
    if (!dynamicFit || !fan) return;
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      if (count <= 1) { setOverlap(0); return; }
      const cardEl = el.querySelector(".card") as HTMLElement | null;
      const cardW = cardEl ? cardEl.getBoundingClientRect().width : 84;
      const containerW = el.clientWidth;
      const gap = 8; // breathing room when the hand comfortably fits
      const natural = count * cardW + (count - 1) * gap;
      if (natural <= containerW) { setOverlap(-gap); return; }
      const needed = (count * cardW - containerW) / (count - 1);
      const maxOverlap = cardW * 0.6; // always keep >=40% of every card visible
      setOverlap(Math.min(needed + 2, maxOverlap));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [dynamicFit, fan, count]);

  const cls = `hand-view${fan ? " hand-fan" : ""}${fanCpu ? " hand-fan-cpu" : ""}`;
  const style = overlap !== null ? ({ "--fan-overlap": `${overlap}px` } as CSSProperties) : undefined;

  return (
    <div ref={ref} className={cls} style={style} aria-label={label ?? "hand"}>
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
          hinted={!faceDown && !!hintedId && card.id === hintedId}
        />
      ))}
      {cards.length === 0 && <span className="empty-hand">No cards</span>}
    </div>
  );
}
