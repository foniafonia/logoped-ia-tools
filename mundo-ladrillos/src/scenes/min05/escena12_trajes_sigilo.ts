import * as THREE from 'three';
import { Min05Scene, SceneContext, SceneInstance } from './types';
import { SPY2_SKIN } from '../../characters/MinifigureFactory';
import { BrickPalette } from '../../materials/BrickPalette';
import { buildTent, buildTorch, buildPalm, studdedPlate, brickBox } from './props/BrickProps';
import { Npc } from './props/Npc';

/**
 * ESCENA 12 (450–500s) — LOS ESPÍAS SE CAMBIAN A TRAJES DE SIGILO.
 * La carpa de los espías, de noche. El jugador (espía) va al perchero de la
 * carpa a equiparse el traje de sigilo antes de la infiltración. Objetivo:
 * llegar al perchero dentro de la carpa (ir_a). Al equiparse, se enciende una
 * marca en el traje (correas) y el compañero asiente.
 */
export const escena12: Min05Scene = {
  id: 'm05_12_trajes_sigilo',
  numero: 12,
  titulo: 'Trajes de sigilo',
  subtitulo: 'En la carpa, los espías se enfundan sus trajes oscuros para colarse sin ser vistos.',
  jugador: 'spy',
  noche: true,
  spawn: { x: 0, z: -12 },
  objetivo: { tipo: 'ir_a', texto: 'Ve al perchero y equípate el traje de sigilo', target: { x: 4, z: 6 }, radio: 3 },
  exito: 'Listos y camuflados en la oscuridad',
  camara: { yaw: Math.PI, pitch: 0.4, dist: 24 },

  build(ctx: SceneContext): SceneInstance {
    const { plastic } = ctx;
    const group = new THREE.Group();

    const floor = studdedPlate(plastic, 44, 44, BrickPalette.DARK_SAND, false);
    floor.position.set(0, -0.4, 0);
    group.add(floor);

    // carpa abierta hacia el jugador
    const tent = buildTent(plastic, BrickPalette.DARK_BLUE, 18, 16, true);
    tent.position.set(0, 0, 12);
    tent.rotation.y = Math.PI;  // abertura hacia el jugador (-z)
    group.add(tent);

    // perchero/armero con dos trajes colgados (el objetivo)
    const rack = new THREE.Group();
    rack.add(brickBox(plastic, 6, 0.4, 0.4, BrickPalette.DARK_BROWN, 0, 5, 0));
    for (const sx of [-3, 3]) rack.add(brickBox(plastic, 0.4, 5, 0.4, BrickPalette.BROWN, sx, 2.5, 0));
    // dos trajes de sigilo colgados
    for (const [sx, col] of [[-1.6, 0x2c3550], [1.6, 0x545e6c]] as const) {
      rack.add(brickBox(plastic, 1.8, 3, 0.5, col, sx, 3, 0));
      rack.add(brickBox(plastic, 1.9, 0.4, 0.6, 0x5b7bb0, sx, 3.6, 0.05)); // correas
    }
    rack.position.set(4, 0, 6);
    group.add(rack);
    // farol que ilumina el perchero (para que el objetivo se vea de noche)
    const rackLight = new THREE.PointLight(0xffd39a, 2.4, 16, 1.6);
    rackLight.position.set(4, 5, 6);
    group.add(rackLight);

    // baúl de equipo abierto
    group.add(brickBox(plastic, 4, 2, 2.6, BrickPalette.BROWN, -6, 1, 8));
    group.add(brickBox(plastic, 4.2, 0.4, 2.8, BrickPalette.DARK_BROWN, -6, 2.2, 8));

    // dos antorchas dentro de la carpa
    const torches = [buildTorch(plastic, -7, 15, 5), buildTorch(plastic, 7, 15, 5)];
    torches.forEach((tr) => group.add(tr.group));

    group.add(buildPalm(plastic, -18, -4, 8));
    group.add(buildPalm(plastic, 18, -2, 9));

    // compañero espía, ya cambiándose junto al perchero
    const buddy = new Npc(plastic, SPY2_SKIN, -1, 5, Math.PI);
    group.add(buddy.root);

    ctx.scene.add(group);

    let equipped = false;
    return {
      group,
      update(dt, t, player) {
        for (const tr of torches) tr.update(t);
        const near = Math.hypot(player.x - 4, player.z - 6) < 4;
        if (near && !equipped) { equipped = true; buddy.lookAt(player.x, player.z); }
        buddy.update(dt);
      },
      isDone(p) {
        const o = escena12.objetivo.target!;
        return Math.hypot(p.x - o.x, p.z - o.z) < (escena12.objetivo.radio ?? 3);
      }
    };
  }
};
