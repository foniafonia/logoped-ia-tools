import * as THREE from 'three';
import { SceneContext } from '../types';
import { buildTavern, TavernHandle } from '../../../world/Tavern';
import { buildCrowd, CrowdSpot, CrowdWalker } from '../../../world/Crowd';
import { buildStall } from '../../../world/Market';
import { buildLanternString, buildLaundryLine, buildWell } from '../../../world/StreetProps';
import { studdedPlate, buildHouse, buildBarrel, brickBox } from '../../min05/props/BrickProps';
import { buildLantern, buildBrazier } from '../../min05/props/NightAmbience';
import { BrickPalette } from '../../../materials/BrickPalette';
import { RugHide, PotHide } from './RugHide';

/**
 * MONTADORES DE ESCENARIO compartidos por las escenas 17–25, al LISTÓN del tramo
 * 0–5 (campamento del LEAD): "mundo lleno, nunca vacío", con profundidad (telón +
 * cerros), atmósfera (humo, motas, fuego) y luz cálida — no cajas planas.
 *  - `buildTavernStage`  → INTERIOR CÁLIDO de la posada de Rahab: la taberna del
 *    muñequero VESTIDA con techo, hogar con fuego, ventana a la noche de Jericó,
 *    motas de polvo flotando en la luz y attrezzo, para que sea acogedora y con
 *    profundidad (adiós "caja negra").
 *  - `buildStreetStage`  → CALLE/MERCADO nocturno con la muralla de Jericó al fondo,
 *    puestos, farolillos, gentío y humo — profundidad de peli.
 */

// ============================ INTERIOR: TABERNA ============================

export interface TavernStageHandle {
  group: THREE.Group;
  tav: TavernHandle;
  update(dt: number, t: number): void;
  dispose(): void;
}

/** Límite del recinto interior de la taberna (para acotar al jugador). */
export const TAVERN_BOUNDS = { minX: -11.5, maxX: 11.5, minZ: -9.2, maxZ: 8 };

