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

/** Un caminante: pasea despacio entre A y B (ida y vuelta) con animación de andar. */
export interface CrowdWalker {
  ax: number; az: number;   // punto A
  bx: number; bz: number;   // punto B
  speed?: number;           // unidades/seg (por defecto 1.6)
  emotion?: Emotion;
  scale?: number;
}

/**
 * Multitud de ALDEANOS para llenar una escena ("mundo lleno, nunca vacío").
 * Cada aldeano usa `villagerSkin(i)` (determinista) → no se clonan caras ni
 * cuerpos. Los `spots` están quietos (idle sutil); los `walkers` pasean de A a B.
 * Devuelve el grupo + `update` + `dispose`.
 */
export function buildCrowd(
  scene: THREE.Scene,
  plastic: PlasticMaterialFactory,
  spots: CrowdSpot[],
  opts: { startIndex?: number; scale?: number; walkers?: CrowdWalker[] } = {}
): { group: THREE.Group; update: (dt: number) => void; dispose: () => void } {
  const group = new THREE.Group();
  const figs: Minifigure[] = [];
  const baseYaw: number[] = [];
  let idx = opts.startIndex ?? 0;

  spots.forEach((s) => {
    const skin: MinifigureSkin = s.emotion
      ? { ...villagerSkin(idx), emotion: s.emotion }
      : villagerSkin(idx);
    idx++;
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

  // --- Caminantes (paseo A<->B con animación de andar) ---
  interface W { fig: Minifigure; ax: number; az: number; dx: number; dz: number; len: number; speed: number; phase: number; sc: number; }
  const walkers: W[] = [];
  (opts.walkers ?? []).forEach((w, k) => {
    const skin: MinifigureSkin = w.emotion ? { ...villagerSkin(idx), emotion: w.emotion } : villagerSkin(idx);
    idx++;
    const fig = createMinifigure(plastic, skin);
    const dx = w.bx - w.ax, dz = w.bz - w.az;
    const len = Math.hypot(dx, dz) || 1;
    const sc = w.scale ?? opts.scale ?? 1;
    if (sc !== 1) fig.root.scale.setScalar(sc);
    fig.root.position.set(w.ax, 0, w.az);
    group.add(fig.root);
    // Fase inicial desfasada por caminante (determinista): no arrancan a la vez.
    walkers.push({ fig, ax: w.ax, az: w.az, dx: dx / len, dz: dz / len, len, speed: w.speed ?? 1.6, phase: (k * 0.5 + 0.15) * len, sc });
  });

  scene.add(group);

  let t = 0;
  return {
    group,
    update(dt: number): void {
      t += dt;
      // Quietos: balanceo lento y desfasado → gente viva, no clones.
      for (let n = 0; n < figs.length; n++) {
        figs[n].root.rotation.y = baseYaw[n] + Math.sin(t * 0.6 + n * 1.7) * 0.06;
        figs[n].update(dt, false);
      }
      // Caminantes: recorren A<->B en triángulo (ida y vuelta) mirando al avance.
      for (const w of walkers) {
        w.phase += dt * w.speed;
        const cycle = w.len * 2;
        let d = w.phase % cycle;
        const forward = d <= w.len;
        if (!forward) d = cycle - d;              // vuelta
        const px = w.ax + w.dx * d, pz = w.az + w.dz * d;
        w.fig.root.position.set(px, 0, pz);
        const sign = forward ? 1 : -1;
        w.fig.root.rotation.y = Math.atan2(w.dx * sign, w.dz * sign);
        w.fig.update(dt, true, w.speed);
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
