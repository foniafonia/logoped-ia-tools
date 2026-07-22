import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { PlasticMaterialFactory } from '../../../materials/PlasticMaterialFactory';
import { BrickPalette } from '../../../materials/BrickPalette';
import { BRICK_HEIGHT } from '../../../bricks/BrickDimensions';

/**
 * Piezas de atrezo de LADRILLO reutilizables por las escenas del tramo 5–10.
 * Todo se construye con el mismo lenguaje que la muralla (cajas redondeadas
 * con acabado de plástico), para que el mundo sea coherente. Geometría 100%
 * propia, sin marcas.
 */

/** Caja de ladrillo biselada básica (con sombras). */
export function brickBox(
  plastic: PlasticMaterialFactory,
  w: number, h: number, d: number, color: number,
  x = 0, y = 0, z = 0
): THREE.Mesh {
  const g = new RoundedBoxGeometry(w, h, d, 2, 0.05);
  const m = new THREE.Mesh(g, plastic.get(color));
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** Placa base con tetones (retícula de tacos) para acotar visualmente el suelo. */
export function studdedPlate(
  plastic: PlasticMaterialFactory,
  wStuds: number, dStuds: number, color: number,
  studs = true
): THREE.Group {
  const g = new THREE.Group();
  const base = brickBox(plastic, wStuds, 0.4, dStuds, color, 0, 0.2, 0);
  g.add(base);
  if (studs) {
    const studGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.22, 12);
    const mat = plastic.get(color);
    const n = Math.floor(wStuds) * Math.floor(dStuds);
    const inst = new THREE.InstancedMesh(studGeo, mat, n);
    const mtx = new THREE.Matrix4();
    let i = 0;
    for (let sx = 0; sx < Math.floor(wStuds); sx++) {
      for (let sz = 0; sz < Math.floor(dStuds); sz++) {
        mtx.setPosition(-wStuds / 2 + sx + 0.5, 0.5, -dStuds / 2 + sz + 0.5);
        inst.setMatrixAt(i++, mtx);
      }
    }
    inst.castShadow = false;
    inst.receiveShadow = true;
    g.add(inst);
  }
  return g;
}

/**
 * RÍO de ladrillo animado: bandas de placas azules translúcidas que se
 * desplazan ligeramente (corriente). Ocupa un rectángulo centrado en `z`.
 * Devuelve el grupo + un `update` para la animación.
 */
export function buildRiver(
  plastic: PlasticMaterialFactory,
  width: number, depth: number, cx = 0, cz = 0
): { group: THREE.Group; update: (t: number) => void } {
  const group = new THREE.Group();
  const rows: THREE.Mesh[] = [];
  const tones = [0x2a6fb0, 0x3b82c4, 0x1f5f9e, 0x4a93d1];
  const band = 2;
  for (let z = -depth / 2; z < depth / 2; z += band) {
    const tone = tones[Math.floor((z + depth) / band) % tones.length];
    const mat = new THREE.MeshPhysicalMaterial({
      color: tone, roughness: 0.15, clearcoat: 0.7, clearcoatRoughness: 0.1,
      transmission: 0.15, transparent: true, opacity: 0.94, metalness: 0
    });
    const m = new THREE.Mesh(new RoundedBoxGeometry(width, 0.35, band * 0.92, 2, 0.06), mat);
    m.position.set(cx, 0.05, cz + z + band / 2);
    m.receiveShadow = true;
    group.add(m);
    rows.push(m);
  }
  // reflejos de luna/tetones sobre el agua (pequeñas placas claras)
  const glints = new THREE.Group();
  for (let i = 0; i < 40; i++) {
    const gx = cx + (((i * 928371) % 1000) / 1000 - 0.5) * width;
    const gz = cz + (((i * 12345) % 1000) / 1000 - 0.5) * depth;
    const s = brickBox(plastic, 0.5, 0.12, 0.5, BrickPalette.WHITE, gx, 0.28, gz);
    (s.material as THREE.Material).transparent = true;
    (s.material as any).opacity = 0.5;
    glints.add(s);
  }
  group.add(glints);
  return {
    group,
    update: (t: number) => {
      for (let i = 0; i < rows.length; i++) {
        rows[i].position.x = cx + Math.sin(t * 0.6 + i * 0.7) * 0.35;
        rows[i].position.y = 0.05 + Math.sin(t * 1.3 + i) * 0.06;
      }
      glints.rotation.y = Math.sin(t * 0.2) * 0.02;
    }
  };
}

