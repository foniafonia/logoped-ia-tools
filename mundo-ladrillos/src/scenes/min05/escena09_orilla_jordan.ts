import * as THREE from 'three';
import { Min05Scene, SceneContext, SceneInstance } from './types';
import { YOSHUA_SKIN } from '../../characters/MinifigureFactory';
import { BrickPalette } from '../../materials/BrickPalette';
import {
  buildRiver, buildPalm, buildBoat, buildReeds, buildRock, buildDistantJericho, studdedPlate
} from './props/BrickProps';
import { Npc } from './props/Npc';

/**
 * ESCENA 9 (307–340s) — ORILLA DEL JORDÁN.
 * Yehoshúa contempla el río y, al fondo, la ciudad de Jericó. Escenario 3D de
 * ladrillo: orilla de arena, río animado, juncos, palmeras, una barca varada y
 * la silueta lejana de Jericó al otro lado. Objetivo: llegar al promontorio del
 * mirador para "contemplar" el río (ir_a).
 */
export const escena09: Min05Scene = {
  id: 'm05_09_orilla_jordan',
  numero: 9,
  titulo: 'Orilla del Jordán',
  subtitulo: 'Yehoshúa contempla el Jordán y, al otro lado, la fortaleza de Jericó.',
  jugador: 'yoshua',
  spawn: { x: -8, z: -14 },
  objetivo: { tipo: 'ir_a', texto: 'Sube al promontorio y contempla el río', target: { x: 6, z: 4 }, radio: 3.5 },
  exito: 'Yehoshúa observa Jericó al otro lado del río',
  camara: { yaw: Math.PI + 0.2, pitch: 0.34, dist: 32 },

  build(ctx: SceneContext): SceneInstance {
    const { plastic } = ctx;
    const group = new THREE.Group();

    // orilla de arena (placa base cálida) en la ribera cercana (z < 12)
    const shore = studdedPlate(plastic, 80, 34, BrickPalette.WARM_SAND, false);
    shore.position.set(0, -0.4, -5);
    group.add(shore);

    // río ancho que separa de Jericó (z ~ 12..34)
    const river = buildRiver(plastic, 90, 26, 0, 23);
    group.add(river.group);

    // otra orilla + Jericó lejano
    const farShore = studdedPlate(plastic, 100, 20, BrickPalette.SAND, false);
    farShore.position.set(0, -0.4, 44);
    group.add(farShore);
    const jericho = buildDistantJericho(plastic, 96);
    jericho.position.set(0, 0, 50);
    group.add(jericho);

    // vegetación de la ribera
    group.add(buildPalm(plastic, -20, -8, 10));
    group.add(buildPalm(plastic, 22, -12, 8));
    group.add(buildPalm(plastic, 16, 2, 9));
    group.add(buildReeds(plastic, -10, 9, 11));
    group.add(buildReeds(plastic, 12, 10, 9));

    // barca varada y promontorio-mirador (el objetivo)
    const boat = buildBoat(plastic);
    boat.position.set(-16, 0, 6);
    boat.rotation.y = 0.5;
    group.add(boat);
    const rock = buildRock(plastic, 1.1);
    rock.position.set(6, 0, 6);
    group.add(rock);

    // NPCs: dos soldados israelitas acompañando a Yehoshúa (detrás)
    const g1 = new Npc(plastic, { ...YOSHUA_SKIN, torso: 0x5a6470, legs: 0x3f4753, headwear: 0x8a6a3a }, -14, -18, 0.3);
    const g2 = new Npc(plastic, { ...YOSHUA_SKIN, torso: 0x7a5433, legs: 0x4e341f, headwear: 0x9a7a4a }, -2, -20, -0.2);
    g1.lookAt(6, 20); g2.lookAt(6, 20);
    group.add(g1.root, g2.root);

    ctx.scene.add(group);

    return {
      group,
      update(dt, t) {
        river.update(t);
        g1.update(dt); g2.update(dt);
      },
      isDone(p) {
        const o = escena09.objetivo.target!;
        return Math.hypot(p.x - o.x, p.z - o.z) < (escena09.objetivo.radio ?? 3.5);
      }
    };
  }
};
