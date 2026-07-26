import * as THREE from 'three';
import { Min05Scene, SceneContext, SceneInstance } from './types';
import { BrickPalette } from '../../materials/BrickPalette';
import { buildRiver, buildReeds, buildPalm, studdedPlate, buildDistantJericho, buildFish } from './props/BrickProps';
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
    // faroles en los postes de amarre + faroles a media travesía (P3: camino con luz)
    const lanterns = [
      buildLantern(plastic, 2.4, 5.5, -6), buildLantern(plastic, -2.4, 5.5, 14),
      buildLantern(plastic, 2.2, 5, 1), buildLantern(plastic, -2.2, 5, 8)
    ];
    lanterns.forEach((l) => group.add(l.group));

    // guía del centro móvil (P3: "pisa aquí" bien claro): aro brillante + galón que
    // bota encima, con el mismo lenguaje visual que la baliza de navegación.
    const guide = new THREE.Group(); guide.position.y = 0.5; group.add(guide);
    const guideRing = new THREE.Mesh(new THREE.RingGeometry(0.7, 1.15, 24), new THREE.MeshBasicMaterial({ color: 0x8fe0ff, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false }));
    guideRing.rotation.x = -Math.PI / 2; guide.add(guideRing);
    const guideChev = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.9, 4), new THREE.MeshBasicMaterial({ color: 0x8fe0ff }));
    guideChev.rotation.x = Math.PI; guideChev.position.y = 2.2; guide.add(guideChev);
    const guideMat = guideRing.material as THREE.MeshBasicMaterial;
    const guideChevMat = guideChev.material as THREE.MeshBasicMaterial;

    group.add(buildReeds(plastic, -18, -8, 10));
    group.add(buildReeds(plastic, 18, 16, 10));
    [[-22, -14], [22, 22]].forEach(([x, z]) => { group.add(buildPalm(plastic, x, z, 8)); });
    const jericho = buildDistantJericho(plastic, 80); jericho.position.set(0, 0, 40); group.add(jericho);

    const buddy = new Npc(plastic, ESPIA2_SIGILO, 0, 22, Math.PI); group.add(buddy.root);

    // PECES: el río está VIVO (nadan bajo la cuerda y de vez en cuando saltan).
    const fishCols = [BrickPalette.ORANGE, BrickPalette.YELLOW, BrickPalette.WHITE, 0x9fd0e8];
    interface Fish { g: THREE.Group; z: number; x: number; dir: number; speed: number; phase: number; jump: number; }
    const fishes: Fish[] = [];
    for (let i = 0; i < 7; i++) {
      const g = buildFish(plastic, fishCols[i % fishCols.length]);
      const fz = -4 + ((i * 2.7) % 16);
      const fx = -14 + ((i * 4.3) % 28);
      g.position.set(fx, 0.34, fz); g.scale.setScalar(0.85 + (i % 3) * 0.13);
      group.add(g);
      fishes.push({ g, z: fz, x: fx, dir: i % 2 ? 1 : -1, speed: 2.2 + (i % 3) * 0.7, phase: i * 1.3, jump: 0 });
    }
    let jumpTimer = 2.5;

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
        // peces: nadan de orilla a orilla serpenteando; uno salta cada pocos seg.
        jumpTimer -= dt;
        if (jumpTimer <= 0) { const f = fishes[Math.floor(t * 7) % fishes.length]; if (f.jump <= 0) f.jump = 0.95; jumpTimer = 3.5 + (Math.sin(t) + 1) * 2; }
        for (const f of fishes) {
          if (f.jump > 0) {
            f.jump -= dt; const k = 1 - f.jump / 0.95;
            f.g.position.y = 0.34 + Math.sin(THREE.MathUtils.clamp(k, 0, 1) * Math.PI) * 2.1;
            f.g.rotation.x = (f.dir > 0 ? -1 : 1) * Math.sin(k * Math.PI) * 0.5;
            if (f.jump <= 0) { f.g.position.y = 0.34; f.g.rotation.x = 0; }
          } else {
            f.x += f.dir * f.speed * dt;
            if (f.x > 16) { f.x = 16; f.dir = -1; } else if (f.x < -16) { f.x = -16; f.dir = 1; }
            f.g.position.set(f.x, 0.34, f.z + Math.sin(t * 1.2 + f.phase) * 0.5);
            f.g.rotation.y = f.dir > 0 ? 0 : Math.PI;
            f.g.rotation.z = Math.sin(t * 6 + f.phase) * 0.12;
          }
        }
        const r = rope.update(dt, t, player);
        onBridge = r.onSpan;
        balance = r.onSpan ? (player.x - r.centerX) / rope.safeMargin : 0;
        progress = THREE.MathUtils.clamp((player.z - (-6)) / 20, 0, 1);
        const gz = THREE.MathUtils.clamp(player.z, -6, 14);
        guide.position.set(r.onSpan ? r.centerX : 0, 0.5, gz);
        const gcol = r.nearMiss ? 0xffcc44 : 0x8fe0ff;
        guideMat.color.setHex(gcol); guideChevMat.color.setHex(gcol);
        guideChev.position.y = 2.2 + Math.sin(t * 4) * 0.3;   // bota: "pisa aquí"
        guideRing.scale.setScalar(1 + Math.sin(t * 4) * 0.1);
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
