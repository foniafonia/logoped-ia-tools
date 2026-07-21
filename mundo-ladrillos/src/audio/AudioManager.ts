import { CLIPS } from './clips';

/** Reproduce los clips de la película con WebAudio (baja latencia). */
export class AudioManager {
  private ac: AudioContext | null = null;
  private buffers = new Map<string, AudioBuffer>();

  /** Debe llamarse tras un gesto del usuario (tecla/click) para permitir audio. */
  init(): void {
    if (this.ac) return;
    this.ac = new (window.AudioContext || (window as any).webkitAudioContext)();
    for (const [name, url] of Object.entries(CLIPS)) {
      fetch(url).then((r) => r.arrayBuffer()).then((a) => {
        this.ac!.decodeAudioData(a, (buf) => this.buffers.set(name, buf), () => {});
      }).catch(() => {});
    }
  }

  play(name: string, volume = 1, stopAfter?: number): boolean {
    if (!this.ac) return false;
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
