import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { normalizeGeometry } from '../bricks/BrickGeometryFactory';
import { IS_MOBILE } from '../core/Quality';

const ROBES = [0xb9a36f, 0x8f6a3e, 0x6f7a52, 0x9a9184, 0x7a5230, 0xcdb98a];
const TURBANS = [0xf1ece0, 0x2f6db0, 0x8a6a3a, 0xb9b2a4, 0xcdb98a];

function box(w: number, h: number, d: number, y: number): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(w, h, d); g.translate(0, y, 0);
  return normalizeGeometry(g);
}

/** Ejército de minifiguras (soldados) mirando a la muralla. Instanced para rendimiento. */
export function buildCrowd(): THREE.Group {
  const group = new THREE.Group();
  const count = IS_MOBILE ? 220 : 520;

  const bodyGeo = mergeGeometries([box(0.9, 1.9, 0.7, 0.95), box(1.05, 1.7, 0.72, 2.75)], false)!;
  const headGeo = normalizeGeometry(new THREE.CylinderGeometry(0.44, 0.44, 0.8, 8).translate(0, 4.0, 0));
  const turbGeo = normalizeGeometry(new THREE.SphereGeometry(0.5, 8, 6).scale(1, 0.7, 1).translate(0, 4.55, 0));
  const spearGeo = normalizeGeometry(new THREE.CylinderGeometry(0.05, 0.05, 4.2, 5).translate(0.7, 3.2, 0.2));
  const shieldGeo = normalizeGeometry(new THREE.CylinderGeometry(0.55, 0.55, 0.16, 12).rotateX(Math.PI / 2).translate(-0.65, 2.3, 0.42));

  const bodyMat = new THREE.MeshStandardMaterial({ roughness: 0.7, metalness: 0 });
  const headMat = new THREE.MeshStandardMaterial({ color: 0xf2c141, roughness: 0.5 });
  const turbMat = new THREE.MeshStandardMaterial({ roughness: 0.7 });
  const spearMat = new THREE.MeshStandardMaterial({ color: 0x5a3a1c, roughness: 0.8 });
  const shieldMat = new THREE.MeshStandardMaterial({ color: 0x8a5a2c, roughness: 0.7 });

  const body = new THREE.InstancedMesh(bodyGeo, bodyMat, count);
  const head = new THREE.InstancedMesh(headGeo, headMat, count);
  const turb = new THREE.InstancedMesh(turbGeo, turbMat, count);
  const spear = new THREE.InstancedMesh(spearGeo, spearMat, count);
  const shield = new THREE.InstancedMesh(shieldGeo, shieldMat, count);
  body.castShadow = true; head.castShadow = true;

  const dummy = new THREE.Object3D();
  const rows = IS_MOBILE ? 8 : 13;
  const cols = Math.ceil(count / rows);
  let i = 0;
  for (let r = 0; r < rows && i < count; r++) {
    for (let c = 0; c < cols && i < count; c++) {
      let x = (c - cols / 2) * (320 / cols) + (Math.random() - 0.5) * 3;
      if (Math.abs(x) < 13) x += (x < 0 ? -1 : 1) * 13; // fuera de la avenida central
      const z = 16 + r * (88 / rows) + (Math.random() - 0.5) * 3; // flanquea hasta la muralla
      dummy.position.set(x, 0, z);
      dummy.rotation.set(0, Math.PI + (Math.random() - 0.5) * 0.4, 0); // mira a la muralla (-z)
      const s = 0.92 + Math.random() * 0.16;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      body.setMatrixAt(i, dummy.matrix);
      head.setMatrixAt(i, dummy.matrix);
      turb.setMatrixAt(i, dummy.matrix);
      spear.setMatrixAt(i, dummy.matrix);
      shield.setMatrixAt(i, dummy.matrix);
      body.setColorAt(i, new THREE.Color(ROBES[(Math.random() * ROBES.length) | 0]));
      turb.setColorAt(i, new THREE.Color(TURBANS[(Math.random() * TURBANS.length) | 0]));
      i++;
    }
  }
  body.instanceMatrix.needsUpdate = true;
  group.add(body, head, turb, spear, shield);
  return group;
}
