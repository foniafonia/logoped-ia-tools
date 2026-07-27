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

/**
 * Tienda de campaña del desierto (carpa a dos aguas, frente abierto). Con
 * `rack:true` monta dentro un perchero con trajes de sigilo colgados — pieza
 * pedida para reclutar espías / vestuario (E10, E12). Suéltala en campamentos
 * e interiores de tienda (Regla Nº1).
 *
 *   scene.add(buildTent(plastic, { x: 3, z: -2, rack: true }));
 */
export function buildTent(
  plastic: PlasticMaterialFactory,
  o: Pos & { rack?: boolean; color?: number; scale?: number } = {}
): THREE.Group {
  const g = new THREE.Group();
  const s = o.scale ?? 1;
  const cloth = plastic.get(o.color ?? 0xbfa06a);   // lona arena
  const clothDk = plastic.get(0x8f7440);            // pliegues/sombra
  const pole = plastic.get(0x6e4a28);               // postes de madera
  const W = 3.2 * s, L = 3.6 * s, H = 2.3 * s;      // ancho, fondo, alto de cumbrera

  // postes de cumbrera (frente y fondo)
  for (const pz of [-L / 2, L / 2]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06 * s, 0.07 * s, H, 8), pole);
    p.position.set(0, H / 2, pz); p.castShadow = true; g.add(p);
  }
  // dos faldones de lona (paneles inclinados a dos aguas, se juntan en cumbrera)
  const theta = Math.atan2(H, W / 2);                 // ángulo del faldón bajo la horizontal
  const slant = Math.hypot(W / 2, H) + 0.04 * s;      // longitud del faldón (ridge→suelo)
  for (const side of [-1, 1]) {
    // caja: X=longitud del faldón, Y=grosor, Z=fondo de la tienda
    const panel = new THREE.Mesh(new THREE.BoxGeometry(slant, 0.05 * s, L), cloth);
    panel.position.set(side * W / 4, H / 2, 0);
    panel.rotation.z = -side * theta;                 // inclina la punta exterior hacia el suelo
    panel.castShadow = true; panel.receiveShadow = true; g.add(panel);
    // ribete inferior (pliegue oscuro) en el borde que toca el suelo
    const hem = new THREE.Mesh(new THREE.BoxGeometry(0.14 * s, 0.1 * s, L), clothDk);
    hem.position.set(side * (W / 2 - 0.05 * s), 0.06 * s, 0); g.add(hem);
  }
  // gablete trasero cerrado (triángulo), frente abierto
  const gable = new THREE.Shape();
  gable.moveTo(-W / 2, 0); gable.lineTo(W / 2, 0); gable.lineTo(0, H); gable.lineTo(-W / 2, 0);
  const gableMesh = new THREE.Mesh(new THREE.ShapeGeometry(gable), clothDk);
  gableMesh.position.set(0, 0, -L / 2); gableMesh.receiveShadow = true; g.add(gableMesh);
  // solapas de entrada (dos cortinas recogidas a los lados del frente)
  for (const side of [-1, 1]) {
    const flap = new THREE.Mesh(new THREE.BoxGeometry(0.5 * s, H * 0.9, 0.05 * s), clothDk);
    flap.position.set(side * (W / 2 - 0.35 * s), H * 0.45, L / 2 - 0.02 * s);
    flap.rotation.z = side * 0.12; g.add(flap);
  }

  // perchero de trajes de sigilo (opcional)
  if (o.rack) {
    const rack = new THREE.Group();
    const bar = plastic.get(0x4a3420);
    const rw = W * 0.62, rh = H * 0.62;
    for (const px of [-rw / 2, rw / 2]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04 * s, 0.04 * s, rh, 6), bar);
      post.position.set(px, rh / 2, 0); rack.add(post);
    }
    const cross = new THREE.Mesh(new THREE.CylinderGeometry(0.035 * s, 0.035 * s, rw, 6), bar);
    cross.rotation.z = Math.PI / 2; cross.position.set(0, rh, 0); rack.add(cross);
    // trajes de sigilo colgados (paños oscuros + hombreras)
    const garb = [0x1b2631, 0x212f3c, 0x17202a];
    const nG = 3;
    for (let i = 0; i < nG; i++) {
      const gx = -rw / 2 + (i + 0.5) * (rw / nG);
      const robe = new THREE.Mesh(new THREE.BoxGeometry(0.42 * s, 0.95 * s, 0.14 * s), plastic.get(garb[i % garb.length]));
      robe.position.set(gx, rh - 0.52 * s, 0); robe.castShadow = true; rack.add(robe);
      const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(0.055 * s, 0.055 * s, 0.44 * s, 6), plastic.get(garb[i % garb.length]));
      shoulder.rotation.z = Math.PI / 2; shoulder.position.set(gx, rh - 0.06 * s, 0); rack.add(shoulder);
    }
    rack.position.set(0, 0, -L * 0.18);
    g.add(rack);
  }
  return place(g, o);
}

/**
 * Pozo de aldea (brocal de piedra + poste, travesaño y cubo colgando). Centro
 * natural de una plaza/mercado y fuente de las aguadoras (Regla Nº1). Suéltalo
 * en cruces y patios. `buildWell(plastic, { x, z })`.
 */
