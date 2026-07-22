/**
 * DIRECTOR del tramo (min 0–5) — acompasa el JUEGO al AUDIO.
 *
 * La narración real de la peli es la "columna vertebral" (spine). El Director
 * lee su reloj (`spine.elapsed()`) y, según el segundo en que va la voz, va
 * lanzando cada BEAT: subtítulo + objetivo + su acción (revelar el río, arrancar
 * la caravana, caer la noche…). Así el juego SIEMPRE hace lo que se está
 * contando, en el momento en que se cuenta.
 *
 * Si no hay audio (build del repo, sin la voz de la peli) usa un reloj de pared
 * como respaldo: la secuencia se reproduce igual, solo que muda.
 */

export interface Beat {
  t: number;             // segundo de la narración en que arranca este beat
  sub: string;           // subtítulo (abajo)
  obj?: string;          // objetivo (arriba); vacío = sin objetivo visible
  onEnter?: () => void;  // acción de escena (revelar río, noche, caravana…)
}

interface Spine { ready: () => boolean; elapsed: () => number; ended: () => boolean; }

export class Director {
  private i = -1;
  private wallStart = 0;
  private started = false;
  private finished = false;
  private sub: HTMLDivElement;
  private objEl: HTMLDivElement;
  private flashEl: HTMLDivElement;
  private flashUntil = 0;

  constructor(private beats: Beat[], private spine: Spine | null, private onFinish?: () => void) {
    this.sub = this.mk({
      left: '50%', bottom: '12%', transform: 'translateX(-50%)', maxWidth: '88%',
      background: 'rgba(8,6,4,.74)', color: '#ffeecb', font: '500 17px/1.4 Georgia, serif',
      padding: '10px 18px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(232,176,75,.4)'
    });
    this.objEl = this.mk({
      left: '50%', top: '54px', transform: 'translateX(-50%)', maxWidth: '88%',
      background: 'rgba(20,40,60,.8)', color: '#dff3ff', font: '700 16px system-ui, sans-serif',
      padding: '8px 16px', borderRadius: '20px', textAlign: 'center', border: '1px solid rgba(143,224,255,.6)'
    });
    this.flashEl = this.mk({
      left: '50%', top: '38%', transform: 'translate(-50%,-50%)', maxWidth: '86%',
      color: '#bfffce', font: '800 26px/1.2 system-ui, sans-serif', textShadow: '0 2px 12px rgba(0,0,0,.7)',
      textAlign: 'center'
    });
  }

  private mk(style: Partial<CSSStyleDeclaration>): HTMLDivElement {
    const d = document.createElement('div');
    Object.assign(d.style, {
      position: 'fixed', zIndex: '25', opacity: '0', transition: 'opacity .4s', pointerEvents: 'none'
    } as CSSStyleDeclaration, style);
    document.body.appendChild(d);
    return d;
  }

  /** Engancha (o cambia) la narración que hace de reloj maestro. */
  setSpine(spine: Spine): void { this.spine = spine; }

  start(): void { this.started = true; this.wallStart = performance.now(); }

  /** Reloj maestro: el del audio si suena; si no, el de pared. */
  private clock(): number {
    if (this.spine && this.spine.ready()) return this.spine.elapsed();
    return (performance.now() - this.wallStart) / 1000;
  }

  /** Objetivo cumplido por el jugador (llegó a un sitio, recogió algo…). */
  logro(msg: string): void {
    this.flashEl.textContent = '✅ ' + msg;
    this.flashEl.style.opacity = '1';
    this.flashUntil = performance.now() + 2200;
  }

  /** Sustituye el texto del objetivo (p.ej. el contador de cuerdas). */
  setObjetivo(txt: string): void {
    this.objEl.textContent = txt;
    this.objEl.style.opacity = txt ? '1' : '0';
  }

  get beatIndex(): number { return this.i; }

  update(): void {
    if (!this.started || this.finished) return;
    const now = performance.now();
    if (this.flashUntil && now > this.flashUntil) { this.flashEl.style.opacity = '0'; this.flashUntil = 0; }

    const c = this.clock();
    // lanzar todos los beats cuyo tiempo ya ha llegado
    while (this.i + 1 < this.beats.length && c >= this.beats[this.i + 1].t) {
      this.i++;
      const b = this.beats[this.i];
      this.sub.textContent = b.sub;
      this.sub.style.opacity = '1';
      if (b.obj !== undefined) this.setObjetivo(b.obj ? '🎯 ' + b.obj : '');
      b.onEnter?.();
    }

    // fin del tramo: cuando acaba la voz (o pasa el último beat en modo mudo)
    const last = this.beats[this.beats.length - 1];
    const audioEnded = this.spine && this.spine.ready() && this.spine.ended();
    const muteEnded = (!this.spine || !this.spine.ready()) && c >= last.t + 12;
    if (this.i >= this.beats.length - 1 && (audioEnded || muteEnded)) {
      this.finished = true;
      this.sub.style.opacity = '0';
      this.setObjetivo('');
      this.onFinish?.();
    }
  }
}