/**
 * CARPA / TIENDA de campaña de ladrillo (la tienda de Yehoshúa y la carpa de
 * los espías). Cuatro postes, faldón a dos aguas de placas y una entrada.
 */
export function buildTent(
  plastic: PlasticMaterialFactory,
  color: number = BrickPalette.TAN, w = 12, d = 10, open = true
): THREE.Group {
  const g = new THREE.Group();
  const h = 5;
  // postes de las esquinas
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      g.add(brickBox(plastic, 0.5, h, 0.5, BrickPalette.DARK_BROWN, sx * (w / 2 - 0.4), h / 2, sz * (d / 2 - 0.4)));
    }
  }
  // caballete central
  g.add(brickBox(plastic, 0.5, h + 2.5, 0.5, BrickPalette.DARK_BROWN, 0, (h + 2.5) / 2, 0));
  // dos aguas del techo (dos rampas de placas)
  const roofMat = plastic.get(color);
  for (const side of [-1, 1]) {
    const roof = new THREE.Mesh(new RoundedBoxGeometry(w + 1.4, 0.5, d / 2 + 1.2, 2, 0.06), roofMat);
    roof.position.set(0, h + 1.2, side * (d / 4 + 0.2));
    roof.rotation.x = side * 0.62;
    roof.castShadow = true; roof.receiveShadow = true;
    g.add(roof);
  }
  // paredes laterales y trasera (placas), dejando la delantera abierta si `open`
  const wallMat = plastic.get(BrickPalette.WARM_SAND);
  const back = new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.4, 2, 0.06), wallMat);
  back.position.set(0, h / 2, -d / 2); back.castShadow = true; g.add(back);
  for (const side of [-1, 1]) {
    const wall = new THREE.Mesh(new RoundedBoxGeometry(0.4, h, d, 2, 0.06), wallMat);
    wall.position.set(side * w / 2, h / 2, 0); wall.castShadow = true; g.add(wall);
  }
  if (!open) {
    const front = new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.4, 2, 0.06), wallMat);
    front.position.set(0, h / 2, d / 2); front.castShadow = true; g.add(front);
  } else {
    // cortinas de entrada (dos paneles a los lados de la abertura)
    for (const side of [-1, 1]) {
      const flap = brickBox(plastic, w / 2 - 2, h, 0.35, BrickPalette.DARK_RED, side * (w / 2 - (w / 4 - 1)), h / 2, d / 2);
      g.add(flap);
    }
  }
  return g;
}

/** Palmera de ladrillo (tronco apilado + fronda de placas verdes). */
export function buildPalm(plastic: PlasticMaterialFactory, x = 0, z = 0, h = 9): THREE.Group {
  const g = new THREE.Group();
  for (let i = 0; i < h; i++) {
    const seg = brickBox(plastic, 1, BRICK_HEIGHT, 1, i % 2 ? BrickPalette.BROWN : BrickPalette.DARK_BROWN, 0, 0.6 + i * BRICK_HEIGHT, 0);
    seg.position.x += Math.sin(i * 0.5) * 0.25; // curva suave del tronco
    g.add(seg);
  }
  const top = 0.6 + h * BRICK_HEIGHT;
  for (let a = 0; a < 7; a++) {
    const ang = (a / 7) * Math.PI * 2;
    const frond = brickBox(plastic, 4.5, 0.4, 1.3, a % 2 ? BrickPalette.GREEN : BrickPalette.DARK_GREEN, 0, top, 0);
    frond.position.set(Math.cos(ang) * 2.2, top - 0.3, Math.sin(ang) * 2.2);
    frond.rotation.y = ang;
    frond.rotation.z = -0.35;
    g.add(frond);
  }
  g.add(brickBox(plastic, 1.4, 1, 1.4, BrickPalette.DARK_GREEN, 0, top, 0)); // corona
  g.position.set(x, 0, z);
  return g;
}

