import * as THREE from 'three';
import { SceneContext } from '../types';
import { brickBox, studdedPlate } from '../../min05/props/BrickProps';
import { buildNightSky } from '../../min05/props/NightAmbience';
import { BrickPalette } from '../../../materials/BrickPalette';

/**
 * WILD — attrezzo del EXTERIOR NOCTURNO de la huida (escenas 29–30): el monte de
 * pinos donde los espías se esconden 3 días y la orilla por la que cruzan de vuelta
 * el Jordán. Mismo listón que el 0–5 (mundo lleno, nunca vacío) y misma estética de
 * ladrillo que el resto: reutiliza `brickBox`/`studdedPlate`, `BrickPalette` y el
 * `buildNightSky` del tramo 5–10. Solo AÑADO piezas en mi carpeta; no toco lo común.
 *
 * ⚠️ Este es el monte a las AFUERAS de Jericó (props del 15–20). NO es la muralla del
 * clímax (25–29), que está hecha y no se toca.
 */

type P = SceneContext['plastic'];

/** Suelo de tierra/hierba con tetones (acota visualmente por dónde se anda). */
export function buildGround(plastic: P, color = BrickPalette.DARK_GREEN, w = 74, d = 54): THREE.Group {
  const g = studdedPlate(plastic, w, d, color, false);
  g.position.y = -0.2;
  // parches de tono para que no sea una placa lisa (matas de hierba/tierra)
  const tones = [0x2a5a34, 0x365f28, 0x5a4a2c, 0x274d2a];
  for (let i = 0; i < 26; i++) {
    const s = 2 + ((i * 37) % 5);
    const patch = brickBox(plastic, s, 0.12, s * 0.8, tones[i % tones.length],
      (((i * 928) % 100) / 100 - 0.5) * (w - 6), 0.28, (((i * 517) % 100) / 100 - 0.5) * (d - 6));
    patch.receiveShadow = true; patch.castShadow = false; g.add(patch);
  }
  return g;
}

/** Pino de bloques (tronco + 3 faldones cónicos). Escala con `s`. */
export function buildPine(plastic: P, x: number, z: number, s = 1, y = 0): THREE.Group {
  const g = new THREE.Group();
  g.add(brickBox(plastic, 0.7 * s, 2.4 * s, 0.7 * s, BrickPalette.DARK_BROWN, 0, 1.2 * s, 0));
  const greens = [0x1f3d24, 0x27502e, 0x2f6b3d];
  for (let k = 0; k < 3; k++) {
    const w = (3 - k) * 1.2 * s;
    g.add(brickBox(plastic, w, 1.4 * s, w, greens[k], 0, (2.4 + k * 1.1) * s, 0));
  }
  g.position.set(x, y, z);
  return g;
}

/** Mata/arbusto bajo (esconde rincones a ras de suelo). */
export function buildBush(plastic: P, x: number, z: number, s = 1): THREE.Group {
  const g = new THREE.Group();
  const greens = [0x2f6b3d, 0x27502e, 0x3a7a45];
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const b = brickBox(plastic, 0.9 * s, 0.8 * s, 0.9 * s, greens[i % greens.length],
      Math.cos(a) * 0.5 * s, 0.5 * s + (i % 2) * 0.25 * s, Math.sin(a) * 0.5 * s);
    g.add(b);
  }
  g.position.set(x, 0, z);
  return g;
}

/** Peñasco de bloques (silueta irregular). Sirve de bloqueo y de decorado. */
export function buildBoulder(plastic: P, x: number, z: number, s = 1): THREE.Group {
  const g = new THREE.Group();
  const tones = [BrickPalette.DARK_GRAY, BrickPalette.LIGHT_GRAY, 0x5a5348];
  const blocks: Array<[number, number, number, number, number, number]> = [
    [0, 0.7, 0, 3.4, 1.4, 2.8], [1.0, 1.5, -0.4, 2.4, 1.3, 2.0],
    [-0.8, 1.7, 0.4, 1.8, 1.2, 1.6], [0.3, 2.4, -0.2, 1.2, 1.0, 1.1]
  ];
  blocks.forEach((b, i) => g.add(brickBox(plastic, b[3] * s, b[4] * s, b[5] * s, tones[i % 3], b[0] * s, b[1] * s, b[2] * s)));
  g.position.set(x, 0, z);
  return g;
}

/**
 * ESCONDITE: dos peñascos que forman un hueco con una losa por techo (cueva) y un
 * arbusto delante para tapar. El niño se mete AHÍ dentro en la esc. 29. La boca
 * mira hacia +Z (por donde entra). Devuelve el grupo (el llamador lo posiciona).
 */
export function buildHideout(plastic: P): THREE.Group {
  const g = new THREE.Group();
  g.add(buildBoulder(plastic, -2.6, -1.2, 1.15));
  g.add(buildBoulder(plastic, 2.6, -1.2, 1.15));
  // losa-techo que cierra la cueva por arriba
  const roof = brickBox(plastic, 6.6, 1.0, 4.2, 0x5a5348, 0, 3.2, -1.0);
  roof.rotation.z = 0.04; g.add(roof);
  // fondo oscuro del hueco (sensación de profundidad)
  const back = brickBox(plastic, 4.2, 3.0, 0.6, BrickPalette.BLACK, 0, 1.6, -2.6);
  g.add(back);
  // arbustos que flanquean la boca
  g.add(buildBush(plastic, -3.4, 1.6, 0.9));
  g.add(buildBush(plastic, 3.4, 1.6, 0.9));
  return g;
}

/** Cielo nocturno + luna grande con halo + cresta de montañas oscuras al fondo. */
export function buildMoonNight(plastic: P): THREE.Group {
  const g = new THREE.Group();
  g.add(buildNightSky());
  const moon = new THREE.Mesh(new THREE.SphereGeometry(6, 24, 18),
    new THREE.MeshBasicMaterial({ color: 0xf6efd6, toneMapped: false }));
  moon.position.set(-46, 40, -70); g.add(moon);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(9.5, 18, 14),
    new THREE.MeshBasicMaterial({ color: 0xbcc8e8, transparent: true, opacity: 0.22 }));
  halo.position.copy(moon.position); g.add(halo);
  // cresta de montañas oscuras (cierra el fondo, mata el vacío negro)
  for (let i = 0; i < 8; i++) {
    g.add(brickBox(plastic, 26, 16 + (i % 3) * 8, 26, 0x141f16, -84 + i * 24, -2 + (i % 2) * 4, -64 - (i % 2) * 10));
  }
  return g;
}

/** Fila de pinos de fondo (silueta de bosque en el horizonte). */
export function buildPineRidge(plastic: P, z: number, n = 12, y = 0): THREE.Group {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const x = -60 + (i / (n - 1)) * 120 + ((i * 53) % 7);
    g.add(buildPine(plastic, x, z + ((i * 31) % 6), 1.4 + ((i * 17) % 4) * 0.4, y));
  }
  return g;
}
