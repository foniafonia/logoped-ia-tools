import * as THREE from 'three';
import { PlasticMaterialFactory } from '../materials/PlasticMaterialFactory';

/**
 * Attrezzo de calle para dar vida (mundo lleno): guirnaldas de farolillos,
 * ropa tendida entre casas y un pozo central. Autónomo (solo THREE + plastic).
 * Cada builder devuelve un THREE.Group listo para colocar.
 */

const CLOTH = [0xb5654a, 0x7d8b4f, 0x5b7b8a, 0xd9c27e, 0x8a4b3a, 0xe5e7e9];

/** Cuerda que cuelga (catenaria) entre A y B, a la altura dada. */
function cordBetween(plastic: PlasticMaterialFactory, ax: number, ay: number, az: number,
  bx: number, by: number, bz: number, sag: number, color = 0x2a2018): THREE.Mesh {
  const seg = 14;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= seg; i++) {
    const u = i / seg;
    const x = ax + (bx - ax) * u, z = az + (bz - az) * u;
    const y = ay + (by - ay) * u - Math.sin(u * Math.PI) * sag; // pandeo
    pts.push(new THREE.Vector3(x, y, z));
  }
  const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg, 0.03, 5, false);
  const m = new THREE.Mesh(geo, plastic.get(color));
  m.castShadow = false;
  return m;
}

/** Posición sobre la catenaria en el parámetro u (0..1). */
function sagPoint(ax: number, ay: number, az: number, bx: number, by: number, bz: number, u: number, sag: number): THREE.Vector3 {
  const x = ax + (bx - ax) * u, z = az + (bz - az) * u;
  const y = ay + (by - ay) * u - Math.sin(u * Math.PI) * sag;
  return new THREE.Vector3(x, y, z);
}

/**
 * Guirnalda de farolillos entre A y B. Farolillos emisivos (baratos) + unas
 * pocas luces cálidas reales (limitadas por `lights`, 0 en móvil si quieres).
 */
export function buildLanternString(
  plastic: PlasticMaterialFactory,
  o: { ax: number; az: number; bx: number; bz: number; height?: number; count?: number; sag?: number; lights?: number }
): THREE.Group {
  const g = new THREE.Group();
  const ay = o.height ?? 6, by = o.height ?? 6, sag = o.sag ?? 1.2;
  const count = o.count ?? 6;
  g.add(cordBetween(plastic, o.ax, ay, o.az, o.bx, by, o.bz, sag));
  const glow = [0xffb347, 0xff8a3a, 0xffd27a];
  const lightsWanted = o.lights ?? 2;
  const lightEvery = Math.max(1, Math.floor(count / lightsWanted));
  for (let i = 0; i < count; i++) {
    const u = (i + 0.5) / count;
    const p = sagPoint(o.ax, ay, o.az, o.bx, by, o.bz, u, sag);
    const col = glow[i % glow.length];
    // farolillo: cuerpecito emisivo + capuchón
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), new THREE.MeshBasicMaterial({ color: col }));
    body.position.set(p.x, p.y - 0.28, p.z);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.18, 8), plastic.get(0x3a2a18));
    cap.position.set(p.x, p.y - 0.08, p.z);
    g.add(body, cap);
    if (i % lightEvery === 0) {
      const light = new THREE.PointLight(col, 5, 14, 2);
      light.position.set(p.x, p.y - 0.3, p.z);
      g.add(light);
    }
  }
  return g;
}

/** Ropa tendida: cuerda entre A y B con telas colgando. */
export function buildLaundryLine(
  plastic: PlasticMaterialFactory,
  o: { ax: number; az: number; bx: number; bz: number; height?: number; count?: number; seed?: number }
): THREE.Group {
  const g = new THREE.Group();
  const ay = o.height ?? 5.2, by = o.height ?? 5.2, sag = 0.7;
  const count = o.count ?? 5;
  const seed = o.seed ?? 0;
  g.add(cordBetween(plastic, o.ax, ay, o.az, o.bx, by, o.bz, sag, 0x6b5a3a));
  for (let i = 0; i < count; i++) {
    const u = (i + 0.6) / (count + 0.2);
    const p = sagPoint(o.ax, ay, o.az, o.bx, by, o.bz, u, sag);
    const col = CLOTH[(seed + i) % CLOTH.length];
    const h = 0.9 + ((seed + i) % 3) * 0.35;
    const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.7, h, 0.06), plastic.get(col));
    cloth.position.set(p.x, p.y - h / 2 - 0.05, p.z);
    cloth.rotation.z = (((seed + i) % 2) ? 1 : -1) * 0.04;
    cloth.castShadow = true;
    g.add(cloth);
  }
  return g;
}

/** Pozo de ladrillo con tejadillo y cubo: punto de reunión de la plaza. */
export function buildWell(plastic: PlasticMaterialFactory, o: { x: number; z: number }): THREE.Group {
  const g = new THREE.Group();
  const stone = 0x9a8f7a, stoneDark = 0x7c7460, wood = 0x6e4a2c;
  // Brocal (anillo de piedra)
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.2, 1.1, 20), plastic.get(stone));
  ring.position.y = 0.55; ring.castShadow = true; ring.receiveShadow = true;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.12, 0.12, 8, 22), plastic.get(stoneDark));
  rim.rotation.x = Math.PI / 2; rim.position.y = 1.1;
  const water = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.1, 18),
    new THREE.MeshStandardMaterial({ color: 0x2b4a5a, roughness: 0.3, metalness: 0.2 }));
  water.position.y = 0.75;
  g.add(ring, rim, water);
  // Dos postes + viga + tejadillo a dos aguas
  for (const sx of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 3, 8), plastic.get(wood));
    post.position.set(sx * 1.0, 1.5, 0); post.castShadow = true; g.add(post);
  }
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4, 8), plastic.get(0x4a3320));
  beam.rotation.z = Math.PI / 2; beam.position.y = 3; g.add(beam);
  for (const sx of [-1, 1]) {
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.12, 1.8), plastic.get(0x8a5a2c));
    roof.position.set(sx * 0.55, 3.25, 0); roof.rotation.z = sx * 0.5; roof.castShadow = true; g.add(roof);
  }
  // Cubo colgando de una cuerda
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 6), plastic.get(0x2a2018));
  rope.position.set(0, 2.3, 0); g.add(rope);
  const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.36, 12), plastic.get(0x5a3f22));
  bucket.position.set(0, 1.6, 0); bucket.castShadow = true; g.add(bucket);

  g.position.set(o.x, 0, o.z);
  return g;
}
