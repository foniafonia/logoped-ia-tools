import * as THREE from 'three';
import { Min05Scene, SceneContext, SceneInstance } from './types';
import { BrickPalette } from '../../materials/BrickPalette';
import { buildTent, buildPalm, studdedPlate, brickBox } from './props/BrickProps';
import { buildLantern } from './props/NightAmbience';
import { Npc } from './props/Npc';
import { Collectibles } from './props/Collectibles';
import { ESPIA2_CAMP, ESPIA2_SIGILO } from './skins';

/**
 * ESCENA 12 (450–500s) — LOS ESPÍAS SE CAMBIAN A TRAJES DE SIGILO.
 * La carpa de noche. El jugador llega de CAMPAMENTO y, en el perchero, pulsa E
 * para EQUIPARSE el traje de sigilo (aquí ocurre el cambio "ninja" fiel a la
 * peli). Su compañero también se cambia. Objetivo: equiparse el traje.
 */
export const escena12: Min05Scene = {
  id: 'm05_12_trajes_sigilo',
  numero: 12,
  titulo: 'Trajes de sigilo',
  subtitulo: 'En la carpa, los espías se enfundan sus trajes oscuros para colarse sin ser vistos.',
  jugador: 'spy_camp',
  noche: true,
  ambiente: 'night',
  voz: 'm0510_12_trajes',            // TODO: cortar del audio de la peli (min 5-10)
  spawn: { x: 0, z: -12 },
  objetivo: { tipo: 'ir_a', texto: 'Ve al perchero y pulsa E para ponerte el traje', target: { x: 4, z: 6 }, radio: 3 },
  exito: 'Listos y camuflados en la oscuridad',
  camara: { yaw: Math.PI, pitch: 0.4, dist: 24 },

  build(ctx: SceneContext): SceneInstance {
    const { plastic } = ctx;
    const group = new THREE.Group();

    const floor = studdedPlate(plastic, 44, 44, BrickPalette.DARK_SAND, false);
    floor.position.set(0, -0.4, 0); group.add(floor);

    const tent = buildTent(plastic, BrickPalette.DARK_BLUE, 18, 16, true);
    tent.position.set(0, 0, 12); tent.rotation.y = Math.PI; group.add(tent);
    ctx.addObstacle(0, 15, 9, 4);

    // perchero con dos trajes colgados (el objetivo)
    const rack = new THREE.Group();
    rack.add(brickBox(plastic, 6, 0.4, 0.4, BrickPalette.DARK_BROWN, 0, 5, 0));
    for (const sx of [-3, 3]) rack.add(brickBox(plastic, 0.4, 5, 0.4, BrickPalette.BROWN, sx, 2.5, 0));
    const suits: THREE.Mesh[] = [];
    for (const [sx, col] of [[-1.6, 0x2c3550], [1.6, 0x566573]] as const) {
      const s = brickBox(plastic, 1.8, 3, 0.5, col, sx, 3, 0);
      rack.add(s); suits.push(s);
      rack.add(brickBox(plastic, 1.9, 0.4, 0.6, 0x9aa7b5, sx, 3.6, 0.05));
    }
    rack.position.set(4, 0, 6); group.add(rack);
    const rackLight = buildLantern(plastic, 4, 5, 4); group.add(rackLight.group);

    // baúl de equipo
    group.add(brickBox(plastic, 4, 2, 2.6, BrickPalette.BROWN, -6, 1, 8)); ctx.addObstacle(-6, 8, 2, 1.3);
    group.add(brickBox(plastic, 4.2, 0.4, 2.8, BrickPalette.DARK_BROWN, -6, 2.2, 8));

    const lanterns = [buildLantern(plastic, -7, 5, 14), buildLantern(plastic, 7, 5, 14)];
    lanterns.forEach((l) => group.add(l.group));
    [[-18, -4], [18, -2]].forEach(([x, z]) => { group.add(buildPalm(plastic, x, z, 8)); ctx.addObstacle(x, z, 1, 1); });

    let buddy = new Npc(plastic, ESPIA2_CAMP, -1, 5, Math.PI); group.add(buddy.root);

    const gems = new Collectibles(plastic, ctx.sound, [{ x: -4, z: -6 }, { x: 4, z: -4 }, { x: -6, z: 2 }, { x: 8, z: 2 }]);
    group.add(gems.group);

    ctx.scene.add(group);

    let equipped = false;
    return {
      group,
      update(dt, t, player) {
        rackLight.update(t); lanterns.forEach((l) => l.update(t));
        const near = Math.hypot(player.x - 4, player.z - 6) < 3.5;
        if (near && !equipped && ctx.wantsInteract()) {
          equipped = true;
          ctx.setPlayerSkin('spy');                 // ¡se pone el traje de sigilo!
          // el compañero también se cambia (se sustituye por su versión de sigilo)
          group.remove(buddy.root);
          buddy = new Npc(plastic, ESPIA2_SIGILO, -1, 5, Math.PI); group.add(buddy.root);
          suits.forEach((s) => (s.visible = false)); // los trajes ya no cuelgan
          ctx.sound.pickup();
        }
        buddy.update(dt); gems.update(dt, t, player);
      },
      status() { return equipped ? '🥷 ¡Traje de sigilo puesto!' : null; },
      hud() {
        const p = ctx.getPlayer();
        const near = Math.hypot(p.x - 4, p.z - 6) < 3.5;
        return { progress: equipped ? 1 : 0, prompt: (near && !equipped) ? 'Pulsa E para ponerte el traje' : undefined, gems: { got: gems.got, total: gems.total } };
      },
      isDone() { return equipped; }
    };
  }
};