export function buildWell(plastic: PlasticMaterialFactory, o: Pos & { scale?: number } = {}): THREE.Group {
  const g = new THREE.Group();
  const s = o.scale ?? 1;
  const stone = plastic.get(0x9a8f7d);
  const stoneDk = plastic.get(0x7c7263);
  const wood = plastic.get(0x6e4a28);
  const water = plastic.get(0x2f6f8f);
  // brocal (anillo de piedra) = toro bajo + bloques
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.72 * s, 0.8 * s, 0.62 * s, 16), stone);
  rim.position.y = 0.31 * s; rim.castShadow = true; rim.receiveShadow = true; g.add(rim);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(0.72 * s, 0.09 * s, 8, 18), stoneDk);
  lip.rotation.x = Math.PI / 2; lip.position.y = 0.62 * s; g.add(lip);
  // piedras del borde (irregular, para que no sea un cilindro liso)
  const N = 8;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const b = new THREE.Mesh(new THREE.DodecahedronGeometry(0.14 * s + (i % 3) * 0.02 * s), i % 2 ? stone : stoneDk);
    b.position.set(Math.cos(a) * 0.74 * s, 0.6 * s, Math.sin(a) * 0.74 * s);
    b.rotation.set(i, i * 2, i); g.add(b);
  }
  // agua al fondo
  const w = new THREE.Mesh(new THREE.CircleGeometry(0.62 * s, 16), water);
  w.rotation.x = -Math.PI / 2; w.position.y = 0.2 * s; g.add(w);
  // dos postes + travesaño + tejadillo
  for (const sx of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06 * s, 0.07 * s, 1.5 * s, 8), wood);
    post.position.set(sx * 0.7 * s, 0.75 * s, 0); post.castShadow = true; g.add(post);
  }
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.05 * s, 0.05 * s, 1.6 * s, 8), wood);
  beam.rotation.z = Math.PI / 2; beam.position.y = 1.5 * s; g.add(beam);
  // tejadillo a dos aguas
  for (const side of [-1, 1]) {
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.1 * s, 0.05 * s, 0.9 * s), stoneDk);
    roof.position.set(side * 0.28 * s, 1.68 * s, 0);
    roof.rotation.z = -side * 0.5; roof.castShadow = true; g.add(roof);
  }
  // cuerda + cubo colgando
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.015 * s, 0.015 * s, 0.85 * s, 6), plastic.get(0x8d7a4f));
  rope.position.set(0.15 * s, 1.05 * s, 0); g.add(rope);
  const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.13 * s, 0.1 * s, 0.22 * s, 10), wood);
  bucket.position.set(0.15 * s, 0.68 * s, 0); bucket.castShadow = true; g.add(bucket);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.12 * s, 0.012 * s, 6, 12, Math.PI), plastic.get(0x4a3420));
  handle.position.set(0.15 * s, 0.79 * s, 0); g.add(handle);
  return place(g, o);
}

/**
 * Montón de ESCOMBROS de la muralla caída: ladrillos de juguete desperdigados y
 * apilados + polvo, para el "después" del clímax (Regla de oro: quedan ladrillos,
 * no ruinas violentas). Estático y determinista. Combínalo con BrickBurst para el
 * momento de la caída y deja esto como estado final. `buildRubblePile(plastic, {x,z})`.
 */
export function buildRubblePile(
  plastic: PlasticMaterialFactory,
  o: Pos & { n?: number; scale?: number; colors?: number[] } = {}
): THREE.Group {
  const g = new THREE.Group();
  const s = o.scale ?? 1;
  const cols = o.colors ?? [0xcaa15e, 0xb07a45, 0xd8c193, 0x9c6b3f, 0xc7ad7a];
  const n = o.n ?? 16;
  const bw = 0.34 * s, bh = 0.2 * s, bd = 0.32 * s;
  for (let i = 0; i < n; i++) {
    const c = cols[i % cols.length];
    const brick = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(bw * (0.85 + (i % 3) * 0.15), bh, bd), plastic.get(c));
    body.castShadow = true; body.receiveShadow = true; brick.add(body);
    for (const sx of [-1, 1]) {
      const stud = new THREE.Mesh(new THREE.CylinderGeometry(0.05 * s, 0.05 * s, 0.05 * s, 6), plastic.get(c));
      stud.position.set(sx * bw * 0.26, bh * 0.55, 0); brick.add(stud);
    }
    // amontonamiento determinista: espiral achatada que sube hacia el centro
    const a = i * 2.4;
    const rr = (0.9 - (i / n) * 0.6) * s * (0.6 + (i % 3) * 0.2);
    const y = (i / n) * 0.5 * s;
    brick.position.set(Math.cos(a) * rr, y + bh * 0.5, Math.sin(a) * rr * 0.8);
    brick.rotation.set((i % 4) * 0.4, a, ((i % 5) - 2) * 0.25);
    g.add(brick);
  }
  // base de polvo/cascotes finos (disco bajo irregular)
  const dust = new THREE.Mesh(new THREE.CylinderGeometry(1.15 * s, 1.35 * s, 0.06 * s, 12), plastic.get(0xbfa06a));
  dust.position.y = 0.03 * s; dust.receiveShadow = true; g.add(dust);
  return place(g, o);
}
