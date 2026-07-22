import * as THREE from 'three';
import { Min05Scene, SceneContext, SceneInstance } from './types';
import { BrickPalette } from '../../materials/BrickPalette';
import { buildTent, buildPalm, studdedPlate, brickBox } from './props/BrickProps';
import { Npc } from './props/Npc';
import { Wanderers } from './props/Wanderers';
import { Collectibles } from './props/Collectibles';
import { ESPIA1_CAMP, ESPIA2_CAMP } from './skins';

/**
 * ESCENA 10 (341–439s) — YEHOSHÚA RECLUTA A LOS DOS ESPÍAS.
 * La tienda de Yehoshúa en el campamento. Yehoshúa (jugador) va a hablar con
 * los DOS espías (aún de campamento, túnica + turbante). Objetivo de 2 pasos:
 * acércate a cada espía para encomendarle la misión; al saludar al segundo,
 * ambos aceptan. Campamento con vida (aldeanos, hoguera, cajas).
 */
export const escena10: Min05Scene = {
  id: 'm05_10_reclutar_espias',
  numero: 10,
  titulo: 'Reclutar a los espías',
  subtitulo: '«Id y reconoced la tierra, y Jericó.» Yehoshúa encomienda la misión a dos hombres.',
  jugador: 'yoshua',
  ambiente: 'day',
  voz: 'm0510_10_reclutar',            // TODO: cortar del audio de la peli (min 5-10)
  spawn: { x: 0, z: -13 },
  objetivo: { tipo: 'ir_a', texto: 'Habla con los dos espías (acércate a cada uno)', target: { x: 0, z: 4 }, radio: 4 },
  exito: 'Los dos espías aceptan la misión',
  camara: { yaw: Math.PI, pitch: 0.38, dist: 28 },

  build(ctx: SceneContext): SceneInstance {
    const { plastic } = ctx;
    const group = new THREE.Group();

    const floor = studdedPlate(plastic, 64, 60, BrickPalette.TAN, false);
    floor.position.set(0, -0.4, 0); group.add(floor);

    const tent = buildTent(plastic, BrickPalette.DARK_RED, 16, 14, true);
    tent.position.set(0, 0, 12); tent.rotation.y = Math.PI; group.add(tent);
    ctx.addObstacle(0, 14, 8, 5);

    // mesa de mapas
    group.add(brickBox(plastic, 5, 0.4, 3, BrickPalette.BROWN, 0, 2.4, 10));
    for (const sx of [-2, 2]) for (const sz of [-1, 1]) group.add(brickBox(plastic, 0.4, 2.4, 0.4, BrickPalette.DARK_BROWN, sx, 1.2, 10 + sz));
    group.add(brickBox(plastic, 4.2, 0.15, 2.4, BrickPalette.WARM_SAND, 0, 2.65, 10));

    // hoguera
    const fire = new THREE.Group();
    for (let a = 0; a < 8; a++) { const ang = (a / 8) * Math.PI * 2; fire.add(brickBox(plastic, 0.8, 0.6, 0.8, BrickPalette.DARK_GRAY, Math.cos(ang) * 1.6, 0.3, Math.sin(ang) * 1.6)); }
    const ember = brickBox(plastic, 1.4, 0.5, 1.4, BrickPalette.ORANGE, 0, 0.7, 0);
    (ember.material as THREE.MeshPhysicalMaterial).emissive = new THREE.Color(0xff6a00);
    (ember.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.8; fire.add(ember);
    fire.position.set(-14, 0, -4); group.add(fire);
    const fireLight = new THREE.PointLight(0xff8a3a, 1.6, 20, 1.8); fireLight.position.set(-14, 2.4, -4); group.add(fireLight);
    ctx.addObstacle(-14, -4, 2, 2);

    for (let i = 0; i < 5; i++) { const bx = 16 + (i % 2) * 2.2, bz = 2 + i * 2.4; group.add(brickBox(plastic, 2, 2, 2, i % 2 ? BrickPalette.BROWN : BrickPalette.DARK_SAND, bx, 1, bz)); ctx.addObstacle(bx, bz, 1, 1); }
    for (let x = -30; x <= 30; x += 2.4) group.add(brickBox(plastic, 0.5, 3, 0.5, BrickPalette.DARK_BROWN, x, 1.5, 26));
    [[-26, 10], [26, 12]].forEach(([x, z]) => { group.add(buildPalm(plastic, x, z, 9)); ctx.addObstacle(x, z, 1, 1); });

    // los DOS espías (de campamento), al frente de la tienda
    const spyA = new Npc(plastic, ESPIA1_CAMP, -4, 2, Math.PI);
    const spyB = new Npc(plastic, ESPIA2_CAMP, 4, 2, Math.PI);
    group.add(spyA.root, spyB.root);

    // aldeanos deambulando
    const life = new Wanderers(plastic, [ESPIA1_CAMP, ESPIA2_CAMP], 4, { minX: -26, maxX: 26, minZ: -10, maxZ: -2 });
    group.add(life.group);

    const gems = new Collectibles(plastic, ctx.sound, [{ x: -6, z: -8 }, { x: 6, z: -6 }, { x: -8, z: 0 }, { x: 8, z: -2 }, { x: 0, z: -4 }]);
    group.add(gems.group);

    ctx.scene.add(group);

    let greetA = false, greetB = false;
    return {
      group,
      update(dt, t, player) {
        ember.scale.y = 1 + Math.sin(t * 9) * 0.25; fireLight.intensity = 1.6 + Math.sin(t * 9) * 0.4;
        if (!greetA && Math.hypot(player.x - (-4), player.z - 2) < 3.5) { greetA = true; spyA.lookAt(player.x, player.z); ctx.sound.pickup(); }
        if (!greetB && Math.hypot(player.x - 4, player.z - 2) < 3.5) { greetB = true; spyB.lookAt(player.x, player.z); ctx.sound.pickup(); }
        if (greetA) spyA.lookAt(player.x, player.z);
        if (greetB) spyB.lookAt(player.x, player.z);
        spyA.update(dt); spyB.update(dt); life.update(dt); gems.update(dt, t, player);
      },
      status() {
        const n = (greetA ? 1 : 0) + (greetB ? 1 : 0);
        return n < 2 ? `🗣️ Espías reclutados: ${n}/2` : null;
      },
      hud() { return { progress: ((greetA ? 1 : 0) + (greetB ? 1 : 0)) / 2, gems: { got: gems.got, total: gems.total } }; },
      isDone() { return greetA && greetB; }
    };
  }
};
