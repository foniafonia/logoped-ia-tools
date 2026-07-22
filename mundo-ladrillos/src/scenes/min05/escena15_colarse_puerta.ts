import * as THREE from 'three';
import { Min05Scene, SceneContext, SceneInstance } from './types';
import { SPY2_SKIN } from '../../characters/MinifigureFactory';
import { BrickPalette } from '../../materials/BrickPalette';
import { buildCityGate, buildTorch, buildBarrel, buildHouse, studdedPlate, brickBox } from './props/BrickProps';
import { buildStraightWallLike } from './props/Walls';
import { StealthSystem } from './mechanics/StealthSystem';
import { Npc, VisionCone } from './props/Npc';

/**
 * ESCENA 15 (534–544s) — LOS ESPÍAS SE CUELAN POR LA PUERTA ABIERTA.
 * Con la puerta abierta, los espías aprovechan el despiste. Dos guardias
 * recuperan la vigilancia (conos de visión que barren la entrada). Objetivo
 * (sigilo): cruza la puerta y llega a la primera calle sin entrar en un cono.
 * Hay tinajas para esconderse mientras pasa un cono.
 */
export const escena15: Min05Scene = {
  id: 'm05_15_colarse_puerta',
  numero: 15,
  titulo: 'Colarse por la puerta',
  subtitulo: 'Aprovechando el despiste, los espías se deslizan por la puerta abierta.',
  jugador: 'spy',
  noche: true,
  spawn: { x: 0, z: -18 },
  objetivo: { tipo: 'sigilo', texto: 'Cruza la puerta hasta la calle sin que te vean', target: { x: 0, z: 30 }, radio: 3.5 },
  exito: '¡Dentro de Jericó, sin ser vistos!',
  camara: { yaw: Math.PI, pitch: 0.42, dist: 30 },

  build(ctx: SceneContext): SceneInstance {
    const { plastic } = ctx;
    const group = new THREE.Group();

    const floor = studdedPlate(plastic, 60, 70, BrickPalette.DARK_SAND, false);
    floor.position.set(0, -0.4, 6); group.add(floor);

    // muralla + puerta (abierta) en z ~ 8
    const wallL = buildStraightWallLike(plastic, 24, 12, false); wallL.position.set(-21, 0, 8); group.add(wallL);
    const wallR = buildStraightWallLike(plastic, 24, 12, false); wallR.position.set(21, 0, 8); group.add(wallR);
    const gate = buildCityGate(plastic, 10, 11); gate.group.position.set(0, 0, 8);
    gate.setOpen(1);
    group.add(gate.group);

    // primeras casas de la calle interior (más allá de la puerta)
    group.add(buildHouse(plastic, 8, 8, 8, BrickPalette.SAND, BrickPalette.DARK_RED));
    (group.children[group.children.length - 1] as THREE.Object3D).position.set(-12, 0, 26);
    const h2 = buildHouse(plastic, 8, 10, 8, BrickPalette.WARM_SAND, BrickPalette.BROWN); h2.position.set(12, 0, 26); group.add(h2);

    // antorchas
    const torches = [buildTorch(plastic, -9, 6, 5), buildTorch(plastic, 9, 6, 5)];
    torches.forEach((tr) => group.add(tr.group));

    // tinajas para esconderse (escondites)
    const barrelPos = [{ x: -5, z: 2 }, { x: 6, z: 14 }, { x: -6, z: 20 }];
    for (const b of barrelPos) { const br = buildBarrel(plastic); br.position.set(b.x, 0, b.z); group.add(br); }

    // meta interior (marca)
    const goal = new THREE.Mesh(new THREE.RingGeometry(1.4, 2, 24), new THREE.MeshBasicMaterial({ color: 0x8fe0ff, transparent: true, opacity: 0.7, side: THREE.DoubleSide }));
    goal.rotation.x = -Math.PI / 2; goal.position.set(0, 0.15, 30); group.add(goal);

    // === SIGILO: dos guardias en la puerta con conos que barren ===
    const stealth = new StealthSystem(ctx.getPlayer, (x, z) => ctx.setPlayer(x, z), escena15.spawn);
    const gA = new Npc(plastic, { ...SPY2_SKIN, torso: 0x8a3a2a, headwear: 0x6b2a1e, headStyle: 'turban' }, -6, 11, 0);
    const gB = new Npc(plastic, { ...SPY2_SKIN, torso: 0x3a4a6b, headwear: 0x2a3550, headStyle: 'turban' }, 6, 11, 0);
    group.add(gA.root, gB.root);
    const coneA = new VisionCone(20, 24); const coneB = new VisionCone(20, 24);
    group.add(coneA.mesh, coneB.mesh);
    stealth
      .addGuard({ npc: gA, cone: coneA, baseYaw: Math.PI, sweep: 0.7, sweepSpeed: 0.7 })
      .addGuard({ npc: gB, cone: coneB, baseYaw: Math.PI, sweep: 0.7, sweepSpeed: 0.55 });
    for (const b of barrelPos) stealth.addHidingSpot({ x: b.x, z: b.z, radio: 2.2 });

    // compañero espía esperando en la calle
    const buddy = new Npc(plastic, SPY2_SKIN, 3, 32, Math.PI); group.add(buddy.root);
    void brickBox;

    ctx.scene.add(group);

    let doneFlag = false;
    return {
      group,
      update(dt, t, player) {
        for (const tr of torches) tr.update(t);
        stealth.update(dt, t);
        buddy.update(dt);
        goal.scale.setScalar(1 + Math.sin(t * 3) * 0.08);
        const o = escena15.objetivo.target!;
        if (Math.hypot(player.x - o.x, player.z - o.z) < (escena15.objetivo.radio ?? 3.5)) doneFlag = true;
      },
      status() { return stealth.status(); },
      isDone() { return doneFlag; }
    };
  }
};
