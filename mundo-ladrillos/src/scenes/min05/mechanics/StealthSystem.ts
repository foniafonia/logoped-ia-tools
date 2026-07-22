import * as THREE from 'three';
import { Npc, VisionCone } from '../props/Npc';
import { SoundEngine } from '../audio/SoundEngine';
import { AudioManager } from '../../../audio/AudioManager';

/** Un guardia = NPC + cono de visión + barrido de la mirada (o patrulla). */
export interface GuardConfig {
  npc: Npc;
  cone: VisionCone;
  baseYaw: number;
  sweep?: number;
  sweepSpeed?: number;
  followNpc?: boolean;
}

export interface HidingSpot { x: number; z: number; radio: number; }

/**
 * SIGILO con MEDIDOR de detección (más justo y legible que la captura
 * instantánea): mientras un cono te ve, la ALARMA sube; escondido o fuera de
 * vista, baja. Al llenarse, ¡te pillan! → vuelves al inicio. Sobre cada guardia
 * que te ve aparece un "!" y su cono se pone rojo; suena la alarma.
 */
export class StealthSystem {
  private guards: GuardConfig[] = [];
  private spots: HidingSpot[] = [];
  private marks: THREE.Sprite[] = [];
  private alarm = 0;          // 0..1
  private caughtFlash = 0;
  private resetCooldown = 0;

  constructor(
    private getPlayer: () => THREE.Vector3,
    private onCaught: (x: number, z: number) => void,
    private spawn: { x: number; z: number },
    private sound: SoundEngine,
    private film?: AudioManager
  ) {}

  addGuard(cfg: GuardConfig): this {
    this.guards.push(cfg);
    this.marks.push(this.makeMark());
    cfg.npc.root.add(this.marks[this.marks.length - 1]);
    return this;
  }
  addHidingSpot(s: HidingSpot): this { this.spots.push(s); return this; }
  get marksGroup(): THREE.Sprite[] { return this.marks; }

  private makeMark(): THREE.Sprite {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d')!;
    x.fillStyle = '#ffd24a'; x.font = 'bold 56px system-ui'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText('!', 32, 36);
    const tex = new THREE.CanvasTexture(c);
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    spr.position.set(0, 5.6, 0); spr.scale.set(1.6, 1.6, 1); spr.visible = false;
    return spr;
  }

  get hidden(): boolean {
    const p = this.getPlayer();
    return this.spots.some((s) => Math.hypot(p.x - s.x, p.z - s.z) < s.radio);
  }
  get alarmLevel(): number { return this.alarm; }
  get justCaught(): boolean { return this.caughtFlash > 0; }

  update(dt: number, t: number): void {
    if (this.caughtFlash > 0) this.caughtFlash -= dt;
    if (this.resetCooldown > 0) { this.resetCooldown -= dt; }
    const p = this.getPlayer();
    const hiding = this.hidden;
    let seenBy = 0;

    for (let i = 0; i < this.guards.length; i++) {
      const g = this.guards[i];
      g.npc.update(dt);
      let yaw: number;
      if (g.followNpc) yaw = g.npc.yaw;
      else { yaw = g.baseYaw + (g.sweep ? Math.sin(t * (g.sweepSpeed ?? 0.8)) * g.sweep : 0); g.npc.root.rotation.y = yaw; }
      const gp = g.npc.position;
      g.cone.place(gp.x, gp.z, yaw);
      const sees = !hiding && this.resetCooldown <= 0 && g.cone.contains(gp.x, gp.z, yaw, p.x, p.z);
      g.cone.setAlert(sees);
      this.marks[i].visible = sees;
      if (sees) seenBy++;
    }

    // subir/bajar la alarma
    if (seenBy > 0 && this.resetCooldown <= 0) {
      this.alarm = Math.min(1, this.alarm + dt * (0.6 + 0.4 * seenBy));
      if (this.alarm < 1 && Math.random() < dt * 2) this.sound.shout();
    } else {
      this.alarm = Math.max(0, this.alarm - dt * (hiding ? 1.4 : 0.7));
    }

    if (this.alarm >= 1 && this.resetCooldown <= 0) {
      this.caughtFlash = 1.4;
      this.resetCooldown = 1.6;
      this.alarm = 0;
      this.sound.alarm();
      this.film?.play('shout', 1);   // grito REAL de la peli al pillarte
      this.onCaught(this.spawn.x, this.spawn.z);
    }
  }

  status(): string | null {
    if (this.justCaught) return '🚨 ¡Te han visto! Vuelves al inicio';
    if (this.hidden) return '🫥 Escondido — pasa sin que te vean';
    if (this.alarm > 0.35) return '👁️ ¡Cuidado, te están viendo!';
    return null;
  }
}
