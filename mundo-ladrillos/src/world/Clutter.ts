import * as THREE from 'three';
import { PlasticMaterialFactory } from '../materials/PlasticMaterialFactory';

/**
 * Clutter — attrezzo suelto para NO dejar rincones pelados (Regla Nº1). Piezas
 * que cualquier hilo puede soltar en un hueco: pila de cajas, montón de sacos,
 * cúmulo de vasijas y una palmera. Copia/emula la estética de ladrillo del
 * resto (Market, StreetProps). Cada builder devuelve un THREE.Group.
 *
 *   scene.add(buildCrateStack(plastic, { x: 4, z: -2 }));
 *   scene.add(buildSackPile(plastic, { x: -3, z: 1 }));
 *   scene.add(buildPotCluster(plastic, { x: 2, z: 3 }));
 *   const palm = buildPalm(plastic, { x: -6, z: -4, height: 5 });
 *   scene.add(buildFirePit(plastic, { x: 0, z: 0 }));  // fogata con luz cálida
 */

type Pos = { x?: number; z?: number; yaw?: number };

function place(g: THREE.Group, o: Pos): THREE.Group {
  g.position.set(o.x ?? 0, 0, o.z ?? 0);
  if (o.yaw) g.rotation.y = o.yaw;
  return g;
}

/** Pila de cajas de madera con listones (mercado / almacén). */
export function buildCrateStack(plastic: PlasticMaterialFactory, o: Pos & { n?: number } = {}): THREE.Group {
  const g = new THREE.Group();
  const wood = plastic.get(0x8a5a2c);
  const woodDk = plastic.get(0x6e4522);
  const crate = (s: number, x: number, y: number, z: number, yaw = 0): void => {
    const c = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), wood);
    body.castShadow = true; body.receiveShadow = true; c.add(body);
    // listones (marco) en las aristas verticales
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const edge = new THREE.Mesh(new THREE.BoxGeometry(0.06, s + 0.02, 0.06), woodDk);
      edge.position.set(sx * s / 2, 0, sz * s / 2); c.add(edge);
    }
    const band = new THREE.Mesh(new THREE.BoxGeometry(s + 0.02, 0.07, s + 0.02), woodDk);
    c.add(band);
    c.position.set(x, y, z); c.rotation.y = yaw; g.add(c);
  };
  const n = o.n ?? 3;
  crate(0.9, 0, 0.45, 0, 0.1);
  if (n >= 2) crate(0.7, 0.55, 0.35, 0.5, -0.2);
  if (n >= 3) crate(0.8, -0.1, 1.28, 0.06, 0.35); // encima
  return place(g, o);
}

/** Montón de sacos de grano (formas redondeadas atadas arriba). */
export function buildSackPile(plastic: PlasticMaterialFactory, o: Pos = {}): THREE.Group {
  const g = new THREE.Group();
  const jute = [0xc7ad7a, 0xb89a63, 0xd8c193];
  const sack = (x: number, y: number, z: number, s: number, c: number): void => {
    const body = new THREE.Mesh(new THREE.SphereGeometry(s, 12, 10), plastic.get(c));
    body.scale.set(1, 1.25, 1); body.position.set(x, y, z);
    body.castShadow = true; body.receiveShadow = true; g.add(body);
    const knot = new THREE.Mesh(new THREE.ConeGeometry(s * 0.4, s * 0.5, 8), plastic.get(c));
    knot.position.set(x, y + s * 1.1, z); g.add(knot);
  };
  sack(0, 0.42, 0, 0.42, jute[0]);
  sack(0.6, 0.38, 0.25, 0.38, jute[1]);
  sack(0.28, 1.0, 0.1, 0.34, jute[2]);
  return place(g, o);
}

