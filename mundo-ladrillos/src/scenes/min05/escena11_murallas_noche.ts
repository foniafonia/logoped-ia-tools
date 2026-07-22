import * as THREE from 'three';
import { Min05Scene, SceneContext, SceneInstance } from './types';
import { SPY_SKIN, SPY2_SKIN } from '../../characters/MinifigureFactory';
import { BrickPalette } from '../../materials/BrickPalette';
import { buildStraightWallLike } from './props/Walls';
import { buildTorch, buildReeds, buildRock, studdedPlate } from './props/BrickProps';
import { Npc } from './props/Npc';

/**
 * ESCENA 11 (440–449s) — MURALLAS DE JERICÓ DE NOCHE (establecimiento).
 * Plano nocturno de la muralla, con antorchas encendidas y guardias arriba. Los
 * dos espías llegan por el cañaveral. Objetivo suave (jugable): avanza hasta el
 * puesto de observación oculto entre los juncos para estudiar la muralla.
 */
export const escena11: Min05Scene = {
  id: 'm05_11_murallas_noche',
  numero: 11,
  titulo: 'Murallas de noche',
  subtitulo: 'De noche, la fortaleza de Jericó se alza enorme e iluminada por antorchas.',
  jugador: 'spy',
  noche: true,
  spawn: { x: -16, z: -18 },
  objetivo: { tipo: 'ir_a', texto: 'Llega al puesto de observación entre los juncos', target: { x: 10, z: -6 }, radio: 3.5 },
  exito: 'Los espías estudian la muralla desde las sombras',
  camara: { yaw: Math.PI + 0.12, pitch: 0.3, dist: 36 },

  build(ctx: SceneContext): SceneInstance {
    const { plastic } = ctx;
    const group = new THREE.Group();

    const ground = studdedPlate(plastic, 90, 60, BrickPalette.DARK_SAND, false);
    ground.position.set(0, -0.4, -6);
    group.add(ground);

    // gran muralla al fondo (z ~ 20), con puerta cerrada
    const wall = buildStraightWallLike(plastic, 80, 14, true);
    wall.position.set(0, 0, 22);
    group.add(wall);

    // antorchas a lo largo de la muralla
    const torches: Array<{ update: (t: number) => void }> = [];
    for (const x of [-30, -14, 14, 30]) {
      const tr = buildTorch(plastic, x, 18, 6);
      group.add(tr.group); torches.push(tr);
    }
    // antorchas cercanas al camino de aproximación
    const tr1 = buildTorch(plastic, -6, 4, 5); group.add(tr1.group); torches.push(tr1);

    // guardias patrullando la coronación de la muralla
    const wg1 = new Npc(plastic, { ...SPY2_SKIN, torso: 0x8a3a2a, headwear: 0x6b2a1e, headStyle: 'turban' }, -10, 22, Math.PI);
    const wg2 = new Npc(plastic, { ...SPY2_SKIN, torso: 0x3a4a6b, headwear: 0x2a3550, headStyle: 'turban' }, 12, 22, Math.PI);
    wg1.root.position.y = 14 * 1.2 + 0.6; wg2.root.position.y = 14 * 1.2 + 0.6;
    wg1.setPatrol([{ x: -20, z: 22 }, { x: 4, z: 22 }], 3);
    wg2.setPatrol([{ x: 20, z: 22 }, { x: -2, z: 22 }], 2.6);
    group.add(wg1.root, wg2.root);

    // cañaveral y rocas donde se esconden los espías (el objetivo)
    group.add(buildReeds(plastic, 10, -6, 14));
    group.add(buildReeds(plastic, -20, -8, 10));
    group.add(buildRock(plastic, 1.3));
    const rock2 = buildRock(plastic, 0.9); rock2.position.set(-24, 0, -10); group.add(rock2);

    // el compañero espía acompaña al jugador
    const buddy = new Npc(plastic, SPY2_SKIN, -20, -20, 0.4);
    buddy.setPatrol([{ x: -20, z: -20 }, { x: -12, z: -12 }, { x: 4, z: -8 }], 1.8);
    group.add(buddy.root);

    ctx.scene.add(group);

    return {
      group,
      update(dt, t) {
        for (const tr of torches) tr.update(t);
        wg1.update(dt); wg2.update(dt); buddy.update(dt);
      },
      isDone(p) {
        const o = escena11.objetivo.target!;
        return Math.hypot(p.x - o.x, p.z - o.z) < (escena11.objetivo.radio ?? 3.5);
      }
    };
  }
};
