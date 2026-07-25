import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { makeBrickGeometry, normalizeGeometry } from '../bricks/BrickGeometryFactory';
import { STUD_WIDTH, BRICK_HEIGHT, BEVEL_SIZE } from '../bricks/BrickDimensions';
import { PlasticMaterialFactory } from '../materials/PlasticMaterialFactory';
import { BrickPalette } from '../materials/BrickPalette';
import { IS_MOBILE } from '../core/Quality';
import { COURT, ROAD } from '../core/Layout';

/**
 * Acumula geometrías por color y las fusiona en una malla por color
 * (pocas draw-calls). Suficiente para un render estático de estructura;
 * la variante InstancedMesh llegará en la fase de rendimiento.
 */
class BrickAccumulator {
  private byColor = new Map<number, THREE.BufferGeometry[]>();
  // CACHÉ de geometría por (w,d,kind): el muro de Jericó llama a addBrick miles de
  // veces con ladrillos IDÉNTICOS (2×2). Antes se re-teselaba un RoundedBox+tetones
  // en cada llamada (→ 24 s / ~1 GB). Ahora se tesela UNA vez y se clona (barato).
  private static geoCache = new Map<string, THREE.BufferGeometry>();

  addGeometry(geo: THREE.BufferGeometry, colorHex: number, x: number, y: number, z: number, rotY = 0): void {
    const g = normalizeGeometry(geo.clone());
    const m = new THREE.Matrix4().makeRotationY(rotY);
    m.setPosition(x, y, z);
    g.applyMatrix4(m);
    if (!this.byColor.has(colorHex)) this.byColor.set(colorHex, []);
    this.byColor.get(colorHex)!.push(g);
  }

  addBrick(w: number, d: number, kind: 'brick' | 'plate' | 'tile', colorHex: number,
           x: number, y: number, z: number): void {
    const key = `${w}|${d}|${kind}`;
    let geometry = BrickAccumulator.geoCache.get(key);
    if (!geometry) { geometry = makeBrickGeometry(w, d, kind).geometry; BrickAccumulator.geoCache.set(key, geometry); }
    this.addGeometry(geometry, colorHex, x, y, z);   // addGeometry clona → la caché no se muta
  }

  build(plastic: PlasticMaterialFactory): THREE.Group {
    const group = new THREE.Group();
    for (const [colorHex, geos] of this.byColor) {
      const merged = mergeGeometries(geos, false)!;
      const mesh = new THREE.Mesh(merged, plastic.get(colorHex));
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    }
    return group;
  }
}

const SAND_TONES = [BrickPalette.SAND, BrickPalette.WARM_SAND, BrickPalette.TAN];
function sandFor(x: number, y: number): number {
  const h = (Math.floor(x) * 928371 + Math.floor(y) * 12345) >>> 0;
  if (h % 11 === 0) return BrickPalette.DARK_SAND; // ladrillo acento oscuro salpicado
  if (h % 7 === 0) return BrickPalette.BROWN;
  return SAND_TONES[h % SAND_TONES.length];
}

/** Ménsula redondeada (medio cilindro tumbado que sobresale del muro). */
function corbelGeo(len: number, axis: 'x' | 'z' = 'x'): THREE.BufferGeometry {
  const g = new THREE.CylinderGeometry(0.5, 0.5, len, 16, 1, false, 0, Math.PI);
  if (axis === 'x') g.rotateZ(Math.PI / 2);
  else g.rotateX(Math.PI / 2);
  return normalizeGeometry(g);
}

/** Bloque genérico biselado (para almenas, dinteles, puerta). */
function blockGeo(w: number, h: number, d: number): THREE.BufferGeometry {
  const g = new RoundedBoxGeometry(w, h, d, 3, BEVEL_SIZE);
  g.translate(0, h / 2, 0);
  return normalizeGeometry(g);
}

interface WallOptions { x0: number; z: number; widthStuds: number; courses: number; gate?: boolean; }

const GATE_HALF = 3; // hueco de puerta de 6 studs
const GATE_TOP = 5;  // cursos de alto del hueco

