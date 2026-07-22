/**
 * Motor de sonido PROCEDURAL (WebAudio) para el tramo 5–10. Genera todo por
 * síntesis — NO usa material de audio de la película (que es privado). Da:
 *  - camas de ambiente (noche con grillos, brisa; río) en bucle,
 *  - efectos: pasos, salto, recoger, alarma de guardia, avión, puerta,
 *    chapuzón, éxito y fallo.
 * El LEAD puede cablear las VOCES REALES de la peli aparte (AudioManager).
 *
 * Debe arrancarse con un gesto del usuario (política de autoplay): `init()`.
 */
export class SoundEngine {
  private ac: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private ambientNodes: AudioNode[] = [];
  private crickets: OscillatorNode | null = null;
  private stepT = 0;
  muted = false;

  // --- secuenciador de música ---
  private musicTimer: ReturnType<typeof setInterval> | null = null;
  private nextNoteTime = 0;
  private step = 0;
  private mood: 'adventure' | 'tension' = 'adventure';

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
    this.musicGain = this.ac.createGain();
    this.musicGain.gain.value = 0.32;
    this.musicGain.connect(this.master);
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

  // ===================== MÚSICA DE FONDO (siempre sonando) =====================
  // Progresiones de acordes (semitonos desde la tónica). Alegre = mayor;
  // sigilo = menor con notas suspensivas. Un arpegio + pad + bajo por compás.
  private static PROG = {
    adventure: { root: 261.63, chords: [[0, 4, 7, 12], [7, 11, 14, 19], [9, 12, 16, 21], [5, 9, 12, 17]] }, // C G Am F
    tension:   { root: 196.00, chords: [[0, 3, 7, 10], [8, 12, 15, 20], [5, 8, 12, 15], [7, 10, 14, 17]] }   // Gm Eb Cm Dm-ish
  };

  setMusicMood(m: 'adventure' | 'tension'): void {
    this.mood = m;
    if (this.musicGain && this.ac) this.musicGain.gain.setTargetAtTime(m === 'tension' ? 0.24 : 0.34, this.ac.currentTime, 0.6);
  }

  private startMusic(): void {
    if (!this.ac || this.musicTimer) return;
    this.nextNoteTime = this.ac.currentTime + 0.1;
    this.step = 0;
    // planificador con lookahead (robusto): programa las notas que caen en los
    // próximos 120 ms cada 25 ms.
    this.musicTimer = setInterval(() => this.scheduler(), 25);
  }

  private freq(root: number, semi: number): number { return root * Math.pow(2, semi / 12); }

  private note(freq: number, t: number, dur: number, gain: number, type: OscillatorType): void {
    if (!this.ac || !this.musicGain) return;
    const o = this.ac.createOscillator(); o.type = type; o.frequency.value = freq;
    const g = this.ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.musicGain); o.start(t); o.stop(t + dur + 0.03);
  }

  private scheduler(): void {
    if (!this.ac) return;
    const spb = 0.30; // segundos por paso (~100 BPM en corcheas)
    while (this.nextNoteTime < this.ac.currentTime + 0.12) {
      const t = this.nextNoteTime;
      const prog = SoundEngine.PROG[this.mood];
      const bar = Math.floor(this.step / 8) % prog.chords.length;
      const chord = prog.chords[bar];
      const inBar = this.step % 8;
      // arpegio (corcheas): recorre las notas del acorde
      const arpSemi = chord[inBar % chord.length] + (inBar >= 4 ? 12 : 0);
      this.note(this.freq(prog.root, arpSemi), t, 0.28, 0.16, this.mood === 'tension' ? 'triangle' : 'square');
      // pad sostenido al empezar el compás (tónica + quinta)
      if (inBar === 0) {
        this.note(this.freq(prog.root, chord[0]), t, spb * 8 * 0.98, 0.05, 'sawtooth');
        this.note(this.freq(prog.root, chord[2]), t, spb * 8 * 0.98, 0.04, 'sawtooth');
        // bajo
        this.note(this.freq(prog.root, chord[0] - 12), t, spb * 2, 0.10, 'sine');
      }
      // melodía sencilla en los tiempos fuertes (día: saltarina)
      if (this.mood === 'adventure' && (inBar === 2 || inBar === 6)) {
        this.note(this.freq(prog.root, chord[(inBar) % chord.length] + 12), t, 0.24, 0.10, 'triangle');
      }
      this.step = (this.step + 1) % (8 * prog.chords.length);
      this.nextNoteTime += spb;
    }
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
  /** Motor de avión que cruza (whoosh con doppler). */
  plane(): { stop: () => void } {
    if (!this.ac || !this.master) return { stop: () => {} };
    const t = this.now();
    const s = this.nz(); const bp = this.ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 450; bp.Q.value = 3;
    const drone = this.ac.createOscillator(); drone.type = 'sawtooth'; drone.frequency.value = 90;
    const g = this.ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.28, t + 0.6);
    const dg = this.ac.createGain(); dg.gain.value = 0.12;
    s.connect(bp); bp.connect(g); drone.connect(dg); dg.connect(g); g.connect(this.master);
    // doppler: sube y baja el filtro/frecuencia
    bp.frequency.setValueAtTime(300, t); bp.frequency.linearRampToValueAtTime(650, t + 3); bp.frequency.linearRampToValueAtTime(300, t + 6);
    s.start(t); drone.start(t);
    return { stop: () => { const tt = this.now(); g.gain.setTargetAtTime(0.0001, tt, 0.4); try { s.stop(tt + 1.2); drone.stop(tt + 1.2); } catch { /* noop */ } } };
  }
  /** Fanfarria breve de éxito (arpegio mayor). */
  success(): void { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.blip(f, 0.22, 'triangle', 0.3), i * 90)); }
  /** Golpe grave de fallo. */
  fail(): void { this.blip(200, 0.4, 'sawtooth', 0.3, 90); this.noiseBurst(0.3, 140, 0.8, 0.2, 'lowpass'); }
}
