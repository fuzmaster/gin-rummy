/* ============================================================
   Sound effects — synthesized with the Web Audio API so there
   are no asset files to ship. All playback is a no-op when muted
   or before the user's first interaction (AudioContext suspended).
   ============================================================ */

let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(m: boolean): void {
  muted = m;
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Short burst of band-passed noise — the basis of a card slide / snap. */
function noiseBurst(duration: number, freq: number, q: number, gain: number): void {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;

  const buffer = ac.createBuffer(1, Math.max(1, Math.floor(ac.sampleRate * duration)), ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  const src = ac.createBufferSource();
  src.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = freq;
  filter.Q.value = q;

  const g = ac.createGain();
  const now = ac.currentTime;
  g.gain.setValueAtTime(0.0001, now);
  g.gain.linearRampToValueAtTime(gain, now + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  src.connect(filter);
  filter.connect(g);
  g.connect(ac.destination);
  src.start(now);
  src.stop(now + duration + 0.02);
}

/** A short tone (for chimes). */
function tone(freq: number, start: number, duration: number, gain: number): void {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  osc.type = "triangle";
  const g = ac.createGain();
  const t0 = ac.currentTime + start;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

/** Drawing a card — a quick airy slide. */
export function playDraw(): void {
  noiseBurst(0.17, 2000, 0.7, 0.22);
}

/** Placing a card on the discard pile — a crisper snap. */
export function playDiscard(): void {
  noiseBurst(0.11, 1300, 0.5, 0.3);
}

/** Dealing a new hand — one soft riffle. */
export function playDeal(): void {
  noiseBurst(0.28, 1600, 0.4, 0.18);
}

/** Knock / gin — a short happy two-note chime. */
export function playWin(): void {
  tone(660, 0, 0.16, 0.18);
  tone(880, 0.12, 0.22, 0.18);
}

/** Losing a round — a soft downward two-note. */
export function playLose(): void {
  tone(440, 0, 0.18, 0.16);
  tone(330, 0.14, 0.26, 0.16);
}