/** Añade los cursos [cStart, cEnd) del muro a un acumulador (para franjas). */
function addWallCourses(acc: BrickAccumulator, o: WallOptions, cStart: number, cEnd: number): void {
  const gateCenter = o.x0 + o.widthStuds / 2;
  for (let c = cStart; c < cEnd; c++) {
    const y = c * BRICK_HEIGHT;
    const offset = c % 2 ? -1 : 0;
    for (let sx = 0; sx < o.widthStuds; sx += 2) {
      const cx = o.x0 + sx + offset + 1;
      if (o.gate && c < GATE_TOP && Math.abs(cx - gateCenter) < GATE_HALF) continue; // hueco de puerta
      acc.addBrick(2, 2, 'brick', sandFor(cx, y), cx, y, o.z);
    }
    if (o.gate && c === GATE_TOP) {
      acc.addGeometry(blockGeo(GATE_HALF * 2 + 1, BRICK_HEIGHT * 1.2, 2.2), BrickPalette.DARK_SAND, gateCenter, GATE_TOP * BRICK_HEIGHT, o.z);
    }
  }
  if (cStart === 0 && o.gate) {
    acc.addGeometry(blockGeo(GATE_HALF * 2 - 0.6, GATE_TOP * BRICK_HEIGHT - 0.2, 0.5),
      BrickPalette.DARK_BROWN, gateCenter, 0, o.z + 0.9); // puerta
  }
}

/** Corona del muro: fila de ménsulas + almenas cuadradas con huecos. */
function addCrown(acc: BrickAccumulator, x0: number, x1: number, topY: number, z: number): void {
  // fila de ménsulas redondeadas que sobresalen hacia delante
  for (let x = x0 + 0.5; x < x1; x += 1) {
    acc.addGeometry(corbelGeo(0.9, 'x'), BrickPalette.WARM_SAND, x, topY - 0.1, z + 1.1);
  }
  // banda continua sobre las ménsulas
  acc.addGeometry(blockGeo(x1 - x0, 0.5, 2.4), BrickPalette.SAND, (x0 + x1) / 2, topY + 0.35, z);
  // almenas (merlones) alternos
  for (let x = x0; x < x1 - 1; x += 2) {
    acc.addGeometry(blockGeo(1.4, BRICK_HEIGHT, 1.6), BrickPalette.WARM_SAND, x + 1, topY + 0.85, z);
  }
}

/** Base en talud limascia (pirámide truncada de 4 caras, alineada). */
function addBatter(acc: BrickAccumulator, cx: number, z: number, sideTop: number, sideBot: number, height: number): void {
  const rTop = sideTop / Math.SQRT2;
  const rBot = sideBot / Math.SQRT2;
  const g = new THREE.CylinderGeometry(rTop, rBot, height, 4, 1, false);
  g.rotateY(Math.PI / 4); // caras alineadas a los ejes
  g.translate(0, height / 2, 0);
  acc.addGeometry(normalizeGeometry(g), BrickPalette.DARK_SAND, cx, 0, z);
}

/** Ventana de flecha: hueco oscuro rematado en arco. */
function addSlitWindow(acc: BrickAccumulator, cx: number, y: number, zFace: number): void {
  acc.addGeometry(blockGeo(0.75, BRICK_HEIGHT * 2.1, 0.5), BrickPalette.DARK_BROWN, cx, y, zFace);
  const arch = new THREE.CylinderGeometry(0.42, 0.42, 0.5, 12, 1, false, 0, Math.PI);
  arch.rotateX(Math.PI / 2);
  acc.addGeometry(normalizeGeometry(arch), BrickPalette.DARK_BROWN, cx, y + BRICK_HEIGHT * 2.1, zFace);
}

/** Merlones (almenas) a lo largo de un borde recto. */
function addMerlons(acc: BrickAccumulator, x0: number, x1: number, y: number, z: number, along: 'x' | 'z'): void {
  const len = x1 - x0;
  for (let d = 0; d < len - 0.5; d += 2) {
    if (along === 'x') acc.addGeometry(blockGeo(1.4, BRICK_HEIGHT, 1.4), BrickPalette.WARM_SAND, x0 + d + 0.9, y, z);
    else acc.addGeometry(blockGeo(1.4, BRICK_HEIGHT, 1.4), BrickPalette.WARM_SAND, z, y, x0 + d + 0.9);
  }
}

