import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { normalizeGeometry } from '../bricks/BrickGeometryFactory';
import { IS_MOBILE } from '../core/Quality';

/** Palmeras (instanced) + antorchas junto a la puerta. */
export function buildScenery(): THREE.Group {
  const group = new THREE.Group();
  const N = IS_MOBILE ? 26 : 60;

  const trunkGeo = normalizeGeometry(new THREE.CylinderGeometry(0.32, 0.5, 8, 6).translate(0, 4, 0));
  // fronda: varias hojas planas radiales
  const leaves: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 6; k++) {
    const leaf = new THREE.BoxGeometry(0.5, 0.16, 3.2);
    leaf.translate(0, 0, 1.5);
    leaf.rotateX(-0.5);
    leaf.rotateY((k / 6) * Math.PI * 2);
    leaf.translate(0, 8, 0);
    leaves.push(normalizeGeometry(leaf));
  }
  const frondGeo = mergeGeometries(leaves, false)!;

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x7a5a34, roughness: 0.85 });
  const frondMat = new THREE.MeshStandardMaterial({ color: 0x4f7a3a, roughness: 0.8 });
  const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, N);
  const fronds = new THREE.InstancedMesh(frondGeo, frondMat, N);
  trunks.castShadow = true; fronds.castShadow = true;

  const d = new THREE.Object3D();
  for (let i = 0; i < N; i++) {
    // repartidas a los lados y detrás, lejos del frente central
    let x = (Math.random() - 0.5) * 340;
    if (Math.abs(x) < 40) x += Math.sign(x || 1) * 40;
    const z = 15 + Math.random() * 130;
    d.position.set(x, 0, z);
    d.rotation.set(0, Math.random() * Math.PI, 0);
    const s = 0.8 + Math.random() * 0.7;
    d.scale.set(s, s, s);
    d.updateMatrix();
    trunks.setMatrixAt(i, d.matrix); fronds.setMatrixAt(i, d.matrix);
  }
  trunks.instanceMatrix.needsUpdate = true; fronds.instanceMatrix.needsUpdate = true;
  group.add(trunks, fronds);

  // Antorchas a los lados de la puerta (poste + llama emisiva, sin luces)
  const postMat = new THREE.MeshStandardMaterial({ color: 0x4a3420, roughness: 0.9 });
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xffb347 });
  for (const tx of [-6, 6]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 5, 6), postMat);
    post.position.set(tx, 2.5, 4.5); post.castShadow = true;
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.4, 8), flameMat);
    flame.position.set(tx, 5.4, 4.5);
    group.add(post, flame);
  }

  // === Avenida procesional: columnas + farolas flanqueando el pasillo ===
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xe3cd9a, roughness: 0.8 });
  const colBase = normalizeGeometry(new THREE.BoxGeometry(1.7, 0.5, 1.7).translate(0, 0.25, 0));
  const colShaft = normalizeGeometry(new THREE.CylinderGeometry(0.5, 0.6, 6.2, 14).translate(0, 3.6, 0));
  const colCap = normalizeGeometry(new THREE.BoxGeometry(1.6, 0.6, 1.6).translate(0, 7.0, 0));
  const columnGeo = mergeGeometries([colBase, colShaft, colCap], false)!;

  const lampPostMat = new THREE.MeshStandardMaterial({ color: 0x2a241c, roughness: 0.7 });
  const lampGlow = new THREE.MeshBasicMaterial({ color: 0xffd27a });

  for (const side of [-1, 1]) {
    for (let z = 16; z <= 50; z += 5.6) {
      // columna
      const col = new THREE.Mesh(columnGeo, stoneMat);
      col.position.set(side * 10, 0, z); col.castShadow = true; col.receiveShadow = true;
      group.add(col);
    }
    for (let z = 19; z <= 48; z += 5.6) {
      // farola: poste + brazo + lámpara que brilla
      const lp = new THREE.Group();
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 6, 6), lampPostMat);
      post.position.y = 3; post.castShadow = true;
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 1.2), lampPostMat);
      arm.position.set(side * -0.6, 5.8, 0);
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.7), lampGlow);
      lamp.position.set(side * -1.1, 5.5, 0);
      lp.add(post, arm, lamp);
      lp.position.set(side * 14, 0, z);
      group.add(lp);
    }
  }
  return group;
}

