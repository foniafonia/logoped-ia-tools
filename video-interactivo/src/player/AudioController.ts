/**
 * Controla la reproduccion de audios cortos (pregunta, opciones, feedback).
 * Solo suena un audio a la vez. Respeta el ajuste global de sonido.
 */
export class AudioController {
  private current: HTMLAudioElement | null = null;
  private enabled = true;

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.stop();
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /** Reproduce un audio. Si falla (archivo ausente) no interrumpe la app. */
  async play(src?: string): Promise<void> {
    this.stop();
    if (!src || !this.enabled) return;
    const audio = new Audio(src);
    this.current = audio;
    try {
      await audio.play();
    } catch {
      // Bloqueo de autoplay o archivo ausente: se ignora en silencio.
    }
  }

  stop(): void {
    if (this.current) {
      this.current.pause();
      this.current.currentTime = 0;
      this.current = null;
    }
  }
}
