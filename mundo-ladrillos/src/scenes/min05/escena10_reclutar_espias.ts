import * as THREE from 'three';
import { Min05Scene, SceneContext, SceneInstance } from './types';
import { BrickPalette } from '../../materials/BrickPalette';
import { buildTent, buildPalm, studdedPlate, brickBox, buildBarrel, buildRock } from './props/BrickProps';
import { buildBanner } from './props/NightAmbience';
import { Npc } from './props/Npc';
import { Wanderers } from './props/Wanderers';
import { Collectibles } from './props/Collectibles';
import { buildRug, KILIM_PALS } from '../min00/textiles';
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
  subtitulo: '«Necesito hombres discretos y valientes que vayan a espiar Jericó, la primera ciudad que vamos a conquistar.»',
  jugador: 'yoshua',
  ambiente: 'day',
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
    // alfombra de kilim en el suelo de la tienda (detalle "de verdad", técnica del lead/muñequero)
    const rug = buildRug(9, 6.5, KILIM_PALS[0]); rug.position.set(0, 0.03, 9); group.add(rug);

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
    // trípode + puchero sobre la hoguera y troncos para sentarse (vida de campamento)
    for (const a of [0, 2.1, 4.2]) group.add(brickBox(plastic, 0.28, 3.4, 0.28, BrickPalette.DARK_BROWN, -14 + Math.cos(a) * 1.5, 1.7, -4 + Math.sin(a) * 1.5));
    group.add(brickBox(plastic, 1.6, 1.3, 1.6, BrickPalette.DARK_GRAY, -14, 1.4, -4));      // puchero
    for (const [lx, lz] of [[-18, -4], [-14, -8], [-10, -3]] as const) group.add(brickBox(plastic, 2.2, 0.7, 0.8, BrickPalette.BROWN, lx, 0.35, lz)); // troncos

    // === P2: MÁS VIDA DE CAMPAMENTO (menos desangelado) ===
    // dos tiendas laterales más pequeñas
    const t2 = buildTent(plastic, BrickPalette.BROWN, 9, 8); t2.position.set(-24, 0, 8); t2.rotation.y = Math.PI * 0.7; group.add(t2); ctx.addObstacle(-24, 8, 4, 3);
    const t3 = buildTent(plastic, BrickPalette.DARK_SAND, 8, 7); t3.position.set(23, 0, 10); t3.rotation.y = -Math.PI * 0.7; group.add(t3); ctx.addObstacle(23, 10, 4, 3);
    // estandartes en postes (color, movimiento visual del campamento)
    for (const [bx, bz, col] of [[-7, 6, BrickPalette.DARK_RED], [7, 6, BrickPalette.DARK_BLUE], [-10, 14, BrickPalette.WARM_SAND]] as const) {
      const b = buildBanner(plastic, col, 1.4, 4.2); b.position.set(bx, 4, bz); group.add(b);
    }
    // barriles, ánforas y sacos repartidos (con colisión suave en los grandes)
    for (const [bx, bz] of [[-20, -2], [-18, 2], [20, 4], [18, -2]] as const) { const br = buildBarrel(plastic); br.position.set(bx, 0, bz); group.add(br); ctx.addObstacle(bx, bz, 1, 1); }
    for (const [sx, sz, col] of [[-9, -6, BrickPalette.SAND], [9, -5, BrickPalette.WARM_SAND], [12, 4, BrickPalette.TAN]] as const) group.add(brickBox(plastic, 1.6, 1.1, 1.2, col, sx, 0.55, sz)); // sacos
    // alfombrilla de color junto a la hoguera
    const rug2 = buildRug(5, 3.5, KILIM_PALS[1] ?? KILIM_PALS[0]); rug2.position.set(-14, 0.03, 1); group.add(rug2);

    // === REGLA Nº1: VESTIR el ARENAL exterior (el anillo del desierto no puede quedar pelado) ===
    // rocas dispersas por el desierto (con colisión)
    for (const [rx, rz, s] of [[-28, -18, 1.3], [27, -20, 1.0], [-30, 14, 1.1], [29, 20, 1.2], [-24, 24, 0.9], [22, 27, 0.8], [-8, -22, 0.7], [11, -24, 0.9]] as const) { const rk = buildRock(plastic, s); rk.position.set(rx, 0, rz); group.add(rk); ctx.addObstacle(rx, rz, 1.5 * s, 1.3 * s); }
    // matojos secos del desierto: grupitos bajos verdosos (sin luz, sin colisión)
    for (const [mx, mz] of [[-26, -8], [26, -6], [-16, 22], [16, 24], [4, -20], [-6, 26], [24, 12]] as const) {
      for (let k = 0; k < 3; k++) group.add(brickBox(plastic, 0.7, 0.6 + (k % 2) * 0.4, 0.7, k % 2 ? 0x6f7a3a : 0x566a2e, mx + (k - 1) * 0.7, 0.35, mz + (k % 2)));
    }
    // palmeras en grupos (oasis) por las esquinas
    for (const [px, pz] of [[-29, -6], [-27, -10], [28, 8], [30, 12], [-22, 26], [24, -14]] as const) group.add(buildPalm(plastic, px, pz, 8 + ((px + pz + 60) % 3)));
    // tiendas lejanas al fondo (el campamento continúa) + corral de estacas
    const t4 = buildTent(plastic, BrickPalette.WARM_SAND, 7, 6); t4.position.set(-10, 0, 24); t4.rotation.y = Math.PI * 0.9; group.add(t4); ctx.addObstacle(-10, 24, 3.5, 2.5);
    const t5 = buildTent(plastic, BrickPalette.BROWN, 6, 6); t5.position.set(13, 0, 26); t5.rotation.y = -Math.PI * 0.8; group.add(t5); ctx.addObstacle(13, 26, 3, 2.5);
    for (let a = 0; a < 10; a++) { const ang = (a / 10) * Math.PI * 2; group.add(brickBox(plastic, 0.25, 1.4, 0.25, BrickPalette.DARK_BROWN, 24 + Math.cos(ang) * 3.4, 0.7, 20 + Math.sin(ang) * 3.4)); } // corral
    // más aldeanos repartidos al fondo (gentío lite, instanciado)
    const life2 = new Wanderers(plastic, [ESPIA1_CAMP, ESPIA2_CAMP], 3, { minX: -20, maxX: -6, minZ: 16, maxZ: 26 });
    group.add(life2.group);

    for (let i = 0; i < 5; i++) { const bx = 16 + (i % 2) * 2.2, bz = 2 + i * 2.4; group.add(brickBox(plastic, 2, 2, 2, i % 2 ? BrickPalette.BROWN : BrickPalette.DARK_SAND, bx, 1, bz)); ctx.addObstacle(bx, bz, 1, 1); }
    for (let x = -30; x <= 30; x += 2.4) group.add(brickBox(plastic, 0.5, 3, 0.5, BrickPalette.DARK_BROWN, x, 1.5, 26));
    [[-26, 10], [26, 12]].forEach(([x, z]) => { group.add(buildPalm(plastic, x, z, 9)); ctx.addObstacle(x, z, 1, 1); });

    // los DOS espías (de campamento), al frente de la tienda
    const spyA = new Npc(plastic, ESPIA1_CAMP, -4, 2, Math.PI);
    const spyB = new Npc(plastic, ESPIA2_CAMP, 4, 2, Math.PI);
    group.add(spyA.root, spyB.root);

    // aldeanos deambulando (más gente = campamento vivo)
    const villager = { head: 0xf2c141, torso: 0x6f7a52, belt: 0x4a5030, legs: 0x556040, arms: 0x66703f, hands: 0xf2c141, headwear: 0xa9b088, headStyle: 'turban' as const };
    const life = new Wanderers(plastic, [ESPIA1_CAMP, ESPIA2_CAMP, villager], 7, { minX: -26, maxX: 26, minZ: -10, maxZ: 4 });
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
        spyA.update(dt); spyB.update(dt); life.update(dt); life2.update(dt); gems.update(dt, t, player);
      },
      status() {
        const n = (greetA ? 1 : 0) + (greetB ? 1 : 0);
        return n < 2 ? `🗣️ Espías reclutados: ${n}/2` : null;
      },
      hud() {
        // objetivo dinámico: guía al siguiente espía por saludar (marcador y QA)
        const goal: [number, number] | undefined = !greetA ? [-4, 2] : (!greetB ? [4, 2] : undefined);
        return { progress: ((greetA ? 1 : 0) + (greetB ? 1 : 0)) / 2, goal, prompt: goal ? '🗣️ Acércate al espía' : undefined, gems: { got: gems.got, total: gems.total } };
      },
      isDone() { return greetA && greetB; }
    };
  }
};
