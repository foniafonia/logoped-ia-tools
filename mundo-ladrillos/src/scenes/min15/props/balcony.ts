import * as THREE from 'three';
import { SceneContext } from '../types';
import { createMinifigure, Minifigure } from '../../../characters/MinifigureFactory';
import { RAHAB_MUJER } from '../../min05/skins';
import { brickBox, studdedPlate } from '../../min05/props/BrickProps';
import { buildLantern, buildNightSky } from '../../min05/props/NightAmbience';
import { BrickPalette } from '../../../materials/BrickPalette';

/**
 * EL BALCÓN DE RAHAB EN LO ALTO DE LA MURALLA (escenas 26–28), de noche.
 *
 * Rahab vivía sobre la muralla de Jericó: por eso puede descolgar a los espías
 * por FUERA. Este montador arma ese escenario 3D de ladrillo:
 *  - una PLATAERMA de adarve (el suelo por el que anda el niño) a `y = 0`,
 *  - detrás (−Z) la fachada de la casa con la VENTANA de Rahab (donde se ata el
 *    cordón rojo) y su puerta,
 *  - delante (+Z) el PARAPETO con un hueco por el que cuelga la cuerda, y la
 *    CARA EXTERIOR de la muralla cayendo hasta el suelo, muy abajo (`y = -DROP`),
 *  - al fondo, dentro de la ciudad, tejados y torres con ventanas cálidas; fuera,
 *    la noche estrellada, la luna y el monte oscuro hacia el que se escapa.
 *
 * Todo el juego transcurre en el plano `y = 0` (el niño anda por el adarve); la
 * altura de la muralla es puro decorado + el recorrido de la cuerda para el
 * descuelgue de la escena 28.
 */

/** Altura de la caída por fuera de la muralla (para el descuelgue). */
export const WALL_DROP = 22;
/** Punto de la VENTANA de Rahab (se ata ahí el cordón rojo). */
export const WINDOW_POS = { x: 0, y: 4.6, z: -6.2 };
/** Punto del PARAPETO por donde cuelga la cuerda del descuelgue. */
export const ROPE_TOP = { x: 0, y: 0, z: 7.2 };
/** Límites del adarve (para acotar al niño y que no se salga por los lados). */
export const BALCONY_BOUNDS = { minX: -9.5, maxX: 9.5, minZ: -5, maxZ: 6.6 };

export interface BalconyHandle {
  group: THREE.Group;
  rahab: Minifigure;
  update(dt: number, t: number): void;
  dispose(): void;
}

/** Silueta de tejados de Jericó (dentro de la ciudad) con ventanas cálidas. */
function cityRooftops(P: SceneContext['plastic']): THREE.Group {
  const g = new THREE.Group();
  for (let i = 0; i < 14; i++) {
    const x = -34 + i * 5 + (i % 2) * 1.4;
    const h = 5 + (i % 4) * 2.4;
    const col = i % 2 ? BrickPalette.SAND : BrickPalette.WARM_SAND;
    g.add(brickBox(P, 4.4, h, 4.4, col, x, -3 + h / 2, -18 - (i % 3) * 3));
    // ventana cálida emisiva
    const win = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1.3, 0.3),
      new THREE.MeshStandardMaterial({ color: 0xffca7a, emissive: 0xffab45, emissiveIntensity: 1.0 })
    );
    win.position.set(x, -2 + h * 0.5, -18 - (i % 3) * 3 + 2.3);
    g.add(win);
  }
  // dos torres altas al fondo
  for (const tx of [-22, 20]) {
    g.add(brickBox(P, 7, 20, 7, BrickPalette.DARK_SAND, tx, 4, -26));
    g.add(brickBox(P, 8, 2, 8, BrickPalette.BROWN, tx, 14, -26));
  }
  return g;
}

