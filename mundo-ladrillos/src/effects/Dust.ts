import * as THREE from 'three';
import { IS_MOBILE } from '../core/Quality';

function softTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d')!;
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(230,210,160,0.9)');
  g.addColorStop(0.5, 'rgba(210,185,130,0.35)');
  g.addColorStop(1, 'rgba(210,185,130,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/** Polvo: bruma ambiente + estallidos grandes cuando cae la muralla. */
export class Dust {
  private pts: THREE.Points;
  private N: number;
  private pos: Float32Array;
  private vel: Float32Array;
  private life: Float32Array;
  private ttl: Float32Array;

  constructor(scene: THREE.Scene) {
    this.N = IS_MOBILE ? 500 : 1100;
    this.pos = new Float32Array(this.N * 3);
    this.vel = new Float32Array(this.N * 3);
    this.life = new Float32Array(this.N);
    this.ttl = new Float32Array(this.N);
    // bruma ambiente: un tercio siempre vivo, flotando bajo
    for (let i = 0; i < this.N; i++) {
      if (i < this.N / 3) {
        this.pos[i * 3] = (Math.random() - 0.5) * 320;
        this.pos[i * 3 + 1] = Math.random() * 10;
        this.pos[i * 3 + 2] = (Math.random() - 0.5) * 180 + 40;
        this.vel[i * 3] = (Math.random() - 0.5) * 0.3;
        this.vel[i * 3 + 1] = 0.1 + Math.random() * 0.2;
        this.vel[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
        this.life[i] = 1; this.ttl[i] = 1e9; // ambiente: no muere
      } else {
        this.pos[i * 3 + 1] = -999; this.life[i] = 0;
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    const mat = new THREE.PointsMaterial({
      size: IS_MOBILE ? 7 : 9, map: softTexture(), transparent: true, opacity: 0.5,
      depthWrite: false, blending: THREE.NormalBlending, sizeAttenuation: true
    });
    this.pts = new THREE.Points(geo, mat);
    this.pts.frustumCulled = false;
    scene.add(this.pts);
  }

  /** Estallido de polvo (al caer una franja de muralla). */
  burst(x: number, y: number, z: number, count: number): void {
    let done = 0;
    for (let i = Math.floor(this.N / 3); i < this.N; i++) {
      if (this.life[i] > 0) continue;
      this.pos[i * 3] = x + (Math.random() - 0.5) * 14;
      this.pos[i * 3 + 1] = y + (Math.random() - 0.5) * 4;
      this.pos[i * 3 + 2] = z + (Math.random() - 0.5) * 4;
      this.vel[i * 3] = (Math.random() - 0.5) * 6;
      this.vel[i * 3 + 1] = 2 + Math.random() * 5;
      this.vel[i * 3 + 2] = 1 + Math.random() * 5;
      this.life[i] = 1; this.ttl[i] = 2.5 + Math.random() * 2;
      if (++done >= count) break;
    }
  }

  update(dt: number): void {
    for (let i = 0; i < this.N; i++) {
      if (this.life[i] <= 0) continue;
      this.pos[i * 3] += this.vel[i * 3] * dt;
      this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt;
      this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
      this.vel[i * 3] *= 0.98; this.vel[i * 3 + 2] *= 0.98; this.vel[i * 3 + 1] *= 0.985;
      if (this.ttl[i] < 1e8) {
        this.ttl[i] -= dt;
        if (this.ttl[i] <= 0) { this.life[i] = 0; this.pos[i * 3 + 1] = -999; }
      } else {
        // ambiente: envolver en altura
        if (this.pos[i * 3 + 1] > 12) this.pos[i * 3 + 1] = 0;
      }
    }
    (this.pts.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  }
}