/** Torre cuadrada limpia: base en talud, fuste de ladrillos, ventana y corona. */
function addTower(acc: BrickAccumulator, cx: number, courses: number): void {
  const z = 0;
  const half = 2;            // footprint 4x4 studs
  const baseY = 1.7;

  addBatter(acc, cx, z, half * 2 + 0.4, half * 2 + 2.4, baseY);

  // Fuste: cada curso = cuatro ladrillos 2x2 rellenando el 4x4, junta alterna
  for (let c = 0; c < courses; c++) {
    const y = baseY + c * BRICK_HEIGHT;
    const off = c % 2 ? 0.0 : 0.0; // footprint fijo, tono alterno para variar
    for (const dx of [-1, 1]) {
      for (const dz of [-1, 1]) {
        acc.addBrick(2, 2, 'brick', sandFor(cx + dx * 3 + (c % 2), y * 2 + dz), cx + dx + off, y, z + dz);
      }
    }
  }
  const topY = baseY + courses * BRICK_HEIGHT;

  // Ventana de flecha en la cara frontal
  addSlitWindow(acc, cx, baseY + courses * BRICK_HEIGHT * 0.4, z + half + 0.05);

  // Corona: banda saliente + ménsulas en las tres caras vistas + merlones alrededor
  acc.addGeometry(blockGeo(half * 2 + 1.2, 0.5, half * 2 + 1.2), BrickPalette.SAND, cx, topY + 0.3, z);
  for (let x = cx - half; x < cx + half; x += 1) {
    acc.addGeometry(corbelGeo(0.9, 'x'), BrickPalette.WARM_SAND, x + 0.5, topY - 0.05, z + half + 0.6);
  }
  for (let zz = z - half; zz < z + half; zz += 1) {
    acc.addGeometry(corbelGeo(0.9, 'z'), BrickPalette.WARM_SAND, cx - half - 0.6, topY - 0.05, zz + 0.5);
    acc.addGeometry(corbelGeo(0.9, 'z'), BrickPalette.WARM_SAND, cx + half + 0.6, topY - 0.05, zz + 0.5);
  }
  const my = topY + 0.9;
  addMerlons(acc, cx - half, cx + half, my, z + half, 'x'); // frente
  addMerlons(acc, cx - half, cx + half, my, z - half, 'x'); // detrás
  addMerlons(acc, z - half, z + half, my, cx - half, 'z'); // izquierda
  addMerlons(acc, z - half, z + half, my, cx + half, 'z'); // derecha
}

/** Suelo tipo placa base con tetones (sand), amplio para la zona jugable. */
function addBaseplate(acc: BrickAccumulator): void {
  for (let x = -70; x < 70; x += 2) {
    for (let zz = -8; zz < 34; zz += 2) {
      const col = ((x + zz) >>> 2) % 9 === 0 ? BrickPalette.WARM_SAND : BrickPalette.SAND;
      acc.addBrick(2, 2, 'plate', col, x + 1, -0.4, zz + 1);
    }
  }
}

export interface JerichoBuild {
  group: THREE.Group;    // todo, para añadir a la escena
  bands: THREE.Group[];  // franjas del muro, de ARRIBA a abajo (para el derrumbe)
  towers: THREE.Group[]; // torres, colapsan al final
  wallTop: number;       // altura de la coronación
  wallWidth: number;     // ancho total en unidades
}

/** Muralla de Jericó grande, construida por franjas horizontales. */
export function buildJericho(plastic: PlasticMaterialFactory): JerichoBuild {
  const group = new THREE.Group();
  const bands: THREE.Group[] = [];
  const towers: THREE.Group[] = [];

  // (el suelo lo pone EnvironmentManager: un plano texturizado, barato)

  // Tamaño según el dispositivo: ENORME en ordenador, manejable en móvil.
  const width = IS_MOBILE ? 200 : 420;
  const courses = IS_MOBILE ? 14 : 20;
  const o: WallOptions = { x0: -width / 2, z: 0, widthStuds: width, courses, gate: true };
  const BAND = 2;
  for (let c0 = 0; c0 < o.courses; c0 += BAND) {
    const acc = new BrickAccumulator();
    addWallCourses(acc, o, c0, Math.min(o.courses, c0 + BAND));
    if (c0 + BAND >= o.courses) addCrown(acc, o.x0, o.x0 + o.widthStuds, o.courses * BRICK_HEIGHT, o.z);
    const g = acc.build(plastic);
    group.add(g);
    bands.push(g);
  }
  bands.reverse(); // arriba primero

  // torres altas repartidas a lo ancho
  const nTowers = IS_MOBILE ? 6 : 10;
  const towerH = IS_MOBILE ? 20 : 26;
  for (let i = 0; i < nTowers; i++) {
    const tx = o.x0 + (o.widthStuds * (i + 0.5)) / nTowers;
    if (Math.abs(tx) < 6) continue; // deja libre la puerta central
    const acc = new BrickAccumulator();
    addTower(acc, tx, towerH);
    const g = acc.build(plastic);
    group.add(g);
    towers.push(g);
  }

  return { group, bands, towers, wallTop: o.courses * BRICK_HEIGHT, wallWidth: o.widthStuds };
}

/** Muro recto de ladrillo (centrado en x=0, cara frontal hacia +z), coronado
 * con banda de ménsulas y merlones — el mismo lenguaje que la muralla. */
