/**
 * Motor de sonido PROCEDURAL (WebAudio) para el tramo 5–10. Genera todo por
 * síntesis — NO usa material de audio de la película (que es privado). Da:
 *  - camas de ambiente (noche con grillos, brisa; río) en bucle,
 *  - efectos: pasos, salto, recoger, alarma de guardia, avión, puerta,
 *    chapuzón, éxito y fallo.
 * La MÚSICA y las VOCES son el AUDIO REAL DE LA PELÍCULA: este motor decodifica
 * el clip del tramo y lo reproduce DESDE EL SEGUNDO de cada escena (offset), para
 * que la voz/música case con lo que se ve. NO hay música sintética.
 *
 * Debe arrancarse con un gesto del usuario (política de autoplay): `init()`.
 */
import { CLIPS } from '../../../audio/clips';

export class SoundEngine {
  private ac: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private ambientNodes: AudioNode[] = [];
  private crickets: OscillatorNode | null = null;
  private stepT = 0;
  muted = false;

  // --- audio REAL de la peli (voces + música) reproducido por segmentos ---
  private filmGain: GainNode | null = null;
  private filmSrc: AudioBufferSourceNode | null = null;
  private filmBuf: AudioBuffer | null = null;
  // seguimiento del segmento en curso (para no bleed entre escenas + pegatina)
  private filmStartAt = 0;
  private filmOff = 0;
  private filmSegLen = 0;
  private filmLabel = '';
  private clipUntil = 0;
  private clipName = '';

  init(): void {
    if (this.ac) { void this.ac.resume(); return; }
    const AC = (window.AudioContext || (window as any).webkitAudioContext);
    this.ac = new AC();
    void this.ac.resume();
    this.master = this.ac.createGain();
    this.master.gain.value = 0.9;
    this.master.connect(this.ac.destination);
    this.ambientGain = this.ac.createGain();
    this.ambientGain.gain.value = 0.0;
    this.ambientGain.connect(this.master);
    this.filmGain = this.ac.createGain();
    this.filmGain.gain.value = 0.9;
    this.filmGain.connect(this.master);
    // buffer de ruido blanco reutilizable (2 s)
    const n = this.ac.sampleRate * 2;
    this.noise = this.ac.createBuffer(1, n, this.ac.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    // empujón silencioso (desbloqueo iOS)
    try { const b = this.ac.createBuffer(1, 1, 22050); const s = this.ac.createBufferSource(); s.buffer = b; s.connect(this.ac.destination); s.start(); } catch { /* noop */ }
    // NOTA: la música de fondo la pone el AUDIO DE LA PELÍCULA (ver preview:
    // `film`), NO un sintetizador. Aquí solo hay ambiente (viento/grillos/agua)
    // y efectos. `setMusicMood`/scheduler quedan desactivados a propósito.
  }

  // ============= AUDIO DE LA PELÍCULA (voces + música por segmentos) =============
  /** Decodifica el clip de la peli (data:...;base64 en CLIPS) una sola vez. */
  async loadFilm(name: string): Promise<boolean> {
    if (!this.ac || this.filmBuf) return !!this.filmBuf;
    const uri = CLIPS[name];
    if (!uri) return false; // sin audio del tramo (build del repo) → no-op
    try {
      const b64 = uri.slice(uri.indexOf(',') + 1);
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      this.filmBuf = await this.ac.decodeAudioData(bytes.buffer);
      return true;
    } catch { return false; }
  }

  get filmReady(): boolean { return !!this.filmBuf; }
  get filmDuration(): number { return this.filmBuf ? this.filmBuf.duration : 0; }

  /**
   * Reproduce SOLO el SEGMENTO de la peli de esta escena: `[offsetSec, endSec)`.
   * Al terminar el segmento se funde a silencio y NO continúa (así una escena
   * nunca "se adelanta" y suelta el audio de otra —p. ej. el del avión). Si el
   * jugador se demora, queda el ambiente (viento/grillos/agua) por debajo.
   */
  playFilmFrom(offsetSec: number, endSec?: number, gain = 0.9, label = ''): void {
    if (!this.ac || !this.filmBuf || !this.filmGain) return;
    const t = this.ac.currentTime;
    // corta el segmento anterior con un fundido rápido
    if (this.filmSrc) { try { this.filmSrc.stop(t + 0.2); } catch { /* noop */ } this.filmSrc = null; }
    const dur = this.filmBuf.duration;
    const off = Math.max(0, Math.min(offsetSec, dur - 0.1));
    const end = Math.max(off + 0.5, Math.min(endSec ?? dur, dur));
    const segLen = end - off;
    const src = this.ac.createBufferSource();
    src.buffer = this.filmBuf;
    src.loop = false;                    // NO se cuela en el audio de la escena siguiente
    const g = this.ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.4);
    g.gain.setValueAtTime(gain, t + Math.max(0.4, segLen - 0.6));
    g.gain.linearRampToValueAtTime(0.0001, t + segLen);  // fundido al final del segmento
    src.connect(g); g.connect(this.filmGain);
    src.start(t, off);
    try { src.stop(t + segLen + 0.05); } catch { /* noop */ }
    this.filmSrc = src;
    this.filmStartAt = t; this.filmOff = off; this.filmSegLen = segLen; this.filmLabel = label;
  }

