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
