import * as THREE from 'three';
import { PlasticMaterialFactory } from '../materials/PlasticMaterialFactory';

/**
 * BrickBurst — el efecto INSIGNIA del clímax (Regla de oro nº3: nada de violencia;
 * lo que "cae" se DESHACE EN LADRILLOS de juguete que saltan y ruedan). Sirve para
 * un enemigo derrotado, un trozo de muralla, una torre… Cada estallido es un
 * puñado de ladrillitos con física ligera (velocidad + gravedad + giro + rebote),
 * que se posan en el suelo y se quedan un rato como escombro y luego se desvanecen.
 *
 * Uso simple (un estallido puntual):
 *   const b = spawnBrickBurst(scene, plastic, { center: new THREE.Vector3(0,1,0) });
 *   // en el loop:  if (!b.update(dt)) b.dispose();   // update() devuelve false al acabar
 *
 * Uso recomendado para el LEAD (muchos estallidos, p.ej. la muralla entera):
 *   const bricks = new BrickBurstSystem(scene, plastic);
 *   bricks.burst(new THREE.Vector3(x, y, z), { count: 14, colors: [0xcaa15e, 0xb07a45] });
 *   // en el loop:  bricks.update(dt);
 *   // barrido en franja (muralla cayendo de izquierda a derecha):
 *   bricks.wall({ x0:-6, x1:6, y:0, z:-4, height:3 }, { perMeter: 3, sweepSecs: 2.5 });
 */

export interface BrickBurstOpts {
  center?: THREE.Vector3;
  count?: number;                 // nº de ladrillos
  colors?: number[];              // paleta (adobe/arenisca por defecto)
  size?: number;                  // tamaño base del ladrillo
  power?: number;                 // impulso de salida
  up?: number;                    // sesgo hacia arriba
  life?: number;                  // segundos hasta desvanecer del todo
  gravity?: number;
  floorY?: number;                // altura del suelo (rebotes)
  lite?: boolean;                 // sin sombras (móvil / muchos a la vez)
}

interface Piece {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  spin: THREE.Vector3;
  rest: boolean;
}

const DEFAULT_COLORS = [0xcaa15e, 0xb07a45, 0xd8c193, 0x9c6b3f, 0xc7ad7a];

/** Un estallido suelto. Devuelve un handle con update(dt)->alive y dispose(). */
export function spawnBrickBurst(
  scene: THREE.Scene,
  plastic: PlasticMaterialFactory,
  opts: BrickBurstOpts = {}
): { group: THREE.Group; update: (dt: number) => boolean; dispose: () => void } {
  const center = opts.center ?? new THREE.Vector3();
  const count = opts.count ?? 12;
  const colors = opts.colors ?? DEFAULT_COLORS;
  const size = opts.size ?? 0.16;
  const power = opts.power ?? 3.2;
  const upBias = opts.up ?? 2.6;
  const life = opts.life ?? 2.6;
  const gravity = opts.gravity ?? -9.2;
  const floorY = opts.floorY ?? 0;

  const group = new THREE.Group();
  const pieces: Piece[] = [];
  // Ladrillo de juguete: caja con dos "tetones" arriba (silueta reconocible).
  for (let i = 0; i < count; i++) {
    const c = colors[i % colors.length];
    const mat = plastic.get(c);
    const brick = new THREE.Group();
    const w = size * (0.85 + (i % 3) * 0.18);
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, size * 0.6, size), mat);
    if (!opts.lite) { body.castShadow = true; }
    brick.add(body);
    for (const sx of [-1, 1]) {
      const stud = new THREE.Mesh(new THREE.CylinderGeometry(size * 0.16, size * 0.16, size * 0.12, 6), mat);
      stud.position.set(sx * w * 0.24, size * 0.36, 0);
      brick.add(stud);
    }
    // deterministamente disperso (sin Math.random, estable en resume)
    const a = (i / count) * Math.PI * 2 + i * 0.7;
    const r = 0.05 + (i % 4) * 0.04;
    brick.position.set(center.x + Math.cos(a) * r, center.y + (i % 3) * 0.05, center.z + Math.sin(a) * r);
    brick.rotation.set(i, i * 1.7, i * 0.9);
    group.add(brick);
    const speed = power * (0.6 + ((i * 7) % 5) * 0.1);
    pieces.push({
      mesh: brick,
      vel: new THREE.Vector3(Math.cos(a) * speed, upBias * (0.7 + (i % 3) * 0.2), Math.sin(a) * speed),
      spin: new THREE.Vector3((i % 5) - 2, (i % 3) - 1, (i % 4) - 1.5).multiplyScalar(3),
      rest: false
    });
  }
  scene.add(group);

  let t = 0;
  return {
    group,
    update(dt: number): boolean {
      t += dt;
      for (const p of pieces) {
        if (!p.rest) {
          p.vel.y += gravity * dt;
          p.mesh.position.addScaledVector(p.vel, dt);
          p.mesh.rotation.x += p.spin.x * dt;
          p.mesh.rotation.y += p.spin.y * dt;
          p.mesh.rotation.z += p.spin.z * dt;
          if (p.mesh.position.y <= floorY + size * 0.3) {
            p.mesh.position.y = floorY + size * 0.3;
            if (Math.abs(p.vel.y) < 1.2) {                 // se posa como escombro
              p.rest = true; p.vel.set(0, 0, 0);
              p.mesh.rotation.x = Math.PI / 2 * Math.round(p.mesh.rotation.x / (Math.PI / 2));
            } else {                                        // rebote amortiguado
              p.vel.y = -p.vel.y * 0.42; p.vel.x *= 0.7; p.vel.z *= 0.7;
              p.spin.multiplyScalar(0.6);
            }
          }
        }
      }
      // desvanecido al final de la vida
      const fade = Math.max(0, Math.min(1, (life - t) / 0.6));
      if (t > life - 0.6) {
        group.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.material) {
            const mm = m.material as THREE.Material & { opacity: number; transparent: boolean };
            mm.transparent = true; mm.opacity = fade;
          }
        });
      }
      return t < life;
    },
    dispose(): void {
      scene.remove(group);
      group.traverse((o) => { const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose(); });
    }
  };
}

