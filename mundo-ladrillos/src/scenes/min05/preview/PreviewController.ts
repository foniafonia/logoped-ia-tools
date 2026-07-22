import * as THREE from 'three';
import { Minifigure } from '../../../characters/MinifigureFactory';

/**
 * Controlador de jugador LIBRE para el preview del tramo (independiente del
 * CharacterController compartido, que acota el movimiento al recinto de la
 * muralla). Movimiento relativo a la cámara, salto con gravedad y límites de
 * escena configurables. El lead puede sustituirlo por el CharacterController
 * compartido al integrar; aquí necesitamos límites por escena.
 */
export class PreviewController {
  pos = new THREE.Vector3(0, 0, 0);
  bounds = { minX: -60, maxX: 60, minZ: -60, maxZ: 60 };
  private vy = 0;
  private facing = Math.PI;
  private grounded = true;
  private keys = new Set<string>();
  touch = { x: 0, z: 0, jump: false };

  constructor(private fig: Minifigure) {
    addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    });
    addEventListener('keyup', (e) => this.keys.delete(e.code));
  }

  teleport(x: number, z: number): void {
    this.pos.set(x, 0, z);
    this.vy = 0; this.grounded = true;
    this.fig.root.position.copy(this.pos);
  }

  setBounds(minX: number, maxX: number, minZ: number, maxZ: number): void {
    this.bounds = { minX, maxX, minZ, maxZ };
  }

  update(dt: number, camYaw: number): boolean {
    let ix = 0, iz = 0;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) iz -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) iz += 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) ix -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) ix += 1;
    if (Math.abs(this.touch.x) > 0.12 || Math.abs(this.touch.z) > 0.12) { ix += this.touch.x; iz += this.touch.z; }
    if (this.touch.jump) { this.keys.add('Space'); this.touch.jump = false; setTimeout(() => this.keys.delete('Space'), 60); }
    const run = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
    const moving = Math.abs(ix) > 0.01 || Math.abs(iz) > 0.01;

    if (moving) {
      const len = Math.hypot(ix, iz); ix /= len; iz /= len;
      const s = Math.sin(camYaw), c = Math.cos(camYaw);
      const dx = ix * c + iz * s;
      const dz = iz * c - ix * s;
      const speed = run ? 9 : 5.2;
      this.pos.x += dx * speed * dt;
      this.pos.z += dz * speed * dt;
      this.facing += (Math.atan2(dx, dz) - this.facing) * 0.25;
    }

    if (this.keys.has('Space') && this.grounded) { this.vy = 9.5; this.grounded = false; }
    this.vy -= 26 * dt;
    this.pos.y += this.vy * dt;
    if (this.pos.y <= 0) { this.pos.y = 0; this.vy = 0; this.grounded = true; }

    const b = this.bounds;
    this.pos.x = Math.max(b.minX, Math.min(b.maxX, this.pos.x));
    this.pos.z = Math.max(b.minZ, Math.min(b.maxZ, this.pos.z));

    this.fig.root.position.copy(this.pos);
    this.fig.root.rotation.y = this.facing;
    this.fig.update(dt, moving && this.grounded, run ? 1.4 : 1);
    return moving;
  }
}
