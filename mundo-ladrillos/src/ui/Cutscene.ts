/**
 * Cutscene — cinemática/adelanto AISLADO y SALTABLE (pieza compartida).
 *
 * Nació del "adelanto de los espías" del 0–5, pero sirve para CUALQUIER momento
 * de peli en cualquier tramo (revelar un sitio, presentar un personaje, un gag…).
 *
 * ── Por qué existe (la lección importante) ──────────────────────────────────
 * Meter una cinemática DENTRO del bucle de juego es peligroso: si mueve la
 * cámara o toca actores mientras el gameplay sigue corriendo, puede "romper"
 * cosas (perseguir la cámara, disparar tareas, marear…). El patrón seguro es
 * BLINDARLA con un guard propio en el bucle: mientras la cinemática está activa,
 * el gameplay NO corre, así que NO puede tocar ninguna variable del juego.
 *
 *   if (cine.active) { cine.update(dt); render(); return; }   // <- guard
 *
 * Esta clase se encarga del "cromo" común (cartel + botón Saltar + temporizador
 * + flag `active`). Lo específico de tu escena (mover la cámara, animar a los
 * actores) lo pones tú en `onFrame(k, dt)`, y la limpieza (restaurar cámara,
 * quitar actores) en `onEnd()`. Se dispara cuando tú quieras; para que salga
 * UNA sola vez, guarda tú un flag `visto` antes de llamar a `start`.
 *
 * ── Uso ─────────────────────────────────────────────────────────────────────
 *   const cine = new Cutscene();
 *   // al disparar:
 *   camSaved = {yaw:tp.yaw, pitch:tp.pitch, dist:tp.dist};   // guarda tu cámara
 *   cine.start({
 *     duration: 6.2,
 *     bannerHTML: '🔦 <b>…</b>',
 *     onFrame: (k, dt) => { /* mueve cámara/actores según k=0..1 *\/ },
 *     onEnd:   () => { /* restaura cámara + quita actores *\/ },
 *   });
 *   // en el bucle:
 *   if (cine.active) { cine.update(dt); if (composer) composer.render(); else renderer.render(scene, camera); return; }
 *
 * Sin dependencias de three: solo DOM + tiempo. Reutilizable tal cual.
 */
export interface CutsceneOpts {
  /** Duración en segundos (el usuario puede saltarla antes con el botón). */
  duration: number;
  /** Se llama cada frame con k = progreso 0..1 y dt (segundos). Aquí mueves cámara/actores. */
  onFrame: (k: number, dt: number) => void;
  /** Limpieza al terminar (por tiempo o por Saltar): restaura cámara, quita actores. */
  onEnd?: () => void;
  /** Cartel superior (HTML). Si se omite, no sale cartel. */
  bannerHTML?: string;
  /** Texto del botón de saltar (por defecto "Saltar ▶"). Pon '' para ocultarlo. */
  skipLabel?: string;
}

export class Cutscene {
  /** true mientras corre. Úsalo para el guard del bucle. */
  active = false;
  private t = 0;
  private opts: CutsceneOpts | null = null;
  private banner: HTMLDivElement | null = null;
  private skip: HTMLButtonElement | null = null;

  start(opts: CutsceneOpts): void {
    if (this.active) return;         // no re-entrante
    this.opts = opts;
    this.t = 0;
    this.active = true;
    if (opts.bannerHTML) {
      this.banner = document.createElement('div');
      this.banner.innerHTML = opts.bannerHTML;
      Object.assign(this.banner.style, {
        position: 'fixed', top: '22px', left: '50%', transform: 'translateX(-50%)', maxWidth: '84%',
        font: '700 18px system-ui, sans-serif', color: '#fff', textAlign: 'center', lineHeight: '1.5',
        background: 'linear-gradient(180deg,rgba(20,30,55,.92),rgba(20,30,55,.72))', padding: '12px 20px',
        borderRadius: '14px', border: '2px solid rgba(255,220,120,.6)', zIndex: '40',
        boxShadow: '0 6px 24px rgba(0,0,0,.5)', pointerEvents: 'none'
      } as CSSStyleDeclaration);
      document.body.appendChild(this.banner);
    }
    const label = opts.skipLabel ?? 'Saltar ▶';
    if (label) {
      this.skip = document.createElement('button');
      this.skip.textContent = label;
      this.skip.style.cssText = `position:fixed;right:22px;bottom:22px;padding:12px 20px;border-radius:12px;
        background:rgba(232,176,75,.92);border:2px solid rgba(255,255,255,.5);font:700 16px system-ui,sans-serif;
        color:#2a2010;z-index:40;box-shadow:0 4px 14px rgba(0,0,0,.4);cursor:pointer;`;
      this.skip.addEventListener('pointerdown', (e) => { e.preventDefault(); this.end(); });
      document.body.appendChild(this.skip);
    }
  }

  /** Llámalo cada frame desde el guard del bucle mientras `active`. */
  update(dt: number): void {
    if (!this.active || !this.opts) return;
    this.t += dt;
    const k = Math.min(1, this.t / this.opts.duration);
    this.opts.onFrame(k, dt);
    if (this.t >= this.opts.duration) this.end();
  }

  /** Termina ya (por tiempo o por el botón Saltar). Limpia el cromo y llama a onEnd. */
  end(): void {
    if (!this.active) return;
    this.active = false;
    this.banner?.remove(); this.banner = null;
    this.skip?.remove(); this.skip = null;
    this.opts?.onEnd?.();
    this.opts = null;
  }
}
