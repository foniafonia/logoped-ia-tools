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

/**
 * Multitud LITE de PROCESIÓN para los momentos "wow": la marcha alrededor de
 * Jericó, la muralla cayendo o el júbilo del campamento. En vez de un anillo que
 * mira al centro, forma FILAS que miran todas a un mismo objetivo (la muralla /
 * el frente) → lee como un pueblo en marcha o celebrando, no como corrillos.
 *
 *   - `mode:'march'`  → caras resueltas/serias (determined/stern/alert): el ejército
 *      que rodea la ciudad. Avanzan hacia el objetivo.
 *   - `mode:'celebration'` → caras de júbilo/asombro (joyful/awe/surprised/happy):
 *      cuando cae la muralla o el campamento celebra.
 *
 * `facingYaw` = hacia dónde miran todos (0 = +Z; usa `Math.atan2(tx-x, tz-z)` si
 * apuntas a un punto). Determinista y sin sombras (barato, suave en móvil).
 *
 *   const proc = buildProcessionCrowd(scene, plastic, { mode: 'march', rows: 3, perRow: 6, facingYaw: 0 });
 *   // en el loop: proc.update(dt);
 */
export function buildProcessionCrowd(
  scene: THREE.Scene,
  plastic: PlasticMaterialFactory,
  opts: {
    mode?: 'march' | 'celebration';
    origin?: { x: number; z: number };
    rows?: number;
    perRow?: number;
    spacing?: number;
    facingYaw?: number;
    advance?: boolean;      // en 'march', añade caminantes que avanzan hacia el frente
    startIndex?: number;
    extraSpots?: CrowdSpot[];
  } = {}
): { group: THREE.Group; update: (dt: number) => void; dispose: () => void } {
  const ox = opts.origin?.x ?? 0;
  const oz = opts.origin?.z ?? 0;
  const rows = opts.rows ?? 3;
  const perRow = opts.perRow ?? 6;
  const gap = opts.spacing ?? 1.5;
  const yaw = opts.facingYaw ?? 0;
  const march = (opts.mode ?? 'march') === 'march';

  // Moods según el momento. scale<1 = niños entre la multitud (comunidad real).
  const marchMoods: Emotion[] = ['determined', 'stern', 'alert', 'determined', 'neutral', 'stern'];
  const joyMoods: Emotion[] = ['joyful', 'awe', 'surprised', 'happy', 'awe', 'joyful'];
  const moods = march ? marchMoods : joyMoods;

  // Dirección "hacia el frente" (adonde miran) y su perpendicular (ancho de fila).
  const fx = Math.sin(yaw), fz = Math.cos(yaw);       // vector de avance
  const rx = Math.cos(yaw), rz = -Math.sin(yaw);      // vector lateral (fila)

  const spots: CrowdSpot[] = [];
  let k = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < perRow; c++) {
      // fila r (más atrás cuanto mayor r), columna c centrada; leve zigzag determinista.
      const lateral = (c - (perRow - 1) / 2) * gap + ((r % 2) * 0.5 * gap);
      const depth = -r * gap * 1.1 - ((c * 3) % 2) * 0.18;   // filas hacia atrás
      const x = ox + rx * lateral + fx * depth;
      const z = oz + rz * lateral + fz * depth;
      const isChild = ((r * perRow + c) % 5) === 0;          // ~1 de cada 5 es niño/a
      spots.push({
        x, z, yaw,
        emotion: moods[(r + c) % moods.length],
        scale: isChild ? 0.7 : 1
      });
      k++;
    }
  }
  if (opts.extraSpots) spots.push(...opts.extraSpots);

  // En modo marcha, un par de figuras que AVANZAN hacia el frente (dan sensación de columna).
  const walkers: CrowdWalker[] = [];
  if (march && (opts.advance ?? true)) {
    for (const side of [-1, 1]) {
      const lx = ox + rx * side * (perRow / 2) * gap * 0.7;
      const lz = oz + rz * side * (perRow / 2) * gap * 0.7;
      walkers.push({
        ax: lx - fx * gap, az: lz - fz * gap,
        bx: lx + fx * gap * 3, bz: lz + fz * gap * 3,
        speed: 1.2, emotion: 'determined'
      });
    }
  }

  return buildCrowd(scene, plastic, spots, { walkers, lite: true, startIndex: opts.startIndex });
}
