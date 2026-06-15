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

type ToneOpts = { duration?: number; type?: OscillatorType; gain?: number; delay?: number; slideTo?: number };

/** A single shaped tone (chimes / arpeggios). */
function tone(freq: number, { duration = 0.12, type = "sine", gain = 0.18, delay = 0, slideTo }: ToneOpts = {}): void {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;
  const start = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const env = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
  env.gain.setValueAtTime(0.0001, start);
  env.gain.exponentialRampToValueAtTime(gain, start + 0.01);
  env.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(env).connect(ac.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

/** Drawing a card — a quick airy slide. */
export function playDraw(): void {
  noiseBurst(0.17, 2000, 0.7, 0.22);
}

/** Placing a card on the discard pile — a crisper snap. */
export function playDiscard(): void {
  noiseBurst(0.11, 1300, 0.5, 0.3);
}

/** Dealing a new hand — a quick flurry of soft card flicks. */
export function playDeal(): void {
  for (let i = 0; i < 5; i++) {
    tone(420 + i * 30, { duration: 0.06, type: "triangle", gain: 0.12, delay: i * 0.06 });
  }
}

/** Knock — a bright C–E–G–C arpeggio. */
export function playWin(): void {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((f, i) => tone(f, { duration: 0.16, type: "sine", gain: 0.16, delay: i * 0.09 }));
}

/** Gin — a longer, fuller fanfare. */
export function playBigWin(): void {
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
  notes.forEach((f, i) => tone(f, { duration: 0.22, type: "triangle", gain: 0.18, delay: i * 0.1 }));
}

/** Losing a round — a soft downward slide. */
export function playLose(): void {
  tone(220, { duration: 0.3, type: "sawtooth", gain: 0.12, slideTo: 120 });
}
