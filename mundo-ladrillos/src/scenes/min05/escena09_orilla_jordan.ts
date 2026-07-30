import * as THREE from 'three';
import { Min05Scene, SceneContext, SceneInstance } from './types';
import { BrickPalette } from '../../materials/BrickPalette';
import {
  buildRiver, buildPalm, buildBoat, buildReeds, buildRock, buildDistantJericho, studdedPlate, brickBox, buildTent, buildBarrel
} from './props/BrickProps';
import { buildBanner } from './props/NightAmbience';
import { Npc } from './props/Npc';
import { Wanderers } from './props/Wanderers';
import { Collectibles } from './props/Collectibles';
import { buildRiverbank } from '../../world/Riverbank';
import { ESPIA1_CAMP, ESPIA2_CAMP } from './skins';

/**
 * ESCENA 9 (307–340s) — ORILLA DEL JORDÁN.
 * Yehoshúa (jugador) contempla el río y, al otro lado, Jericó. Mundo 3D de
 * ladrillo con VIDA: río animado con peces de colores, soldados que deambulan,
 * palmeras, barca y juncos. Objetivo: subir al promontorio para contemplar el
 * río. (Modo campamento: los espías aún NO van de sigilo.)
 */
export const escena09: Min05Scene = {
  id: 'm05_09_orilla_jordan',
  numero: 9,
  titulo: 'Orilla del Jordán',
  subtitulo: 'Frente a ellos, el poderoso río Jordán; más allá, la tierra que Hashem prometió a sus antepasados.',
  jugador: 'yoshua',
  ambiente: 'river',
  spawn: { x: -8, z: -14 },
  objetivo: { tipo: 'ir_a', texto: 'Sube al promontorio y otea Jericó al otro lado (E)', target: { x: 6, z: 5 }, radio: 3.5 },
  exito: 'Yehoshúa observa Jericó al otro lado del río',
  camara: { yaw: Math.PI + 0.2, pitch: 0.34, dist: 32 },
  // establecimiento: la cámara recorre el río hasta Jericó y baja a Yehoshúa
  intro: {
    from: { x: 0, y: 10, z: 22 }, lookFrom: { x: 0, y: 6, z: 50 },
    to: { x: -8, y: 12, z: -44 }, lookTo: { x: -8, y: 3, z: -14 }, seconds: 4
  },

  build(ctx: SceneContext): SceneInstance {
    const { plastic } = ctx;
    const group = new THREE.Group();

    const shore = studdedPlate(plastic, 80, 34, BrickPalette.WARM_SAND, false);
    shore.position.set(0, -0.4, -5); group.add(shore);

    const river = buildRiver(plastic, 90, 26, 0, 23); group.add(river.group);

    const farShore = studdedPlate(plastic, 100, 20, BrickPalette.SAND, false);
    farShore.position.set(0, -0.4, 44); group.add(farShore);
    const jericho = buildDistantJericho(plastic, 96); jericho.position.set(0, 0, 50); group.add(jericho);

    // peces de colores en el río (guiño al plano del Jordán partido)
    const fish: THREE.Mesh[] = [];
    const fishCol = [0xe8801e, 0xf0b429, 0x4c9e5e, 0xb62b2b, 0x1f6fb2];
    for (let i = 0; i < 14; i++) {
      const f = brickBox(plastic, 1.1, 0.6, 0.4, fishCol[i % fishCol.length], 0, 0.6, 0);
      f.userData.bx = -38 + (i * 6) % 76; f.userData.bz = 14 + (i * 13) % 20; f.userData.ph = i;
      group.add(f); fish.push(f);
    }

    // vegetación + props (con colisión)
    const palms: Array<[number, number]> = [[-20, -8], [22, -12], [16, 2]];
    palms.forEach(([x, z], i) => { group.add(buildPalm(plastic, x, z, 8 + i)); ctx.addObstacle(x, z, 1, 1); });
    // ribera exuberante a lo largo del agua (helper del muñequero): juncos,
    // espadañas y rocas esparcidos por la orilla, para que no quede pelada.
    group.add(buildRiverbank(plastic, { ax: -34, az: 10, bx: 34, bz: 10, clumps: 9, jitter: 1.6, seed: 5 }));
    const reeds = buildReeds(plastic, -10, 9, 11);
    group.add(reeds);

    // VIDA AÑADIDA: pequeños vecinos de la ribera. Son pocos, baratos y no
    // participan en colisiones: rellenan el plano sin competir con el objetivo.
    const birds: Array<{ root: THREE.Group; left: THREE.Mesh; right: THREE.Mesh; speed: number; phase: number }> = [];
    for (let i = 0; i < 3; i++) {
      const root = new THREE.Group();
      const left = brickBox(plastic, 1.2, 0.16, 0.42, BrickPalette.DARK_GRAY, -0.7, 0, 0);
      const right = brickBox(plastic, 1.2, 0.16, 0.42, BrickPalette.DARK_GRAY, 0.7, 0, 0);
      root.add(left, right);
      root.position.set(-24 - i * 9, 15 + i * 2, 28 + i * 4);
      root.scale.setScalar(0.65 + i * 0.08);
      group.add(root);
      birds.push({ root, left, right, speed: 3.8 + i * 0.8, phase: i * 1.7 });
    }

    const frogs: Array<{ root: THREE.Group; phase: number }> = [];
    for (const [x, z, phase] of [[-5, 9.2, 0.4], [4, 10.4, 2.1]] as const) {
      const root = new THREE.Group();
      root.add(brickBox(plastic, 1.1, 0.55, 0.9, BrickPalette.GREEN, 0, 0.3, 0));
      root.add(brickBox(plastic, 0.72, 0.4, 0.72, BrickPalette.GREEN, 0, 0.75, -0.12));
      root.add(brickBox(plastic, 0.14, 0.14, 0.14, BrickPalette.WHITE, -0.22, 0.98, -0.48));
      root.add(brickBox(plastic, 0.14, 0.14, 0.14, BrickPalette.WHITE, 0.22, 0.98, -0.48));
      root.position.set(x, 0, z);
      group.add(root);
      frogs.push({ root, phase });
    }

    const dragonflies: Array<{ root: THREE.Group; phase: number }> = [];
    for (const [x, y, z, phase] of [[-9, 4.2, 7, 0.2], [-1, 3.4, 11, 2.4]] as const) {
      const root = new THREE.Group();
      root.add(brickBox(plastic, 0.18, 0.9, 0.18, BrickPalette.DARK_BLUE, 0, 0, 0));
      root.add(brickBox(plastic, 0.8, 0.08, 0.28, 0x8fd3e8, -0.46, 0.1, 0));
      root.add(brickBox(plastic, 0.8, 0.08, 0.28, 0x8fd3e8, 0.46, 0.1, 0));
      root.position.set(x, y, z);
      group.add(root);
      dragonflies.push({ root, phase });
    }

    const boat = buildBoat(plastic); boat.position.set(-16, 0, 6); boat.rotation.y = 0.5; group.add(boat);
    ctx.addObstacle(-16, 6, 2, 4);
    const rock = buildRock(plastic, 1.1); rock.position.set(6, 0, 6); group.add(rock);
    ctx.addObstacle(6, 6, 2.5, 2);

    // === P2: MÁS VIDA / BELLEZA (menos desangelado) ===
    // campamento israelita a la IZQUIERDA (lejos del promontorio en x=6): tienda,
    // hoguera, estandartes y barriles. Da sensación de "el pueblo acampado".
    const camp = buildTent(plastic, BrickPalette.DARK_RED, 11, 9); camp.position.set(-26, 0, -16); camp.rotation.y = 0.5; group.add(camp); ctx.addObstacle(-26, -16, 5, 4);
    const fire = new THREE.Group();
    for (let a = 0; a < 8; a++) { const ang = (a / 8) * Math.PI * 2; fire.add(brickBox(plastic, 0.7, 0.5, 0.7, BrickPalette.DARK_GRAY, Math.cos(ang) * 1.4, 0.25, Math.sin(ang) * 1.4)); }
    const ember = brickBox(plastic, 1.2, 0.5, 1.2, BrickPalette.ORANGE, 0, 0.6, 0);
    (ember.material as THREE.MeshPhysicalMaterial).emissive = new THREE.Color(0xff6a00);
    (ember.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.7; fire.add(ember);
    fire.position.set(-18, 0, -12); group.add(fire); ctx.addObstacle(-18, -12, 1.6, 1.6);
    for (const [bx, bz, col] of [[-22, -18, BrickPalette.DARK_RED], [-30, -13, BrickPalette.WARM_SAND]] as const) { const b = buildBanner(plastic, col, 1.3, 4); b.position.set(bx, 4, bz); group.add(b); }
    for (const [bx, bz] of [[-14, -14], [-21, -9], [-12, -18]] as const) { const br = buildBarrel(plastic); br.position.set(bx, 0, bz); group.add(br); ctx.addObstacle(bx, bz, 1, 1); }
    // NENÚFARES y flores de loto en el agua (belleza del río)
    for (const [lx, lz, hasFlower] of [[-24, 16, 1], [-8, 20, 0], [10, 15, 1], [24, 22, 0], [-16, 26, 1], [18, 30, 0], [2, 24, 1]] as const) {
      group.add(brickBox(plastic, 2.2, 0.12, 2.2, 0x2f7d4f, lx, 0.55, lz));                 // hoja
      if (hasFlower) { const fl = brickBox(plastic, 0.8, 0.5, 0.8, 0xf3b6d6, lx, 0.85, lz); (fl.material as THREE.MeshPhysicalMaterial).emissive = new THREE.Color(0x3a1020); group.add(fl); }
    }
    // más palmeras al fondo para enmarcar
    for (const [px, pz, ph] of [[-34, -20, 10], [30, -18, 11], [-30, 4, 9]] as const) { group.add(buildPalm(plastic, px, pz, ph)); ctx.addObstacle(px, pz, 1, 1); }

    // soldados israelitas deambulando (modo campamento) + los dos futuros espías
    const life = new Wanderers(plastic, [ESPIA1_CAMP, ESPIA2_CAMP, {
      head: 0xf2c141, torso: 0x6f7a52, belt: 0x4a5030, legs: 0x556040, arms: 0x66703f, hands: 0xf2c141, headwear: 0xa9b088, headStyle: 'turban'
    }], 8, { minX: -32, maxX: -8, minZ: -22, maxZ: -4 });
    group.add(life.group);
    const g1 = new Npc(plastic, ESPIA1_CAMP, -2, -20, -0.2); g1.lookAt(6, 20); group.add(g1.root);

    // gemas por el camino (premio)
    const gems = new Collectibles(plastic, ctx.sound, [{ x: -6, z: -8 }, { x: 2, z: -6 }, { x: -2, z: 0 }, { x: 8, z: -2 }, { x: 0, z: -12 }]);
    group.add(gems.group);

    // === REGLA Nº1: vestir el ARENAL de la orilla (bordes y frente, sin tocar el agua ni el promontorio) ===
    for (const [rx, rz, s] of [[-32, -16, 1.2], [33, -13, 1.0], [31, 2, 0.9], [-15, -19, 0.8], [17, -18, 0.9], [24, 8, 0.7]] as const) { const rk = buildRock(plastic, s); rk.position.set(rx, 0, rz); group.add(rk); ctx.addObstacle(rx, rz, 1.5 * s, 1.3 * s); }
    for (const [mx, mz] of [[28, -4], [20, -12], [-6, -18], [10, -16], [30, 6]] as const) { for (let k = 0; k < 3; k++) group.add(brickBox(plastic, 0.7, 0.6 + (k % 2) * 0.4, 0.7, k % 2 ? 0x6f7a3a : 0x566a2e, mx + (k - 1) * 0.7, 0.35, mz + (k % 2))); }
    for (const [px, pz] of [[34, -10], [31, -13], [-34, -8]] as const) group.add(buildPalm(plastic, px, pz, 8 + ((px + pz + 60) % 3)));
    for (const [bx, bz] of [[12, 7], [-9, 8]] as const) { const br = buildBarrel(plastic); br.position.set(bx, 0, bz); group.add(br); }

    ctx.scene.add(group);

    // CONVERSACIÓN de contemplación del Jordán (helper de diálogo compartido del LEAD).
    // Yehoshúa contempla la tierra prometida; su compañero pregunta. Frases fieles a la
    // peli (0:54), auto-avance para que suene sola sobre el plano de establecimiento.
    const AZUL = 0x6f9fc4;
    ctx.say?.('Frente a nosotros, el poderoso río Jordán; más allá, la tierra que Hashem prometió a nuestros antepasados.', 'Yehoshúa', 4.6);
    ctx.say?.('¿Cruzaremos pronto, Yehoshúa?', 'Compañero', 2.8, AZUL);
    ctx.say?.('Pronto. Pero antes debemos conocer la tierra: sube al promontorio y otea Jericó.', 'Yehoshúa', 4.2);

    const start = new THREE.Vector2(escena09.spawn.x, escena09.spawn.z);
    const tgt = new THREE.Vector2(escena09.objetivo.target!.x, escena09.objetivo.target!.z);
    const total = start.distanceTo(tgt);
    const radio = escena09.objetivo.radio ?? 3.5;
    let observed = false; // Yehoshúa ya ha oteado Jericó (verbo: pulsar E arriba)
    return {
      group,
      update(dt, t, player) {
        river.update(t);
        for (const f of fish) {
          const s = Math.sin(t * 0.8 + f.userData.ph);
          f.position.set(f.userData.bx + s * 6, 0.5 + Math.sin(t * 3 + f.userData.ph) * 0.15, f.userData.bz + Math.cos(t * 0.6 + f.userData.ph) * 2);
          f.rotation.y = s > 0 ? 0.4 : -0.4 + Math.PI;
        }
        reeds.rotation.z = Math.sin(t * 1.4) * 0.025;
        for (const bird of birds) {
          bird.root.position.x += bird.speed * dt;
          if (bird.root.position.x > 30) bird.root.position.x = -32;
          bird.root.position.y += Math.sin(t * 1.8 + bird.phase) * 0.006;
          const flap = Math.sin(t * 8 + bird.phase) * 0.45;
          bird.left.rotation.z = flap; bird.right.rotation.z = -flap;
        }
        for (const frog of frogs) {
          const hop = Math.max(0, Math.sin(t * 2.2 + frog.phase)) ** 8;
          frog.root.position.y = hop * 0.75;
          frog.root.rotation.z = Math.sin(t * 2.2 + frog.phase) * hop * 0.12;
        }
        for (const dragonfly of dragonflies) {
          dragonfly.root.position.x += Math.sin(t * 1.5 + dragonfly.phase) * dt * 0.8;
          dragonfly.root.position.y += Math.sin(t * 2.4 + dragonfly.phase) * dt * 0.45;
          dragonfly.root.rotation.y = Math.sin(t * 1.3 + dragonfly.phase) * 0.35;
          dragonfly.root.rotation.z = Math.sin(t * 11 + dragonfly.phase) * 0.2;
        }
        life.update(dt); g1.update(dt); gems.update(dt, t, player);
        // VERBO: en el promontorio, pulsa E para otear Jericó (la cámara cruza el
        // río hasta la fortaleza y vuelve). Refuerza "Yehoshúa contempla Jericó".
        const near = Math.hypot(player.x - tgt.x, player.z - tgt.y) < radio;
        if (near && !observed && ctx.wantsInteract()) {
          observed = true;
          ctx.sound.success();
          ctx.cameraReveal?.(
            { x: 4, y: 7.5, z: 2 }, { x: 0, y: 9, z: 9 },
            { x: 0, y: 5, z: 26 }, { x: 0, y: 9, z: 50 }, 2.8
          );
        }
      },
      status() { return observed ? '🔭 Yehoshúa contempla Jericó al otro lado' : null; },
      hud() {
        const p = ctx.getPlayer();
        const near = Math.hypot(p.x - tgt.x, p.z - tgt.y) < radio;
        const d = Math.hypot(p.x - tgt.x, p.z - tgt.y);
        return { progress: THREE.MathUtils.clamp(1 - d / total, 0, 1), gems: { got: gems.got, total: gems.total }, prompt: (near && !observed) ? '🔭 Pulsa E para otear Jericó al otro lado' : undefined };
      },
      isDone() { return observed; }
    };
  }
};