/**
 * ANTORCHA de ladrillo con luz puntual cálida y llama parpadeante. Devuelve el
 * grupo + un `update` para el titileo. Clave en las escenas nocturnas.
 */
export function buildTorch(
  plastic: PlasticMaterialFactory, x = 0, z = 0, poleH = 5
): { group: THREE.Group; update: (t: number) => void; light: THREE.PointLight } {
  const g = new THREE.Group();
  for (let i = 0; i < poleH; i++) {
    g.add(brickBox(plastic, 0.5, BRICK_HEIGHT, 0.5, i % 2 ? BrickPalette.DARK_BROWN : BrickPalette.BROWN, 0, 0.6 + i * BRICK_HEIGHT, 0));
  }
  const topY = 0.6 + poleH * BRICK_HEIGHT;
  const bowl = brickBox(plastic, 1.1, 0.5, 1.1, BrickPalette.DARK_GRAY, 0, topY, 0);
  g.add(bowl);
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xffb347 });
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.3, 8), flameMat);
  flame.position.set(0, topY + 0.9, 0);
  g.add(flame);
  const light = new THREE.PointLight(0xffb066, 3.4, 34, 1.5);
  light.position.set(0, topY + 1.2, 0);
  g.add(light);
  g.position.set(x, 0, z);
  return {
    group: g,
    light,
    update: (t: number) => {
      const f = 0.85 + Math.sin(t * 11 + x) * 0.1 + Math.sin(t * 23 + z) * 0.05;
      light.intensity = 3.4 * f;
      flame.scale.set(0.9 + f * 0.2, f, 0.9 + f * 0.2);
    }
  };
}

/**
 * PUERTA de ciudad de ladrillo: dos jambas macizas, dintel y dos hojas de
 * madera que pueden abrirse. Devuelve el grupo + un método `setOpen(0..1)`.
 */
export function buildCityGate(
  plastic: PlasticMaterialFactory, widthStuds = 10, height = 10
): { group: THREE.Group; setOpen: (k: number) => void } {
  const g = new THREE.Group();
  const jambW = 3;
  const gap = widthStuds; // hueco entre jambas
  // jambas
  for (const side of [-1, 1]) {
    const jamb = new THREE.Group();
    for (let c = 0; c < height; c++) {
      const y = 0.6 + c * BRICK_HEIGHT;
      jamb.add(brickBox(plastic, jambW, BRICK_HEIGHT, 3, c % 2 ? BrickPalette.SAND : BrickPalette.DARK_SAND, 0, y, 0));
    }
    jamb.position.x = side * (gap / 2 + jambW / 2);
    g.add(jamb);
  }
  // dintel
  const lintelY = 0.6 + height * BRICK_HEIGHT;
  g.add(brickBox(plastic, gap + jambW * 2 + 1, BRICK_HEIGHT * 1.4, 3.4, BrickPalette.DARK_SAND, 0, lintelY, 0));
  // almenas sobre el dintel
  for (let x = -gap / 2 - jambW / 2; x <= gap / 2 + jambW / 2; x += 2) {
    g.add(brickBox(plastic, 1.3, BRICK_HEIGHT, 1.3, BrickPalette.WARM_SAND, x, lintelY + 1.3, 0));
  }
  // dos hojas de madera, cada una articulada sobre su borde exterior (bisagra).
  // El pivote de la hoja se coloca en la jamba; el panel cuelga hacia el centro.
  const doors: { leaf: THREE.Group; side: number }[] = [];
  const leafW = gap / 2 - 0.2;
  const leafH = height * BRICK_HEIGHT - 0.4;
  for (const side of [-1, 1]) {
    const leaf = new THREE.Group();
    // pivote (bisagra) junto a la jamba correspondiente
    leaf.position.set(side * (gap / 2), 0, 0);
    // panel colgando hacia el centro (x = -side*leafW/2, relativo a la bisagra)
    const panel = brickBox(plastic, leafW, leafH, 0.5, BrickPalette.DARK_BROWN, -side * (leafW / 2), leafH / 2 + 0.4, 0);
    leaf.add(panel);
    for (let i = 0; i < 3; i++) {
      leaf.add(brickBox(plastic, leafW - 0.4, 0.3, 0.62, BrickPalette.BROWN, -side * (leafW / 2), 1.5 + i * 3, 0.05));
    }
    g.add(leaf);
    doors.push({ leaf, side });
  }
  const setOpen = (k: number): void => {
    for (const { leaf, side } of doors) leaf.rotation.y = -side * k * 1.7;
  };
  setOpen(0);
  return { group: g, setOpen };
}

