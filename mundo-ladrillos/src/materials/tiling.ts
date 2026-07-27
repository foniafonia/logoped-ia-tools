import * as THREE from 'three';

/**
 * tiling — carga una textura data-URI y la deja lista para TILEAR (repetir) en
 * suelos y muros, matando los "suelos infinitos planos" (Regla Nº1). Las texturas
 * son de Higgsfield (z_image, seamless) e incrustadas como data-URI (ver
 * src/assets/texSand.ts, texWall.ts).
 *
 *   import { tiledTexture } from './materials/tiling';
 *   import { texSand } from './assets/texSand';
 *   const mat = new THREE.MeshStandardMaterial({ map: tiledTexture(texSand, 12), roughness: 0.95 });
 *   floor.material = mat;
 */

/** Devuelve una THREE.Texture con RepeatWrapping (repeat×repeat) lista para suelo/muro. */
export function tiledTexture(dataUri: string, repeat = 8): THREE.Texture {
  const tex = new THREE.TextureLoader().load(dataUri);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.anisotropy = 4;
  return tex;
}

/** Aplica una textura tileada como `map` a un mesh existente (respeta su material). */
export function applyTiledTexture(mesh: THREE.Mesh, dataUri: string, repeat = 8): void {
  const mat = mesh.material as THREE.MeshStandardMaterial;
  mat.map = tiledTexture(dataUri, repeat);
  mat.needsUpdate = true;
}
