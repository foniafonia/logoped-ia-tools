import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  STUD_WIDTH, STUD_DEPTH, BRICK_HEIGHT, PLATE_HEIGHT, TILE_HEIGHT,
  STUD_RADIUS, STUD_HEIGHT, BEVEL_SIZE, PIECE_GAP
} from './BrickDimensions';

export type PieceKind = 'brick' | 'plate' | 'tile';

/** Deja solo position/normal/uv y sin índice, para poder fusionar sin conflictos. */
export function normalizeGeometry(geo: THREE.BufferGeometry): THREE.BufferGeometry {
  return normalize(geo);
}
function normalize(geo: THREE.BufferGeometry): THREE.BufferGeometry {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const keep = ['position', 'normal', 'uv'];
  for (const name of Object.keys(g.attributes)) {
    if (!keep.includes(name)) g.deleteAttribute(name);
  }
  if (!g.attributes.uv) {
    const count = g.attributes.position.count;
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(count * 2), 2));
  }
  return g;
}

/** Geometría de tetón reutilizable (cilindro con borde superior suavizado). */
function makeStudGeometry(): THREE.BufferGeometry {
  const g = new THREE.CylinderGeometry(STUD_RADIUS, STUD_RADIUS * 0.98, STUD_HEIGHT, 24, 1, false);
  // pequeño chaflán superior para que el tetón no tenga canto vivo
  const cap = new THREE.CylinderGeometry(STUD_RADIUS * 0.86, STUD_RADIUS, STUD_HEIGHT * 0.28, 24, 1, false);
  cap.translate(0, STUD_HEIGHT * 0.5, 0);
  return mergeGeometries([normalize(g), normalize(cap)], false)!;
}

const STUD_GEO = makeStudGeometry();

export interface BrickGeometryResult {
  geometry: THREE.BufferGeometry;
  size: { w: number; d: number; h: number };
}

/**
 * Crea la geometría (cuerpo biselado + tetones) de una pieza de w x d studs.
 * El pivote queda en el centro horizontal y en la base (y = 0 abajo).
 */
export function makeBrickGeometry(
  wStuds: number,
  dStuds: number,
  kind: PieceKind = 'brick'
): BrickGeometryResult {
  const height = kind === 'brick' ? BRICK_HEIGHT : kind === 'plate' ? PLATE_HEIGHT : TILE_HEIGHT;
  const width = wStuds * STUD_WIDTH - PIECE_GAP;
  const depth = dStuds * STUD_DEPTH - PIECE_GAP;

  const body = new RoundedBoxGeometry(width, height, depth, 4, BEVEL_SIZE);
  body.translate(0, height / 2, 0);

  const geoms: THREE.BufferGeometry[] = [normalize(body)];

  // Las baldosas (tile) no llevan tetones
  if (kind !== 'tile') {
    for (let ix = 0; ix < wStuds; ix++) {
      for (let iz = 0; iz < dStuds; iz++) {
        const x = (ix - (wStuds - 1) / 2) * STUD_WIDTH;
        const z = (iz - (dStuds - 1) / 2) * STUD_DEPTH;
        const stud = STUD_GEO.clone();
        stud.translate(x, height + STUD_HEIGHT / 2, z);
        geoms.push(stud);
      }
    }
  }

  const geometry = mergeGeometries(geoms, false)!;
  geometry.computeVertexNormals();
  return { geometry, size: { w: width, d: depth, h: height } };
}
