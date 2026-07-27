import * as THREE from 'three';
import { PlasticMaterialFactory } from '../../../materials/PlasticMaterialFactory';
import { Minifigure, createMinifigure, MinifigureSkin } from '../../../characters/MinifigureFactory';

interface W { fig: Minifigure; tx: number; tz: number; speed: number; }

/**
 * VIDA ambiental: figuras de ladrillo que deambulan por una zona (con animación
 * de andar), como los aldeanos del campamento (min00/campLife). Barato y da
 * sensación de mundo vivo. `bounds` acota su vagabundeo.
 */
export class Wanderers {
  readonly group = new THREE.Group();
  private ws: W[] = [];
  private bounds: { minX: number; maxX: number; minZ: number; maxZ: number };

  constructor(
    plastic: PlasticMaterialFactory,
    skins: MinifigureSkin[],
    n: number,
    bounds: { minX: number; maxX: number; minZ: number; maxZ: number },
    scale = 1
  ) {
    this.bounds = bounds;
    for (let i = 0; i < n; i++) {
      const fig = createMinifigure(plastic, skins[i % skins.length]);
      const x = bounds.minX + ((i * 97) % 100) / 100 * (bounds.maxX - bounds.minX);
      const z = bounds.minZ + ((i * 53) % 100) / 100 * (bounds.maxZ - bounds.minZ);
      fig.root.position.set(x, 0, z);
      fig.root.scale.setScalar(scale * (0.9 + ((i * 31) % 20) / 100));
      this.group.add(fig.root);
      this.ws.push({ fig, tx: x, tz: z, speed: 1.6 + ((i * 17) % 10) / 10 });
    }
  }

  update(dt: number): void {
    for (const w of this.ws) {
      const p = w.fig.root.position;
      const dx = w.tx - p.x, dz = w.tz - p.z;
      const dist = Math.hypot(dx, dz);
      const moving = dist > 0.6;
      if (moving) {
        p.x += (dx / dist) * w.speed * dt;
        p.z += (dz / dist) * w.speed * dt;
        w.fig.root.rotation.y = Math.atan2(dx, dz);
      } else {
        const b = this.bounds;
        w.tx = b.minX + Math.random() * (b.maxX - b.minX);
        w.tz = b.minZ + Math.random() * (b.maxZ - b.minZ);
      }
      w.fig.update(dt, moving, 1);
    }
  }
}
