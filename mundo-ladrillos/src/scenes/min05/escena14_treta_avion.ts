import * as THREE from 'three';
import { Min05Scene, SceneContext, SceneInstance } from './types';
import { SPY2_SKIN } from '../../characters/MinifigureFactory';
import { BrickPalette } from '../../materials/BrickPalette';
import { buildCityGate, buildTorch, studdedPlate, brickBox } from './props/BrickProps';
import { buildStraightWallLike } from './props/Walls';
import { Distraction } from './mechanics/Distraction';
import { Npc } from './props/Npc';

/**
 * ESCENA 14 (512–533s) — GUARDIAS EN LA PUERTA; LA TRETA DEL "¡UN AVIÓN!".
 * Dos guardias custodian la puerta de Jericó. El jugador (espía) llega al punto
 * de grito y suelta la vieja treta: «¡Mirad, un avión!». Un avión de ladrillo
 * cruza el cielo, los guardias miran arriba y la puerta queda abierta.
 * Objetivo (distraer): llega al punto marcado; la treta se lanza sola al entrar.
 */
export const escena14: Min05Scene = {
  id: 'm05_14_treta_avion',
  numero: 14,
  titulo: 'La treta del avión',
  subtitulo: 'Dos guardias vigilan la puerta. «¡Mirad… un avión!» — y todos alzan la vista.',
  jugador: 'spy',
  noche: true,
  spawn: { x: -10, z: -16 },
  objetivo: { tipo: 'distraer', texto: 'Llega al punto y grita «¡un avión!» para distraerlos', target: { x: 0, z: -4 }, radio: 3.2 },
  exito: 'Los guardias miran al cielo; la puerta queda libre',
  camara: { yaw: Math.PI, pitch: 0.32, dist: 30 },

  build(ctx: SceneContext): SceneInstance {
    const { plastic } = ctx;
    const group = new THREE.Group();

    const floor = studdedPlate(plastic, 70, 50, BrickPalette.DARK_SAND, false);
    floor.position.set(0, -0.4, 2); group.add(floor);

    // muralla con puerta al fondo (z ~ 16)
    const wallL = buildStraightWallLike(plastic, 30, 12, false); wallL.position.set(-24, 0, 16); group.add(wallL);
    const wallR = buildStraightWallLike(plastic, 30, 12, false); wallR.position.set(24, 0, 16); group.add(wallR);
    const gate = buildCityGate(plastic, 10, 11);
    gate.group.position.set(0, 0, 16);
    group.add(gate.group);

    // antorchas junto a la puerta
    const torches = [buildTorch(plastic, -9, 13, 5), buildTorch(plastic, 9, 13, 5)];
    torches.forEach((tr) => group.add(tr.group));

    // dos guardias delante de la puerta (con lanza de ladrillo)
    const gA = new Npc(plastic, { ...SPY2_SKIN, torso: 0x8a3a2a, headwear: 0x6b2a1e, headStyle: 'turban', straps: 0xcaa14a }, -5, 11, Math.PI);
    const gB = new Npc(plastic, { ...SPY2_SKIN, torso: 0x3a4a6b, headwear: 0x2a3550, headStyle: 'turban', straps: 0xcaa14a }, 5, 11, Math.PI);
    gA.lookAt(-5, -20); gB.lookAt(5, -20);
    // lanza en la mano de cada guardia
    for (const g of [gA, gB]) {
      const spear = brickBox(plastic, 0.25, 7, 0.25, BrickPalette.BROWN, 0.9, 3.5, 0.4);
      g.root.add(spear);
      const tip = brickBox(plastic, 0.5, 0.7, 0.2, BrickPalette.SILVER, 0.9, 7.2, 0.4);
      g.root.add(tip);
    }
    group.add(gA.root, gB.root);

    // mecánica de distracción (avión + guardias mirando arriba)
    const distr = new Distraction(plastic, [gA, gB]);
    group.add(distr.group);

    // marca del punto de grito
    const spot = new THREE.Mesh(
      new THREE.RingGeometry(1.4, 2, 24),
      new THREE.MeshBasicMaterial({ color: 0xffd24a, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
    );
    spot.rotation.x = -Math.PI / 2; spot.position.set(0, 0.15, -4);
    group.add(spot);

    ctx.scene.add(group);

    let triggered = false;
    return {
      group,
      update(dt, t, player) {
        for (const tr of torches) tr.update(t);
        distr.update(dt, t);
        if (!triggered) {
          gA.update(dt); gB.update(dt);
          const near = Math.hypot(player.x - 0, player.z - (-4)) < (escena14.objetivo.radio ?? 3.2);
          if (near) { distr.trigger(); triggered = true; }
          spot.scale.setScalar(1 + Math.sin(t * 4) * 0.08);
        } else {
          // puerta se abre mientras dura la distracción
          gate.setOpen(distr.active ? 1 : 0.15);
          spot.visible = false;
        }
      },
      status() {
        if (distr.active) return '✈️ ¡Miran al cielo! La puerta queda abierta';
        if (!triggered) return '🗣️ Ve a la marca y suelta la treta';
        return null;
      },
      // se cumple en cuanto la treta surte efecto
      isDone() { return triggered && (distr.active || distr.spent); }
    };
  }
};
