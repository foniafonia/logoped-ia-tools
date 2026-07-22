import * as THREE from 'three';
import { Min05Scene, SceneContext, SceneInstance } from './types';
import { BrickPalette } from '../../materials/BrickPalette';
import { buildBarrel, buildHouse, studdedPlate } from './props/BrickProps';
import { buildStraightWallLike } from './props/Walls';
import { buildArchGate, buildBrazier, buildLantern } from './props/NightAmbience';
import { StealthSystem } from './mechanics/StealthSystem';
import { VisionCone } from './props/Npc';
import { buildGuard } from './props/Guard';
import { Npc } from './props/Npc';
import { Collectibles } from './props/Collectibles';
import { ESPIA2_SIGILO } from './skins';

/**
 * ESCENA 15 (534–544s) — LOS ESPÍAS SE CUELAN POR LA PUERTA ABIERTA.
 * Con la puerta abierta, dos guardias barren la entrada con sus conos de visión.
 * Objetivo (sigilo): cruza el portal hasta la primera calle sin llenar la barra
 * de ALARMA. Hay tinajas para esconderte mientras pasa un cono.
 */
export const escena15: Min05Scene = {
  id: 'm05_15_colarse_puerta',
  numero: 15,
  titulo: 'Colarse por la puerta',
  subtitulo: 'Aprovechando el despiste, los espías se deslizan por la puerta abierta.',
  jugador: 'spy',
  noche: true,
  ambiente: 'street',
  voz: 'm0510_15_colarse',            // TODO: cortar del audio de la peli (min 5-10)
  spawn: { x: 0, z: -18 },
  objetivo: { tipo: 'sigilo', texto: 'Cruza la puerta hasta la calle sin que se llene la alarma', target: { x: 0, z: 30 }, radio: 3.5 },
  exito: '¡Dentro de Jericó, sin ser vistos!',
  camara: { yaw: Math.PI, pitch: 0.42, dist: 30 },

  build(ctx: SceneContext): SceneInstance {
    const { plastic } = ctx;
    const group = new THREE.Group();

    const floor = studdedPlate(plastic, 60, 70, BrickPalette.DARK_SAND, false);
    floor.position.set(0, -0.4, 6); group.add(floor);

    const wallL = buildStraightWallLike(plastic, 22, 12, false); wallL.position.set(-20, 0, 8); group.add(wallL); ctx.addObstacle(-20, 8, 11, 2);
    const wallR = buildStraightWallLike(plastic, 22, 12, false); wallR.position.set(20, 0, 8); group.add(wallR); ctx.addObstacle(20, 8, 11, 2);
    const gate = buildArchGate(plastic, 9, 10); gate.group.position.set(0, 0, 8); gate.setOpen(1); group.add(gate.group);
    ctx.addObstacle(-7, 8, 2, 2); ctx.addObstacle(7, 8, 2, 2);

    // casas de la calle interior (con colisión)
    const h1 = buildHouse(plastic, 8, 8, 8, BrickPalette.SAND, BrickPalette.DARK_RED); h1.position.set(-12, 0, 26); group.add(h1); ctx.addObstacle(-12, 26, 4, 4);
    const h2 = buildHouse(plastic, 8, 10, 8, BrickPalette.WARM_SAND, BrickPalette.BROWN); h2.position.set(12, 0, 26); group.add(h2); ctx.addObstacle(12, 26, 4, 4);

    const braziers = [buildBrazier(plastic, -11, 11, 7), buildBrazier(plastic, 11, 11, 7)];
    braziers.forEach((b) => group.add(b.group));
    const lanterns = [buildLantern(plastic, -6, 5, 18), buildLantern(plastic, 6, 5, 22)];
    lanterns.forEach((l) => group.add(l.group));

    // tinajas = escondites (con colisión suave)
    const barrelPos = [{ x: -5, z: 2 }, { x: 6, z: 14 }, { x: -6, z: 20 }];
    for (const b of barrelPos) { const br = buildBarrel(plastic); br.position.set(b.x, 0, b.z); group.add(br); }

    const goal = new THREE.Mesh(new THREE.RingGeometry(1.4, 2, 24), new THREE.MeshBasicMaterial({ color: 0x8fe0ff, transparent: true, opacity: 0.75, side: THREE.DoubleSide }));
    goal.rotation.x = -Math.PI / 2; goal.position.set(0, 0.2, 30); group.add(goal);

    // === SIGILO ===
    const stealth = new StealthSystem(ctx.getPlayer, (x, z) => ctx.setPlayer(x, z), escena15.spawn, ctx.sound, ctx.film);
    const gA = buildGuard(plastic, -6, 11, 0);
    const gB = buildGuard(plastic, 6, 11, 0, true);
    group.add(gA.root, gB.root);
    const coneA = new VisionCone(20, 24), coneB = new VisionCone(20, 24);
    group.add(coneA.mesh, coneB.mesh);
    stealth
      .addGuard({ npc: gA, cone: coneA, baseYaw: Math.PI, sweep: 0.7, sweepSpeed: 0.7 })
      .addGuard({ npc: gB, cone: coneB, baseYaw: Math.PI, sweep: 0.7, sweepSpeed: 0.55 });
    for (const b of barrelPos) stealth.addHidingSpot({ x: b.x, z: b.z, radio: 2.2 });
    for (const s of stealth.marksGroup) group.add(s); // "!" sobre guardias

    const buddy = new Npc(plastic, ESPIA2_SIGILO, 3, 32, Math.PI); group.add(buddy.root);

    const gems = new Collectibles(plastic, ctx.sound, [{ x: -5, z: 2 }, { x: 6, z: 14 }, { x: -6, z: 20 }, { x: 3, z: 26 }, { x: 0, z: 30 }]);
    group.add(gems.group);

    ctx.scene.add(group);

    let doneFlag = false;
    return {
      group,
      update(dt, t, player) {
        braziers.forEach((b) => b.update(t)); lanterns.forEach((l) => l.update(t));
        stealth.update(dt, t); buddy.update(dt); gems.update(dt, t, player);
        goal.scale.setScalar(1 + Math.sin(t * 3) * 0.08);
        const o = escena15.objetivo.target!;
        if (Math.hypot(player.x - o.x, player.z - o.z) < (escena15.objetivo.radio ?? 3.5)) doneFlag = true;
      },
      status() { return stealth.status(); },
      hud() { const p = ctx.getPlayer(); const o = escena15.objetivo.target!; return { alarm: stealth.alarmLevel, progress: THREE.MathUtils.clamp(1 - Math.hypot(p.x - o.x, p.z - o.z) / 48, 0, 1), gems: { got: gems.got, total: gems.total } }; },
      isDone() { return doneFlag; }
    };
  }
};
