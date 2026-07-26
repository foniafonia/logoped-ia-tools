import * as THREE from 'three';
import { IS_MOBILE } from '../../core/Quality';

/**
 * ATMÓSFERA y VIDA del campamento (pase "senior"): humo que sube de las fogatas,
 * una bandada de pájaros cruzando el cielo, y los estandartes ondeando al viento.
 * Todo barato (sin luces nuevas, geometría mínima) y con un solo `update(dt, t)`.
 */
export interface Atmosphere { update: (dt: number, t: number) => void; }

export function buildAtmosphere(
  scene: THREE.Scene,
  fires: Array<[number, number]>,
  flags: THREE.Mesh[]
): Atmosphere {
  const g = new THREE.Group();
  scene.add(g);

  // ---------- HUMO: puffs translúcidos que suben de cada fogata y se desvanecen ----------
  interface Puff { m: THREE.Mesh; fx: number; fz: number; life: number; dur: number; }
  const puffs: Puff[] = [];
  const puffGeo = new THREE.SphereGeometry(0.6, 6, 5);
  const nFires = IS_MOBILE ? 3 : fires.length;
  const perFire = IS_MOBILE ? 3 : 5;
  for (let f = 0; f < nFires; f++) {
    for (let k = 0; k < perFire; k++) {
      const m = new THREE.Mesh(puffGeo, new THREE.MeshBasicMaterial({ color: 0xcfc9c0, transparent: true, opacity: 0, depthWrite: false }));
      g.add(m);
      puffs.push({ m, fx: fires[f][0], fz: fires[f][1], life: k / perFire, dur: 2.6 + Math.random() * 1.4 });
    }
  }

  // ---------- PÁJAROS: siluetas en "V" que cruzan el cielo en bucle, aleteando ----------
  const birds: Array<{ g: THREE.Group; wL: THREE.Mesh; wR: THREE.Mesh; speed: number; z: number; y: number; ph: number }> = [];
  const birdMat = new THREE.MeshBasicMaterial({ color: 0x4a4038 });
  const wingGeo = new THREE.BoxGeometry(2.2, 0.12, 0.6);
  const nBirds = IS_MOBILE ? 5 : 9;
  for (let i = 0; i < nBirds; i++) {
    const b = new THREE.Group();
    const wL = new THREE.Mesh(wingGeo, birdMat); wL.position.x = -1.1;
    const wR = new THREE.Mesh(wingGeo, birdMat); wR.position.x = 1.1;
    b.add(wL, wR);
    const z = -40 + Math.random() * 80;
    const y = 34 + Math.random() * 20;
    b.position.set(-120 + Math.random() * 240, y, z);
    b.scale.setScalar(0.7 + Math.random() * 0.6);
    g.add(b);
    birds.push({ g: b, wL, wR, speed: 6 + Math.random() * 5, z, y, ph: Math.random() * 6.28 });
  }

  return {
    update: (dt: number, t: number): void => {
      // humo
      for (const p of puffs) {
        p.life += dt / p.dur;
        if (p.life >= 1) p.life -= 1;
        p.m.position.set(p.fx + Math.sin(p.life * 6 + p.fx) * 0.35, 1.2 + p.life * 4.8, p.fz);
        p.m.scale.setScalar(0.35 + p.life * 1.7);
        (p.m.material as THREE.MeshBasicMaterial).opacity = 0.32 * Math.sin(p.life * Math.PI);
      }
      // pájaros: avanzan en +x y reaparecen; las alas aletean
      for (const b of birds) {
        b.g.position.x += b.speed * dt;
        if (b.g.position.x > 130) b.g.position.x = -130;
        const flap = Math.sin(t * 8 + b.ph) * 0.5;
        b.wL.rotation.z = flap; b.wR.rotation.z = -flap;
      }
      // banderas ondeando (desfasadas) — vida en el campamento
      for (const fl of flags) {
        const ph = (fl.userData.phase as number) || 0;
        fl.rotation.y = Math.sin(t * 2.2 + ph) * 0.3;
        fl.rotation.z = Math.sin(t * 3.1 + ph) * 0.08;
      }
    }
  };
}
