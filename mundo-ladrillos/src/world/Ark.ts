import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { PlasticMaterialFactory } from '../materials/PlasticMaterialFactory';

/**
 * Arca de la Alianza — la PIEZA-HÉROE de la historia (se cruza el Jordán con ella
 * y se rodea Jericó). Construida con ladrillo/plástico como el resto del mundo:
 * cofre dorado con molduras, propiciatorio (tapa), dos querubines afrontados con
 * las alas arqueadas, y dos varales con anillas para llevarla a hombros.
 *
 *   const ark = buildArk(plastic, { glow: true });
 *   scene.add(ark.group);
 *   // en el bucle (flotecito + brillo):  ark.update(dt)
 */

const GOLD = 0xCF9B2C;      // oro cálido (no se lava con el bloom)
const GOLD_HI = 0xEFC658;   // molduras / brillo
const GOLD_DK = 0x936514;   // sombras / anillas
const ACACIA = 0x7a4d24;    // madera de los varales (bajo el oro)

export interface ArkOptions {
  /** Escala global (1 ≈ a la altura del pecho de una minifigura). Def. 1. */
  scale?: number;
  /** Luz cálida interior (presencia). Def. true (1 PointLight barata). */
  glow?: boolean;
  /** Muestra los varales para llevarla. Def. true. */
  poles?: boolean;
}

export interface ArkHandle {
  group: THREE.Group;
  update(dt: number): void;
  dispose(): void;
}

export function buildArk(plastic: PlasticMaterialFactory, o: ArkOptions = {}): ArkHandle {
  const g = new THREE.Group();
  const gold = plastic.get(GOLD);
  const goldHi = plastic.get(GOLD_HI);
  const goldDk = plastic.get(GOLD_DK);

  const mesh = (geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true;
    g.add(m);
    return m;
  };

  // --- Cofre (proporción bíblica ~2.5 x 1.5 x 1.5 codos) ---
  const W = 2.5, H = 1.5, D = 1.5;
  const bodyY = 0.9 + H / 2;                         // sobre el suelo (patas)
  mesh(new RoundedBoxGeometry(W, H, D, 4, 0.1), gold, 0, bodyY, 0);
  // molduras (corona) arriba y abajo del cofre
  mesh(new THREE.BoxGeometry(W + 0.16, 0.18, D + 0.16), goldHi, 0, bodyY + H / 2, 0);
  mesh(new THREE.BoxGeometry(W + 0.16, 0.18, D + 0.16), goldHi, 0, bodyY - H / 2, 0);
  // cuatro patas
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    mesh(new THREE.BoxGeometry(0.28, 0.9, 0.28), goldDk, sx * (W / 2 - 0.2), 0.45, sz * (D / 2 - 0.2));
  }

  // --- Propiciatorio (tapa de oro macizo) ---
  const lidY = bodyY + H / 2 + 0.12;
  mesh(new RoundedBoxGeometry(W + 0.1, 0.24, D + 0.1, 3, 0.06), goldHi, 0, lidY, 0);

  // --- Dos querubines afrontados sobre la tapa ---
  const cheruby = lidY + 0.12;
  const buildCherub = (side: number): void => {
    const cx = side * (W / 2 - 0.55);
    // cuerpo (esbelto) + hombros
    mesh(new RoundedBoxGeometry(0.42, 0.85, 0.32, 3, 0.08), gold, cx, cheruby + 0.42, 0);
    mesh(new RoundedBoxGeometry(0.5, 0.16, 0.34, 3, 0.06), goldHi, cx, cheruby + 0.82, 0);
    // cabeza (más pequeña, mirando al centro)
    mesh(new RoundedBoxGeometry(0.28, 0.3, 0.28, 3, 0.07), goldHi, cx, cheruby + 1.06, 0.02);
    // alas grandes que se ALZAN y arquean hacia el centro formando dosel sobre
    // el propiciatorio (silueta icónica del Arca)
    for (const wz of [-1, 1]) {                        // dos alas por querubín
      const wing = mesh(
        new RoundedBoxGeometry(1.25, 0.6, 0.1, 2, 0.05), gold,
        cx - side * 0.62, cheruby + 1.05, wz * 0.17
      );
      wing.rotation.z = side * 1.05;                   // muy alzadas (puntas al centro-arriba)
      wing.rotation.y = side * 0.32;                   // giradas hacia dentro
      wing.rotation.x = wz * 0.18;                     // ligera apertura
    }
  };
  buildCherub(-1);
  buildCherub(1);

  // --- Varales con anillas (para llevarla a hombros) ---
  if (o.poles ?? true) {
    const acacia = plastic.get(ACACIA);
    for (const sz of [-1, 1]) {
      const z = sz * (D / 2 + 0.14);
      // anillas de oro
      for (const sx of [-1, 1]) {
        const ring = mesh(new THREE.TorusGeometry(0.16, 0.05, 8, 16), goldDk, sx * (W / 2 - 0.15), bodyY, z);
        ring.rotation.y = Math.PI / 2;
      }
      // varal (cilindro largo, madera con puntas doradas)
      const pole = mesh(new THREE.CylinderGeometry(0.09, 0.09, W + 2.6, 12), acacia, 0, bodyY, z);
      pole.rotation.z = Math.PI / 2;
      mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.3, 12), goldHi, (W + 2.6) / 2 - 0.15, bodyY, z).rotation.z = Math.PI / 2;
      mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.3, 12), goldHi, -((W + 2.6) / 2 - 0.15), bodyY, z).rotation.z = Math.PI / 2;
    }
  }

  // --- Presencia: luz cálida interior barata ---
  let glow: THREE.PointLight | null = null;
  if (o.glow ?? true) {
    glow = new THREE.PointLight(0xffdf9e, 2.6, 7, 2);
    glow.position.set(0, lidY + 0.7, 0);
    g.add(glow);
  }

  const scale = o.scale ?? 1;
  if (scale !== 1) g.scale.setScalar(scale);

  let t = 0;
  return {
    group: g,
    update(dt: number): void {
      t += dt;
      g.position.y = Math.sin(t * 1.1) * 0.05;             // flota suave
      if (glow) glow.intensity = 2.4 + Math.sin(t * 2.3) * 0.6; // parpadeo cálido
    },
    dispose(): void {
      g.traverse((n) => { const m = n as THREE.Mesh; if (m.geometry) m.geometry.dispose(); });
    }
  };
}