export function buildWallBalcony(ctx: SceneContext): BalconyHandle {
  const group = new THREE.Group();
  const P = ctx.plastic;

  // --- ADARVE: el suelo de piedra por el que anda el niño (y = 0) ---
  const deck = studdedPlate(P, 20, 13, BrickPalette.LIGHT_GRAY, false);
  deck.position.set(0, -0.2, 0.8); group.add(deck);
  // borde/moldura del adarve para que se lea el grosor de la muralla
  group.add(brickBox(P, 20.4, 0.6, 0.8, BrickPalette.DARK_GRAY, 0, 0.1, 7.4));

  // --- FACHADA de la casa de Rahab (detrás, hacia la ciudad) con VENTANA ---
  const facade = new THREE.Group(); facade.position.set(0, 0, -6.6); group.add(facade);
  facade.add(brickBox(P, 20, 12, 1.2, BrickPalette.WARM_SAND, 0, 6, 0));   // muro
  facade.add(brickBox(P, 20.6, 1.2, 1.6, BrickPalette.DARK_SAND, 0, 12.2, 0)); // cornisa
  // puerta a la izquierda
  facade.add(brickBox(P, 2.6, 5, 0.5, BrickPalette.DARK_BROWN, -6, 2.5, 0.5));
  // hueco de la VENTANA (a la altura WINDOW_POS) con marco de madera
  const winGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 3.2),
    new THREE.MeshBasicMaterial({ color: 0xffd79a })
  );
  winGlow.position.set(WINDOW_POS.x, WINDOW_POS.y, -6.0 + 0.05); group.add(winGlow);
  const fr = 0.32;
  group.add(brickBox(P, 3.8, fr, 0.6, BrickPalette.BROWN, 0, WINDOW_POS.y + 1.7, -6.0));
  group.add(brickBox(P, 3.8, fr, 0.6, BrickPalette.BROWN, 0, WINDOW_POS.y - 1.7, -6.0));
  group.add(brickBox(P, fr, 3.7, 0.6, BrickPalette.BROWN, -1.7, WINDOW_POS.y, -6.0));
  group.add(brickBox(P, fr, 3.7, 0.6, BrickPalette.BROWN, 1.7, WINDOW_POS.y, -6.0));
  const winLight = new THREE.PointLight(0xffca85, 2.4, 20, 1.8);
  winLight.position.set(WINDOW_POS.x, WINDOW_POS.y, -5.2); group.add(winLight);

  // --- PARAPETO exterior + hueco para la cuerda (delante, hacia fuera) ---
  // dos tramos de parapeto dejando un hueco central en ROPE_TOP.x
  group.add(brickBox(P, 7.6, 2.2, 1, BrickPalette.LIGHT_GRAY, -5.4, 1.1, 7.2));
  group.add(brickBox(P, 7.6, 2.2, 1, BrickPalette.LIGHT_GRAY, 5.4, 1.1, 7.2));
  // almenas sobre el parapeto
  for (const ax of [-8.5, -6, -3.6, 3.6, 6, 8.5]) group.add(brickBox(P, 1.4, 1, 1.1, BrickPalette.DARK_GRAY, ax, 2.6, 7.2));
  // poste de amarre de la cuerda junto al hueco
  group.add(brickBox(P, 0.7, 2.6, 0.7, BrickPalette.DARK_BROWN, -1.6, 1.3, 7.0));

  // --- CARA EXTERIOR de la muralla cayendo hasta el suelo (decorado de altura) ---
  const faceMat = P.get(BrickPalette.SAND);
  const wallFace = new THREE.Mesh(new THREE.BoxGeometry(20, WALL_DROP, 1.4), faceMat);
  wallFace.position.set(0, -WALL_DROP / 2 - 0.2, 8.0); wallFace.receiveShadow = true; group.add(wallFace);
  // hiladas horizontales para dar textura de sillares
  for (let y = -2; y > -WALL_DROP; y -= 3) {
    group.add(brickBox(P, 20.2, 0.3, 1.6, BrickPalette.DARK_SAND, 0, y, 8.05));
  }
  // suelo MUY abajo (donde aterrizan y corren en la esc. 28)
  const baseGround = studdedPlate(P, 40, 16, BrickPalette.DARK_GREEN, false);
  baseGround.position.set(0, -WALL_DROP - 0.2, 16); group.add(baseGround);

  // --- FONDO: tejados de la ciudad + monte oscuro fuera + cielo nocturno ---
  group.add(cityRooftops(P));
  const nightSky = buildNightSky(); group.add(nightSky);
  const moon = new THREE.Mesh(new THREE.SphereGeometry(6, 20, 16), new THREE.MeshBasicMaterial({ color: 0xf6efd6 }));
  moon.position.set(38, 40, 60); group.add(moon);
  const moonHalo = new THREE.Mesh(new THREE.SphereGeometry(9, 16, 12), new THREE.MeshBasicMaterial({ color: 0xbcc8e8, transparent: true, opacity: 0.22 }));
  moonHalo.position.copy(moon.position); group.add(moonHalo);
  // monte oscuro a lo lejos (fuera de la muralla)
  for (let i = 0; i < 6; i++) {
    const m = brickBox(P, 26, 12 + i * 2, 26, 0x22331f, -60 + i * 24, -WALL_DROP + 4, 40 + (i % 2) * 10);
    (m.material as THREE.Material).transparent = false; group.add(m);
  }

  // --- FAROLES cálidos en el adarve (vida nocturna) ---
  const lanterns = [buildLantern(P, -7.5, 5, -4.5), buildLantern(P, 7.5, 5, -4.5)];
  lanterns.forEach((l) => group.add(l.group));

  // --- RAHAB junto a su ventana ---
  const rahab = createMinifigure(P, RAHAB_MUJER);
  rahab.root.position.set(4.2, 0, -3.4);
  rahab.root.rotation.y = -0.5;
  group.add(rahab.root);

  // --- Colisiones: fachada (detrás), parapetos (delante, salvo el hueco), lados ---
  ctx.addObstacle(0, -6.6, 10, 0.8);       // fachada
  ctx.addObstacle(-5.4, 7.2, 3.8, 0.6);    // parapeto izq
  ctx.addObstacle(5.4, 7.2, 3.8, 0.6);     // parapeto der
  ctx.addObstacle(-9.8, 0.8, 0.6, 7);      // lado izq
  ctx.addObstacle(9.8, 0.8, 0.6, 7);       // lado der
  ctx.addObstacle(4.2, -3.4, 0.9, 0.9);    // Rahab

  ctx.scene.add(group);

  return {
    group,
    rahab,
    update(_dt: number, t: number): void {
      lanterns.forEach((l) => l.update(t));
      // Rahab respira / mira alrededor con suavidad
      rahab.root.rotation.y = -0.5 + Math.sin(t * 0.7) * 0.12;
      rahab.update(_dt, false);
    },
    dispose(): void {
      group.traverse((o) => { const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose(); });
    }
  };
}