/** Barca de ladrillo (para la orilla del Jordán). */
export function buildBoat(plastic: PlasticMaterialFactory): THREE.Group {
  const g = new THREE.Group();
  const hull = BrickPalette.BROWN;
  // casco: filas de placas que se estrechan en las puntas
  for (let z = -4; z <= 4; z++) {
    const w = 3.2 - Math.abs(z) * 0.35;
    if (w < 0.6) continue;
    g.add(brickBox(plastic, w, 0.5, 1, hull, 0, 0.5, z));
    g.add(brickBox(plastic, 0.4, 0.9, 1, BrickPalette.DARK_BROWN, w / 2, 0.9, z));
    g.add(brickBox(plastic, 0.4, 0.9, 1, BrickPalette.DARK_BROWN, -w / 2, 0.9, z));
  }
  g.add(brickBox(plastic, 2, 0.4, 2, BrickPalette.DARK_BROWN, 0, 0.7, 0)); // banco
  return g;
}

/** Juncos/cañaveral de ladrillo (orilla del río): placas verdes verticales. */
export function buildReeds(plastic: PlasticMaterialFactory, x = 0, z = 0, n = 9): THREE.Group {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const h = 3 + ((i * 37) % 5) * 0.6;
    const rx = ((i * 928) % 100) / 100 * 3 - 1.5;
    const rz = ((i * 371) % 100) / 100 * 3 - 1.5;
    const reed = brickBox(plastic, 0.35, h, 0.35, i % 2 ? BrickPalette.GREEN : BrickPalette.DARK_GREEN, rx, h / 2, rz);
    reed.rotation.z = (rx) * 0.05;
    g.add(reed);
  }
  g.position.set(x, 0, z);
  return g;
}

/** Roca/promontorio de ladrillo (mirador de la orilla). */
export function buildRock(plastic: PlasticMaterialFactory, scale = 1): THREE.Group {
  const g = new THREE.Group();
  const tones = [BrickPalette.DARK_GRAY, BrickPalette.LIGHT_GRAY, BrickPalette.BROWN];
  const blocks = [
    [0, 0.6, 0, 5, 1.2, 4], [1.2, 1.5, -0.5, 3.5, 1.2, 3], [-1, 2.3, 0.4, 2.6, 1.2, 2.4],
    [0.5, 3.0, -0.3, 1.8, 1.0, 1.8]
  ];
  blocks.forEach((b, i) => {
    g.add(brickBox(plastic, b[3], b[4], b[5], tones[i % tones.length], b[0], b[1], b[2]));
  });
  g.scale.setScalar(scale);
  return g;
}

/**
 * Silueta LEJANA de Jericó (fondo 3D, no plano): una muralla baja de ladrillo
 * con torres y algún tejado, para verse al otro lado del río. Se coloca lejos y
 * el jugador no la pisa; da profundidad al plano como en la peli.
 */
