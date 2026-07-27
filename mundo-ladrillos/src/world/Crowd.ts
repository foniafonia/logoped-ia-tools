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
  skin?: MinifigureSkin; // skin propio (p.ej. un guardia con presencia); si no, aldeano auto
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
  opts: { startIndex?: number; scale?: number; walkers?: CrowdWalker[]; lite?: boolean } = {}
): { group: THREE.Group; update: (dt: number) => void; dispose: () => void } {
  const group = new THREE.Group();
  const figs: Minifigure[] = [];
  const baseYaw: number[] = [];
  let idx = opts.startIndex ?? 0;

  // Modo "lite": quita sombras (barato para densidad de fondo, suave en móvil).
  const noShadows = (fig: Minifigure): void => {
    if (opts.lite) fig.root.traverse((o: any) => { o.castShadow = false; o.receiveShadow = false; });
  };

  spots.forEach((s) => {
    const auto = s.emotion ? { ...villagerSkin(idx), emotion: s.emotion } : villagerSkin(idx);
    const skin: MinifigureSkin = s.skin ? (s.emotion ? { ...s.skin, emotion: s.emotion } : s.skin) : auto;
    idx++;
    const fig = createMinifigure(plastic, skin);
    noShadows(fig);
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
    noShadows(fig);
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

/**
 * Multitud LITE curada para un MERCADO NOCTURNO (tramos 5–10 / 10–15). En vez de
 * clones serenos, reparte un elenco variado y con carácter de noche alrededor de
 * un centro: mercader que regatea (enfadado), anciano asombrado, figuras
 * encapuchadas (pícaras/alerta), una niña asustada (escala pequeña), aguadoras
 * serenas… + un par de caminantes que cruzan la calle. Todo determinista (estable
 * en resume) y sin sombras (barato para densidad de fondo, suave en móvil).
 *
 *   const crowd = buildNightMarketCrowd(scene, plastic, { center: { x: 0, z: -2 }, density: 'med' });
 *   // en el loop:  crowd.update(dt);
 *
 * `extraSpots`/`extraWalkers` se añaden tal cual (para tu attrezzo de escena).
 */
export function buildNightMarketCrowd(
  scene: THREE.Scene,
  plastic: PlasticMaterialFactory,
  opts: {
    center?: { x: number; z: number };
    radius?: number;
    density?: 'low' | 'med';
    startIndex?: number;
    extraSpots?: CrowdSpot[];
    extraWalkers?: CrowdWalker[];
  } = {}
): { group: THREE.Group; update: (dt: number) => void; dispose: () => void } {
  const cx = opts.center?.x ?? 0;
  const cz = opts.center?.z ?? 0;
  const R = opts.radius ?? 4.2;
  const n = opts.density === 'med' ? 12 : 7;

  // Paleta de moods de noche de mercado (variada y con intención). scale<1 = niño/a.
  const cast: { emotion: Emotion; scale?: number }[] = [
    { emotion: 'sly' },                 // mercader que tantea en la penumbra
    { emotion: 'angry' },               // regateo acalorado
    { emotion: 'awe' },                 // anciano mirando el cielo/prodigio
    { emotion: 'alert' },               // encapuchado ojo avizor
    { emotion: 'scared', scale: 0.7 },  // niña que se asusta de las sombras
    { emotion: 'neutral' },             // aguadora serena
    { emotion: 'worried' },             // alguien que presiente algo
    { emotion: 'stern' },               // guardián civil
    { emotion: 'happy', scale: 0.72 },  // chiquillo que corretea entre puestos
    { emotion: 'surprised' },
    { emotion: 'sad' },                 // dolienta al margen
    { emotion: 'determined' }
  ];

  // Reparto determinista en anillo irregular alrededor del centro (sin Math.random).
  const spots: CrowdSpot[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + i * 0.37;         // ángulo desfasado
    const rr = R * (0.55 + ((i * 7) % 5) * 0.11);        // radios variados
    const x = cx + Math.cos(a) * rr;
    const z = cz + Math.sin(a) * rr;
    const c = cast[i % cast.length];
    spots.push({ x, z, yaw: Math.atan2(cx - x, cz - z), emotion: c.emotion, scale: c.scale }); // miran al centro
  }
  if (opts.extraSpots) spots.push(...opts.extraSpots);

  // Caminantes que cruzan la calle del mercado (paseo lento).
  const walkers: CrowdWalker[] = [
    { ax: cx - R - 1, az: cz + 1.2, bx: cx + R + 1, bz: cz + 1.8, speed: 1.3, emotion: 'neutral' },
    { ax: cx + R + 1, az: cz - 1.6, bx: cx - R - 1, bz: cz - 1.0, speed: 1.1, emotion: 'alert' }
  ];
  if (opts.density === 'med') {
    walkers.push({ ax: cx - 2, az: cz - R, bx: cx + 2, bz: cz - R + 0.6, speed: 1.5, emotion: 'happy', scale: 0.72 });
  }
  if (opts.extraWalkers) walkers.push(...opts.extraWalkers);

  return buildCrowd(scene, plastic, spots, { walkers, lite: true, startIndex: opts.startIndex });
}
