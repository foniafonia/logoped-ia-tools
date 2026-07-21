import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { makeBrickGeometry, normalizeGeometry } from '../bricks/BrickGeometryFactory';
import { STUD_WIDTH, BRICK_HEIGHT, BEVEL_SIZE } from '../bricks/BrickDimensions';
import { PlasticMaterialFactory } from '../materials/PlasticMaterialFactory';
import { BrickPalette } from '../materials/BrickPalette';

/**
 * Acumula geometrías por color y las fusiona en una malla por color
 * (pocas draw-calls). Suficiente para un render estático de estructura;
 * la variante InstancedMesh llegará en la fase de rendimiento.
 */
class BrickAccumulator {
  private byColor = new Map<number, THREE.BufferGeometry[]>();

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
    const { geometry } = makeBrickGeometry(w, d, kind);
    this.addGeometry(geometry, colorHex, x, y, z);
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
function corbelGeo(len: number): THREE.BufferGeometry {
  const g = new THREE.CylinderGeometry(0.5, 0.5, len, 16, 1, false, 0, Math.PI);
  g.rotateZ(Math.PI / 2); // eje a lo largo de X
  return normalizeGeometry(g);
}

/** Bloque genérico biselado (para almenas, dinteles, puerta). */
function blockGeo(w: number, h: number, d: number): THREE.BufferGeometry {
  const g = new RoundedBoxGeometry(w, h, d, 3, BEVEL_SIZE);
  g.translate(0, h / 2, 0);
  return normalizeGeometry(g);
}

interface WallOptions { x0: number; z: number; widthStuds: number; courses: number; gate?: boolean; }

/** Tramo de muralla de filas alternadas, con ménsulas y almenas arriba. */
function addWall(acc: BrickAccumulator, o: WallOptions): void {
  const gateCenter = o.x0 + o.widthStuds / 2;
  const gateHalf = 3; // hueco de puerta de 6 studs
  const gateTop = 5;  // cursos de alto del hueco

  for (let c = 0; c < o.courses; c++) {
    const y = c * BRICK_HEIGHT;
    const offset = c % 2 ? -1 : 0;
    for (let sx = 0; sx < o.widthStuds; sx += 2) {
      const cx = o.x0 + sx + offset + 1; // centro de un ladrillo 2x2
      if (o.gate && c < gateTop && Math.abs(cx - gateCenter) < gateHalf) continue; // hueco de puerta
      acc.addBrick(2, 2, 'brick', sandFor(cx, y), cx, y, o.z);
    }
  }

  // Dintel del arco de la puerta
  if (o.gate) {
    const topY = gateTop * BRICK_HEIGHT;
    acc.addGeometry(blockGeo(gateHalf * 2 + 1, BRICK_HEIGHT * 1.2, 2.2), BrickPalette.DARK_SAND, gateCenter, topY, o.z);
    // Puerta de madera (plástico marrón)
    acc.addGeometry(blockGeo(gateHalf * 2 - 0.6, gateTop * BRICK_HEIGHT - 0.2, 0.5),
      BrickPalette.DARK_BROWN, gateCenter, 0, o.z + 0.9);
  }

  addCrown(acc, o.x0, o.x0 + o.widthStuds, o.courses * BRICK_HEIGHT, o.z);
}

/** Corona del muro: fila de ménsulas + almenas cuadradas con huecos. */
function addCrown(acc: BrickAccumulator, x0: number, x1: number, topY: number, z: number): void {
  // fila de ménsulas redondeadas que sobresalen hacia delante
  for (let x = x0 + 0.5; x < x1; x += 1) {
    acc.addGeometry(corbelGeo(0.9), BrickPalette.WARM_SAND, x, topY - 0.1, z + 1.1);
  }
  // banda continua sobre las ménsulas
  acc.addGeometry(blockGeo(x1 - x0, 0.5, 2.4), BrickPalette.SAND, (x0 + x1) / 2, topY + 0.35, z);
  // almenas (merlones) alternos
  for (let x = x0; x < x1 - 1; x += 2) {
    acc.addGeometry(blockGeo(1.4, BRICK_HEIGHT, 1.6), BrickPalette.WARM_SAND, x + 1, topY + 0.85, z);
  }
}

/** Torre cuadrada más alta, con base en talud, ventana de flecha y corona. */
function addTower(acc: BrickAccumulator, cx: number, z: number, courses: number): void {
  const foot = 3; // 3x3 studs
  // base en talud (skirt que se ensancha abajo)
  for (let i = 0; i < 3; i++) {
    const grow = (3 - i) * 0.5;
    acc.addGeometry(blockGeo(foot + grow, BRICK_HEIGHT, foot + grow),
      BrickPalette.DARK_SAND, cx, i * BRICK_HEIGHT * 0.8, z);
  }
  const baseY = 2.4;
  for (let c = 0; c < courses; c++) {
    const y = baseY + c * BRICK_HEIGHT;
    const offset = c % 2 ? -1 : 0;
    for (let sx = -foot + 1; sx <= foot - 1; sx += 2) {
      for (let sz = -1; sz <= 1; sz += 2) {
        acc.addBrick(2, 1, 'brick', sandFor(cx + sx, y), cx + sx + offset, y, z + sz * 1);
      }
    }
  }
  // ventana de flecha (recess oscuro alto)
  const winY = baseY + courses * BRICK_HEIGHT * 0.55;
  acc.addGeometry(blockGeo(0.7, BRICK_HEIGHT * 2.4, 0.4), BrickPalette.DARK_BROWN, cx, winY, z + 1.55);
  // corona de la torre
  addCrown(acc, cx - foot / 2 - 0.5, cx + foot / 2 + 0.5, baseY + courses * BRICK_HEIGHT, z);
}

/** Suelo tipo placa base con tetones (sand). */
function addBaseplate(acc: BrickAccumulator): void {
  for (let x = -30; x < 30; x += 2) {
    for (let zz = 2; zz < 16; zz += 2) {
      acc.addBrick(2, 2, 'plate', BrickPalette.SAND, x + 1, -0.4, zz + 1);
    }
  }
}

/** Escena completa: muralla + dos torres + puerta + suelo. */
export function buildJericho(plastic: PlasticMaterialFactory): THREE.Group {
  const acc = new BrickAccumulator();
  addBaseplate(acc);
  addWall(acc, { x0: -20, z: 0, widthStuds: 40, courses: 7, gate: true });
  addTower(acc, -8, 0.2, 9);
  addTower(acc, 8, 0.2, 9);
  return acc.build(plastic);
}
