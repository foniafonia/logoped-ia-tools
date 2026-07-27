import * as THREE from 'three';
import { PlasticMaterialFactory } from '../../materials/PlasticMaterialFactory';
import { AudioManager } from '../../audio/AudioManager';
import { buildJericho } from '../../structures/BrickStructureBuilder';
import { Dust } from '../../effects/Dust';
import { ShofarInteraction } from '../../interactions/ShofarInteraction';
import { createMinifigure, Minifigure, RAHAB_SKIN } from '../../characters/MinifigureFactory';

/**
 * CLÍMAX · "La caída de la muralla de Jericó" (escena FINAL, tras el 15–20).
 *
 * ⚠️ El derrumbe YA EXISTE y es la escena insignia: `interactions/ShofarInteraction`
 * (el niño encuentra el shofar → pulsa E → la muralla se derrumba en ladrillos con
 * polvo/temblor/audio). Corrección del cerebro (14:14): NO rehacerlo, reutilizar TAL CUAL.
 * Aquí lo ENVUELVO como escena y engancho lo que faltaba:
 *   1) tocar el shofar → la muralla se deshace en ladrillos   (ShofarInteraction)
 *   2) rescate de RAHAB — se salva la casa marcada con el CORDÓN ROJO   ← este hito
 *   3) VICTORIA                                                          ← este hito
 *
 * Uso (lo monta el orquestador/integrador tras el 15–20):
 *   const cl = buildClimax(scene, plastic, audio, () => player.pos, dust, onVictoria);
 *   // en el bucle:  cl.update(dt, t);
 *   // objetivos:    cl.faseObjetivo()  →  {x,z} del shofar, luego de Rahab, luego null
 */
export interface ClimaxBuild {
  group: THREE.Group;
  update(dt: number, t: number): void;
  /** true cuando la muralla ya se ha derrumbado (lo marca ShofarInteraction). */
  cayo(): boolean;
  /** true cuando se ha rescatado a Rahab → victoria. */
  ganado(): boolean;
  /** Objetivo actual para la baliza: shofar → Rahab → null (al ganar). */
  faseObjetivo(): { x: number; z: number } | null;
}

const SHOFAR = { x: 0, z: 16 };
const RAHAB = { x: 34, z: 2 };   // su casa, marcada con el cordón rojo, se salva del derrumbe

export function buildClimax(
  scene: THREE.Scene,
  plastic: PlasticMaterialFactory,
  audio: AudioManager,
  getPlayer: () => THREE.Vector3,
  dust: Dust,
  onVictoria?: () => void,
): ClimaxBuild {
  const group = new THREE.Group();

  // Muralla de Jericó en coordenadas NATIVAS (como el demo de ShofarInteraction).
  const jer = buildJericho(plastic);
  group.add(jer.group);
  scene.add(group);

  let cayo = false;
  let rescateActivo = false;
  let ganado = false;
  let revealT = 0;

  // Escena insignia TAL CUAL (shofar + baliza + prompt "Pulsa E" + derrumbe en ladrillos).
  const shofar = new ShofarInteraction(scene, plastic, audio, jer, getPlayer, dust, () => { cayo = true; });

  // --- Refugio de RAHAB (se salva): tramo de casa de ladrillo + ventana + CORDÓN ROJO
  //     colgando (la señal), con Rahab dentro. Oculto hasta que cae la muralla. ---
  const refugio = new THREE.Group();
  const casaMat = plastic.get(0xcaa06a);
  const pared = new THREE.Mesh(new THREE.BoxGeometry(6, 7, 1), casaMat);
  pared.position.set(0, 3.5, 0); pared.castShadow = true; refugio.add(pared);
  const techo = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.7, 1.6), plastic.get(0x8a6a3a));
  techo.position.set(0, 7.2, 0); refugio.add(techo);
  // hueco de ventana (un recuadro oscuro)
  const ventana = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.0, 0.3), plastic.get(0x2a2018));
  ventana.position.set(0, 4.2, 0.55); refugio.add(ventana);
  // CORDÓN ROJO colgando de la ventana (la señal reconocible)
  const cordon = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 3.4, 8), plastic.get(0xc0392b));
  cordon.position.set(0.5, 2.9, 0.62); refugio.add(cordon);
  const rahab: Minifigure = createMinifigure(plastic, RAHAB_SKIN);
  rahab.root.position.set(0, 0, 1.4); rahab.root.rotation.y = Math.PI; refugio.add(rahab.root);
  refugio.position.set(RAHAB.x, 0, RAHAB.z);
  refugio.visible = false;
  group.add(refugio);

  const p = new THREE.Vector3();
  const update = (dt: number, t: number): void => {
    shofar.update(dt);
    // al caer la muralla, tras un instante, aparece el refugio de Rahab y se activa el rescate
    if (cayo && !rescateActivo) {
      revealT += dt;
      if (revealT > 1.2) { refugio.visible = true; rescateActivo = true; dust.burst(RAHAB.x, 1, RAHAB.z, 12); }
    }
    if (rescateActivo && !ganado) {
      // el cordón rojo ondea un poco (señal viva) + Rahab saluda
      cordon.rotation.z = Math.sin(t * 3) * 0.12;
      rahab.armR.rotation.x = -1.4 + Math.sin(t * 5) * 0.4;
      rahab.update(dt, false, 1);
      // llegar junto a Rahab → VICTORIA
      p.copy(getPlayer());
      if (Math.hypot(p.x - RAHAB.x, p.z - RAHAB.z) < 4) { ganado = true; onVictoria?.(); }
    }
  };

  return {
    group,
    update,
    cayo: () => cayo,
    ganado: () => ganado,
    faseObjetivo: () => (ganado ? null : rescateActivo ? { ...RAHAB } : { ...SHOFAR }),
  };
}
