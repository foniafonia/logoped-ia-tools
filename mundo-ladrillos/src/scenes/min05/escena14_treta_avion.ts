import * as THREE from 'three';
import { Min05Scene, SceneContext, SceneInstance } from './types';
import { BrickPalette } from '../../materials/BrickPalette';
import { studdedPlate } from './props/BrickProps';
import { buildStraightWallLike } from './props/Walls';
import { buildArchGate, buildBrazier, buildLantern, buildBanner } from './props/NightAmbience';
import { Distraction } from './mechanics/Distraction';
import { buildGuard } from './props/Guard';
import { Collectibles } from './props/Collectibles';

/**
 * ESCENA 14 (512–533s) — GUARDIAS EN LA PUERTA; LA TRETA DEL "¡UN AVIÓN!".
 * Dos guardias custodian el portal arqueado de Jericó. El jugador llega al punto
 * de grito y pulsa E: «¡Mirad, un avión!». Un avión de ladrillo cruza el cielo
 * (con sonido), los guardias miran arriba y la puerta se abre. Objetivo:
 * distraerlos con la treta.
 */
export const escena14: Min05Scene = {
  id: 'm05_14_treta_avion',
  numero: 14,
  titulo: 'La treta del avión',
  subtitulo: 'Dos guardias vigilan la puerta. «¡Mirad… un avión!» — y todos alzan la vista.',
  jugador: 'spy',
  noche: true,
  ambiente: 'street',
  spawn: { x: -10, z: -16 },
  objetivo: { tipo: 'distraer', texto: 'Ve a la marca, pulsa E («¡un avión!») y cuélate por la puerta', target: { x: 0, z: 22 }, radio: 4 },
  exito: '¡Colado por la puerta mientras miraban al cielo!',
  camara: { yaw: Math.PI, pitch: 0.32, dist: 30 },

  build(ctx: SceneContext): SceneInstance {
    const { plastic } = ctx;
    const group = new THREE.Group();

    const floor = studdedPlate(plastic, 70, 50, BrickPalette.DARK_SAND, false);
    floor.position.set(0, -0.4, 2); group.add(floor);

    const wallL = buildStraightWallLike(plastic, 28, 12, false); wallL.position.set(-23, 0, 16); group.add(wallL); ctx.addObstacle(-23, 16, 14, 2);
    const wallR = buildStraightWallLike(plastic, 28, 12, false); wallR.position.set(23, 0, 16); group.add(wallR); ctx.addObstacle(23, 16, 14, 2);
    const gate = buildArchGate(plastic, 9, 10); gate.group.position.set(0, 0, 16); group.add(gate.group);
    ctx.addObstacle(-7, 16, 2, 2); ctx.addObstacle(7, 16, 2, 2);

    const braziers = [buildBrazier(plastic, -11, 12, 15), buildBrazier(plastic, 11, 12, 15)];
    braziers.forEach((b) => group.add(b.group));
    const lantern = buildLantern(plastic, 0, 9, 13); group.add(lantern.group);
    const spotLantern = buildLantern(plastic, -6, 5, -2); group.add(spotLantern.group); // ilumina la zona de la marca
    for (const x of [-16, 16]) { const b = buildBanner(plastic, BrickPalette.DARK_RED, 1.4, 4.5); b.position.set(x, 9, 14.6); group.add(b); }

    // dos guardias delante de la puerta
    const gA = buildGuard(plastic, -5, 11, Math.PI);
    const gB = buildGuard(plastic, 5, 11, Math.PI, true); // jefe
    gA.lookAt(-5, -20); gB.lookAt(5, -20);
    group.add(gA.root, gB.root);

    const distr = new Distraction(plastic, [gA, gB]); group.add(distr.group);

    const gems = new Collectibles(plastic, ctx.sound, [{ x: -10, z: -10 }, { x: -4, z: -8 }, { x: 4, z: -8 }, { x: 8, z: -4 }, { x: 0, z: -12 }]);
    group.add(gems.group);

    // marca del grito (antes) y meta al otro lado de la puerta (después)
    const spot = new THREE.Mesh(new THREE.RingGeometry(1.4, 2, 24), new THREE.MeshBasicMaterial({ color: 0xffd24a, transparent: true, opacity: 0.75, side: THREE.DoubleSide }));
    spot.rotation.x = -Math.PI / 2; spot.position.set(0, 0.2, -4); group.add(spot);
    const goal = new THREE.Mesh(new THREE.RingGeometry(1.4, 2, 24), new THREE.MeshBasicMaterial({ color: 0x8fe0ff, transparent: true, opacity: 0.75, side: THREE.DoubleSide }));
    goal.rotation.x = -Math.PI / 2; goal.position.set(0, 0.2, 22); goal.visible = false; group.add(goal);

    ctx.scene.add(group);

    const GOAL_Z = 20;
    let triggered = false;
    let doneFlag = false;
    let planeSfx: { stop: () => void } | null = null;
    let gateSoundDone = false;
    return {
      group,
      update(dt, t, player) {
        braziers.forEach((b) => b.update(t)); lantern.update(t); spotLantern.update(t);
        distr.update(dt, t);
        gems.update(dt, t, player);
        if (!triggered) {
          gA.update(dt); gB.update(dt);
          spot.scale.setScalar(1 + Math.sin(t * 4) * 0.1);
          const near = Math.hypot(player.x - 0, player.z - (-4)) < 3.2;
          if (near && ctx.wantsInteract()) {
            distr.trigger(); triggered = true;
            planeSfx = ctx.sound.plane(); ctx.sound.playClip('m0510_14_avion', 1.6);
            spot.visible = false; goal.visible = true;
          }
        } else {
          gate.setOpen(1);                       // una vez hecha la treta, la puerta queda abierta
          if (!gateSoundDone) { ctx.sound.gate(); gateSoundDone = true; }
          if (!distr.active && planeSfx) { planeSfx.stop(); planeSfx = null; }
          goal.scale.setScalar(1 + Math.sin(t * 3) * 0.1);
          if (player.z > GOAL_Z) doneFlag = true; // ¡colado por la puerta!
        }
      },
      status() {
        if (!triggered) return null;
        return distr.active ? '✈️ ¡Miran al cielo! ¡Corre, cuélate!' : '🚪 ¡La puerta sigue abierta, entra!';
      },
      hud() {
        const p = ctx.getPlayer();
        if (!triggered) {
          const near = Math.hypot(p.x - 0, p.z - (-4)) < 3.2;
          return { progress: 0, prompt: near ? 'Pulsa E: «¡un avión!»' : undefined, gems: { got: gems.got, total: gems.total } };
        }
        const prog = THREE.MathUtils.clamp((p.z - (-4)) / (GOAL_Z + 4), 0, 1);
        return { progress: prog, prompt: distr.active ? '🏃 ¡AHORA! ¡Cuélate por la puerta!' : undefined, gems: { got: gems.got, total: gems.total } };
      },
      isDone() { return doneFlag; }
    };
  }
};