/** Cúmulo de vasijas/ánforas de barro suelto (esquina de mercado o patio). */
export function buildPotCluster(plastic: PlasticMaterialFactory, o: Pos = {}): THREE.Group {
  const g = new THREE.Group();
  const clays = [0xb07a45, 0x9c6b3f, 0xc08a52, 0x8a5a34];
  const pot = (x: number, z: number, s: number, c: number): void => {
    const body = new THREE.Mesh(new THREE.SphereGeometry(s, 14, 12), plastic.get(c));
    body.scale.set(1, 1.2, 1); body.position.set(x, s * 1.15, z);
    body.castShadow = true; body.receiveShadow = true; g.add(body);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.35, s * 0.5, s * 0.6, 12), plastic.get(c));
    neck.position.set(x, s * 2.0, z); g.add(neck);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(s * 0.4, s * 0.08, 6, 14), plastic.get(0x6e4522));
    rim.rotation.x = Math.PI / 2; rim.position.set(x, s * 2.25, z); g.add(rim);
  };
  pot(0, 0, 0.32, clays[0]);
  pot(0.5, 0.2, 0.26, clays[1]);
  pot(0.2, 0.5, 0.22, clays[2]);
  // cesta de mimbre baja al lado
  const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.24, 0.34, 14), plastic.get(0xcaa15e));
  basket.position.set(-0.45, 0.17, 0.15); basket.castShadow = true; g.add(basket);
  return place(g, o);
}

/** Palmera datilera (tronco anillado + palmas caídas + dátiles). */
export function buildPalm(plastic: PlasticMaterialFactory, o: Pos & { height?: number } = {}): THREE.Group {
  const g = new THREE.Group();
  const bark = plastic.get(0x7a5a34);
  const barkDk = plastic.get(0x5f4525);
  const leaf = plastic.get(0x5f8a3a);
  const H = o.height ?? 5;
  // tronco: segmentos apilados con leve curva
  const seg = 7, segH = H / seg;
  for (let i = 0; i < seg; i++) {
    const r = 0.22 - i * 0.012;
    const s = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.02, segH, 10), i % 2 ? bark : barkDk);
    s.position.set(Math.sin(i * 0.5) * 0.12, segH * (i + 0.5), Math.cos(i * 0.5) * 0.05);
    s.castShadow = true; g.add(s);
  }
  const topX = Math.sin((seg - 1) * 0.5) * 0.12, topZ = Math.cos((seg - 1) * 0.5) * 0.05;
  // corona de palmas (planos alargados que caen)
  const crown = new THREE.Group();
  crown.position.set(topX, H, topZ);
  const nLeaves = 9;
  for (let i = 0; i < nLeaves; i++) {
    const frond = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.07, 0.42), leaf);
    frond.geometry.translate(0.95, 0, 0); // pivota desde la base de la palma
    frond.rotation.y = (i / nLeaves) * Math.PI * 2;
    frond.rotation.z = -0.5 - (i % 3) * 0.12; // caídas
    frond.castShadow = true;
    crown.add(frond);
  }
  // dátiles
  for (let i = 0; i < 3; i++) {
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), plastic.get(0xa5642a));
    d.position.set(Math.cos(i * 2) * 0.2, -0.1, Math.sin(i * 2) * 0.2); crown.add(d);
  }
  g.add(crown);
  return place(g, o);
}

/**
 * Fogata: cerco de piedras + leños cruzados + llama emisiva + luz cálida. Para
 * campamentos y calles de noche (Regla Nº1: rincones con vida y calor). Estática.
 */
export function buildFirePit(plastic: PlasticMaterialFactory, o: Pos = {}): THREE.Group {
  const g = new THREE.Group();
  const stone = plastic.get(0x8a8477);
  const wood = plastic.get(0x5f4527);
  // cerco de piedras
  const N = 9;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18 + (i % 3) * 0.03), stone);
    s.position.set(Math.cos(a) * 0.62, 0.12, Math.sin(a) * 0.62);
    s.rotation.set(i, i * 2, i); s.castShadow = true; s.receiveShadow = true; g.add(s);
  }
  // leños cruzados
  for (const r of [0, 1, 2]) {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 1.0, 8), wood);
    log.rotation.z = Math.PI / 2; log.rotation.y = r * 1.05; log.position.y = 0.14 + r * 0.02;
    log.castShadow = true; g.add(log);
  }
  // llamas emisivas (conos que brillan con el bloom, sin toneMapping)
  const flameMat = (c: number): THREE.MeshBasicMaterial =>
    new THREE.MeshBasicMaterial({ color: c, toneMapped: false, transparent: true, opacity: 0.92 });
  const f1 = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.7, 10), flameMat(0xff8a2a)); f1.position.y = 0.5; g.add(f1);
  const f2 = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.5, 10), flameMat(0xffd24a)); f2.position.y = 0.62; g.add(f2);
  // luz cálida
  const light = new THREE.PointLight(0xffa845, 3.2, 7, 2);
  light.position.set(0, 0.7, 0); g.add(light);
  return place(g, o);
}
