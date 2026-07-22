import * as THREE from 'three';
import { PlasticMaterialFactory } from '../../../materials/PlasticMaterialFactory';
import { BrickPalette } from '../../../materials/BrickPalette';
import { brickBox } from './BrickProps';
import { Npc } from './Npc';
import { GUARDIA_SKIN, JEFE_GUARDIA_SKIN } from '../skins';

/**
 * GUARDIA DE JERICÓ (fiel a `referencias/guardia-01`): casco cónico plateado con
 * nasal, túnica a rayas rojo/amarillo, lanza de punta plateada y escudo redondo.
 * Se construye sobre la Minifigure compartida (Npc) y se le cuelgan los props.
 */
export function buildGuard(
  plastic: PlasticMaterialFactory, x = 0, z = 0, facing = 0, jefe = false
): Npc {
  const npc = new Npc(plastic, jefe ? JEFE_GUARDIA_SKIN : GUARDIA_SKIN, x, z, facing);
  const r = npc.root;

  // --- Casco cónico plateado con nasal ---
  const helm = new THREE.Mesh(new THREE.ConeGeometry(0.62, 1.15, 16), plastic.get(BrickPalette.SILVER));
  helm.position.set(0, 4.55, 0); helm.castShadow = true; r.add(helm);
  const nasal = brickBox(plastic, 0.16, 0.5, 0.2, BrickPalette.LIGHT_GRAY, 0, 4.0, 0.56); r.add(nasal);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.09, 8, 18), plastic.get(BrickPalette.LIGHT_GRAY));
  rim.rotation.x = Math.PI / 2; rim.position.set(0, 4.05, 0); r.add(rim);

  if (jefe) {
    // cresta de plumas + capa (jefe de guardia)
    for (let i = 0; i < 3; i++) {
      const feather = brickBox(plastic, 0.18, 0.9 - i * 0.15, 0.5, BrickPalette.BLACK, 0, 5.3 + i * 0.1, -0.2 - i * 0.15);
      feather.rotation.x = -0.5 - i * 0.15; r.add(feather);
    }
    const cape = brickBox(plastic, 1.5, 2.6, 0.25, 0x241b12, 0, 2.6, -0.55);
    cape.rotation.x = 0.12; r.add(cape);
  } else {
    // rayas verticales AMARILLAS sobre la túnica roja
    for (const sx of [-0.4, 0, 0.4]) {
      r.add(brickBox(plastic, 0.22, 1.35, 0.86, BrickPalette.YELLOW, sx, 2.55, 0.02));
    }
    // faldón rojo
    r.add(brickBox(plastic, 1.3, 0.7, 0.9, 0xb03020, 0, 1.7, 0));
  }

  // --- Lanza en la mano derecha (o alabarda dorada el jefe) ---
  const shaft = brickBox(plastic, 0.22, 7.2, 0.22, BrickPalette.BROWN, 0.95, 3.5, 0.45); r.add(shaft);
  const tipColor = jefe ? BrickPalette.GOLD : BrickPalette.SILVER;
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.9, 6), plastic.get(tipColor));
  tip.position.set(0.95, 7.4, 0.45); r.add(tip);
  if (jefe) { // hoja de alabarda
    r.add(brickBox(plastic, 0.7, 0.5, 0.12, BrickPalette.GOLD, 1.3, 6.9, 0.45));
  }

  // --- Escudo redondo con emblema (león) en la mano izquierda ---
  const shield = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.2, 20), plastic.get(0x9a6a2a));
  disc.rotation.z = Math.PI / 2; disc.rotation.y = Math.PI / 2; shield.add(disc);
  const boss = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), plastic.get(BrickPalette.SILVER));
  boss.position.z = 0.14; shield.add(boss);
  // emblema simple (cruz de refuerzos) evocando el escudo con león
  shield.add(brickBox(plastic, 0.16, 1.7, 0.06, BrickPalette.DARK_BROWN, 0, 0, 0.12));
  shield.add(brickBox(plastic, 1.7, 0.16, 0.06, BrickPalette.DARK_BROWN, 0, 0, 0.12));
  shield.position.set(-1.1, 2.6, 0.2);
  shield.rotation.y = -0.3;
  r.add(shield);

  return npc;
}
