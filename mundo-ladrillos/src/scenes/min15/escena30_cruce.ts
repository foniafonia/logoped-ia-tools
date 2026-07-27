import * as THREE from 'three';
import { Min15Scene, SceneContext, SceneInstance } from './types';
import { GuideBeacon } from './props/guide';
import { buildGround, buildPine, buildBush, buildMoonNight, buildPineRidge } from './props/wild';
import { buildRiver, buildFish, buildReeds, buildRock, buildTent } from '../min05/props/BrickProps';
import { createMinifigure, Minifigure } from '../../characters/MinifigureFactory';
import { ESPIA1_SIGILO, ESPIA2_SIGILO } from '../min05/skins';
import { BrickPalette } from '../../materials/BrickPalette';

/**
 * ESCENA 30 (17:17) — EL CRUCE DE VUELTA DEL JORDÁN (huida, latido 2 de 3).
 * Pasados los tres días, los espías bajan del monte y CRUZAN de vuelta el río para
 * volver con Josué (Josué 2:23). ⚠️ Este es el cruce PEQUEÑO de la huida (dos
 * hombres saltando de piedra en piedra), NO el gran milagro de las aguas partidas
 * (esc. 34 = tramo 20–25). No lo toco.
 *
 * MINI-JUEGO (cruzar): el niño salta de PIEDRA en PIEDRA de la orilla de Jericó
 * (oeste) a la orilla de Israel (este), donde brillan las fogatas del campamento.
 * Las piedras se hunden un poco al pisarlas y suena un chapoteo; al llegar a la
 * otra orilla, el compañero le espera. Guiado con la baliza, siempre claro.
 */
