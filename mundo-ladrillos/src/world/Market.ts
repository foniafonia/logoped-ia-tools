import * as THREE from 'three';
import { PlasticMaterialFactory } from '../materials/PlasticMaterialFactory';

export interface StallOpts {
  x: number;
  z: number;
  yaw?: number;      // 0 = frente (mostrador) hacia +Z
  variant?: number;  // cambia colores del toldo/género
}

// Paletas de tela (rayas del toldo) y de género (fruta/telas), estilo kilim.
const STRIPE_A = [0xb5654a, 0x7d8b4f, 0x8a4b3a, 0x5b7b8a];
const STRIPE_B = [0xe8c98a, 0xd9c27e, 0xcdb79a, 0xe5e7e9];
const GOODS = [0xc0392b, 0xf1c40f, 0x27ae60, 0xe67e22, 0x8e44ad];

/**
 * Puesto de mercado de ladrillo/tela: mesa con faldón, cuatro postes, toldo a
 * rayas inclinado y género encima (vasijas, cesta con fruta, rollos de tela).
 * Autónomo (solo THREE + plastic). Devuelve un THREE.Group para colocarlo.
 * Da a la calle "algo a lo que agruparse" y textura de mercado.
 */
export function buildStall(plastic: PlasticMaterialFactory, opts: StallOpts): THREE.Group {
  const g = new THREE.Group();
  const v = opts.variant ?? 0;
  const wood = 0x6e4a2c, woodDark = 0x4a3320;

  const mesh = (geo: THREE.BufferGeometry, color: number): THREE.Mesh => {
    const m = new THREE.Mesh(geo, plastic.get(color));
    m.castShadow = true; m.receiveShadow = true;
    return m;
  };

  // --- Mesa ---
  const topW = 3.2, topD = 1.4, topY = 1.5;
  const top = mesh(new THREE.BoxGeometry(topW, 0.16, topD), wood);
  top.position.set(0, topY, 0);
  g.add(top);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const leg = mesh(new THREE.BoxGeometry(0.18, topY, 0.18), woodDark);
    leg.position.set(sx * (topW / 2 - 0.2), topY / 2, sz * (topD / 2 - 0.15));
    g.add(leg);
  }
  // Faldón de tela al frente
  const apron = mesh(new THREE.BoxGeometry(topW, 0.9, 0.08), STRIPE_A[v % STRIPE_A.length]);
  apron.position.set(0, topY - 0.55, topD / 2 + 0.02);
  g.add(apron);

  // --- Postes + toldo a rayas (por encima de la cabeza, como un puesto real) ---
  const poleH = 4.7;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const pole = mesh(new THREE.CylinderGeometry(0.09, 0.09, poleH, 8), woodDark);
    pole.position.set(sx * (topW / 2), poleH / 2, sz * (topD / 2 + 0.35));
    g.add(pole);
  }
  const canopy = new THREE.Group();
  const stripes = 6, canW = topW + 0.9, canD = topD + 1.6, sw = canW / stripes;
  for (let i = 0; i < stripes; i++) {
    const c = i % 2 ? STRIPE_B[v % STRIPE_B.length] : STRIPE_A[v % STRIPE_A.length];
    const s = mesh(new THREE.BoxGeometry(sw, 0.08, canD), c);
    s.position.set(-canW / 2 + sw / 2 + i * sw, 0, 0);
    canopy.add(s);
  }
  canopy.position.set(0, poleH + 0.05, 0.15);
  canopy.rotation.x = -0.2;
  g.add(canopy);
  // Tela colgando por detrás (cierra el fondo del puesto)
  const backCloth = mesh(new THREE.BoxGeometry(topW, poleH - topY - 0.3, 0.08), STRIPE_B[v % STRIPE_B.length]);
  backCloth.position.set(0, topY + (poleH - topY) / 2 - 0.1, -(topD / 2 + 0.32));
  g.add(backCloth);

  // --- Género sobre la mesa ---
  // Vasijas
  for (const [vx, vz] of [[-1.2, 0.1], [1.1, -0.2]] as Array<[number, number]>) {
    const jar = mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.5, 10), 0xb08d57);
    jar.position.set(vx, topY + 0.33, vz);
    const neck = mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.16, 8), 0x9a7b4f);
    neck.position.set(vx, topY + 0.62, vz);
    g.add(jar, neck);
  }
  // Cesta con fruta
  const basket = mesh(new THREE.CylinderGeometry(0.34, 0.28, 0.3, 12), 0x8a6a3a);
  basket.position.set(0.2, topY + 0.23, 0.2);
  g.add(basket);
  for (let i = 0; i < 5; i++) {
    const f = mesh(new THREE.SphereGeometry(0.12, 8, 6), GOODS[(v + i) % GOODS.length]);
    const a = (i / 5) * Math.PI * 2;
    f.position.set(0.2 + Math.cos(a) * 0.14, topY + 0.42, 0.2 + Math.sin(a) * 0.14);
    g.add(f);
  }
  // Rollos de tela apilados
  for (let i = 0; i < 3; i++) {
    const bolt = mesh(new THREE.BoxGeometry(0.7, 0.16, 0.4), GOODS[(v + i + 2) % GOODS.length]);
    bolt.position.set(-0.7, topY + 0.16 + i * 0.17, -0.28);
    bolt.rotation.y = 0.1;
    g.add(bolt);
  }

  g.position.set(opts.x, 0, opts.z);
  g.rotation.y = opts.yaw ?? 0;
  return g;
}