export function buildDistantJericho(plastic: PlasticMaterialFactory, width = 90): THREE.Group {
  const g = new THREE.Group();
  const courses = 7;
  for (let c = 0; c < courses; c++) {
    const y = 0.6 + c * BRICK_HEIGHT;
    const off = c % 2 ? 1 : 0;
    for (let x = -width / 2; x < width / 2; x += 2) {
      g.add(brickBox(plastic, 2, BRICK_HEIGHT, 3, (x + off) % 4 === 0 ? BrickPalette.DARK_SAND : BrickPalette.SAND, x + off, y, 0));
    }
  }
  const topY = 0.6 + courses * BRICK_HEIGHT;
  for (let x = -width / 2; x < width / 2; x += 2) {
    g.add(brickBox(plastic, 1.3, BRICK_HEIGHT, 3, BrickPalette.WARM_SAND, x, topY, 0));
  }
  // torres repartidas
  for (let x = -width / 2 + 8; x < width / 2; x += 22) {
    const th = courses + 5;
    for (let c = 0; c < th; c++) {
      g.add(brickBox(plastic, 5, BRICK_HEIGHT, 5, c % 2 ? BrickPalette.SAND : BrickPalette.DARK_SAND, x, 0.6 + c * BRICK_HEIGHT, 0));
    }
    const ty = 0.6 + th * BRICK_HEIGHT;
    for (const mx of [-1.6, 0, 1.6]) g.add(brickBox(plastic, 1.2, BRICK_HEIGHT, 5, BrickPalette.WARM_SAND, x + mx, ty, 0));
  }
  return g;
}

/** Barril/tinaja de ladrillo (escondite urbano). */
export function buildBarrel(plastic: PlasticMaterialFactory, color: number = BrickPalette.BROWN): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 1.1, 2.6, 12),
    plastic.get(color)
  );
  body.position.y = 1.3; body.castShadow = true; body.receiveShadow = true;
  g.add(body);
  for (const y of [0.5, 1.3, 2.1]) {
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(1.13, 0.09, 8, 16), plastic.get(BrickPalette.DARK_GRAY));
    hoop.rotation.x = Math.PI / 2; hoop.position.y = y;
    g.add(hoop);
  }
  g.add(brickBox(plastic, 2, 0.3, 2, BrickPalette.DARK_BROWN, 0, 2.65, 0));
  return g;
}

/** Casa/edificio urbano de ladrillo (para las calles de Jericó). */
export function buildHouse(
  plastic: PlasticMaterialFactory, w = 8, h = 8, d = 8,
  wallColor: number = BrickPalette.SAND, roofColor: number = BrickPalette.DARK_RED
): THREE.Group {
  const g = new THREE.Group();
  // cuerpo por cursos con junta alterna
  const courses = Math.round(h / BRICK_HEIGHT);
  for (let c = 0; c < courses; c++) {
    const y = 0.6 + c * BRICK_HEIGHT;
    const col = c % 2 ? wallColor : BrickPalette.WARM_SAND;
    // cuatro paredes (marco hueco)
    g.add(brickBox(plastic, w, BRICK_HEIGHT, 0.6, col, 0, y, d / 2));
    g.add(brickBox(plastic, w, BRICK_HEIGHT, 0.6, col, 0, y, -d / 2));
    g.add(brickBox(plastic, 0.6, BRICK_HEIGHT, d, col, w / 2, y, 0));
    g.add(brickBox(plastic, 0.6, BRICK_HEIGHT, d, col, -w / 2, y, 0));
  }
  const topY = 0.6 + courses * BRICK_HEIGHT;
  // tejado plano con parapeto (arquitectura de terraza)
  g.add(brickBox(plastic, w + 0.6, 0.5, d + 0.6, roofColor, 0, topY, 0));
  for (let x = -w / 2; x <= w / 2; x += 1.5) {
    g.add(brickBox(plastic, 0.9, BRICK_HEIGHT * 0.8, 0.6, BrickPalette.DARK_SAND, x, topY + 0.6, d / 2));
    g.add(brickBox(plastic, 0.9, BRICK_HEIGHT * 0.8, 0.6, BrickPalette.DARK_SAND, x, topY + 0.6, -d / 2));
  }
  // puerta y una ventana oscuras en la fachada +Z
  g.add(brickBox(plastic, 2, 3.4, 0.3, BrickPalette.DARK_BROWN, -w / 4, 1.9, d / 2 + 0.35));
  g.add(brickBox(plastic, 1.6, 1.6, 0.3, BrickPalette.DARK_BLUE, w / 4, 4.2, d / 2 + 0.35));
  return g;
}
