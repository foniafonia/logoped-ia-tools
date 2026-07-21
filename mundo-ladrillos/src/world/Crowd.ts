import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { normalizeGeometry } from '../bricks/BrickGeometryFactory';
import { IS_MOBILE } from '../core/Quality';
import { COURT } from '../core/Layout';

/** Material de plástico ABS (clearcoat) como el del espía y la muralla. */
function plasticStd(color: number, extra: THREE.MeshPhysicalMaterialParameters = {}): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color, metalness: 0, roughness: 0.34, clearcoat: 0.4, clearcoatRoughness: 0.2,
    envMapIntensity: 1.1, ...extra
  });
}

const ROBES = [0xb9a36f, 0x8f6a3e, 0x6f7a52, 0x9a9184, 0x7a5230, 0xc9b083, 0x86633a];
const TURBANS = [0xf1ece0, 0x2f6db0, 0x8a6a3a, 0xb9b2a4, 0xcdb98a, 0xe6ddc9];

/** RoundedBox con pivote y rotación opcional, normalizado para fusionar. */
function rbox(w: number, h: number, d: number, x: number, y: number, z: number, rz = 0, rx = 0): THREE.BufferGeometry {
  const g = new RoundedBoxGeometry(w, h, d, 1, 0.05);
  if (rz) g.rotateZ(rz);
  if (rx) g.rotateX(rx);
  g.translate(x, y, z);
  return normalizeGeometry(g);
}
function cyl(rt: number, rb: number, h: number, x: number, y: number, z: number, seg = 10): THREE.BufferGeometry {
  return normalizeGeometry(new THREE.CylinderGeometry(rt, rb, h, seg).translate(x, y, z));
}

/**
 * Ejército de minifiguras de VERDAD (proporciones de minifig, turbante,
 * barba, espada en alto y escudo). Geometría propia buena, instanciada por
 * rol para que el móvil aguante cientos de soldados.
 */
