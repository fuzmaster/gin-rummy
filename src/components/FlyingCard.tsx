import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Card } from "../game/types";
import CardView from "./CardView";

export type Flight = {
  key: number;
  card: Card | null; // null = face-down (drawing from stock)
  from: { x: number; y: number };
  to: { x: number; y: number };
  w: number;
  h: number;
};

type Props = {
  flight: Flight;
  onDone: () => void;
};

const DURATION = 420;

/** A single card that animates from `from` to `to` over a fixed overlay layer. */
export default function FlyingCard({ flight, onDone }: Props) {
  const [moved, setMoved] = useState(false);

  useEffect(() => {
    // Two rAFs so the browser paints the start position before transitioning.
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setMoved(true));
    });
    const timer = setTimeout(onDone, DURATION + 30);
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(timer);
    };
  }, [flight.key, onDone]);

  const dx = flight.to.x - flight.from.x;
  const dy = flight.to.y - flight.from.y;

  return createPortal(
    <div
      className="flying-card"
      style={{
        left: flight.from.x - flight.w / 2,
        top: flight.from.y - flight.h / 2,
        width: flight.w,
        height: flight.h,
        transform: moved
          ? `translate(${dx}px, ${dy}px) scale(1)`
          : "translate(0, 0) scale(1.06)",
        transition: `transform ${DURATION}ms cubic-bezier(0.33, 0.66, 0.4, 1)`,
      }}
      aria-hidden="true"
    >
      {flight.card ? <CardView card={flight.card} /> : <div className="card card-back" />}
    </div>,
    document.body
  );
}
