import * as THREE from 'three';
import { PlasticMaterialFactory } from '../materials/PlasticMaterialFactory';
import { createMinifigure, villagerSkin, Minifigure, MinifigureSkin, Emotion } from '../characters/MinifigureFactory';

/** Un sitio de la multitud: posición en el suelo + hacia dónde mira + cara opcional. */
export interface CrowdSpot {
  x: number;
  z: number;
  yaw?: number;        // orientación (0 = mira hacia +Z)
  emotion?: Emotion;   // fuerza una cara para el mood de la escena
  scale?: number;      // <1 = niño/a; 1 = adulto (comunidad de todas las edades)
}

/**
 * Multitud de ALDEANOS para llenar una escena ("mundo lleno, nunca vacío").
 * Cada aldeano usa `villagerSkin(i)` (determinista) → no se clonan caras ni
 * cuerpos. Devuelve el grupo + un `update` con idle sutil desfasado + `dispose`.
 */
export function buildCrowd(
  scene: THREE.Scene,
  plastic: PlasticMaterialFactory,
  spots: CrowdSpot[],
  opts: { startIndex?: number; scale?: number } = {}
): { group: THREE.Group; update: (dt: number) => void; dispose: () => void } {
  const group = new THREE.Group();
  const figs: Minifigure[] = [];
  const baseYaw: number[] = [];

  spots.forEach((s, k) => {
    const i = (opts.startIndex ?? 0) + k;
    const skin: MinifigureSkin = s.emotion
      ? { ...villagerSkin(i), emotion: s.emotion }
      : villagerSkin(i);
    const fig = createMinifigure(plastic, skin);
    fig.root.position.set(s.x, 0, s.z);
    const y = s.yaw ?? 0;
    fig.root.rotation.y = y;
    const sc = s.scale ?? opts.scale ?? 1;
    if (sc !== 1) fig.root.scale.setScalar(sc);
    group.add(fig.root);
    figs.push(fig);
    baseYaw.push(y);
  });

  scene.add(group);

  let t = 0;
  return {
    group,
    update(dt: number): void {
      t += dt;
      // Balanceo lento y desfasado por individuo (n) → parece gente viva, no clones.
      for (let n = 0; n < figs.length; n++) {
        figs[n].root.rotation.y = baseYaw[n] + Math.sin(t * 0.6 + n * 1.7) * 0.06;
        figs[n].update(dt, false);
      }
    },
    dispose(): void {
      scene.remove(group);
      group.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
      });
    }
  };
}
