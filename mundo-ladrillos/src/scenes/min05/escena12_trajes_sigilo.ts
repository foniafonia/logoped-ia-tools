import * as THREE from 'three';
import { Min05Scene, SceneContext, SceneInstance } from './types';
import { BrickPalette } from '../../materials/BrickPalette';
import { brickBox } from './props/BrickProps';
import { buildLantern } from './props/NightAmbience';
import { buildTent } from '../../world/Tent';
import { Npc } from './props/Npc';
import { Collectibles } from './props/Collectibles';
import { ESPIA2_CAMP, ESPIA2_SIGILO } from './skins';

/**
 * ESCENA 12 (450–500s) — LOS ESPÍAS SE CAMBIAN A TRAJES DE SIGILO.
 * INTERIOR de la carpa (helper `buildTent` del muñequero: lona a rayas, alfombra,
 * mesa con mapa, cojines, baúl, faroles cálidos). El jugador llega de campamento
 * y, en el PERCHERO, pulsa E para EQUIPARSE el traje de sigilo (el cambio "ninja"
 * fiel a la peli). Su compañero también se cambia. Objetivo: equiparse el traje.
 */
export const escena12: Min05Scene = {
  id: 'm05_12_trajes_sigilo',
  numero: 12,
  titulo: 'Trajes de sigilo',
  subtitulo: '«¿Estás listo? — Sí. Vamos a cambiarnos.» Se enfundan los trajes de sigilo.',
  jugador: 'spy_camp',
  noche: true,
  ambiente: 'interior',
  spawn: { x: 0, z: -6 },
  objetivo: { tipo: 'ir_a', texto: 'Ve al perchero y pulsa E para ponerte el traje', target: { x: 2, z: 2 }, radio: 3 },
  exito: 'Listos y camuflados en la oscuridad',
  camara: { yaw: Math.PI, pitch: 0.42, dist: 17 },

  build(ctx: SceneContext): SceneInstance {
    const { plastic } = ctx;
    const group = new THREE.Group();

    // INTERIOR vestido: la carpa (autoiluminada). La roto para que la ABERTURA
    // mire a la cámara (-z) y el interior quede hacia +z (donde va el jugador).
    const tentH = buildTent(ctx.scene, plastic, { yehoshua: false, suits: false, background: false });
    tentH.group.rotation.y = Math.PI;
    ctx.addObstacle(0, 9, 9, 0.6);                                  // pared del fondo
    ctx.addObstacle(-9, 1, 0.6, 10); ctx.addObstacle(9, 1, 0.6, 10); // laterales

    // PERCHERO con dos trajes colgados (interactivo: aquí te equipas)
    const rack = new THREE.Group();
    rack.add(brickBox(plastic, 6, 0.4, 0.4, BrickPalette.DARK_BROWN, 0, 5, 0));
    for (const sx of [-3, 3]) rack.add(brickBox(plastic, 0.4, 5, 0.4, BrickPalette.BROWN, sx, 2.5, 0));
    const suits: THREE.Mesh[] = [];
    for (const [sx, col] of [[-1.6, 0x2c3550], [1.6, 0x566573]] as const) {
      const s = brickBox(plastic, 1.8, 3, 0.5, col, sx, 3, 0); rack.add(s); suits.push(s);
      rack.add(brickBox(plastic, 1.9, 0.4, 0.6, 0x9aa7b5, sx, 3.6, 0.05));   // percha
    }
    rack.position.set(2, 0, 2); group.add(rack);
    const rackLight = buildLantern(plastic, 2, 5, 0.5); group.add(rackLight.group);

    let buddy = new Npc(plastic, ESPIA2_CAMP, -4, -3, 0); group.add(buddy.root);

    const gems = new Collectibles(plastic, ctx.sound, [{ x: -3, z: -4 }, { x: 3, z: -5 }, { x: -5, z: 0 }, { x: 5, z: -2 }]);
    group.add(gems.group);

    ctx.scene.add(group);

    let equipped = false;
    return {
      group,
      update(dt, t, player) {
        rackLight.update(t);
        const near = Math.hypot(player.x - 2, player.z - 2) < 3.5;
        if (near && !equipped && ctx.wantsInteract()) {
          equipped = true;
          ctx.setPlayerSkin('spy');                 // ¡se pone el traje de sigilo!
          group.remove(buddy.root);
          buddy = new Npc(plastic, ESPIA2_SIGILO, -4, -3, 0); group.add(buddy.root);  // el compañero también
          suits.forEach((s) => (s.visible = false)); // los trajes ya no cuelgan
          ctx.sound.pickup();
        }
        buddy.update(dt); gems.update(dt, t, player);
      },
      status() { return equipped ? '🥷 ¡Traje de sigilo puesto!' : null; },
      hud() {
        const p = ctx.getPlayer();
        const near = Math.hypot(p.x - 2, p.z - 2) < 3.5;
        return { progress: equipped ? 1 : 0, prompt: (near && !equipped) ? 'Pulsa E para ponerte el traje' : undefined, gems: { got: gems.got, total: gems.total } };
      },
      isDone() { return equipped; },
      dispose() { tentH.dispose(); }
    };
  }
};
