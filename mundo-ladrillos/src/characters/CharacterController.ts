import * as THREE from 'three';
import { Minifigure } from './MinifigureFactory';

/** Interpolación angular corta (para girar al personaje suavemente). */
function lerpAngle(a: number, b: number, t: number): number {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

/**
 * Movimiento del personaje (kinemático simple): desplazamiento relativo a la
 * cámara, salto con gravedad, giro hacia la dirección de avance y animación
 * de andar. La física completa (Rapier) llegará en su fase.
 */
export class CharacterController {
  pos = new THREE.Vector3(0, 0, 14);
  touch = { x: 0, z: 0, jump: false }; // entrada táctil (joystick + botón)
  private vy = 0;
  private facing = Math.PI; // mira hacia la cámara al empezar
  private grounded = true;
  private keys = new Set<string>();

  constructor(private fig: Minifigure) {
    addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    });
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    this.fig.root.position.copy(this.pos);
  }

  /** Devuelve true si el personaje se está moviendo. */
  update(dt: number, camYaw: number): boolean {
    let ix = 0, iz = 0;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) iz -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) iz += 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) ix -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) ix += 1;
    // entrada táctil (joystick): z hacia arriba = adelante
    if (Math.abs(this.touch.x) > 0.12 || Math.abs(this.touch.z) > 0.12) {
      ix += this.touch.x; iz += this.touch.z;
    }
    if (this.touch.jump) { this.keys.add('Space'); this.touch.jump = false; setTimeout(() => this.keys.delete('Space'), 60); }
    const run = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
    const moving = Math.abs(ix) > 0.01 || Math.abs(iz) > 0.01;

    if (moving) {
      const len = Math.hypot(ix, iz); ix /= len; iz /= len;
      const s = Math.sin(camYaw), c = Math.cos(camYaw);
      const dx = ix * c + iz * s;     // dirección relativa a la cámara
      const dz = iz * c - ix * s;
      const speed = run ? 9.5 : 5.5;
      this.pos.x += dx * speed * dt;
      this.pos.z += dz * speed * dt;
      this.facing = lerpAngle(this.facing, Math.atan2(dx, dz), 0.25);
    }

    // salto + gravedad
    if (this.keys.has('Space') && this.grounded) { this.vy = 10; this.grounded = false; }
    this.vy -= 26 * dt;
    this.pos.y += this.vy * dt;
    if (this.pos.y <= 0) { this.pos.y = 0; this.vy = 0; this.grounded = true; }

    // zona jugable amplia (movimiento libre)
    this.pos.x = Math.max(-140, Math.min(140, this.pos.x));
    this.pos.z = Math.max(3.5, Math.min(120, this.pos.z));

    this.fig.root.position.copy(this.pos);
    this.fig.root.rotation.y = this.facing;
    this.fig.update(dt, moving && this.grounded, run ? 1.4 : 1);
    return moving;
  }
}
