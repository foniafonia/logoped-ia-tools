/**
 * LapMarch — mecánica SUELTA y reutilizable OFRECIDA al LEAD para el clímax
 * ("marcha con shofarot: 7 vueltas alrededor de Jericó"). Es genérica y neutral:
 * NO decide el diseño del clímax, solo CUENTA VUELTAS de una entidad alrededor de
 * un centro (acumulando el ángulo recorrido, con signo, para no contar idas y
 * venidas) y expone `ready` al completar N vueltas. Auto-contenida (sin deps de
 * escena); el que la use la alimenta con la posición cada frame.
 *
 * USO:
 *   const march = new LapMarch({ x: 0, z: 0 }, 7);
 *   // cada frame:  march.update(player.x, player.z);
 *   // HUD:         march.laps / march.targetLaps  ·  march.progress (0..1)
 *   // disparo:     if (march.ready) { ... GRITO / caída de la muralla ... }
 *
 * (Patrón hermano de StealthSystem: una clase de mecánica, sin tocar nada ajeno.)
 */
export class LapMarch {
  laps = 0;
  private accum = 0;          // radianes acumulados (con signo)
  private lastAngle: number | null = null;

  constructor(private center: { x: number; z: number }, public targetLaps = 7) {}

  /** Alimenta con la posición de la entidad que da vueltas (jugador/procesión). */
  update(px: number, pz: number): void {
    const a = Math.atan2(pz - this.center.z, px - this.center.x);
    if (this.lastAngle !== null) {
      let d = a - this.lastAngle;
      while (d > Math.PI) d -= Math.PI * 2;   // toma el arco corto (evita saltos ±2π)
      while (d < -Math.PI) d += Math.PI * 2;
      this.accum += d;
    }
    this.lastAngle = a;
    this.laps = Math.floor(Math.abs(this.accum) / (Math.PI * 2));
  }

  /** Progreso 0..1 hacia las vueltas objetivo (para una barra/HUD). */
  get progress(): number {
    return Math.min(1, Math.abs(this.accum) / (Math.PI * 2 * this.targetLaps));
  }

  /** ¿Completadas las vueltas objetivo? (momento de tocar el shofar / el grito). */
  get ready(): boolean { return this.laps >= this.targetLaps; }

  /** Reinicia el conteo (p. ej. si la escena se reintenta). */
  reset(): void { this.laps = 0; this.accum = 0; this.lastAngle = null; }
}