/** Textura de "ventana a la noche": silueta de Jericó con ventanas cálidas + luna. */
function nightCityTexture(): THREE.CanvasTexture {
  const W = 256, H = 256; const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d')!;
  const sky = x.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#0e1a3e'); sky.addColorStop(0.6, '#23315e'); sky.addColorStop(1, '#3b4a78');
  x.fillStyle = sky; x.fillRect(0, 0, W, H);
  // luna
  x.fillStyle = '#f6efd6'; x.beginPath(); x.arc(196, 54, 26, 0, Math.PI * 2); x.fill();
  x.fillStyle = 'rgba(230,222,190,.25)'; x.beginPath(); x.arc(196, 54, 40, 0, Math.PI * 2); x.fill();
  // estrellas
  x.fillStyle = '#dfe6ff'; for (let i = 0; i < 40; i++) x.fillRect(Math.random() * W, Math.random() * H * 0.6, 2, 2);
  // silueta de la ciudad (torres) con ventanas cálidas
  x.fillStyle = '#141026';
  const base = H * 0.72;
  for (let bx = -10; bx < W; bx += 34) {
    const bw = 26 + Math.random() * 14, bh = 40 + Math.random() * 70;
    x.fillRect(bx, base - bh, bw, bh + (H - base));
    x.fillStyle = '#ffca7a';
    for (let wy = base - bh + 10; wy < base; wy += 16) for (let wx = bx + 4; wx < bx + bw - 4; wx += 10)
      if (Math.random() < 0.6) x.fillRect(wx, wy, 4, 6);
    x.fillStyle = '#141026';
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/** Monta el INTERIOR de la taberna + colisiones + VESTIDO cálido (senior). */
export function buildTavernStage(ctx: SceneContext, opts: { rahabAt?: [number, number, number] } = {}): TavernStageHandle {
  const group = new THREE.Group();
  const P = ctx.plastic;
  const tav = buildTavern(ctx.scene, P, { rahab: true });
  group.add(tav.group);
  // fondo/niebla cálidos (no negro): sombra ámbar que envuelve la sala
  ctx.scene.background = new THREE.Color(0x241a10);
  ctx.scene.fog = new THREE.Fog(0x1e150c, 24, 62);

  if (opts.rahabAt && tav.rahab) {
    tav.rahab.root.position.set(opts.rahabAt[0], 0, opts.rahabAt[1]);
    tav.rahab.root.rotation.y = opts.rahabAt[2];
  }

  // ---- TECHO (tabla oscura) que cierra el hueco negro de arriba ----
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(26, 22), new THREE.MeshStandardMaterial({ color: 0x3a2817, roughness: 1 }));
  ceiling.rotation.x = Math.PI / 2; ceiling.position.set(0, 12.8, -2); group.add(ceiling);
  // dintel/viga frontal para cerrar por delante
  group.add(brickBox(P, 27, 1.4, 0.8, 0x4e341f, 0, 12.2, 8.6));

  // ---- HOGAR con FUEGO (calidez "senior") en la esquina trasera izquierda ----
  const hearth = new THREE.Group(); hearth.position.set(-10.5, 0, -9.6); group.add(hearth);
  hearth.add(brickBox(P, 4, 4.4, 1.6, 0x8a7256, 0, 2.2, 0));           // campana de piedra
  hearth.add(brickBox(P, 4.4, 0.6, 1.8, 0x6d5a44, 0, 0.3, 0.2));       // base
  const logs = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 2.2, 8), P.get(BrickPalette.DARK_BROWN));
  logs.rotation.z = Math.PI / 2; logs.position.set(0, 0.7, 0.4); hearth.add(logs);
  const fireMat = new THREE.MeshBasicMaterial({ color: 0xff9a40 });
  const flames: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const fl = new THREE.Mesh(new THREE.ConeGeometry(0.4 - i * 0.07, 1.6 - i * 0.24, 7), fireMat);
    fl.position.set((i - 1.5) * 0.32, 1.3 + i * 0.12, 0.4); hearth.add(fl); flames.push(fl);
  }
  const fireLight = new THREE.PointLight(0xff8a3a, 5.5, 26, 1.7); fireLight.position.set(-10.5, 2.4, -8.6); group.add(fireLight);

  // ---- VENTANA a la noche de Jericó (mata el vacío del fondo) ----
  const winTex = nightCityTexture();
  const winPane = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 3.6), new THREE.MeshBasicMaterial({ map: winTex }));
  winPane.position.set(6.5, 7.4, -10.4); group.add(winPane);
  group.add(brickBox(P, 5.2, 0.4, 0.5, 0x4e341f, 6.5, 9.4, -10.3));    // marco sup
  group.add(brickBox(P, 5.2, 0.4, 0.5, 0x4e341f, 6.5, 5.5, -10.3));    // marco inf
  group.add(brickBox(P, 0.4, 4.2, 0.5, 0x4e341f, 4.1, 7.4, -10.3));
  group.add(brickBox(P, 0.4, 4.2, 0.5, 0x4e341f, 8.9, 7.4, -10.3));
  group.add(brickBox(P, 4.6, 0.3, 0.5, 0x4e341f, 6.5, 7.4, -10.35));   // parteluz
  const moonGlow = new THREE.PointLight(0x9fb6e8, 1.2, 16, 2); moonGlow.position.set(6.5, 7.4, -9); group.add(moonGlow);

  // ---- ATTREZZO: sacos, barriles, ristra de ajos/hierbas colgando de la viga ----
  const sack = (x: number, z: number): void => {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 1.4, 10), P.get(0xcaa87a));
    s.position.set(x, 0.7, z); s.castShadow = true; group.add(s);
    group.add(brickBox(P, 0.9, 0.3, 0.9, 0xb9976a, x, 1.4, z));
  };
  sack(-11, 3); sack(-10, 4.6);
  const b1 = buildBarrel(P); b1.position.set(11, 0, 3); group.add(b1);
  for (let i = 0; i < 5; i++) {
    const herb = brickBox(P, 0.3, 1.2 + (i % 2) * 0.4, 0.3, i % 2 ? 0x6f8f3a : 0x9c7b3a, -3 + i * 1.4, 11.3, -1);
    herb.rotation.z = (i - 2) * 0.05; group.add(herb);
  }

  // ---- MESAS + COMENSALES: un restaurante con vida (feedback del niño) ----
  const diningTable = (tx: number, tz: number): void => {
    const top = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.28, 14), P.get(0x6e4a2c));
    top.position.set(tx, 2.0, tz); top.castShadow = true; group.add(top);
    group.add(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 1.9, 8), P.get(0x4e341f)).translateX(tx).translateY(1.0).translateZ(tz));
    // vasijas/tazas encima
    for (let k = 0; k < 3; k++) {
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.2, 0.42, 9), P.get([0xb5673a, 0xcaa14a, 0x9a9184][k]));
      cup.position.set(tx + Math.cos(k * 2) * 0.5, 2.35, tz + Math.sin(k * 2) * 0.5); group.add(cup);
    }
    // taburetes
    for (let s = 0; s < 3; s++) {
      const a = s * 2.1 + 0.5;
      const st = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.42, 1.2, 10), P.get(0x6e4a2c));
      st.position.set(tx + Math.cos(a) * 2.0, 0.6, tz + Math.sin(a) * 2.0); group.add(st);
    }
  };
  // mesas repartidas por el comedor (lejos de la barra, del paso central y de los escondites de z≈0)
  diningTable(-4.5, 5.5); diningTable(4.5, 6.5); diningTable(6.5, -2.5);
  // comensales + un camarero (aldeanos variados; idle sutil, sin clonar caras)
  const diners = buildCrowd(ctx.scene, P, [
    { x: -6.2, z: 5.2, yaw: -0.7, emotion: 'happy' },
    { x: -3.2, z: 6.8, yaw: 2.2, scale: 0.72 },
    { x: 6.2, z: 6.4, yaw: -2.0, emotion: 'neutral' },
    { x: 2.8, z: 6.6, yaw: 1.4, emotion: 'happy' },
    { x: 8.0, z: -2.6, yaw: 2.4, emotion: 'neutral' },
    { x: -2.5, z: -3.0, yaw: 0.2, emotion: 'happy' }   // camarero, junto a la barra
  ], { startIndex: 11 });

  // ---- MOTAS de polvo flotando en la luz cálida (atmósfera senior) ----
  const moteN = 60;
  const moteGeo = new THREE.BufferGeometry();
  const mpos = new Float32Array(moteN * 3);
  for (let i = 0; i < moteN; i++) { mpos[i * 3] = (Math.random() - 0.5) * 22; mpos[i * 3 + 1] = 1 + Math.random() * 9; mpos[i * 3 + 2] = -10 + Math.random() * 16; }
  moteGeo.setAttribute('position', new THREE.BufferAttribute(mpos, 3));
  const motes = new THREE.Points(moteGeo, new THREE.PointsMaterial({ color: 0xffdba0, size: 0.12, transparent: true, opacity: 0.6, depthWrite: false }));
  group.add(motes);

  // ---- luz de relleno cálida hacia la cámara (el jugador no queda en sombra) ----
  const camWarm = new THREE.PointLight(0xffca85, 1.6, 30, 1.6); camWarm.position.set(0, 6, 8); group.add(camWarm);

  // Colisiones: paredes + barra + hogar + mesas del comedor.
  ctx.addObstacle(0, -10.8, 13, 0.6);
  ctx.addObstacle(-12.4, -1, 0.6, 10);
  ctx.addObstacle(12.4, -1, 0.6, 10);
  ctx.addObstacle(-1.5, -5.5, 7.6, 1.2);
  ctx.addObstacle(-10.5, -9.6, 2, 1);
  for (const [tx, tz] of [[-4.5, 5.5], [4.5, 6.5], [6.5, -2.5]] as Array<[number, number]>) ctx.addObstacle(tx, tz, 1.3, 1.3);

  return {
    group, tav,
    update(_dt: number, t: number): void {
      const f = 0.85 + Math.sin(t * 11) * 0.1 + Math.sin(t * 23) * 0.05;
      fireLight.intensity = 5.5 * f;
      flames.forEach((fl, i) => fl.scale.set(0.9 + f * 0.2, f * (1 + i * 0.12), 0.9 + f * 0.2));
      diners.update(_dt);
      // motas: suben lento y reaparecen
      const mp = motes.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < moteN; i++) {
        let y = mp.getY(i) + _dt * (0.15 + (i % 5) * 0.03);
        if (y > 11) y = 1;
        mp.setY(i, y);
        mp.setX(i, mp.getX(i) + Math.sin(t * 0.5 + i) * 0.002);
      }
      mp.needsUpdate = true;
    },
    dispose(): void { tav.dispose(); diners.dispose(); if (ctx.scene.fog) ctx.scene.fog = null; }
  };
}

