import * as THREE from 'three';
import { Npc, VisionCone } from '../props/Npc';

/** Un guardia = NPC + cono de visión + un barrido de la mirada (patrulla óptica). */
export interface GuardConfig {
  npc: Npc;
  cone: VisionCone;
  baseYaw: number;   // dirección central de la mirada
  sweep?: number;    // amplitud del barrido (rad); 0 = mira fijo
  sweepSpeed?: number;
  /** Si el NPC patrulla, el cono sigue su rumbo en vez del barrido. */
  followNpc?: boolean;
}

export interface HidingSpot {
  x: number;
  z: number;
  radio: number;
}

/**
 * SIGILO: gestiona guardias con conos de visión que barren el terreno. Si el
 * jugador entra en un cono y NO está dentro de un escondite, salta la alarma:
 * se le devuelve al punto de partida (callback `onCaught`). El objetivo se
 * cumple al llegar a la meta sin ser visto.
 */
export class StealthSystem {
  private guards: GuardConfig[] = [];
  private spots: HidingSpot[] = [];
  private caughtCooldown = 0;
  private seenFlash = 0;

  constructor(
    private getPlayer: () => THREE.Vector3,
    private onCaught: (x: number, z: number) => void,
    private spawn: { x: number; z: number }
  ) {}

  addGuard(cfg: GuardConfig): this { this.guards.push(cfg); return this; }
  addHidingSpot(s: HidingSpot): this { this.spots.push(s); return this; }

  /** ¿El jugador está escondido ahora mismo? (para pintar el HUD). */
  get hidden(): boolean {
    const p = this.getPlayer();
    return this.spots.some((s) => Math.hypot(p.x - s.x, p.z - s.z) < s.radio);
  }

  get justSeen(): boolean { return this.seenFlash > 0; }

  update(dt: number, t: number): void {
    if (this.caughtCooldown > 0) this.caughtCooldown -= dt;
    if (this.seenFlash > 0) this.seenFlash -= dt;
    const p = this.getPlayer();
    const hiding = this.hidden;

    for (const g of this.guards) {
      g.npc.update(dt);
      let yaw: number;
      if (g.followNpc) {
        yaw = g.npc.yaw;
      } else {
        yaw = g.baseYaw + (g.sweep ? Math.sin(t * (g.sweepSpeed ?? 0.8)) * g.sweep : 0);
        g.npc.root.rotation.y = yaw; // el guardia gira la cabeza/cuerpo con el barrido
      }
      const gp = g.npc.position;
      g.cone.place(gp.x, gp.z, yaw);

      const sees = !hiding && this.caughtCooldown <= 0 &&
        g.cone.contains(gp.x, gp.z, yaw, p.x, p.z);
      g.cone.setAlert(sees);
      if (sees) {
        this.seenFlash = 1.2;
        this.caughtCooldown = 1.5;
        this.onCaught(this.spawn.x, this.spawn.z);
      }
    }
  }

  status(): string | null {
    if (this.justSeen) return '👁️ ¡Te han visto! Vuelve a empezar';
    if (this.hidden) return '🫥 Escondido — pasa sin que te vean';
    return null;
  }
}
