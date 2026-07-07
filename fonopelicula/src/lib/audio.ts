/**
 * Efectos de sonido sintetizados con WebAudio — sin assets externos.
 * El contexto se crea perezosamente en el primer gesto del usuario.
 */

let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(value: boolean) {
  muted = value;
}

function audioContext(): AudioContext | null {
  if (muted) return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

interface ToneOptions {
  type?: OscillatorType;
  gain?: number;
  when?: number;
  slideTo?: number;
}

function tone(freq: number, duration: number, opts: ToneOptions = {}) {
  const ac = audioContext();
  if (!ac) return;
  const { type = 'sine', gain = 0.12, when = 0, slideTo } = opts;
  const t0 = ac.currentTime + when;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + duration);
  amp.gain.setValueAtTime(0, t0);
  amp.gain.linearRampToValueAtTime(gain, t0 + 0.015);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(amp).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

export const sfx = {
  correct() {
    tone(660, 0.12, { type: 'triangle' });
    tone(990, 0.18, { type: 'triangle', when: 0.09 });
  },
  wrong() {
    tone(240, 0.22, { type: 'sawtooth', gain: 0.05, slideTo: 170 });
  },
  pop() {
    tone(540, 0.06, { type: 'triangle', gain: 0.1, slideTo: 860 });
  },
  bomb() {
    tone(140, 0.3, { type: 'square', gain: 0.05, slideTo: 70 });
  },
  star(index: number) {
    tone(720 + index * 170, 0.16, { type: 'triangle', gain: 0.14 });
  },
  unlock() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.14, { type: 'triangle', when: i * 0.09 }));
  },
  win() {
    [523, 659, 784, 659, 784, 1047].forEach((f, i) =>
      tone(f, 0.18, { type: 'triangle', gain: 0.13, when: i * 0.11 }),
    );
  },
  click() {
    tone(420, 0.05, { type: 'triangle', gain: 0.07 });
  },
};