// ============================ ESCONDITES (esc. 22–25) ============================

export interface HideoutsHandle {
  group: THREE.Group;
  rug: RugHide;
  pot: PotHide;
  update(dt: number, t: number, px: number, pz: number): boolean;
}

export function buildHideouts(ctx: SceneContext): HideoutsHandle {
  const group = new THREE.Group();
  // Escondites EXENTOS en el suelo del comedor, con COLISIÓN + hueco detrás:
  // el tapiz (izquierda) y la tinaja (derecha). Se rodean para meterse detrás.
  const rug = new RugHide(ctx.plastic, { x: -7.5, z: 0, entrada: 'derecha' });
  const pot = new PotHide(ctx.plastic, { x: 8, z: 0 });
  group.add(rug.group); group.add(pot.group);
  rug.registerCollision(ctx.addObstacle);
  pot.registerCollision(ctx.addObstacle);
  return {
    group, rug, pot,
    update(dt, t, px, pz): boolean {
      const inRug = rug.contains(px, pz); const inPot = pot.contains(px, pz);
      rug.update(dt, t, inRug); pot.update(dt, t, inPot);
      return inRug || inPot;
    }
  };
}

// ============================ EXTERIOR: CALLE / MERCADO ============================

export interface StreetStageHandle {
  group: THREE.Group;
  update(dt: number, t: number): void;
  dispose(): void;
}

