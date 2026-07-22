import * as THREE from 'three';
import { Min05Scene, SceneContext, SceneInstance } from './types';
import { BrickPalette } from '../../materials/BrickPalette';
import { buildRiver, buildReeds, buildPalm, studdedPlate, buildDistantJericho } from './props/BrickProps';
import { buildLantern } from './props/NightAmbience';
import { RopeCrossing } from './mechanics/RopeCrossing';
import { Npc } from './props/Npc';
import { Collectibles } from './props/Collectibles';
import { ESPIA2_SIGILO } from './skins';

/**
 * ESCENA 13 (501–511s) — CRUZAN EL RÍO DE NOCHE COLGADOS DE UNA CUERDA.
 * Puente de cuerda que se MECE sobre el Jordán. Mini-juego de EQUILIBRIO: la
 * pasarela oscila y hay que corregir con A/D para no salirse; si te desvías
 * demasiado, caes al agua (¡chof!) y vuelves al inicio. Barra de equilibrio y
 * de progreso en el HUD.
 */
export const escena13: Min05Scene = {
  id: 'm05_13_cruzar_rio',
  numero: 13,
  titulo: 'Cruzar el río por la cuerda',
  subtitulo: 'A oscuras, los espías cruzan el Jordán por una cuerda tendida, sin caer al agua.',
  jugador: 'spy',
  noche: true,
  ambiente: 'river',
  voz: 'm0510_13_cruzar',            // TODO: cortar del audio de la peli (min 5-10)
  spawn: { x: 0, z: -18 },
  objetivo: { tipo: 'cruzar', texto: 'Cruza el puente de cuerda manteniendo el equilibrio', target: { x: 0, z: 20 }, radio: 4 },
  exito: '¡Al otro lado, sanos y secos!',
  camara: { yaw: Math.PI, pitch: 0.28, dist: 30 },

  build(ctx: SceneContext): SceneInstance {
    const { plastic } = ctx;
    const group = new THREE.Group();

    const near = studdedPlate(plastic, 60, 20, BrickPalette.DARK_SAND, false);
    near.position.set(0, -0.4, -16); group.add(near);
    const far = studdedPlate(plastic, 60, 20, BrickPalette.DARK_SAND, false);
    far.position.set(0, -0.4, 24); group.add(far);

    const river = buildRiver(plastic, 70, 22, 0, 4); group.add(river.group);

    const rope = new RopeCrossing(plastic, -6, 14, { amp: 1.6, safeHalf: 1.7 });
    group.add(rope.group);
    // faroles en los postes de amarre
    const lanterns = [buildLantern(plastic, 2.4, 5.5, -6), buildLantern(plastic, -2.4, 5.5, 14)];
    lanterns.forEach((l) => group.add(l.group));

    // guía del centro móvil
    const guide = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.8, 20), new THREE.MeshBasicMaterial({ color: 0x8fe0ff, transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
    guide.rotation.x = -Math.PI / 2; guide.position.y = 0.5; group.add(guide);

    group.add(buildReeds(plastic, -18, -8, 10));
    group.add(buildReeds(plastic, 18, 16, 10));
    [[-22, -14], [22, 22]].forEach(([x, z]) => { group.add(buildPalm(plastic, x, z, 8)); });
    const jericho = buildDistantJericho(plastic, 80); jericho.position.set(0, 0, 40); group.add(jericho);

    const buddy = new Npc(plastic, ESPIA2_SIGILO, 0, 22, Math.PI); group.add(buddy.root);

    // gemas en el centro del puente (recompensan mantener el equilibrio)
    const gems = new Collectibles(plastic, ctx.sound, [{ x: 0, z: -3 }, { x: 0, z: 2 }, { x: 0, z: 7 }, { x: 0, z: 12 }]);
    group.add(gems.group);

    ctx.scene.add(group);

    let doneFlag = false;
    let balance = 0, progress = 0;
    let onBridge = false;
    return {
      group,
      update(dt, t, player) {
        river.update(t); buddy.update(dt); lanterns.forEach((l) => l.update(t));
        const r = rope.update(dt, t, player);
        onBridge = r.onSpan;
        balance = r.onSpan ? (player.x - r.centerX) / rope.safeMargin : 0;
        progress = THREE.MathUtils.clamp((player.z - (-6)) / 20, 0, 1);
        const gz = THREE.MathUtils.clamp(player.z, -6, 14);
        guide.position.set(r.onSpan ? r.centerX : 0, 0.5, gz);
        (guide.material as THREE.MeshBasicMaterial).color.setHex(r.nearMiss ? 0xffcc44 : 0x8fe0ff);
        if (r.fell) { ctx.sound.splash(); ctx.setPlayer(escena13.spawn.x, escena13.spawn.z); }
        if (player.z > 18) doneFlag = true;
        gems.update(dt, t, player);
      },
      status() { return rope.fellRecently ? '💦 ¡Al agua! Vuelve al inicio del puente' : (onBridge ? '⚖️ Corrige con A/D para no caer' : null); },
      hud() { return { balance: onBridge ? balance : undefined, progress, gems: { got: gems.got, total: gems.total } }; },
      isDone() { return doneFlag; }
    };
  }
};
