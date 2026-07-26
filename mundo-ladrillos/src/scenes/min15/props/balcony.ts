import * as THREE from 'three';
import { SceneContext } from '../types';
import { createMinifigure, Minifigure } from '../../../characters/MinifigureFactory';
import { RAHAB_MUJER } from '../../min05/skins';
import { brickBox, studdedPlate } from '../../min05/props/BrickProps';
import { buildLantern, buildBrazier, buildNightSky, buildBanner } from '../../min05/props/NightAmbience';
import { BrickPalette } from '../../../materials/BrickPalette';

/**
 * EL BALCÓN DE RAHAB EN LO ALTO DE LA MURALLA (escenas 26–28), de noche.
 *
 * Rahab vivía sobre la muralla de Jericó: por eso puede descolgar a los espías
 * por FUERA. Este montador arma ese escenario 3D de ladrillo, al LISTÓN del 0–5
 * (mundo lleno, nunca vacío; calidez de faroles/braseros; profundidad de peli):
 *  - una PLATAFORMA de adarve (el suelo por el que anda el niño) a `y = 0`,
 *  - detrás (−Z) la fachada de la casa con la VENTANA de Rahab (cordón rojo) y su
 *    puerta, con banderolas y calidez,
 *  - delante (+Z) el PARAPETO con un hueco para la cuerda, y la CARA EXTERIOR de
 *    la muralla —con hiladas de sillares— cayendo hasta el suelo (`y = -DROP`),
 *  - al fondo, dentro de la ciudad, tejados y torres con ventanas cálidas; fuera,
 *    la noche estrellada, la luna grande y el monte con pinos hacia el que se
 *    escapa.
 *
 * Todo el juego transcurre en el plano `y = 0` (el niño anda por el adarve); la
 * altura de la muralla es decorado + el recorrido de la cuerda (esc. 28).
 *
 * ⚠️ Ésta es la muralla del BALCÓN de Rahab (props del tramo 15–20). NO es la
 * muralla del clímax (25–29), que está hecha y no se toca.
 */

/** Altura de la caída por fuera de la muralla (para el descuelgue). */
export const WALL_DROP = 22;
/** Punto de la VENTANA de Rahab (se ata ahí el cordón rojo). */
export const WINDOW_POS = { x: 0, y: 4.6, z: -6.0 };
/**
 * Línea de la CUERDA del descuelgue: POR DELANTE de la cara exterior de la
 * muralla (la cara está en z≈8.7), así el espía cuelga a la VISTA y no se empotra
 * en la piedra. La esc. 28 lo usa para la cuerda y el proxy que baja.
 */
export const ROPE_LINE = { x: 0, z: 9.2 };
/** Punto de APROXIMACIÓN en el adarve (hueco del parapeto) donde se agarra la cuerda. */
export const ROPE_TOP = { x: 0, y: 0, z: 6.2 };
/** Límites del adarve (para acotar al niño y que no se salga por los lados). */
export const BALCONY_BOUNDS = { minX: -9.5, maxX: 9.5, minZ: -5, maxZ: 6.6 };

export interface BalconyHandle {
  group: THREE.Group;
  rahab: Minifigure;
  update(dt: number, t: number): void;
  dispose(): void;
}

/** Silueta densa de tejados de Jericó (dentro de la ciudad) con ventanas cálidas. */
function cityRooftops(P: SceneContext['plastic']): THREE.Group {
  const g = new THREE.Group();
  const emissiveWin = (x: number, y: number, z: number): THREE.Mesh => {
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 0.3),
      new THREE.MeshStandardMaterial({ color: 0xffca7a, emissive: 0xffab45, emissiveIntensity: 1.1 }));
    win.position.set(x, y, z); return win;
  };
  // dos filas de casas para dar profundidad
  for (let row = 0; row < 2; row++) {
    const zBase = -16 - row * 8;
    for (let i = 0; i < 16; i++) {
      const x = -38 + i * 5 + (i % 2) * 1.6 + row * 2.5;
      const h = 4 + ((i + row) % 4) * 2.6;
      const col = (i + row) % 2 ? BrickPalette.SAND : BrickPalette.WARM_SAND;
      g.add(brickBox(P, 4.2, h, 4.2, col, x, -3 + h / 2, zBase - (i % 3) * 2));
      // tejado plano más oscuro
      g.add(brickBox(P, 4.6, 0.5, 4.6, BrickPalette.DARK_SAND, x, -3 + h + 0.2, zBase - (i % 3) * 2));
      if ((i + row) % 2 === 0) g.add(emissiveWin(x, -2.4 + h * 0.5, zBase - (i % 3) * 2 + 2.2));
    }
  }
  // tres torres altas al fondo con ventanas cálidas
  for (const tx of [-24, 0, 22]) {
    g.add(brickBox(P, 7, 22, 7, BrickPalette.DARK_SAND, tx, 5, -30));
    g.add(brickBox(P, 8, 2, 8, BrickPalette.BROWN, tx, 16, -30));
    for (let wy = 2; wy < 14; wy += 4) g.add(emissiveWin(tx, wy, -26.6));
  }
  return g;
}

