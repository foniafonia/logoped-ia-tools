import * as THREE from 'three';
import { Min05Scene, SceneContext, SceneInstance } from './types';
import { BrickPalette } from '../../materials/BrickPalette';
import { buildBarrel, buildHouse, studdedPlate, buildTorch, buildReeds, buildRock, buildPalm, buildMarketStall, brickBox } from './props/BrickProps';
import { buildStraightWallLike } from './props/Walls';
import { buildArchGate, buildBrazier, buildLantern, buildBanner } from './props/NightAmbience';
import { StealthSystem } from './mechanics/StealthSystem';
import { VisionCone } from './props/Npc';
import { buildGuard } from './props/Guard';
import { Npc } from './props/Npc';
import { Wanderers } from './props/Wanderers';
import { Collectibles } from './props/Collectibles';
import { ESPIA2_SIGILO, ESPIA1_CAMP, ESPIA2_CAMP } from './skins';
import { buildLanternString, buildLaundryLine } from '../../world/StreetProps';
import { buildCrateStack, buildSackPile, buildPotCluster, buildFirePit } from '../../world/Clutter';

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
  subtitulo: '«Vamos, ya es hora.» Aprovechan el despiste y se deslizan por la puerta.',
  jugador: 'spy',
  noche: true,
  ambiente: 'street',
  spawn: { x: 0, z: -18 },
  objetivo: { tipo: 'sigilo', texto: 'Cruza la puerta hasta la calle sin que se llene la alarma', target: { x: 0, z: 30 }, radio: 3.5 },
  exito: '¡Dentro de Jericó, sin ser vistos!',
  camara: { yaw: Math.PI, pitch: 0.42, dist: 30 },
  // corredor acotado: el jugador NO puede rodear la muralla por el campo abierto;
  // se le fuerza a pasar por la PUERTA (x∈[-5,5]). Evita saltarse el sigilo.
  bounds: { minX: -24, maxX: 24, minZ: -24, maxZ: 34 },

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
    // vida de calle: guirnaldas de farolillos cruzando la calle interior + ropa tendida
    group.add(buildLanternString(plastic, { ax: -11, az: 16, bx: 11, bz: 16, height: 9, count: 8, lights: 2 }));
    group.add(buildLanternString(plastic, { ax: -11, az: 26, bx: 11, bz: 26, height: 9, count: 8, lights: 2 }));
    group.add(buildLaundryLine(plastic, { ax: -9, az: 22, bx: -9, bz: 29, height: 5.4, seed: 3 }));
    group.add(buildLaundryLine(plastic, { ax: 9, az: 24, bx: 9, bz: 31, height: 5.6, seed: 8 }));

    // REGLA Nº1: el APPROACH (z<8) estaba pelado ("desolado"). Enseres de la
    // guarnición con Clutter del muñequero + pertrechos en la calle. Se respetan
    // el hueco de la puerta (x∈[-5,5]) y los escondites (tinajas).
    group.add(buildFirePit(plastic, { x: -15, z: -3 })); ctx.addObstacle(-15, -3, 1.4, 1.4);
    for (const [cx, cz] of [[16, -8], [-17, -12], [19, 20], [-18, 24]] as const) { group.add(buildCrateStack(plastic, { x: cx, z: cz, n: 3 })); ctx.addObstacle(cx, cz, 1.6, 1.6); }
    for (const [sx, sz] of [[-16, -6], [15, -14], [16, 16]] as const) { group.add(buildSackPile(plastic, { x: sx, z: sz })); ctx.addObstacle(sx, sz, 1.4, 1.2); }
    for (const [px, pz] of [[13, -4], [-17, 30]] as const) { group.add(buildPotCluster(plastic, { x: px, z: pz })); ctx.addObstacle(px, pz, 1.2, 1.2); }
    // rocas/palmeras al borde del arenal de aproximación (que no quede plano)
    for (const [rx, rz, s] of [[-22, -16, 1.1], [22, -18, 1.0], [-21, 6, 0.9]] as const) { const rk = buildRock(plastic, s); rk.position.set(rx, 0, rz); group.add(rk); ctx.addObstacle(rx, rz, 1.5 * s, 1.3 * s); }
    [[-23, -12], [23, -6]].forEach(([x, z]) => { group.add(buildPalm(plastic, x, z, 8)); ctx.addObstacle(x, z, 1, 1); });
    // estandartes colgados en la muralla, a los lados de la puerta
    for (const [bx] of [[-16], [16]] as const) { const b = buildBanner(plastic, BrickPalette.DARK_RED, 1.4, 4); b.position.set(bx, 6, 7.4); group.add(b); }

    // === AMUEBLADO EXTERIOR: la aproximación a la puerta estaba desolada ===
    // camino con 2 antorchas (ÚNICA luz nueva; el resto son props SIN luz, por el móvil)
    const torches = [buildTorch(plastic, -8, -3, 5), buildTorch(plastic, 8, -3, 5)];
    torches.forEach((tt) => group.add(tt.group));
    // control/zoco fuera de la muralla: dos puestos de mercado (con colisión)
    const stallA = buildMarketStall(plastic, BrickPalette.DARK_RED); stallA.position.set(-16, 0, -7); stallA.rotation.y = 0.5; group.add(stallA); ctx.addObstacle(-16, -7, 2.6, 1.6);
    const stallB = buildMarketStall(plastic, BrickPalette.DARK_BLUE); stallB.position.set(16, 0, -9); stallB.rotation.y = -0.5; group.add(stallB); ctx.addObstacle(16, -9, 2.6, 1.6);
    // cajas/sacos y barriles amontonados (caravana), sin luz
    for (const [cx, cz] of [[-13, -12], [-11.5, -13.5], [15, -4.5], [13.5, -3], [-18.5, -3]] as const) {
      group.add(brickBox(plastic, 2, 2, 2, (cx < 0 ? BrickPalette.BROWN : BrickPalette.DARK_SAND), cx, 1, cz)); ctx.addObstacle(cx, cz, 1, 1);
    }
    for (const [bx, bz] of [[-14, -6], [17, -13], [-9.5, -10]] as const) { const br = buildBarrel(plastic); br.position.set(bx, 0, bz); group.add(br); ctx.addObstacle(bx, bz, 1, 1); }
    // vegetación y rocas del desierto (sin luz)
    for (const [px, pz] of [[-21, -15], [21, -11]] as const) { group.add(buildPalm(plastic, px, pz, 8)); ctx.addObstacle(px, pz, 1, 1); }
    group.add(buildReeds(plastic, -22, -8, 8)); group.add(buildReeds(plastic, 22, -4, 8));
    for (const [rx, rz, s] of [[-19, -18, 1.1], [19, -17, 0.9], [-5, -15, 0.7]] as const) { const rk = buildRock(plastic, s); rk.position.set(rx, 0, rz); group.add(rk); ctx.addObstacle(rx, rz, 1.6 * s, 1.4 * s); }
    // estandartes de color en la muralla
    for (const bx2 of [-14, 14]) { const bn = buildBanner(plastic, BrickPalette.DARK_RED, 1.6, 5); bn.position.set(bx2, 9, 6.6); group.add(bn); }
    // gente del zoco fuera (acotada a la izquierda: no estorba la puerta ni el sigilo)
    const life = new Wanderers(plastic, [ESPIA1_CAMP, ESPIA2_CAMP], 3, { minX: -22, maxX: -13, minZ: -16, maxZ: -5 });
    group.add(life.group);

    // tinajas = escondites (con colisión suave)
    const barrelPos = [{ x: -5, z: 2 }, { x: 6, z: 14 }, { x: -6, z: 20 }];
    for (const b of barrelPos) { const br = buildBarrel(plastic); br.position.set(b.x, 0, b.z); group.add(br); }

    const goal = new THREE.Mesh(new THREE.RingGeometry(1.4, 2, 24), new THREE.MeshBasicMaterial({ color: 0x8fe0ff, transparent: true, opacity: 0.75, side: THREE.DoubleSide }));
    goal.rotation.x = -Math.PI / 2; goal.position.set(0, 0.2, 30); group.add(goal);

    // === SIGILO ===
    const stealth = new StealthSystem(ctx.getPlayer, (x, z) => ctx.setPlayer(x, z), escena15.spawn, ctx.sound);
    const gA = buildGuard(plastic, -6, 11, 0);
    const gB = buildGuard(plastic, 6, 11, 0, true);
    group.add(gA.root, gB.root);
    const coneA = new VisionCone(14, 17), coneB = new VisionCone(14, 17); // fácil-niño: conos cortos y estrechos
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
        torches.forEach((tt) => tt.update(t)); life.update(dt);
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
