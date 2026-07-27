import * as THREE from 'three';
import { PlasticMaterialFactory } from '../../materials/PlasticMaterialFactory';
import { AudioManager } from '../../audio/AudioManager';
import { buildJericho } from '../../structures/BrickStructureBuilder';
import { Dust } from '../../effects/Dust';
import { ShofarInteraction } from '../../interactions/ShofarInteraction';

/**
 * CLÍMAX · "La caída de la muralla de Jericó" (escena FINAL, tras el 15–20).
 *
 * ⚠️ El derrumbe YA EXISTE y es la escena insignia: `interactions/ShofarInteraction`
 * (el niño encuentra el shofar → pulsa E → la muralla se derrumba por franjas con
 * oleadas de ladrillos, temblor y audio). Corrección del cerebro (14:14): NO rehacerlo,
 * **reutilizarlo TAL CUAL**. Aquí solo lo ENVUELVO como escena y engancho lo que falta.
 *
 * Este módulo (LEAD): monta la muralla (`buildJericho`) + `ShofarInteraction` tal cual,
 * y expone `cayo()` (via el callback `onBattle`) para encadenar los HITOS que faltan:
 *   → rescate de Rahab (cordón rojo)  [siguiente hito]
 *   → pantalla de victoria             [siguiente hito]
 *
 * Uso (lo monta el orquestador/integrador tras el 15–20):
 *   const cl = buildClimax(scene, plastic, audio, () => player.pos, dust);
 *   // en el bucle:  cl.update(dt, t);
 *   // objetivo:     cl.cayo()  → dispara Rahab + victoria
 */
export interface ClimaxBuild {
  group: THREE.Group;
  update(dt: number, t: number): void;
  /** true cuando la muralla ya se ha derrumbado (lo marca ShofarInteraction). */
  cayo(): boolean;
  /** Posición del shofar (objetivo/baliza para guiar al jugador). */
  readonly shofarPos: { x: number; z: number };
}

export function buildClimax(
  scene: THREE.Scene,
  plastic: PlasticMaterialFactory,
  audio: AudioManager,
  getPlayer: () => THREE.Vector3,
  dust: Dust,
): ClimaxBuild {
  const group = new THREE.Group();

  // Muralla de Jericó en coordenadas NATIVAS (como el demo de ShofarInteraction:
  // muro centrado en z=0, shofar delante en z≈16). No la reubico para no romper el
  // encaje que ya trae la interacción.
  const jer = buildJericho(plastic);
  group.add(jer.group);
  scene.add(group);

  let cayo = false;
  // Escena insignia TAL CUAL: shofar (spawn + baliza + prompt "Pulsa E") + derrumbe.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const shofar = new ShofarInteraction(scene, plastic, audio, jer, getPlayer, dust, () => { cayo = true; });

  return {
    group,
    update: (dt: number, _t: number) => shofar.update(dt),
    cayo: () => cayo,
    shofarPos: { x: 0, z: 16 },
  };
}
