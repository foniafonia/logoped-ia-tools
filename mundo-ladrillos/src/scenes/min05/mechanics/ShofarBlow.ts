/**
 * ShofarBlow — verbo SUELTO y reutilizable OFRECIDO al LEAD para el clímax
 * ("el niño TOCA EL SHOFAR → GRITO"). Genérico y neutral: NO decide qué pasa
 * después (el GRITO y la muralla-se-deshace-en-ladrillos son del LEAD/muñequero);
 * esto solo resuelve el VERBO: estar en el sitio, mantener E para CARGAR el
 * soplido y, al llenarse, disparar el callback una vez. Mismo patrón que los
 * verbos de esc9 (otear) / esc11 (estudiar). Auto-contenido (sin deps de escena).
 *
 * USO:
 *   const shofar = new ShofarBlow({ x: 0, z: 0 }, onBlow, { radio: 3, chargeSec: 1.4 });
 *   // cada frame:  shofar.update(dt, player.x, player.z, wantsInteractHeld);
 *   // HUD prompt:  shofar.near && !shofar.done ? 'Mantén E para tocar el shofar' : ''
 *   // barra:       shofar.charge (0..1)
 */
export interface ShofarOpts { radio?: number; chargeSec?: number; }

export class ShofarBlow {
  charge = 0;         // 0..1 mientras se mantiene E en el sitio
  done = false;
  near = false;

  constructor(
    private spot: { x: number; z: number },
    private onBlow: () => void,
    opts: ShofarOpts = {}
  ) {
    this.radio = opts.radio ?? 3;
    this.chargeSec = opts.chargeSec ?? 1.4;
  }
  private radio: number;
  private chargeSec: number;

  /** `interacting` = el jugador mantiene la acción (E / botón) este frame. */
  update(dt: number, px: number, pz: number, interacting: boolean): void {
    if (this.done) return;
    this.near = Math.hypot(px - this.spot.x, pz - this.spot.z) < this.radio;
    if (this.near && interacting) {
      this.charge = Math.min(1, this.charge + dt / this.chargeSec);
      if (this.charge >= 1) { this.done = true; this.onBlow(); }
    } else {
      // si sueltas o te alejas, la carga baja despacio (perdón amplio, fácil-niño)
      this.charge = Math.max(0, this.charge - dt * 0.5);
    }
  }

  reset(): void { this.charge = 0; this.done = false; this.near = false; }
}