export interface StreetStageOptions {
  posada?: { x: number; z: number };
  gente?: 'poca' | 'media' | 'mucha';
  stalls?: Array<{ x: number; z: number; yaw?: number; variant?: number }>;
}

/** Muralla + torres de Jericó al fondo de la calle (silueta con ventanas cálidas). */
function buildJerichoBackdrop(P: import('../../../materials/PlasticMaterialFactory').PlasticMaterialFactory): THREE.Group {
  const g = new THREE.Group();
  const wallCol = 0x8a7250, wallDark = 0x6f5a3e;
  // muralla larga cruzando el fondo
  g.add(brickBox(P, 90, 16, 3, wallCol, 0, 8, 66));
  g.add(brickBox(P, 90, 2, 3.4, wallDark, 0, 16.5, 66));
  // almenas
  for (let x = -44; x <= 44; x += 4) g.add(brickBox(P, 2, 2, 3.6, wallCol, x, 17.5, 66));
  // torres con ventanas cálidas emisivas
  for (const tx of [-30, -12, 14, 32]) {
    g.add(brickBox(P, 9, 24, 9, wallCol, tx, 12, 68));
    g.add(brickBox(P, 10, 2.4, 10, wallDark, tx, 24, 68));
    for (let wy = 8; wy < 22; wy += 5) {
      const win = brickBox(P, 1.4, 2, 0.4, 0xffca7a, tx + (Math.random() < 0.5 ? -2 : 2), wy, 63.4);
      win.material = new THREE.MeshStandardMaterial({ color: 0xffca7a, emissive: 0xffab45, emissiveIntensity: 1.1 });
      g.add(win);
    }
  }
  return g;
}