  /** Descripción legible de lo que SUENA ahora (para la chapita de parte). */
  nowPlaying(): string {
    if (!this.ac) return '—';
    const t = this.ac.currentTime;
    if (t < this.clipUntil) return `clip ${this.clipName}`;
    if (this.filmSrc && t < this.filmStartAt + this.filmSegLen) {
      const head = this.filmOff + (t - this.filmStartAt);
      return `${this.filmLabel || 'narración'} @ ${head.toFixed(0)}s`;
    }
    return '🔇 solo ambiente';
  }

  stopFilm(fade = 0.5): void {
    if (!this.ac || !this.filmSrc) return;
    const t = this.ac.currentTime;
    try { this.filmSrc.stop(t + fade); } catch { /* noop */ }
    this.filmSrc = null;
  }

  // --- clips CORTOS de la peli para momentos interactivos (p. ej. "¡un avión!") ---
  private clips = new Map<string, AudioBuffer>();
  async preloadClip(name: string): Promise<boolean> {
    if (!this.ac || this.clips.has(name)) return this.clips.has(name);
    const uri = CLIPS[name];
    if (!uri) return false;
    try {
      const b64 = uri.slice(uri.indexOf(',') + 1);
      const bin = atob(b64);
      const by = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) by[i] = bin.charCodeAt(i);
      this.clips.set(name, await this.ac.decodeAudioData(by.buffer));
      return true;
    } catch { return false; }
  }

  /** Reproduce un clip corto de la peli una vez, BAJANDO el spine mientras suena
   *  (para que la línea se oiga clara), y lo restaura al terminar. */
  playClip(name: string, gain = 1): void {
    if (!this.ac || !this.master) return;
    const buf = this.clips.get(name);
    if (!buf) { void this.preloadClip(name).then((ok) => { if (ok) this.playClip(name, gain); }); return; }
    const t = this.ac.currentTime;
    this.clipUntil = t + buf.duration; this.clipName = name;
    if (this.filmGain) {
      const cur = this.filmGain.gain.value;
      this.filmGain.gain.cancelScheduledValues(t);
      this.filmGain.gain.setValueAtTime(cur, t);
      this.filmGain.gain.linearRampToValueAtTime(0.22, t + 0.12);
      this.filmGain.gain.linearRampToValueAtTime(0.9, t + buf.duration + 0.35);
    }
    const src = this.ac.createBufferSource(); src.buffer = buf;
    const g = this.ac.createGain(); g.gain.value = gain;
    src.connect(g); g.connect(this.master); src.start(t);
  }

  get ready(): boolean { return !!this.ac; }
  setMuted(m: boolean): void { this.muted = m; if (this.master && this.ac) this.master.gain.setTargetAtTime(m ? 0 : 0.9, this.ac.currentTime, 0.05); }

  private now(): number { return this.ac ? this.ac.currentTime : 0; }
  private nz(): AudioBufferSourceNode { const s = this.ac!.createBufferSource(); s.buffer = this.noise; s.loop = true; return s; }

  /** Cama de ambiente según la escena. Fundido suave al cambiar. */
  setAmbience(kind: 'day' | 'night' | 'river' | 'street'): void {
    if (!this.ac || !this.ambientGain) return;
    // limpiar la cama anterior
    for (const nd of this.ambientNodes) { try { (nd as any).stop?.(); } catch { /* noop */ } try { nd.disconnect(); } catch { /* noop */ } }
    this.ambientNodes = []; this.crickets = null;
    const t = this.now();
    this.ambientGain.gain.cancelScheduledValues(t);
    this.ambientGain.gain.setTargetAtTime(0.5, t, 0.4);

    // brisa: ruido filtrado paso-bajo, lento LFO de volumen
    const wind = this.nz();
    const lp = this.ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = kind === 'river' ? 900 : 500;
    const wg = this.ac.createGain(); wg.gain.value = kind === 'river' ? 0.5 : 0.28;
    const lfo = this.ac.createOscillator(); lfo.frequency.value = 0.12;
    const lfoG = this.ac.createGain(); lfoG.gain.value = 0.12;
    lfo.connect(lfoG); lfoG.connect(wg.gain);
    wind.connect(lp); lp.connect(wg); wg.connect(this.ambientGain);
    wind.start(); lfo.start();
    this.ambientNodes.push(wind, lfo);

    if (kind === 'night' || kind === 'street') {
      // grillos: onda cuadrada aguda con trémolo rápido
      const cr = this.ac.createOscillator(); cr.type = 'square'; cr.frequency.value = 4300;
      const crg = this.ac.createGain(); crg.gain.value = 0.0;
      const trem = this.ac.createOscillator(); trem.type = 'sine'; trem.frequency.value = 22;
      const tremg = this.ac.createGain(); tremg.gain.value = 0.012;
      trem.connect(tremg); tremg.connect(crg.gain);
      cr.connect(crg); crg.connect(this.ambientGain);
      cr.start(); trem.start();
      this.crickets = cr; this.ambientNodes.push(cr, trem);
    }
    if (kind === 'river') {
      // borboteo: segundo ruido con paso-banda
      const bub = this.nz(); const bp = this.ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1400; bp.Q.value = 0.7;
      const bg = this.ac.createGain(); bg.gain.value = 0.22;
      bub.connect(bp); bp.connect(bg); bg.connect(this.ambientGain);
      bub.start(); this.ambientNodes.push(bub);
    }
  }

  /** Golpe corto de envolvente (para sfx). */
  private blip(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.3, glideTo?: number): void {
    if (!this.ac || !this.master) return;
    const t = this.now();
    const o = this.ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t);
    if (glideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, glideTo), t + dur);
    const g = this.ac.createGain(); g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.02);
  }

  private noiseBurst(dur: number, freq: number, q: number, gain = 0.4, type: BiquadFilterType = 'bandpass'): void {
    if (!this.ac || !this.master) return;
    const t = this.now();
    const s = this.ac.createBufferSource(); s.buffer = this.noise;
    const f = this.ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = this.ac.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.master); s.start(t); s.stop(t + dur + 0.02);
  }

  // --- SFX públicos ---
  footstep(): void { this.noiseBurst(0.09, 220 + Math.random() * 60, 1.2, 0.16, 'lowpass'); }
  /** Llama con `dt` y si el jugador anda; espacia los pasos. */
  footTick(dt: number, moving: boolean, run: boolean): void {
    if (!moving) { this.stepT = 0; return; }
    this.stepT -= dt;
    if (this.stepT <= 0) { this.footstep(); this.stepT = run ? 0.24 : 0.36; }
  }
  jump(): void { this.blip(320, 0.18, 'sine', 0.25, 620); }
  land(): void { this.noiseBurst(0.12, 160, 1.0, 0.22, 'lowpass'); }
  pickup(): void { this.blip(660, 0.12, 'triangle', 0.3, 990); setTimeout(() => this.blip(990, 0.12, 'triangle', 0.28), 90); }
  splash(): void { this.noiseBurst(0.5, 900, 0.6, 0.5, 'bandpass'); this.noiseBurst(0.4, 300, 0.8, 0.3, 'lowpass'); }
  gate(): void { this.blip(90, 0.7, 'sawtooth', 0.18, 60); this.noiseBurst(0.7, 220, 1.5, 0.15, 'lowpass'); }
  /** Silbato de alarma del guardia (dos notas agudas). */
  alarm(): void { this.blip(1200, 0.18, 'square', 0.3, 1500); setTimeout(() => this.blip(1500, 0.22, 'square', 0.3, 1200), 150); }
  /** Grito de aviso ("¡Eh!") aproximado con formante. */
  shout(): void { this.blip(300, 0.22, 'sawtooth', 0.32, 180); }
  /** Motor de avión que cruza — FUERTE, con doppler y retumbo grave (crece al
   *  pasar por encima y se aleja). */
  plane(): { stop: () => void } {
    if (!this.ac || !this.master) return { stop: () => {} };
    const t = this.now();
    const s = this.nz(); const bp = this.ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 450; bp.Q.value = 3;
    const drone = this.ac.createOscillator(); drone.type = 'sawtooth'; drone.frequency.value = 85;
    const rumble = this.ac.createOscillator(); rumble.type = 'sine'; rumble.frequency.value = 46; // retumbo grave
    const g = this.ac.createGain();
    // envolvente: entra fuerte, PICO al pasar por encima (~2.8 s), luego se aleja
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.5);
    g.gain.linearRampToValueAtTime(0.75, t + 2.8);   // pico al sobrevolar
    g.gain.linearRampToValueAtTime(0.2, t + 6);
    const dg = this.ac.createGain(); dg.gain.value = 0.28;
    const rg = this.ac.createGain(); rg.gain.value = 0.35;
    s.connect(bp); bp.connect(g); drone.connect(dg); dg.connect(g); rumble.connect(rg); rg.connect(g); g.connect(this.master);
    // doppler: la frecuencia del motor sube al acercarse y baja al alejarse
    drone.frequency.setValueAtTime(70, t); drone.frequency.linearRampToValueAtTime(120, t + 2.8); drone.frequency.linearRampToValueAtTime(60, t + 6);
    bp.frequency.setValueAtTime(300, t); bp.frequency.linearRampToValueAtTime(750, t + 2.8); bp.frequency.linearRampToValueAtTime(280, t + 6);
    s.start(t); drone.start(t); rumble.start(t);
    return { stop: () => { const tt = this.now(); g.gain.setTargetAtTime(0.0001, tt, 0.4); try { s.stop(tt + 1.2); drone.stop(tt + 1.2); rumble.stop(tt + 1.2); } catch { /* noop */ } } };
  }
  /** Fanfarria breve de éxito (arpegio mayor). */
  success(): void { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.blip(f, 0.22, 'triangle', 0.3), i * 90)); }
  /** Golpe grave de fallo. */
  fail(): void { this.blip(200, 0.4, 'sawtooth', 0.3, 90); this.noiseBurst(0.3, 140, 0.8, 0.2, 'lowpass'); }
}
