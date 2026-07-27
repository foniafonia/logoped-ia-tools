/**
 * Dialogue — bocadillos de diálogo compartidos (pieza COMPARTIDA, encargo del cerebro).
 *
 * Para las conversaciones de la peli en cualquier tramo, con UNA sola implementación
 * (que no monte cada hilo la suya): 0–5 (Yehoshúa arenga), 5–10 (espías esc9/10),
 * 10–15 (Rahab)… Estilo juguete/ladrillo, amable para un niño de 6–8.
 *
 * ── Uso básico ───────────────────────────────────────────────────────────────
 *   const dlg = new Dialogue();
 *   dlg.say('Yehoshúa', '¡Pueblo de Israel, mañana cruzaremos el Jordán!');
 *   dlg.say('Espía 1', 'Iremos con discreción…', { color: 0x6f9fc4 });
 *   // el niño toca/clica el bocadillo (o la tecla) para pasar al siguiente.
 *   // opcional: auto-avance -> dlg.say('...', { ms: 3500 });
 *   // opcional en el bucle (solo si usas ms de auto-avance): dlg.update(dt);
 *
 * ── Bocadillo flotante sobre un personaje (opcional) ──────────────────────────
 *   // proyecta la cabeza del personaje a pantalla y pásalo como anchor:
 *   const v = head.getWorldPosition(tmp).project(camera);
 *   dlg.say('Rahab', 'Escondeos aquí.', { anchor: { x: (v.x*0.5+0.5)*innerWidth, y: (-v.y*0.5+0.5)*innerHeight } });
 *   // sin anchor => barra de diálogo abajo (lo más legible para peques).
 *
 * Sin dependencias de three (solo DOM + tiempo), como `Cutscene`. Cola integrada:
 * varios `say` se muestran en orden. Llama a `clear()` al cambiar de escena.
 */
export interface SayOpts {
  /** Color del nombre del que habla (hex 0xRRGGBB). Def. dorado. */
  color?: number;
  /** Auto-avance a los N ms (si se omite, espera al toque/clic/tecla). */
  ms?: number;
  /** Posición en pantalla para bocadillo flotante {x,y} en px. Si se omite: barra abajo. */
  anchor?: { x: number; y: number };
  /** Se llama cuando ESTE bocadillo se cierra. */
  onDone?: () => void;
}
interface Item { speaker: string; text: string; opts: SayOpts; }

function hex(n: number): string { return '#' + n.toString(16).padStart(6, '0'); }

export class Dialogue {
  private queue: Item[] = [];
  private box: HTMLDivElement | null = null;
  private timer = 0;         // cuenta atrás de auto-avance (s); 0 = manual
  private showing = false;

  constructor() {
    // avanzar con teclado (Espacio/Enter/E) además de tocar el bocadillo
    this._onKey = (e: KeyboardEvent) => {
      if (this.showing && ['Space', 'Enter', 'KeyE'].includes(e.code)) { e.preventDefault(); this.next(); }
    };
    addEventListener('keydown', this._onKey);
  }
  private _onKey: (e: KeyboardEvent) => void;

  /** Encola una línea de diálogo. Si no hay ninguna en pantalla, la muestra ya. */
  say(speaker: string, text: string, opts: SayOpts = {}): void {
    this.queue.push({ speaker, text, opts });
    if (!this.showing) this.render();
  }

  /** ¿Hay diálogo en pantalla? (para pausar gameplay si quieres). */
  get active(): boolean { return this.showing; }

  /** Llama en el bucle SOLO si usas `ms` (auto-avance). */
  update(dt: number): void {
    if (this.showing && this.timer > 0) {
      this.timer -= dt;
      if (this.timer <= 0) this.next();
    }
  }

  /** Pasa al siguiente (o cierra si no queda ninguno). */
  next(): void {
    const cur = this.queue.shift();
    cur?.opts.onDone?.();
    if (this.queue.length) this.render();
    else this.close();
  }

  /** Vacía la cola y quita el bocadillo (al cambiar de escena). */
  clear(): void { this.queue = []; this.close(); }

  /** Libera el listener global (al desmontar del todo). */
  dispose(): void { this.clear(); removeEventListener('keydown', this._onKey); }

  private render(): void {
    const it = this.queue[0];
    if (!it) { this.close(); return; }
    this.showing = true;
    this.timer = it.opts.ms ? it.opts.ms / 1000 : 0;
    if (!this.box) {
      this.box = document.createElement('div');
      this.box.addEventListener('pointerdown', (e) => { e.preventDefault(); this.next(); });
      document.body.appendChild(this.box);
    }
    const floating = !!it.opts.anchor;
    const nameCol = hex(it.opts.color ?? 0xe8b04b);
    this.box.innerHTML =
      `<div style="font:800 14px system-ui;color:${nameCol};letter-spacing:.3px;margin-bottom:4px">${it.speaker}</div>` +
      `<div style="font:600 18px/1.45 system-ui;color:#f4ecdd">${it.text}</div>` +
      `<div style="position:absolute;right:12px;bottom:8px;font:800 14px system-ui;color:#e8b04b;opacity:.85">▶</div>`;
    const common = `position:fixed;z-index:45;max-width:min(680px,86%);padding:14px 20px 20px;
      background:linear-gradient(180deg,rgba(28,22,14,.96),rgba(28,22,14,.86));
      border:2px solid rgba(255,220,120,.55);border-radius:16px;
      box-shadow:0 8px 26px rgba(0,0,0,.5);cursor:pointer;`;
    if (floating) {
      const a = it.opts.anchor!;
      this.box.style.cssText = common +
        `left:${Math.round(a.x)}px;top:${Math.round(a.y)}px;transform:translate(-50%,-120%);`;
    } else {
      this.box.style.cssText = common + `left:50%;bottom:26px;transform:translateX(-50%);`;
    }
  }

  private close(): void {
    this.showing = false;
    this.timer = 0;
    this.box?.remove();
    this.box = null;
  }
}