/** Gestor de muchos estallidos (para el clímax entero). Un solo update(dt). */
export class BrickBurstSystem {
  private scene: THREE.Scene;
  private plastic: PlasticMaterialFactory;
  private active: { update: (dt: number) => boolean; dispose: () => void }[] = [];
  private queue: { at: number; center: THREE.Vector3; opts: BrickBurstOpts }[] = [];
  private clock = 0;

  constructor(scene: THREE.Scene, plastic: PlasticMaterialFactory) {
    this.scene = scene; this.plastic = plastic;
  }

  /** Lanza un estallido ya. */
  burst(center: THREE.Vector3, opts: BrickBurstOpts = {}): void {
    this.active.push(spawnBrickBurst(this.scene, this.plastic, { ...opts, center }));
  }

  /** Programa un estallido dentro de `delay` segundos (para barridos/olas). */
  burstAt(delay: number, center: THREE.Vector3, opts: BrickBurstOpts = {}): void {
    this.queue.push({ at: this.clock + delay, center: center.clone(), opts });
  }

  /**
   * La MURALLA cayendo: siembra estallidos a lo largo de una franja (de x0 a x1)
   * y varias alturas, barridos en el tiempo (`sweepSecs`) → lee como el muro que
   * se deshace de un lado a otro. Ideal para el clímax del LEAD.
   */
  wall(
    span: { x0: number; x1: number; y?: number; z: number; height?: number },
    opts: { perMeter?: number; rows?: number; sweepSecs?: number; colors?: number[]; lite?: boolean } = {}
  ): void {
    const y0 = span.y ?? 0;
    const H = span.height ?? 3;
    const perMeter = opts.perMeter ?? 2;
    const rows = opts.rows ?? 3;
    const sweep = opts.sweepSecs ?? 2.2;
    const len = Math.abs(span.x1 - span.x0);
    const cols = Math.max(2, Math.round(len * perMeter));
    for (let c = 0; c < cols; c++) {
      const fx = c / (cols - 1);
      const x = span.x0 + (span.x1 - span.x0) * fx;
      for (let r = 0; r < rows; r++) {
        const y = y0 + (r + 0.5) * (H / rows);
        const delay = fx * sweep + r * 0.06;
        this.burstAt(delay, new THREE.Vector3(x, y, span.z), {
          count: 8, colors: opts.colors, lite: opts.lite, floorY: y0, power: 2.4, up: 2.2
        });
      }
    }
  }

  update(dt: number): void {
    this.clock += dt;
    if (this.queue.length) {
      const due = this.queue.filter((q) => q.at <= this.clock);
      if (due.length) {
        this.queue = this.queue.filter((q) => q.at > this.clock);
        for (const q of due) this.burst(q.center, q.opts);
      }
    }
    for (let i = this.active.length - 1; i >= 0; i--) {
      if (!this.active[i].update(dt)) { this.active[i].dispose(); this.active.splice(i, 1); }
    }
  }

  get busy(): boolean { return this.active.length > 0 || this.queue.length > 0; }

  dispose(): void { for (const a of this.active) a.dispose(); this.active = []; this.queue = []; }
}