export function buildStreetStage(ctx: SceneContext, o: StreetStageOptions = {}): StreetStageHandle {
  const group = new THREE.Group();
  const P = ctx.plastic;

  // suelo de adoquín cálido
  const floor = studdedPlate(P, 44, 90, BrickPalette.DARK_SAND, false);
  floor.position.set(0, -0.35, 22); group.add(floor);

  // muralla de Jericó al fondo (profundidad de peli)
  group.add(buildJerichoBackdrop(P));
  // luna grande + halo
  const moon = new THREE.Mesh(new THREE.SphereGeometry(7, 20, 16), new THREE.MeshBasicMaterial({ color: 0xf6efd6 }));
  moon.position.set(-46, 52, 90); group.add(moon);
  const moonHalo = new THREE.Mesh(new THREE.SphereGeometry(11, 16, 12), new THREE.MeshBasicMaterial({ color: 0xbcc8e8, transparent: true, opacity: 0.22 }));
  moonHalo.position.copy(moon.position); group.add(moonHalo);

  // casas a los lados → definen el pasillo (con colisión)
  const blocks: Array<[number, number, number, number]> = [
    [-15, -6, 10, 9], [15, -6, 10, 9], [-15, 12, 10, 9], [15, 12, 10, 9],
    [-15, 30, 10, 9], [15, 30, 10, 9], [-15, 48, 10, 9], [15, 48, 10, 9]
  ];
  blocks.forEach(([x, z, w, h], i) => {
    const house = buildHouse(P, w, h, 9, i % 2 ? BrickPalette.SAND : BrickPalette.WARM_SAND, i % 3 ? BrickPalette.DARK_RED : BrickPalette.BROWN);
    house.position.set(x, 0, z); group.add(house);
    // ventanas cálidas emisivas en las casas (vida nocturna)
    const win = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 0.3), new THREE.MeshStandardMaterial({ color: 0xffca7a, emissive: 0xffab45, emissiveIntensity: 0.9 }));
    win.position.set(x + (x < 0 ? w / 2 : -w / 2) * 0.4, 4.4, z + 4.6); group.add(win);
    ctx.addObstacle(x, z, w / 2, 4.6);
  });

  // braseros + farolillos + ropa + pozo
  const braziers = [buildBrazier(P, -9, 8, 4), buildBrazier(P, 9, 8, 22), buildBrazier(P, -9, 8, 40)];
  braziers.forEach((b) => group.add(b.group));
  const lanternHandles = [buildLantern(P, -8.5, 5, 14, 9), buildLantern(P, 8.5, 5, 26, 9), buildLantern(P, -8.5, 5, 38, 9)];
  lanternHandles.forEach((l) => group.add(l.group));
  group.add(buildLanternString(P, { ax: -9, az: 8, bx: 9, bz: 8, height: 7, count: 7, lights: 3 }));
  group.add(buildLanternString(P, { ax: -9, az: 26, bx: 9, bz: 26, height: 7, count: 7, lights: 3 }));
  group.add(buildLaundryLine(P, { ax: -9, az: 44, bx: 9, bz: 44, height: 6, count: 6, seed: 2 }));
  group.add(buildWell(P, { x: 7, z: 33 }));

  const stalls = o.stalls ?? [
    { x: -8, z: 10, yaw: 0.4, variant: 0 }, { x: 8, z: 18, yaw: -0.4, variant: 1 },
    { x: -8, z: 30, yaw: 0.4, variant: 2 }, { x: 8, z: 40, yaw: -0.4, variant: 3 }
  ];
  stalls.forEach((s) => { const st = buildStall(P, s); group.add(st); ctx.addObstacle(s.x, s.z, 1.9, 1.1); });
  [[-7, 4], [7, 8], [-7, 24], [7, 34], [-7, 46]].forEach(([x, z]) => { const br = buildBarrel(P); br.position.set(x, 0, z); group.add(br); });

  // letrero iluminado de la POSADA
  if (o.posada) {
    const { x, z } = o.posada;
    group.add(brickBox(P, 0.5, 6, 0.5, BrickPalette.DARK_BROWN, x + 3.6, 3, z));
    const board = new THREE.Mesh(new THREE.BoxGeometry(5, 2.4, 0.4), new THREE.MeshStandardMaterial({ color: 0xf1c96a, emissive: 0xffb24d, emissiveIntensity: 0.95, roughness: 0.8 }));
    board.position.set(x + 1.2, 6.2, z); board.castShadow = true; group.add(board);
    const signLight = new THREE.PointLight(0xffb24d, 3, 20, 1.7); signLight.position.set(x + 1.2, 6.2, z + 1.5); group.add(signLight);
  }

  // GENTÍO
  const dens = o.gente ?? 'media';
  const nStatic = dens === 'poca' ? 5 : dens === 'mucha' ? 12 : 8;
  const spots: CrowdSpot[] = [];
  for (let i = 0; i < nStatic; i++) {
    const side = i % 2 ? 1 : -1;
    spots.push({ x: side * (6 + (i % 3)), z: 6 + i * 4.5, yaw: side < 0 ? 1.4 : -1.4, emotion: i % 4 === 0 ? 'worried' : 'neutral', scale: i % 5 === 0 ? 0.72 : 1 });
  }
  const walkers: CrowdWalker[] = [
    { ax: -6, az: 12, bx: 6, bz: 20, speed: 1.5, scale: 1 },
    { ax: 6, az: 36, bx: -6, bz: 28, speed: 1.3, scale: 0.75, emotion: 'happy' },
    { ax: -5, az: 46, bx: 5, bz: 42, speed: 1.7 }
  ];
  const crowd = buildCrowd(ctx.scene, P, spots, { walkers, startIndex: 3 });

  // HUMO de los braseros (atmósfera): puffs que suben y se desvanecen
  const puffGeo = new THREE.SphereGeometry(0.55, 6, 5);
  interface Puff { m: THREE.Mesh; fx: number; fz: number; life: number; dur: number; }
  const puffs: Puff[] = [];
  [[-9, 4], [9, 22], [-9, 40]].forEach(([fx, fz]) => {
    for (let k = 0; k < 4; k++) {
      const m = new THREE.Mesh(puffGeo, new THREE.MeshBasicMaterial({ color: 0xb9b0a2, transparent: true, opacity: 0, depthWrite: false }));
      group.add(m); puffs.push({ m, fx, fz, life: k / 4, dur: 2.8 + Math.random() });
    }
  });

  return {
    group,
    update(dt: number, t: number): void {
      braziers.forEach((b) => b.update(t));
      lanternHandles.forEach((l) => l.update(t));
      crowd.update(dt);
      for (const p of puffs) {
        p.life += dt / p.dur;
        if (p.life > 1) { p.life = 0; }
        const yy = 9 + p.life * 7;
        p.m.position.set(p.fx + Math.sin(p.life * 4) * 0.6, yy, p.fz);
        p.m.scale.setScalar(0.6 + p.life * 2.2);
        (p.m.material as THREE.MeshBasicMaterial).opacity = 0.35 * (1 - p.life);
      }
    },
    dispose(): void { crowd.dispose(); }
  };
}
