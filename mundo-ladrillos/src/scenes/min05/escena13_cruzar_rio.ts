import * as THREE from 'three';
import { Min05Scene, SceneContext, SceneInstance } from './types';
import { SPY2_SKIN } from '../../characters/MinifigureFactory';
import { BrickPalette } from '../../materials/BrickPalette';
import { buildRiver, buildReeds, buildPalm, studdedPlate } from './props/BrickProps';
import { buildDistantJericho } from './props/BrickProps';
import { RopeCrossing } from './mechanics/RopeCrossing';
import { Npc } from './props/Npc';

/**
 * ESCENA 13 (501–511s) — CRUZAN EL RÍO DE NOCHE COLGADOS DE UNA CUERDA.
 * El río de noche; los espías cruzan por un puente de cuerda que se mece.
 * Objetivo (cruzar): pasa a la otra orilla sin resbalar al agua. El vaivén del
 * puente obliga a corregir el rumbo (mantente sobre el centro).
 */
export const escena13: Min05Scene = {
  id: 'm05_13_cruzar_rio',
  numero: 13,
  titulo: 'Cruzar el río por la cuerda',
  subtitulo: 'A oscuras, los espías cruzan el Jordán por una cuerda tendida, sin caer al agua.',
  jugador: 'spy',
  noche: true,
  spawn: { x: 0, z: -18 },
  objetivo: { tipo: 'cruzar', texto: 'Cruza el puente de cuerda hasta la otra orilla', target: { x: 0, z: 20 }, radio: 4 },
  exito: '¡Al otro lado, sanos y secos!',
  camara: { yaw: Math.PI, pitch: 0.28, dist: 30 },

  build(ctx: SceneContext): SceneInstance {
    const { plastic } = ctx;
    const group = new THREE.Group();

    // orillas de arena
    const near = studdedPlate(plastic, 60, 20, BrickPalette.DARK_SAND, false);
    near.position.set(0, -0.4, -16); group.add(near);
    const far = studdedPlate(plastic, 60, 20, BrickPalette.DARK_SAND, false);
    far.position.set(0, -0.4, 24); group.add(far);

    // río entre las dos orillas (z ~ -6..14)
    const river = buildRiver(plastic, 70, 22, 0, 4);
    group.add(river.group);

    // puente de cuerda que se mece, de la orilla -6 a la +14
    const rope = new RopeCrossing(plastic, -6, 14, { amp: 1.5, safeHalf: 1.7 });
    group.add(rope.group);

    // guía visual del centro del puente (un cursor que sigue el vaivén)
    const guide = new THREE.Mesh(
      new THREE.RingGeometry(0.5, 0.8, 20),
      new THREE.MeshBasicMaterial({ color: 0x8fe0ff, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
    );
    guide.rotation.x = -Math.PI / 2; guide.position.y = 0.4;
    group.add(guide);

    // ambiente: juncos, palmeras y Jericó al fondo
    group.add(buildReeds(plastic, -18, -8, 10));
    group.add(buildReeds(plastic, 18, 16, 10));
    group.add(buildPalm(plastic, -22, -14, 8));
    group.add(buildPalm(plastic, 22, 22, 9));
    const jericho = buildDistantJericho(plastic, 80);
    jericho.position.set(0, 0, 40); group.add(jericho);

    // compañero espía esperando ya en la otra orilla, animando a cruzar
    const buddy = new Npc(plastic, SPY2_SKIN, 0, 22, Math.PI);
    group.add(buddy.root);

    ctx.scene.add(group);

    let doneFlag = false;
    let fellNow = false;
    return {
      group,
      update(dt, t, player) {
        river.update(t);
        buddy.update(dt);
        const r = rope.update(dt, t, player);
        // guía sobre el centro móvil, a la altura Z del jugador
        const gz = THREE.MathUtils.clamp(player.z, -6, 14);
        guide.position.set(r.onSpan ? r.centerX : 0, 0.4, gz);
        (guide.material as THREE.MeshBasicMaterial).color.setHex(r.nearMiss ? 0xffcc44 : 0x8fe0ff);
        fellNow = r.fell;
        if (r.fell) ctx.setPlayer(escena13.spawn.x, escena13.spawn.z);
        if (player.z > 18) doneFlag = true;
      },
      status() {
        if (fellNow || rope.fellRecently) return '💦 ¡Al agua! Vuelve al inicio del puente';
        return '⚖️ Mantente sobre el centro que se mece';
      },
      isDone() { return doneFlag; }
    };
  }
};
