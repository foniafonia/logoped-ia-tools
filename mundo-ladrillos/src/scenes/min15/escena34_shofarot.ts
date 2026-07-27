import * as THREE from 'three';
import { Min15Scene, SceneContext, SceneInstance } from './types';
import { GuideBeacon, makeBubble } from './props/guide';
import { buildGround, buildMoonNight, buildPine } from './props/wild';
import { buildTent } from '../min05/props/BrickProps';
import { buildBanner } from '../min05/props/NightAmbience';
import { buildFirePit, buildCrateStack, buildSackPile } from '../../world/Clutter';
import { createMinifigure, Minifigure, villagerSkin, PRIEST_SKIN } from '../../characters/MinifigureFactory';
import { BrickPalette } from '../../materials/BrickPalette';

/**
 * ESCENA 34 (peli 20:14 / escena_33) — EL TALLER DE LOS SHOFAROT (cierre del tramo).
 * El Sacerdote (Cohen) reúne a los levitas en una carpa y ordena preparar los
 * Shofarot de cuerno (biblia peli.json escena_33): «montaje de sacerdotes tallando,
 * puliendo y lijando los cuernos curvos… escena cómica de un carnero que huye».
 * Transcripción: «Hermanos míos, preparen los chofarot» (12:16) + gag «a mí no me
 * dieron chofer» (12:39). 🚫 NO es el soplido del clímax (murallas 25–29): aquí solo
 * se PREPARAN los cuernos.
 *
 * MINI-JUEGO (recoger y entregar): el niño recoge los TRES shofarot recién tallados
 * de los bancos de los levitas (E) y se los lleva al Cohen (E). El Cohen los bendice
 * y prueba uno; entonces el carnero cómico cruza corriendo el taller (gag). Fin del
 * tramo 15–20: todo listo para la marcha (que ya es del 20–25).
 */
const BENCHES: Array<{ x: number; z: number }> = [{ x: -8, z: -4 }, { x: 0, z: 6 }, { x: 6, z: -4 }];
const COHEN = { x: 12, z: 0 };

/** Shofar: cuerno curvo beige (cilindros que se estrechan y curvan). */
function buildShofar(P: SceneContext['plastic'], s = 1): THREE.Group {
  const g = new THREE.Group();
  const col = [0xe9d6a8, 0xd8c193, 0xc7ad7a];
  let x = 0, y = 0, ang = 0;
  for (let i = 0; i < 5; i++) {
    const r = (0.16 - i * 0.022) * s;
    const len = 0.5 * s;
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.03 * s, len, 8), P.get(col[i % 3]));
    seg.rotation.z = Math.PI / 2 - ang;
    seg.position.set(x + Math.cos(ang) * len / 2, y + Math.sin(ang) * len / 2, 0);
    g.add(seg);
    x += Math.cos(ang) * len; y += Math.sin(ang) * len; ang += 0.5;
  }
  return g;
}

/** Carnero cómico de ladrillo (cuerpo lanudo + cuernos curvados + cara). Mira +x. */
function buildRam(P: SceneContext['plastic']): THREE.Group {
  const g = new THREE.Group();
  const wool = P.get(0xf0e9da), dark = P.get(0x8a7a5c);
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.9, 0.9), wool); body.position.y = 0.95; body.castShadow = true; g.add(body);
  // lana (bultitos)
  for (const [bx, bz] of [[-0.4, 0.3], [0.3, -0.3], [0, 0.35], [-0.3, -0.3]]) g.add(new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 6), wool).translateX(bx).translateY(1.15).translateZ(bz));
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.55), P.get(0xe0d6bf)); head.position.set(0.9, 1.05, 0); g.add(head);
  // cuernos curvados (dos toros parciales)
  for (const sz of [-0.22, 0.22]) { const h = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.06, 6, 10, Math.PI * 1.3), dark); h.position.set(0.95, 1.3, sz); h.rotation.y = Math.PI / 2; g.add(h); }
  // ojos
  for (const sz of [-0.16, 0.16]) g.add(new THREE.Mesh(new THREE.CircleGeometry(0.06, 8), new THREE.MeshBasicMaterial({ color: 0x101018 })).translateX(1.21).translateY(1.1).translateZ(sz));
  // patas
  for (const [lx, lz] of [[-0.5, 0.3], [0.5, 0.3], [-0.5, -0.3], [0.5, -0.3]]) g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.9, 6), dark).translateX(lx).translateY(0.45).translateZ(lz));
  return g;
}

