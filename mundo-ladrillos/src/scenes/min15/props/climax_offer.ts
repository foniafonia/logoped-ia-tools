import * as THREE from 'three';
import { PlasticMaterialFactory } from '../../../materials/PlasticMaterialFactory';
import { BrickPalette } from '../../../materials/BrickPalette';

/**
 * CLÍMAX-OFFER — piezas REUTILIZABLES que el hilo 15–20 OFRECE al LEAD para el
 * clímax "La caída de la muralla" (el LEAD lo lidera; yo NO toco su código ni la
 * muralla del 25–29). El clímax reusa DOS cosas que son material del 15–20:
 *   (a) la SEÑAL de Rahab = el cordón rojo colgando en su ventana (rescate),
 *   (b) el SHOFAR de cuerno (el niño lo toca antes del grito).
 * Ambas viven aquí, autocontenidas (solo three + BrickPalette), para que el LEAD
 * las importe desde `scenes/min15/props/climax_offer` sin depender de mi escena.
 *
 * Estilo de ladrillo, sin marcas. Colores calcados de mi balcón (esc27) y mi
 * taller de shofarot (esc34) para que el clímax case con mi tramo.
 */

/**
 * SEÑAL DE RAHAB: el cordón rojo atado y colgando (marca la casa a salvar en la
 * muralla que cae). Cuélgalo en la ventana de Rahab dentro del Jericó del clímax.
 * `drop` = cuánto baja el cordón por la pared. Devuelve un grupo estático.
 */
export function buildRedCordSignal(plastic: PlasticMaterialFactory, drop = 5.6): THREE.Group {
  const g = new THREE.Group();
  const cordMat = new THREE.MeshStandardMaterial({ color: 0xd2241f, emissive: 0x6a0c0a, emissiveIntensity: 0.45, roughness: 0.65 });
  // nudo atado arriba
  const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.28, 0.12, 40, 6), cordMat);
  knot.position.set(0, 0, 0); g.add(knot);
  // tramo que cuelga
  const hang = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, drop, 6), cordMat);
  hang.position.set(0, -drop / 2 - 0.2, 0.05); g.add(hang);
  // resplandor cálido tenue para que "cante" con el bloom (marca visible en el caos)
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 10),
    new THREE.MeshBasicMaterial({ color: 0xff6a5a, toneMapped: false, transparent: true, opacity: 0.5 }));
  glow.position.set(0, 0.1, 0); g.add(glow);
  return g;
}

/**
 * SHOFAR: cuerno curvo de carnero color beige (biblia peli.json: "shofar largo de
 * cuerno de carnero, ladrillo curvo beige"). El mismo que talla el Cohen en mi
 * esc34. Úsalo para el momento "el niño toca el shofar" del clímax. `s` = escala.
 * Mira hacia +X (la boca ancha a la izquierda, la punta a la derecha).
 */
export function buildShofar(plastic: PlasticMaterialFactory, s = 1): THREE.Group {
  const g = new THREE.Group();
  const col = [0xe9d6a8, 0xd8c193, 0xc7ad7a];
  let x = 0, y = 0, ang = 0;
  for (let i = 0; i < 5; i++) {
    const r = (0.16 - i * 0.022) * s;
    const len = 0.5 * s;
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.03 * s, len, 8), plastic.get(col[i % 3]));
    seg.rotation.z = Math.PI / 2 - ang;
    seg.position.set(x + Math.cos(ang) * len / 2, y + Math.sin(ang) * len / 2, 0);
    seg.castShadow = true; g.add(seg);
    x += Math.cos(ang) * len; y += Math.sin(ang) * len; ang += 0.5;
  }
  return g;
}

/**
 * Estandarte de tribu (asta + tela colgante) para la MARCHA alrededor de Jericó.
 * Reutiliza el color que le pases (una bandera por tribu). Estático.
 */
export function buildMarchBanner(plastic: PlasticMaterialFactory, color = BrickPalette.DARK_BLUE, h = 5): THREE.Group {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, h, 6), plastic.get(BrickPalette.DARK_BROWN));
  pole.position.y = h / 2; pole.castShadow = true; g.add(pole);
  const cloth = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.0, 0.06), plastic.get(color));
  cloth.position.set(0.75, h - 1.4, 0); cloth.castShadow = true; g.add(cloth);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 6), plastic.get(BrickPalette.GOLD));
  tip.position.y = h + 0.15; g.add(tip);
  return g;
}