export function buildCrowd(): THREE.Group {
  const group = new THREE.Group();
  const count = IS_MOBILE ? 170 : 340;

  // --- Cuerpo (túnica): piernas + cadera + torso trapezoidal + 2 brazos ---
  const body = mergeGeometries([
    rbox(0.62, 1.25, 0.78, -0.32, 0.62, 0),   // pierna izq
    rbox(0.62, 1.25, 0.78, 0.32, 0.62, 0),    // pierna der
    rbox(1.34, 0.5, 0.86, 0, 1.5, 0),         // cadera
    rbox(1.2, 1.4, 0.8, 0, 2.5, 0),           // torso
    rbox(1.5, 0.7, 0.88, 0, 3.02, 0),         // hombros (trapezoide)
    rbox(0.42, 1.15, 0.52, -0.86, 2.55, 0.04, 0.16),   // brazo izq (bajado)
    rbox(0.44, 1.25, 0.52, 1.02, 3.95, 0, -0.7)        // brazo der (LEVANTADO)
  ], false)!;

  // --- Piel (cabeza + 2 manos), amarillo fijo ---
  const skin = mergeGeometries([
    cyl(0.26, 0.26, 0.18, 0, 3.62, 0),        // cuello
    cyl(0.55, 0.55, 0.92, 0, 4.15, 0, 12),    // cabeza
    normalizeGeometry(new THREE.TorusGeometry(0.19, 0.09, 6, 12).rotateX(Math.PI / 2).translate(-1.02, 1.95, 0.16)), // mano izq
    normalizeGeometry(new THREE.TorusGeometry(0.19, 0.09, 6, 12).rotateX(Math.PI / 2).translate(1.5, 4.55, 0))       // mano der (en alto)
  ], false)!;

  // --- Turbante (media esfera + banda) ---
  const turban = mergeGeometries([
    normalizeGeometry(new THREE.SphereGeometry(0.62, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2).scale(1.05, 0.92, 1.05).translate(0, 4.55, 0)),
    normalizeGeometry(new THREE.TorusGeometry(0.57, 0.15, 6, 14).rotateX(Math.PI / 2).translate(0, 4.55, 0))
  ], false)!;

  // --- Barba (cono gris/marrón bajo la cara) ---
  const beard = normalizeGeometry(new THREE.ConeGeometry(0.5, 1.0, 10).rotateX(Math.PI).scale(1, 1, 0.7).translate(0, 3.9, 0.34));

  // --- Espada en alto (hoja + guarda + empuñadura) ---
  const sword = mergeGeometries([
    rbox(0.16, 2.6, 0.06, 1.5, 6.1, 0),        // hoja
    rbox(0.55, 0.14, 0.14, 1.5, 4.75, 0),      // guarda
    cyl(0.09, 0.09, 0.5, 1.5, 4.5, 0, 6)       // empuñadura
  ], false)!;

  // --- Escudo redondo con umbo (disco de cara al frente, en el brazo izq) ---
  const disc = new THREE.CylinderGeometry(0.6, 0.6, 0.16, 16).rotateX(Math.PI / 2).translate(-1.08, 2.5, 0.55);
  const boss = new THREE.CylinderGeometry(0.16, 0.16, 0.26, 8).rotateX(Math.PI / 2).translate(-1.08, 2.5, 0.68);
  const shield = mergeGeometries([normalizeGeometry(disc), normalizeGeometry(boss)], false)!;

  const stdBody = plasticStd(0xffffff);                 // color por instancia (túnica)
  const stdSkin = plasticStd(0xf2c141);                 // amarillo minifig
  const stdTurb = plasticStd(0xffffff);                 // color por instancia (turbante)
  const stdBeard = plasticStd(0xcfc8ba, { roughness: 0.6 });
  const stdSword = new THREE.MeshPhysicalMaterial({ color: 0xd2d7dd, roughness: 0.28, metalness: 0.7, clearcoat: 0.3 });
  const stdShield = plasticStd(0x8a5a2c);

  const meshes = {
    body: new THREE.InstancedMesh(body, stdBody, count),
    skin: new THREE.InstancedMesh(skin, stdSkin, count),
    turban: new THREE.InstancedMesh(turban, stdTurb, count),
    beard: new THREE.InstancedMesh(beard, stdBeard, count),
    sword: new THREE.InstancedMesh(sword, stdSword, count),
    shield: new THREE.InstancedMesh(shield, stdShield, count)
  };
  meshes.body.castShadow = true; meshes.skin.castShadow = true; meshes.turban.castShadow = true;

  // Formación DENTRO del recinto, flanqueando el pasillo central y de cara
  // a la muralla. Denso, para que se sienta lleno y no un descampado.
  const dummy = new THREE.Object3D();
  const rows = IS_MOBILE ? 9 : 13;
  const cols = Math.ceil(count / rows);
  const spread = (COURT.half - 5) * 2;   // ancho ocupado
  const laneHalf = 15;                    // pasillo libre (columnas dentro, ejército fuera)
  const zA = 14, zB = COURT.back - 10;
  let i = 0;
  for (let r = 0; r < rows && i < count; r++) {
    for (let c = 0; c < cols && i < count; c++) {
      let x = (c / (cols - 1) - 0.5) * spread + (Math.random() - 0.5) * 2.4;
      if (Math.abs(x) < laneHalf) x += (x < 0 ? -1 : 1) * laneHalf;
      const z = zA + (r / (rows - 1)) * (zB - zA) + (Math.random() - 0.5) * 2.4;
      dummy.position.set(x, 0, z);
      dummy.rotation.set(0, Math.PI + (Math.random() - 0.5) * 0.4, 0);
      const s = 0.92 + Math.random() * 0.16;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      for (const m of Object.values(meshes)) m.setMatrixAt(i, dummy.matrix);
      meshes.body.setColorAt(i, new THREE.Color(ROBES[(Math.random() * ROBES.length) | 0]));
      meshes.turban.setColorAt(i, new THREE.Color(TURBANS[(Math.random() * TURBANS.length) | 0]));
      i++;
    }
  }
  for (const m of Object.values(meshes)) { m.instanceMatrix.needsUpdate = true; group.add(m); }
  return group;
}
