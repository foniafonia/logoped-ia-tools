import * as THREE from 'three';
import { Min05Scene, SceneContext, SceneInstance } from './types';
import { BrickPalette } from '../../materials/BrickPalette';
import {
  buildRiver, buildPalm, buildBoat, buildReeds, buildRock, buildDistantJericho, studdedPlate, brickBox
} from './props/BrickProps';
import { Npc } from './props/Npc';
import { Wanderers } from './props/Wanderers';
import { ESPIA1_CAMP, ESPIA2_CAMP } from './skins';

/**
 * ESCENA 9 (307–340s) — ORILLA DEL JORDÁN.
 * Yehoshúa (jugador) contempla el río y, al otro lado, Jericó. Mundo 3D de
 * ladrillo con VIDA: río animado con peces de colores, soldados que deambulan,
 * palmeras, barca y juncos. Objetivo: subir al promontorio para contemplar el
 * río. (Modo campamento: los espías aún NO van de sigilo.)
 */
export const escena09: Min05Scene = {
  id: 'm05_09_orilla_jordan',
  numero: 9,
  titulo: 'Orilla del Jordán',
  subtitulo: 'Yehoshúa contempla el Jordán y, al otro lado, la fortaleza de Jericó.',
  jugador: 'yoshua',
  ambiente: 'river',
  spawn: { x: -8, z: -14 },
  objetivo: { tipo: 'ir_a', texto: 'Sube al promontorio y contempla el río', target: { x: 6, z: 5 }, radio: 3.5 },
  exito: 'Yehoshúa observa Jericó al otro lado del río',
  camara: { yaw: Math.PI + 0.2, pitch: 0.34, dist: 32 },

  build(ctx: SceneContext): SceneInstance {
    const { plastic } = ctx;
    const group = new THREE.Group();

    const shore = studdedPlate(plastic, 80, 34, BrickPalette.WARM_SAND, false);
    shore.position.set(0, -0.4, -5); group.add(shore);

    const river = buildRiver(plastic, 90, 26, 0, 23); group.add(river.group);

    const farShore = studdedPlate(plastic, 100, 20, BrickPalette.SAND, false);
    farShore.position.set(0, -0.4, 44); group.add(farShore);
    const jericho = buildDistantJericho(plastic, 96); jericho.position.set(0, 0, 50); group.add(jericho);

    // peces de colores en el río (guiño al plano del Jordán partido)
    const fish: THREE.Mesh[] = [];
    const fishCol = [0xe8801e, 0xf0b429, 0x4c9e5e, 0xb62b2b, 0x1f6fb2];
    for (let i = 0; i < 14; i++) {
      const f = brickBox(plastic, 1.1, 0.6, 0.4, fishCol[i % fishCol.length], 0, 0.6, 0);
      f.userData.bx = -38 + (i * 6) % 76; f.userData.bz = 14 + (i * 13) % 20; f.userData.ph = i;
      group.add(f); fish.push(f);
    }

    // vegetación + props (con colisión)
    const palms: Array<[number, number]> = [[-20, -8], [22, -12], [16, 2]];
    palms.forEach(([x, z], i) => { group.add(buildPalm(plastic, x, z, 8 + i)); ctx.addObstacle(x, z, 1, 1); });
    group.add(buildReeds(plastic, -10, 9, 11));
    group.add(buildReeds(plastic, 12, 10, 9));

    const boat = buildBoat(plastic); boat.position.set(-16, 0, 6); boat.rotation.y = 0.5; group.add(boat);
    ctx.addObstacle(-16, 6, 2, 4);
    const rock = buildRock(plastic, 1.1); rock.position.set(6, 0, 6); group.add(rock);
    ctx.addObstacle(6, 6, 2.5, 2);

    // soldados israelitas deambulando (modo campamento) + los dos futuros espías
    const life = new Wanderers(plastic, [ESPIA1_CAMP, ESPIA2_CAMP, {
      head: 0xf2c141, torso: 0x6f7a52, belt: 0x4a5030, legs: 0x556040, arms: 0x66703f, hands: 0xf2c141, headwear: 0xa9b088, headStyle: 'turban'
    }], 5, { minX: -30, maxX: -12, minZ: -22, maxZ: -6 });
    group.add(life.group);
    const g1 = new Npc(plastic, ESPIA1_CAMP, -2, -20, -0.2); g1.lookAt(6, 20); group.add(g1.root);

    ctx.scene.add(group);

    const start = new THREE.Vector2(escena09.spawn.x, escena09.spawn.z);
    const tgt = new THREE.Vector2(escena09.objetivo.target!.x, escena09.objetivo.target!.z);
    const total = start.distanceTo(tgt);
    return {
      group,
      update(dt, t, player) {
        river.update(t);
        for (const f of fish) {
          const s = Math.sin(t * 0.8 + f.userData.ph);
          f.position.set(f.userData.bx + s * 6, 0.5 + Math.sin(t * 3 + f.userData.ph) * 0.15, f.userData.bz + Math.cos(t * 0.6 + f.userData.ph) * 2);
          f.rotation.y = s > 0 ? 0.4 : -0.4 + Math.PI;
        }
        life.update(dt); g1.update(dt);
      },
      hud() {
        const p = ctx.getPlayer();
        const d = Math.hypot(p.x - tgt.x, p.z - tgt.y);
        return { progress: THREE.MathUtils.clamp(1 - d / total, 0, 1) };
      },
      isDone(p) { const o = escena09.objetivo.target!; return Math.hypot(p.x - o.x, p.z - o.z) < (escena09.objetivo.radio ?? 3.5); }
    };
  }
};
