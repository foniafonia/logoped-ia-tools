import * as THREE from 'three';
import { Min05Scene, SceneContext, SceneInstance } from './types';
import { BrickPalette } from '../../materials/BrickPalette';
import { buildStraightWallLike } from './props/Walls';
import { buildReeds, buildRock, buildPalm, studdedPlate } from './props/BrickProps';
import { buildBrazier, buildBanner, buildLantern } from './props/NightAmbience';
import { buildGuard } from './props/Guard';
import { Npc } from './props/Npc';
import { Collectibles } from './props/Collectibles';
import { ESPIA2_CAMP } from './skins';

/**
 * ESCENA 11 (440–449s) — MURALLAS DE JERICÓ DE NOCHE (establecimiento).
 * Noche azul cálidamente iluminada por braseros (como el plano real): la muralla
 * enorme, guardias patrullando la coronación con casco cónico y lanza. Los dos
 * espías (aún de campamento) llegan por el cañaveral. Objetivo: alcanzar el
 * puesto de observación oculto entre los juncos para estudiar la muralla.
 */
export const escena11: Min05Scene = {
  id: 'm05_11_murallas_noche',
  numero: 11,
  titulo: 'Murallas de noche',
  subtitulo: 'La fortaleza se alza enorme en la noche. «Es peligroso: si os descubren, os matarán.»',
  jugador: 'spy_camp',
  noche: true,
  ambiente: 'night',
  spawn: { x: -16, z: -18 },
  objetivo: { tipo: 'ir_a', texto: 'Llega al puesto entre los juncos y estudia la muralla (E)', target: { x: 10, z: -5 }, radio: 3.5 },
  exito: 'Los espías estudian la muralla desde las sombras',
  camara: { yaw: Math.PI + 0.12, pitch: 0.3, dist: 36 },
  // establecimiento nocturno: la cámara descubre la muralla y baja a los espías
  intro: {
    from: { x: 0, y: 4, z: 9 }, lookFrom: { x: 0, y: 16, z: 22 },
    to: { x: -16, y: 12, z: -46 }, lookTo: { x: -16, y: 3, z: -18 }, seconds: 3.4
  },

  build(ctx: SceneContext): SceneInstance {
    const { plastic } = ctx;
    const group = new THREE.Group();

    const ground = studdedPlate(plastic, 90, 60, BrickPalette.DARK_SAND, false);
    ground.position.set(0, -0.4, -6); group.add(ground);

    // muralla al fondo (z ~ 22) con puerta cerrada — sólida (colisión)
    const wall = buildStraightWallLike(plastic, 80, 14, true);
    wall.position.set(0, 0, 22); group.add(wall);
    ctx.addObstacle(0, 23, 40, 2);

    // braseros encendidos a lo largo de la coronación + estandartes
    const braziers: Array<{ update: (t: number) => void }> = [];
    for (const x of [-30, -14, 14, 30]) { const br = buildBrazier(plastic, x, 18, 21); group.add(br.group); braziers.push(br); }
    for (const x of [-22, 0, 22]) { const b = buildBanner(plastic, BrickPalette.DARK_RED, 1.6, 5); b.position.set(x, 9, 20.4); group.add(b); }

    // guardias patrullando la coronación (con casco + lanza), fieles a la peli
    const wg1 = buildGuard(plastic, -10, 22, Math.PI);
    const wg2 = buildGuard(plastic, 12, 22, Math.PI, true); // el jefe con plumas
    wg1.root.position.y = 14 * 1.2 + 0.6; wg2.root.position.y = 14 * 1.2 + 0.6;
    wg1.setPatrol([{ x: -20, z: 22 }, { x: 4, z: 22 }], 3);
    wg2.setPatrol([{ x: 20, z: 22 }, { x: -2, z: 22 }], 2.4);
    group.add(wg1.root, wg2.root);

    // faroles de mano junto al camino de aproximación (iluminan la zona jugable)
    const lanterns = [buildLantern(plastic, -14, 5, -4), buildLantern(plastic, 14, 5, -2), buildLantern(plastic, 2, 5, -12)];
    lanterns.forEach((l) => group.add(l.group));

    // cañaveral + rocas (escondrijo = objetivo) con colisión en las rocas
    group.add(buildReeds(plastic, 10, -5, 14));
    group.add(buildReeds(plastic, -20, -8, 10));
    const r1 = buildRock(plastic, 1.3); group.add(r1); ctx.addObstacle(0, 0, 2.5, 2);
    const r2 = buildRock(plastic, 0.9); r2.position.set(-24, 0, -10); group.add(r2); ctx.addObstacle(-24, -10, 2, 1.5);
    [[-30, -14], [26, -12]].forEach(([x, z]) => { group.add(buildPalm(plastic, x, z, 8)); ctx.addObstacle(x, z, 1, 1); });

    // el compañero espía acompaña al jugador
    const buddy = new Npc(plastic, ESPIA2_CAMP, -20, -20, 0.4);
    buddy.setPatrol([{ x: -20, z: -20 }, { x: -12, z: -12 }, { x: 4, z: -7 }], 1.8);
    group.add(buddy.root);

    const gems = new Collectibles(plastic, ctx.sound, [{ x: -12, z: -12 }, { x: -4, z: -8 }, { x: 4, z: -10 }, { x: 8, z: -3 }, { x: -18, z: -4 }]);
    group.add(gems.group);

    ctx.scene.add(group);

    const tgt = escena11.objetivo.target!;
    const total = Math.hypot(escena11.spawn.x - tgt.x, escena11.spawn.z - tgt.z);
    const radio = escena11.objetivo.radio ?? 3.5;
    let studied = false; // los espías ya han estudiado la muralla (verbo: E)
    return {
      group,
      update(dt, t, player) {
        for (const br of braziers) br.update(t); lanterns.forEach((l) => l.update(t));
        wg1.update(dt); wg2.update(dt); buddy.update(dt); gems.update(dt, t, player);
        // VERBO: desde el escondite, pulsa E para ESTUDIAR la muralla (la cámara
        // recorre la coronación y las patrullas, y vuelve al control manual).
        const near = Math.hypot(player.x - tgt.x, player.z - tgt.z) < radio;
        if (near && !studied && ctx.wantsInteract()) {
          studied = true;
          ctx.sound.success();
          ctx.cameraReveal?.(
            { x: 8, y: 5.5, z: -4 }, { x: 2, y: 8, z: 2 },
            { x: -6, y: 12, z: 22 }, { x: 12, y: 12, z: 22 }, 3
          );
        }
      },
      status() { return studied ? '🧭 Muralla estudiada: 2 guardias y la puerta cerrada' : null; },
      hud() { const p = ctx.getPlayer(); const near = Math.hypot(p.x - tgt.x, p.z - tgt.z) < radio; return { progress: THREE.MathUtils.clamp(1 - Math.hypot(p.x - tgt.x, p.z - tgt.z) / total, 0, 1), gems: { got: gems.got, total: gems.total }, prompt: (near && !studied) ? '🧭 Pulsa E para estudiar la muralla' : undefined }; },
      isDone() { return studied; }
    };
  }
};
