import * as THREE from 'three';
import { PlasticMaterialFactory } from '../materials/PlasticMaterialFactory';

/**
 * Shofar — el cuerno de carnero que derriba Jericó. Prop 3D con estética de
 * pieza de plástico/hueso: un cuerno curvo que se estrecha en la boquilla y se
 * abre en la campana. Autónomo; se puede colocar en el mundo o "en la mano".
 *
 *   const sh = buildShofar(plastic);      // grupo listo
 *   scene.add(sh);                        // o adjúntalo a la mano de una minifig
 *
 * Devuelve un THREE.Group (como el resto de props del mundo).
 */

const HORN = 0xd8c39a;      // hueso/cuerno cálido
const HORN_DK = 0xa8875a;   // vetas / boquilla

/** Radio del cuerno a lo largo del recorrido u∈[0,1]: fino → grueso → campana. */
function radiusAt(u: number): number {
  const base = 0.05 + u * 0.16;                 // se ensancha suave
  const bell = Math.pow(Math.max(0, u - 0.8) / 0.2, 2) * 0.24; // campana al final
  return base + bell;
}

export function buildShofar(plastic: PlasticMaterialFactory, opts: { scale?: number } = {}): THREE.Group {
  const g = new THREE.Group();

  // Espina del cuerno: curva en gancho (como un cuerno de carnero desenroscado).
  const spine = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.9, 0.05, 0),
    new THREE.Vector3(1.7, 0.28, 0.05),
    new THREE.Vector3(2.3, 0.75, 0.1),
    new THREE.Vector3(2.5, 1.35, 0.05),
    new THREE.Vector3(2.35, 1.85, 0)
  ]);

  const tubular = 80, radial = 18;
  const geo = new THREE.TubeGeometry(spine, tubular, 1, radial, false); // radio 1 → lo escalamos
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const c = new THREE.Vector3(), tmp = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    const ring = Math.floor(i / (radial + 1));
    const u = ring / tubular;
    spine.getPointAt(u, c);                     // centro del anillo
    tmp.fromBufferAttribute(pos, i).sub(c);     // dirección hacia fuera (long ~1)
    tmp.setLength(radiusAt(u));
    pos.setXYZ(i, c.x + tmp.x, c.y + tmp.y, c.z + tmp.z);
  }
  geo.computeVertexNormals();

  const horn = new THREE.Mesh(geo, plastic.get(HORN));
  horn.castShadow = true; horn.receiveShadow = true;
  g.add(horn);

  // Boquilla oscura en el extremo fino
  const mouth = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.16, 14), plastic.get(HORN_DK));
  mouth.position.set(-0.02, 0, 0);
  mouth.rotation.z = Math.PI / 2;
  mouth.castShadow = true;
  g.add(mouth);

  // Un par de vetas (anillos) para dar carácter de cuerno
  for (const u of [0.28, 0.5]) {
    spine.getPointAt(u, c);
    const band = new THREE.Mesh(new THREE.TorusGeometry(radiusAt(u) * 1.02, 0.02, 6, 18), plastic.get(HORN_DK));
    band.position.copy(c);
    const tan = spine.getTangentAt(u);
    band.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tan);
    g.add(band);
  }

  const s = opts.scale ?? 1;
  if (s !== 1) g.scale.setScalar(s);
  return g;
}
