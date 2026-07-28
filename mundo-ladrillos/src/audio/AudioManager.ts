import { CLIPS } from './clips';

/** Decodifica un data:...;base64 a ArrayBuffer sin usar fetch (robusto en móvil/artifact). */
function base64ToArrayBuffer(dataUri: string): ArrayBuffer {
  const b64 = dataUri.slice(dataUri.indexOf(',') + 1);
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

/** Reproduce los clips de la película con WebAudio (baja latencia). */
export class AudioManager {
  private ac: AudioContext | null = null;
  private buffers = new Map<string, AudioBuffer>();

  /** Debe llamarse tras un gesto del usuario (tecla/click) para permitir audio. */
  init(): void {
    if (this.ac) { void this.ac.resume(); return; }
    this.ac = new (window.AudioContext || (window as any).webkitAudioContext)();
    void this.ac.resume(); // móvil/artifact: arranca suspendido
    // "empujón" silencioso para desbloquear WebAudio en iOS/Safari
    try {
      const b = this.ac.createBuffer(1, 1, 22050);
      const s = this.ac.createBufferSource();
      s.buffer = b; s.connect(this.ac.destination); s.start(0);
    } catch { /* noop */ }
    for (const [name, url] of Object.entries(CLIPS)) {
      try {
        const a = base64ToArrayBuffer(url);
        this.ac.decodeAudioData(a, (buf) => this.buffers.set(name, buf), () => {});
      } catch { /* noop */ }
    }
  }

  /** Reanuda el contexto de audio (p.ej. tras un vídeo que lo suspendió). */
  resume(): void {
    if (!this.ac) return;
    void this.ac.resume();
    try {
      const b = this.ac.createBuffer(1, 1, 22050);
      const s = this.ac.createBufferSource();
      s.buffer = b; s.connect(this.ac.destination); s.start(0);
    } catch { /* noop */ }
  }

  /**
   * Sonido en bucle (ambiente): p.ej. el estruendo del ejército durante la
   * marcha. Espera a que el buffer esté decodificado y devuelve un control
   * para bajarlo/pararlo con fundido.
   */
  loop(name: string, volume = 0.5): { stop: (fade?: number) => void; setVolume: (v: number) => void } {
    const ctl = { src: null as AudioBufferSourceNode | null, gain: null as GainNode | null, stopped: false };
    const startWhenReady = (tries = 0): void => {
      if (ctl.stopped || !this.ac) return;
      const buf = this.buffers.get(name);
      if (!buf) { if (tries < 50) setTimeout(() => startWhenReady(tries + 1), 100); return; }
      const src = this.ac.createBufferSource();
      src.buffer = buf; src.loop = true;
      const g = this.ac.createGain(); g.gain.value = volume;
      src.connect(g); g.connect(this.ac.destination);
      try { src.start(); } catch { /* noop */ }
      ctl.src = src; ctl.gain = g;
    };
    startWhenReady();
    return {
      stop: (fade = 0.8): void => {
        ctl.stopped = true;
        if (ctl.src && ctl.gain && this.ac) {
          const t = this.ac.currentTime;
          ctl.gain.gain.setValueAtTime(ctl.gain.gain.value, t);
          ctl.gain.gain.linearRampToValueAtTime(0.0001, t + fade);
          try { ctl.src.stop(t + fade); } catch { /* noop */ }
        }
      },
      setVolume: (v: number): void => { if (ctl.gain) ctl.gain.gain.value = v; }
    };
  }

  /**
   * Reproduce la NARRACIÓN como "columna vertebral" (spine) del tramo y
   * devuelve un reloj sincronizado: `elapsed()` da los segundos transcurridos
   * del audio real. El juego se acompasa a ese reloj, beat a beat.
   *
   * Si el clip no existe (build del repo, sin audio de la peli), `ready()`
   * nunca se pone a true y el Director usa su reloj de pared como respaldo:
   * la secuencia se reproduce igual, solo que sin voz.
   */
  playSpine(name: string, volume = 1, offset = 0): {
    ready: () => boolean; elapsed: () => number; duration: () => number; ended: () => boolean;
    stop: () => void; pause: () => void; resume: () => void; paused: () => boolean; fade: (sec?: number) => void;
  } {
    const st = { started: false, startAt: 0, dur: 0, offset, src: null as AudioBufferSourceNode | null, gain: null as GainNode | null, stopped: false, paused: false, pausedAt: 0 };
    // Arranca (o RE-arranca, al reanudar) la fuente desde `from` segundos del clip.
    const startSrc = (from: number): void => {
      if (st.stopped || !this.ac) return;
      const buf = this.buffers.get(name);
      if (!buf) return;
      const src = this.ac.createBufferSource();
      src.buffer = buf;
      const g = this.ac.createGain(); g.gain.value = volume;
      src.connect(g); g.connect(this.ac.destination);
      try { src.start(0, from); } catch { /* noop */ }
      st.src = src; st.gain = g; st.startAt = this.ac.currentTime; st.offset = from; st.dur = buf.duration; st.started = true;
    };
    const startWhenReady = (tries = 0): void => {
      if (st.stopped || !this.ac) return;
      if (this.ac.state === 'suspended') void this.ac.resume();   // el vídeo pudo suspender el contexto
      const buf = this.buffers.get(name);
      if (!buf) { if (tries < 40) setTimeout(() => startWhenReady(tries + 1), 100); return; }
      startSrc(offset);
    };
    startWhenReady();
    // segundo actual del clip (o el congelado, si está en pausa)
    const nowAt = (): number => (st.started && this.ac ? st.offset + (this.ac.currentTime - st.startAt) : st.offset);
    return {
      ready: () => st.started,
      elapsed: () => (st.paused ? st.pausedAt : nowAt()),
      duration: () => st.dur,
      ended: () => st.started && !st.paused && !!this.ac && nowAt() >= st.dur,
      stop: () => { st.stopped = true; try { st.src?.stop(); } catch { /* noop */ } },
      // PAUSA solo la narración (los SFX/ambiente siguen): congela `elapsed()` y para la voz.
      pause: () => { if (st.paused || !st.started) return; st.pausedAt = nowAt(); st.paused = true; try { st.src?.stop(); } catch { /* noop */ } st.src = null; },
      // REANUDA la voz desde el segundo exacto donde se pausó.
      resume: () => { if (!st.paused) return; st.paused = false; if (this.ac && this.ac.state === 'suspended') void this.ac.resume(); startSrc(st.pausedAt); },
      paused: () => st.paused,
      // FUNDE la voz a silencio en `sec` segundos (para cerrar el tramo sin cortar a media frase).
      fade: (sec = 1.2) => {
        if (!this.ac || !st.gain) return;
        const t = this.ac.currentTime;
        try { st.gain.gain.cancelScheduledValues(t); st.gain.gain.setValueAtTime(st.gain.gain.value, t); st.gain.gain.linearRampToValueAtTime(0.0001, t + sec); } catch { /* noop */ }
      }
    };
  }

  // ----------------------------------------------------------------------
  // SFX de JUEGO sintetizados (sin archivos): premian cada acción con sonido.
  // Funcionan siempre (también en el build del repo, sin audio de la peli).
  // ----------------------------------------------------------------------
  private tone(freq: number, t0: number, dur: number, type: OscillatorType = 'triangle', vol = 0.2): void {
    if (!this.ac) return;
    const o = this.ac.createOscillator(), g = this.ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(this.ac.destination);
    o.start(t0); o.stop(t0 + dur + 0.03);
  }
  /** "pling" discreto al recoger algo (bajo, para no tapar la narración real). */
  sfxPickup(): void { if (!this.ac) return; const t = this.ac.currentTime; this.tone(680, t, 0.09, 'triangle', 0.09); this.tone(1020, t + 0.05, 0.10, 'triangle', 0.08); }
  /** fanfarria corta y suave al lograr un objetivo/estrella. */
  sfxSuccess(): void { if (!this.ac) return; const t = this.ac.currentTime; [523, 659, 784, 1047].forEach((f, i) => this.tone(f, t + i * 0.085, 0.16, 'triangle', 0.11)); }
  /** chispa/brillo (revelaciones, saludo). */
  sfxSparkle(): void { if (!this.ac) return; const t = this.ac.currentTime; this.tone(1320, t, 0.12, 'sine', 0.12); this.tone(1760, t + 0.05, 0.15, 'sine', 0.1); }
  /** "bee" de oveja (con vibrato). */
  sfxAnimal(): void {
    if (!this.ac) return; const t = this.ac.currentTime;
    const o = this.ac.createOscillator(), g = this.ac.createGain();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(360, t); o.frequency.linearRampToValueAtTime(250, t + 0.26);
    const lfo = this.ac.createOscillator(), lg = this.ac.createGain();
    lfo.frequency.value = 19; lg.gain.value = 20; lfo.connect(lg); lg.connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.14, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.27);
    o.connect(g); g.connect(this.ac.destination);
    lfo.start(t); lfo.stop(t + 0.3); o.start(t); o.stop(t + 0.3);
  }

  play(name: string, volume = 1, stopAfter?: number): boolean {
    if (!this.ac) return false;
    if (this.ac.state === 'suspended') void this.ac.resume();
    const buf = this.buffers.get(name);
    if (!buf) return false;
    const src = this.ac.createBufferSource();
    src.buffer = buf;
    const g = this.ac.createGain();
    g.gain.value = volume;
    src.connect(g); g.connect(this.ac.destination);
    src.start();
    if (stopAfter) {
      const t = this.ac.currentTime;
      g.gain.setValueAtTime(volume, t + stopAfter - 0.4);
      g.gain.linearRampToValueAtTime(0.001, t + stopAfter);
      try { src.stop(t + stopAfter); } catch { /* noop */ }
    }
    return true;
  }
}