export const escena30: Min15Scene = {
  id: 'm15_30_cruce',
  numero: 30,
  mundo: 'monte',
  titulo: 'El cruce de vuelta del Jordán',
  subtitulo: 'Salta de piedra en piedra para cruzar el río de vuelta a la orilla de Israel, donde espera el campamento.',
  jugador: 'spy',
  noche: true,
  ambiente: 'river',
  spawn: { x: -17, z: 2 },
  objetivo: { tipo: 'cruzar', texto: 'Cruza el río hasta la orilla de Israel', target: { x: 17, z: 0 }, radio: 2.6 },
  exito: '¡A la otra orilla! Los espías vuelven con los suyos.',
  camara: { yaw: 0, pitch: 0.26, dist: 24 },
  intro: {
    from: { x: -24, y: 9, z: 22 }, to: { x: -16, y: 6, z: 15 },
    lookFrom: { x: 0, y: 1, z: 0 }, lookTo: { x: 17, y: 1, z: 0 }, seconds: 3.0
  },

  build(ctx: SceneContext): SceneInstance {
    const group = new THREE.Group();
    const P = ctx.plastic;

    group.add(buildGround(P, 0x2c5a30));
    group.add(buildMoonNight(P));
    group.add(buildPineRidge(P, -24, 10));

    // --- EL RÍO: franja vertical (corre en Z) que se cruza de oeste a este ---
    const river = buildRiver(P, 15, 48, 0, 3);
    group.add(river.group);
    // juncos en las dos orillas
    for (const [x, z] of [[-9, -6], [-9.5, 6], [-9, 12], [9.5, -5], [9, 7], [9.5, 13]]) group.add(buildReeds(P, x, z, 7));
    // pececillos que nadan/saltan (vida del río)
    const fishes: Array<{ f: THREE.Group; base: number; ph: number }> = [];
    for (let i = 0; i < 4; i++) {
      const f = buildFish(P, [BrickPalette.ORANGE, BrickPalette.SILVER, BrickPalette.YELLOW][i % 3]);
      f.position.set(-4 + i * 2.5, 0.4, -6 + i * 4); f.scale.setScalar(0.8); group.add(f);
      fishes.push({ f, base: -6 + i * 4, ph: i * 1.7 });
    }

    // --- PIEDRAS de paso (de orilla oeste a este) ---
    const stoneXs = [-13, -9.5, -6, -2.5, 1, 4.5, 8, 11.5, 14.5];
    const stones: THREE.Group[] = [];
    stoneXs.forEach((x, i) => {
      const s = buildRock(P, 0.42 + (i % 2) * 0.08);
      const z = Math.sin(i * 0.9) * 1.4; // zigzag suave
      s.position.set(x, -0.35, z); group.add(s); stones.push(s);
    });

    // --- Orilla ESTE: campamento de Israel (fogatas cálidas al fondo) ---
    const camp = new THREE.Group(); camp.position.set(24, 0, 0); group.add(camp);
    camp.add(buildTent(P, BrickPalette.TAN, 8, 7, false).translateX(2));
    const t2 = buildTent(P, BrickPalette.WARM_SAND, 7, 6, false); t2.position.set(6, 0, -9); camp.add(t2);
    const t3 = buildTent(P, BrickPalette.SAND, 6, 6, false); t3.position.set(4, 0, 10); camp.add(t3);
    // resplandor cálido del campamento (emisivo, sin PointLight → móvil-friendly)
    for (const [x, z] of [[0, 0], [4, -8], [3, 9]]) {
      const glow = new THREE.Mesh(new THREE.SphereGeometry(1.1, 12, 10),
        new THREE.MeshBasicMaterial({ color: 0xffb257, toneMapped: false, transparent: true, opacity: 0.85 }));
      glow.position.set(x, 1.1, z); camp.add(glow);
    }
    group.add(buildPine(P, 20, -14, 1.6)); group.add(buildPine(P, 22, 14, 1.5));

    // pinos y matas de la orilla oeste (de donde vienen)
    for (const [x, z, s] of [[-20, -10, 1.6], [-16, 13, 1.4], [-22, 4, 1.3]] as Array<[number, number, number]>) {
      group.add(buildPine(P, x, z, s)); ctx.addObstacle(x, z, 0.9, 0.9);
    }
    for (const [x, z] of [[-18, -4], [-15, 8]]) group.add(buildBush(P, x, z, 1));

    // compañero que cruza por delante y espera en la orilla este
    const buddy: Minifigure = createMinifigure(P, ESPIA2_SIGILO);
    buddy.root.position.set(17.5, 0, 1.6); buddy.root.rotation.y = -Math.PI / 2; group.add(buddy.root);

    const o = escena30.objetivo.target!;
    const beacon = new GuideBeacon(o.x, o.z, {});
    group.add(beacon.group);

    ctx.scene.add(group);

    let doneFlag = false, arriveT = 0, lastStone = -1;
    const R = escena30.objetivo.radio ?? 2.6;

    return {
      group,
      update(dt, t, player): void {
        beacon.update(t);
        river.update(t);
        buddy.update(dt, false);

        // pececillos nadan y de vez en cuando saltan
        for (const fo of fishes) {
          fo.f.position.x = Math.sin(t * 0.5 + fo.ph) * 3;
          const jump = Math.max(0, Math.sin(t * 0.8 + fo.ph));
          fo.f.position.y = 0.35 + jump * jump * 1.2;
          fo.f.rotation.z = Math.cos(t * 0.8 + fo.ph) * 0.5;
        }

        // las piedras botan suavemente; la más cercana al niño se hunde un pelín
        let nearIdx = -1, nd = 99;
        stones.forEach((s, i) => {
          s.position.y = -0.6 + Math.sin(t * 1.2 + i) * 0.04;
          const d = Math.hypot(player.x - s.position.x, player.z - s.position.z);
          if (d < nd) { nd = d; nearIdx = i; }
        });
        if (nearIdx >= 0 && nd < 1.6) {
          stones[nearIdx].position.y -= 0.22; // se hunde al pisarla
          if (nearIdx !== lastStone) { lastStone = nearIdx; ctx.sound.splash?.(); }
        }

        // llegada a la orilla este
        if (!doneFlag && Math.hypot(player.x - o.x, player.z - o.z) < R) {
          arriveT += dt;
          buddy.root.rotation.y = -Math.PI / 2 + Math.sin(t * 3) * 0.3; // saluda
          if (arriveT > 0.7) doneFlag = true;
        }
      },
      status(): string | null {
        const p = ctx.getPlayer();
        if (Math.hypot(p.x - o.x, p.z - o.z) < R) return '🎉 ¡A la otra orilla!';
        if (Math.abs(p.x) < 8) return '🪨 De piedra en piedra… ¡no te mojes!';
        return '🌊 Cruza el río saltando por las piedras';
      },
      hud() {
        const p = ctx.getPlayer();
        // progreso = avance de oeste (-17) a este (+17)
        return { progress: THREE.MathUtils.clamp((p.x - escena30.spawn.x) / (o.x - escena30.spawn.x), 0, 1) };
      },
      isDone(): boolean { return doneFlag; },
      dispose(): void {
        beacon.dispose();
        group.traverse((obj) => { const m = obj as THREE.Mesh; if (m.geometry) m.geometry.dispose(); });
      }
    };
  }
};