function buildStraightWall(plastic: PlasticMaterialFactory, widthStuds: number, courses: number, gate: boolean): THREE.Group {
  const acc = new BrickAccumulator();
  const o: WallOptions = { x0: -widthStuds / 2, z: 0, widthStuds, courses, gate };
  addWallCourses(acc, o, 0, courses);
  const topY = courses * BRICK_HEIGHT;
  // banda saliente + ménsulas frontales + merlones
  acc.addGeometry(blockGeo(widthStuds, 0.5, 2.4), BrickPalette.SAND, 0, topY + 0.28, 0);
  for (let x = -widthStuds / 2 + 0.5; x < widthStuds / 2; x += 1) {
    acc.addGeometry(corbelGeo(0.9, 'x'), BrickPalette.WARM_SAND, x, topY - 0.1, 1.1);
  }
  addMerlons(acc, -widthStuds / 2, widthStuds / 2, topY + 0.85, 0, 'x');
  return acc.build(plastic);
}

/**
 * Recinto amurallado delante de la muralla: dos muros laterales, un muro
 * trasero con puerta y cuatro torres en las esquinas. Todo de ladrillo con
 * el acabado de plástico, para que el espacio esté ACOTADO y "recogido".
 */
export function buildCourtyard(plastic: PlasticMaterialFactory): THREE.Group {
  const g = new THREE.Group();
  const { half, back, front, courses } = COURT;
  const sideLen = Math.round(back - front);   // studs de fondo
  const midZ = (front + back) / 2;

  const left = buildStraightWall(plastic, sideLen, courses, false);
  left.rotation.y = Math.PI / 2; left.position.set(-half, 0, midZ); g.add(left);

  const right = buildStraightWall(plastic, sideLen, courses, false);
  right.rotation.y = -Math.PI / 2; right.position.set(half, 0, midZ); g.add(right);

  const backW = buildStraightWall(plastic, Math.round(half * 2), courses, true);
  backW.rotation.y = Math.PI; backW.position.set(0, 0, back); g.add(backW);

  // torres en las cuatro esquinas (algo más altas que los muros)
  const tH = courses + 4;
  for (const cx of [-half, half]) {
    for (const cz of [front, back]) {
      const acc = new BrickAccumulator();
      addTower(acc, 0, tH);
      const t = acc.build(plastic);
      t.position.set(cx, 0, cz);
      g.add(t);
    }
  }
  return g;
}

/**
 * El CAMINO de aproximación: dos muros bajos de ladrillo que flanquean la
 * senda por la que el ejército marcha hasta la puerta trasera del recinto.
 */
export function buildApproach(plastic: PlasticMaterialFactory): THREE.Group {
  const g = new THREE.Group();
  const courses = COURT.courses - 2;
  const len = Math.round(ROAD.len);
  const midZ = COURT.back + ROAD.len / 2;
  for (const side of [-1, 1]) {
    const w = buildStraightWall(plastic, len, courses, false);
    w.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
    w.position.set(side * ROAD.half, 0, midZ);
    g.add(w);
  }
  // torres a la boca del camino (donde arranca la marcha)
  const zMouth = COURT.back + ROAD.len;
  for (const cx of [-ROAD.half, ROAD.half]) {
    const acc = new BrickAccumulator();
    addTower(acc, 0, courses + 3);
    const t = acc.build(plastic);
    t.position.set(cx, 0, zMouth);
    g.add(t);
  }
  return g;
}

/**
 * Columna procesional de LADRILLO (base y capitel anchos, fuste 2x2 con
 * tetones). Devuelve un grupo listo para clonar por la avenida.
 */
export function buildBrickColumn(plastic: PlasticMaterialFactory, courses: number): THREE.Group {
  const acc = new BrickAccumulator();
  // base ancha (dos placas apiladas)
  acc.addBrick(4, 4, 'plate', BrickPalette.DARK_SAND, 0, 0, 0);
  acc.addBrick(3, 3, 'plate', BrickPalette.WARM_SAND, 0, 0.4, 0);
  // fuste 2x2
  for (let c = 0; c < courses; c++) {
    const y = 0.8 + c * BRICK_HEIGHT;
    acc.addBrick(2, 2, 'brick', c % 2 ? BrickPalette.SAND : BrickPalette.WARM_SAND, 0, y, 0);
  }
  // capitel ancho
  const capY = 0.8 + courses * BRICK_HEIGHT;
  acc.addGeometry(blockGeo(3.4, 0.6, 3.4), BrickPalette.DARK_SAND, 0, capY, 0);
  acc.addBrick(4, 4, 'plate', BrickPalette.WARM_SAND, 0, capY + 0.6, 0);
  return acc.build(plastic);
}