export const escena34: Min15Scene = {
  id: 'm15_34_shofarot',
  numero: 34,
  mundo: 'taller',
  titulo: 'El taller de los shofarot',
  subtitulo: '«Hermanos míos, preparen los shofarot.» Recoge los tres cuernos tallados (E) y llévaselos al Cohen.',
  jugador: 'spy',
  noche: true,
  ambiente: 'night',
  spawn: { x: -14, z: 2 },
  objetivo: { tipo: 'ir_a', texto: 'Recoge los 3 shofarot y dáselos al Cohen (E)', target: { x: BENCHES[0].x, z: BENCHES[0].z }, radio: 2.4 },
  exito: '¡Shofarot listos! El Cohen los bendice. Todo preparado para la marcha.',
  camara: { yaw: 0, pitch: 0.42, dist: 26 },
  intro: {
    from: { x: -22, y: 11, z: 22 }, to: { x: -13, y: 6, z: 14 },
    lookFrom: { x: 6, y: 2, z: 0 }, lookTo: { x: 12, y: 2, z: 0 }, seconds: 3.0
  },

  build(ctx: SceneContext): SceneInstance {
    const group = new THREE.Group();
    const P = ctx.plastic;

    group.add(buildGround(P, 0x6a5334, 74, 54));
    group.add(buildMoonNight(P));

    // --- La CARPA-TALLER de los levitas (grande, abierta) + estandartes ---
    const carpa = buildTent(P, BrickPalette.WHITE, 16, 12, true);
    carpa.position.set(4, 0, -3); group.add(carpa);
    const banA = buildBanner(P, BrickPalette.DARK_BLUE, 1.4, 3.4); banA.position.set(-3.5, 4.6, 0); group.add(banA);
    const banB = buildBanner(P, BrickPalette.GOLD, 1.4, 3.4); banB.position.set(11.5, 4.6, 0); group.add(banB);
    // tiendas y enseres alrededor (Regla Nº1)
    const t2 = buildTent(P, BrickPalette.WARM_SAND, 7, 6, false); t2.position.set(-13, 0, -10); group.add(t2); ctx.addObstacle(-13, -10, 3.5, 3);
    const t3 = buildTent(P, BrickPalette.SAND, 6, 6, false); t3.position.set(-14, 0, 9); group.add(t3); ctx.addObstacle(-14, 9, 3, 3);
    group.add(buildCrateStack(P, { x: -6, z: 9, n: 2 })); ctx.addObstacle(-6, 9, 1, 1);
    group.add(buildSackPile(P, { x: 10, z: 8 })); ctx.addObstacle(10, 8, 1, 1);
    group.add(buildPine(P, -21, -6, 1.6)); group.add(buildPine(P, 21, -11, 1.5)); group.add(buildPine(P, -22, 12, 1.4));
    group.add(buildFirePit(P, { x: -6, z: 2 }));
    group.add(buildFirePit(P, { x: 9, z: -8 }));

    // --- 3 BANCOS de tallado, cada uno con un levita y un shofar tallándose ---
    const benchShofars: THREE.Group[] = [];
    const levites: Minifigure[] = [];
    BENCHES.forEach((b, i) => {
      const bench = new THREE.Group(); bench.position.set(b.x, 0, b.z); group.add(bench);
      bench.add(new THREE.Mesh(new THREE.BoxGeometry(2, 0.4, 1), P.get(BrickPalette.BROWN)).translateY(1.1));
      for (const sx of [-0.8, 0.8]) bench.add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.1, 6), P.get(BrickPalette.DARK_BROWN)).translateX(sx).translateY(0.55));
      const sh = buildShofar(P, 1.1); sh.position.set(0, 1.45, 0); sh.rotation.y = 0.4; bench.add(sh); benchShofars.push(sh);
      const lev = createMinifigure(P, villagerSkin(10 + i)); lev.root.position.set(0, 0, 1.1); lev.root.rotation.y = Math.PI; bench.add(lev.root); levites.push(lev);
      // virutas de tallado (Regla Nº1: rincón vivo)
      for (let k = 0; k < 4; k++) bench.add(new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.06), P.get(0xd8c193)).translateX((k - 1.5) * 0.3).translateY(0.92).translateZ(0.3));
    });

    // --- COHEN (sacerdote) al que se entregan los shofarot ---
    const cohen: Minifigure = createMinifigure(P, PRIEST_SKIN);
    cohen.root.position.set(COHEN.x, 0, COHEN.z); cohen.root.rotation.y = -Math.PI / 2; cohen.root.scale.setScalar(1.06); group.add(cohen.root);
    const cohenShofar = buildShofar(P, 1.3); cohenShofar.position.set(COHEN.x - 0.2, 3.0, COHEN.z + 0.4); cohenShofar.rotation.z = 0.5; cohenShofar.visible = false; group.add(cohenShofar);
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.9, 9, 12, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xffe9b0, transparent: true, opacity: 0.15, side: THREE.DoubleSide, depthWrite: false }));
    pillar.position.set(COHEN.x, 4.5, COHEN.z); group.add(pillar);
    const orderBubble = makeBubble('«Hermanos míos, ¡preparad los shofarot!» — el Cohen', { w: 8.2 });
    orderBubble.position.set(COHEN.x - 1.5, 6.2, COHEN.z); group.add(orderBubble);
    const gagBubble = makeBubble('«¡A mí no me dieron chofer!» 🐏', { w: 6 });
    gagBubble.position.set(3, 3.2, 8); gagBubble.visible = false; group.add(gagBubble);

    // --- CARNERO cómico que trota por el taller (gag; corre más al final) ---
    const ram = buildRam(P); ram.position.set(-6, 0, 9); group.add(ram);

    // shofar que el niño LLEVA (aparece al recoger el primero)
    const carried = buildShofar(P, 1); carried.visible = false; group.add(carried);

    const beacon = new GuideBeacon(BENCHES[0].x, BENCHES[0].z, { action: true });
    group.add(beacon.group);

    ctx.scene.add(group);

    type Phase = 'gather' | 'deliver' | 'done';
    let phase: Phase = 'gather';
    let got = 0, idx = 0, endT0 = 0;
    let doneFlag = false;
    const R = escena34.objetivo.radio ?? 2.4;

    return {
      group,
      update(dt, t, player): void {
        beacon.update(t);
        cohen.root.rotation.y = -Math.PI / 2 + Math.sin(t * 0.7) * 0.12; cohen.update(dt, false);
        pillar.material.opacity = 0.11 + Math.sin(t * 2) * 0.05;
        orderBubble.position.y = 6.2 + Math.sin(t * 3) * 0.1;
        for (const l of levites) l.update(dt, phase === 'gather', 0.4); // tallando
        benchShofars.forEach((s, i) => { s.rotation.y = 0.4 + Math.sin(t * 2 + i) * 0.2; });

        // carnero trotando (círculo cómico); más rápido en 'done'
        const spd = phase === 'done' ? 3.2 : 1.0;
        ram.position.x = -2 + Math.cos(t * spd) * 7;
        ram.position.z = 8 + Math.sin(t * spd) * 3;
        ram.rotation.y = -t * spd + Math.PI / 2;
        ram.position.y = Math.abs(Math.sin(t * spd * 3)) * 0.25; // brinquitos

        // el shofar que llevas sigue al niño
        if (got > 0 && phase !== 'done') { carried.visible = true; carried.position.set(player.x + 0.5, 2.4 + Math.sin(t * 4) * 0.05, player.z + 0.3); carried.rotation.y = t; }

        if (phase === 'gather') {
          const b = BENCHES[idx];
          const near = Math.hypot(player.x - b.x, player.z - b.z) < R;
          if (near && ctx.wantsInteract()) {
            benchShofars[idx].visible = false; got++;
            ctx.sound.pickup?.();
            idx++;
            if (idx < BENCHES.length) beacon.setPos(BENCHES[idx].x, BENCHES[idx].z);
            else { beacon.setPos(COHEN.x, COHEN.z); phase = 'deliver'; }
          }
        } else if (phase === 'deliver') {
          const near = Math.hypot(player.x - COHEN.x, player.z - COHEN.z) < R;
          if (near && ctx.wantsInteract()) {
            phase = 'done'; endT0 = t;
            carried.visible = false; cohenShofar.visible = true; gagBubble.visible = true;
            beacon.visible = false; ctx.sound.success?.();
          }
        } else {
          cohen.root.rotation.z = Math.sin(t * 6) * 0.06; // el Cohen prueba el shofar
          gagBubble.position.set(ram.position.x, ram.position.y + 3.2, ram.position.z); // el bocadillo sigue al carnero
          if (t - endT0 > 1.2) doneFlag = true;
        }
      },
      status(): string | null {
        if (phase === 'gather') return `🐚 Recoge los shofarot: ${got}/${BENCHES.length}`;
        if (phase === 'deliver') return '🎁 ¡Llévaselos al Cohen! (E)';
        return '✅ ¡Shofarot listos! (y el carnero se escapa)';
      },
      hud() {
        const p = ctx.getPlayer();
        if (phase === 'gather') {
          const b = BENCHES[idx];
          const near = Math.hypot(p.x - b.x, p.z - b.z) < R;
          return { prompt: near ? '🐚 Pulsa E para coger el shofar' : undefined, progress: got / (BENCHES.length + 1) };
        }
        if (phase === 'deliver') {
          const near = Math.hypot(p.x - COHEN.x, p.z - COHEN.z) < R;
          return { prompt: near ? '🎁 Pulsa E para entregar' : undefined, progress: BENCHES.length / (BENCHES.length + 1) };
        }
        return { progress: 1 };
      },
      isDone(): boolean { return doneFlag; },
      dispose(): void {
        beacon.dispose();
        (orderBubble.material as THREE.SpriteMaterial).map?.dispose(); orderBubble.material.dispose();
        (gagBubble.material as THREE.SpriteMaterial).map?.dispose(); gagBubble.material.dispose();
        group.traverse((obj) => { const m = obj as THREE.Mesh; if (m.geometry) m.geometry.dispose(); });
      }
    };
  }
};