/** Un pino de bloques (monte fuera de la muralla). */
function pine(P: SceneContext['plastic'], x: number, y: number, z: number, s = 1): THREE.Group {
  const g = new THREE.Group();
  g.add(brickBox(P, 0.7 * s, 2.4 * s, 0.7 * s, BrickPalette.DARK_BROWN, 0, 1.2 * s, 0));
  for (let k = 0; k < 3; k++) {
    const w = (3 - k) * 1.2 * s;
    g.add(brickBox(P, w, 1.4 * s, w, 0x1f3d24, 0, (2.4 + k * 1.1) * s, 0));
  }
  g.position.set(x, y, z); return g;
}

export function buildWallBalcony(ctx: SceneContext): BalconyHandle {
  const group = new THREE.Group();
  const P = ctx.plastic;

  // --- ADARVE: el suelo de piedra por el que anda el niño (y = 0) ---
  const deck = studdedPlate(P, 20, 13, BrickPalette.LIGHT_GRAY, false);
  deck.position.set(0, -0.2, 0.8); group.add(deck);
  // hiladas del adarve (juntas de sillares) para que no sea una placa lisa
  for (let x = -9; x <= 9; x += 3) group.add(brickBox(P, 0.15, 0.05, 12.6, BrickPalette.DARK_GRAY, x, 0.05, 0.8));
  group.add(brickBox(P, 20.4, 0.6, 0.8, BrickPalette.DARK_GRAY, 0, 0.1, 7.4)); // moldura exterior

  // --- FACHADA de la casa de Rahab (detrás, hacia la ciudad) con VENTANA ---
  const facade = new THREE.Group(); facade.position.set(0, 0, -6.6); group.add(facade);
  facade.add(brickBox(P, 20, 12, 1.2, BrickPalette.WARM_SAND, 0, 6, 0));
  // hiladas de sillar en la fachada
  for (let y = 1.5; y < 12; y += 1.5) facade.add(brickBox(P, 20.1, 0.12, 1.3, BrickPalette.DARK_SAND, 0, y, 0));
  facade.add(brickBox(P, 20.6, 1.2, 1.6, BrickPalette.DARK_SAND, 0, 12.2, 0));   // cornisa
  facade.add(brickBox(P, 2.6, 5, 0.5, BrickPalette.DARK_BROWN, -6, 2.5, 0.5));   // puerta
  facade.add(brickBox(P, 3, 0.4, 0.6, BrickPalette.BROWN, -6, 5.1, 0.6));        // dintel puerta
  // banderolas colgando de la cornisa (vida)
  const banner1 = buildBanner(P, BrickPalette.DARK_RED, 1.4, 3); banner1.position.set(-3, 11.4, -6.0); group.add(banner1);
  const banner2 = buildBanner(P, BrickPalette.BLUE, 1.4, 3); banner2.position.set(3, 11.4, -6.0); group.add(banner2);

  // VENTANA de Rahab con marco de madera + resplandor cálido
  const winGlow = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshBasicMaterial({ color: 0xffd79a }));
  winGlow.position.set(WINDOW_POS.x, WINDOW_POS.y, -5.95); group.add(winGlow);
  const fr = 0.32;
  group.add(brickBox(P, 3.8, fr, 0.6, BrickPalette.BROWN, 0, WINDOW_POS.y + 1.7, -5.9));
  group.add(brickBox(P, 3.8, fr, 0.6, BrickPalette.BROWN, 0, WINDOW_POS.y - 1.7, -5.9));
  group.add(brickBox(P, fr, 3.7, 0.6, BrickPalette.BROWN, -1.7, WINDOW_POS.y, -5.9));
  group.add(brickBox(P, fr, 3.7, 0.6, BrickPalette.BROWN, 1.7, WINDOW_POS.y, -5.9));
  group.add(brickBox(P, 3.9, 0.4, 0.9, BrickPalette.DARK_BROWN, 0, WINDOW_POS.y - 1.9, -5.7)); // alféizar
  const winLight = new THREE.PointLight(0xffca85, 2.6, 22, 1.8); winLight.position.set(WINDOW_POS.x, WINDOW_POS.y, -5.0); group.add(winLight);

  // --- PARAPETO exterior + hueco para la cuerda (delante, hacia fuera) ---
  group.add(brickBox(P, 7.6, 2.2, 1, BrickPalette.LIGHT_GRAY, -5.4, 1.1, 7.2));
  group.add(brickBox(P, 7.6, 2.2, 1, BrickPalette.LIGHT_GRAY, 5.4, 1.1, 7.2));
  for (const ax of [-8.5, -6, -3.6, 3.6, 6, 8.5]) group.add(brickBox(P, 1.4, 1, 1.1, BrickPalette.DARK_GRAY, ax, 2.6, 7.2));
  group.add(brickBox(P, 0.7, 2.6, 0.7, BrickPalette.DARK_BROWN, -1.6, 1.3, 7.0)); // poste de amarre

  // --- CARA EXTERIOR de la muralla con HILADAS de sillares, cayendo al suelo ---
  const faceCols = [BrickPalette.SAND, BrickPalette.WARM_SAND, BrickPalette.DARK_SAND];
  for (let y = 0.6; y < WALL_DROP; y += 1.5) {
    const row = new THREE.Group(); row.position.set(0, -y, 8.0);
    const off = (Math.round(y / 1.5) % 2) * 1.1; // aparejo alternado
    for (let x = -9.5 + off; x < 10; x += 2.2) {
      row.add(brickBox(P, 2.0, 1.35, 1.4, faceCols[(Math.round(x + y)) % 3], x, 0, 0));
    }
    group.add(row);
  }
  // suelo MUY abajo (donde aterrizan y corren en la esc. 28)
  const baseGround = studdedPlate(P, 46, 20, BrickPalette.DARK_GREEN, false);
  baseGround.position.set(0, -WALL_DROP - 0.2, 17); group.add(baseGround);
  // pinos del monte al pie de la muralla (adonde escapan)
  [[-18, 13], [-11, 16], [-4, 12], [4, 16], [11, 13], [18, 15], [0, 20]].forEach(([x, z], i) => group.add(pine(P, x, -WALL_DROP, z, 1 + (i % 3) * 0.35)));

  // --- FONDO: cielo nocturno + luna grande + estrellas; monte lejano ---
  const nightSky = buildNightSky(); group.add(nightSky);
  const moon = new THREE.Mesh(new THREE.SphereGeometry(7, 24, 18), new THREE.MeshBasicMaterial({ color: 0xf6efd6 }));
  moon.position.set(40, 44, 66); group.add(moon);
  const moonHalo = new THREE.Mesh(new THREE.SphereGeometry(11, 18, 14), new THREE.MeshBasicMaterial({ color: 0xbcc8e8, transparent: true, opacity: 0.22 }));
  moonHalo.position.copy(moon.position); group.add(moonHalo);
  for (let i = 0; i < 7; i++) {
    const m = brickBox(P, 30, 14 + i * 3, 30, 0x1c2b1a, -70 + i * 24, -WALL_DROP + 5, 46 + (i % 2) * 12);
    group.add(m);
  }

  // --- calidez: tejados de la ciudad, faroles y braseros en el adarve, motas ---
  group.add(cityRooftops(P));
  const lanterns = [buildLantern(P, -7.5, 5, -4.5), buildLantern(P, 7.5, 5, -4.5)];
  lanterns.forEach((l) => group.add(l.group));
  const braziers = [buildBrazier(P, -8.5, 1.4, 5.5), buildBrazier(P, 8.5, 1.4, 5.5)];
  braziers.forEach((b) => group.add(b.group));
  // motas de polvo/ceniza flotando en la luz cálida (atmósfera)
  const moteN = 40, moteGeo = new THREE.BufferGeometry(), mpos = new Float32Array(moteN * 3);
  for (let i = 0; i < moteN; i++) { mpos[i * 3] = (Math.random() - 0.5) * 18; mpos[i * 3 + 1] = 0.5 + Math.random() * 7; mpos[i * 3 + 2] = -5 + Math.random() * 11; }
  moteGeo.setAttribute('position', new THREE.BufferAttribute(mpos, 3));
  const motes = new THREE.Points(moteGeo, new THREE.PointsMaterial({ color: 0xffdba0, size: 0.11, transparent: true, opacity: 0.6, depthWrite: false }));
  group.add(motes);

  // --- RAHAB junto a su ventana ---
  const rahab = createMinifigure(P, RAHAB_MUJER);
  rahab.root.position.set(4.2, 0, -3.4); rahab.root.rotation.y = -0.5; group.add(rahab.root);

  // --- Colisiones: fachada, parapetos (salvo hueco), lados, Rahab ---
  ctx.addObstacle(0, -6.6, 10, 0.8);
  ctx.addObstacle(-5.4, 7.2, 3.8, 0.6);
  ctx.addObstacle(5.4, 7.2, 3.8, 0.6);
  ctx.addObstacle(-9.8, 0.8, 0.6, 7);
  ctx.addObstacle(9.8, 0.8, 0.6, 7);
  ctx.addObstacle(4.2, -3.4, 0.9, 0.9);

  ctx.scene.add(group);

  return {
    group,
    rahab,
    update(dt: number, t: number): void {
      lanterns.forEach((l) => l.update(t));
      braziers.forEach((b) => b.update(t));
      rahab.root.rotation.y = -0.5 + Math.sin(t * 0.7) * 0.12;
      rahab.update(dt, false);
      // motas suben lento y reaparecen
      const mp = motes.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < moteN; i++) {
        let y = mp.getY(i) + dt * (0.12 + (i % 5) * 0.03); if (y > 7.5) y = 0.5;
        mp.setY(i, y); mp.setX(i, mp.getX(i) + Math.sin(t * 0.5 + i) * 0.002);
      }
      mp.needsUpdate = true;
    },
    dispose(): void {
      group.traverse((o) => { const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose(); });
    }
  };
}
