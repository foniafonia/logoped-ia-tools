import * as THREE from 'three';
import { Min15Scene, SceneContext, SceneInstance } from './types';
import { GuideBeacon } from './props/guide';
import { buildGround, buildPine, buildBush, buildBoulder, buildHideout, buildMoonNight, buildPineRidge } from './props/wild';
import { createMinifigure, Minifigure } from '../../characters/MinifigureFactory';
import { ESPIA1_SIGILO, ESPIA2_SIGILO, GUARDIA_SKIN } from '../min05/skins';
import { buildCrateStack, buildFirePit } from '../../world/Clutter';

/**
 * ESCENA 29 (17:00) — ESCONDIDOS EN EL MONTE (huida, latido 1 de 3).
 * Rahab les dijo: «Id al monte, no sea que os encuentren los que os persiguen;
 * escondeos allí TRES DÍAS, hasta que ellos vuelvan» (Josué 2:16). Los espías
 * suben al monte de pinos y se ocultan en una cueva mientras una patrulla de
 * Jericó los rastrea con antorchas.
 *
 * MINI-JUEGO (esconderse): el niño lleva al espía hasta la CUEVA (baliza dorada)
 * y pulsa E para esconderse. Entonces pasan TRES NOCHES (la patrulla barre el
 * monte 3 veces): basta esperar quietecito en el escondite. Al amanecer del
 * tercer día los perseguidores se van → «¡vía libre!». Sin violencia ni castigo:
 * si el niño se despista en campo abierto cerca de una antorcha, solo aparece un
 * aviso amable para que corra a esconderse.
 */
const NIGHTS = 3;
const NIGHT_DUR = 1.9; // segundos por "noche" (elipsis de los 3 días)

export const escena29: Min15Scene = {
  id: 'm15_29_monte',
  numero: 29,
  mundo: 'monte',
  titulo: 'Escondidos en el monte',
  subtitulo: 'Sigue el sendero en silencio hasta pasar la colina y escóndete en la cueva (E). Espera tres noches, hasta que los perseguidores se marchen.',
  jugador: 'spy',
  noche: true,
  ambiente: 'night',
  spawn: { x: -16, z: 2 },
  objetivo: { tipo: 'esconderse', texto: 'Escóndete en la cueva del monte (E)', target: { x: 12, z: 0 }, radio: 2.6 },
  exito: '¡Tres días escondidos! Los perseguidores se han ido. Vía libre.',
  camara: { yaw: 0, pitch: 0.4, dist: 27 },
  intro: {
    from: { x: -26, y: 10, z: 26 }, to: { x: -14, y: 6, z: 16 },
    lookFrom: { x: 8, y: 2, z: -4 }, lookTo: { x: 12, y: 1, z: -3 }, seconds: 3.2
  },

  build(ctx: SceneContext): SceneInstance {
    const group = new THREE.Group();
    const P = ctx.plastic;

    group.add(buildGround(P, 0x27532f));
    group.add(buildMoonNight(P));
    group.add(buildPineRidge(P, -22, 12));

    // --- Bosque de pinos por el que se sube (deja libre el pasillo spawn→cueva) ---
    const treeSpots: Array<[number, number, number]> = [
      [-20, -8, 1.4], [-14, -12, 1.7], [-8, -9, 1.3], [-2, -13, 1.6], [4, -10, 1.4],
      [-22, 8, 1.2], [-18, 14, 1.5], [-6, 15, 1.3], [6, 14, 1.5], [18, 12, 1.6],
      [20, -8, 1.5], [16, -12, 1.3], [-24, -2, 1.2], [22, 2, 1.4]
    ];
    for (const [x, z, s] of treeSpots) {
      group.add(buildPine(P, x, z, s));
      ctx.addObstacle(x, z, 0.9, 0.9);
    }
    for (const [x, z] of [[-10, 6], [2, 8], [-4, -3], [8, 6], [-16, -4]]) group.add(buildBush(P, x, z, 1));
    group.add(buildBoulder(P, -8, 12, 1.4)); ctx.addObstacle(-8, 12, 2, 1.6);
    group.add(buildBoulder(P, 18, -3, 1.2)); ctx.addObstacle(18, -3, 1.6, 1.4);
    // rincón de vivac de los espías (una cajita y una fogata APAGADA junto a la cueva)
    group.add(buildCrateStack(P, { x: 8.6, z: -4, n: 2 })); ctx.addObstacle(8.6, -4, 1, 1);

    // --- El ESCONDITE (cueva) al que hay que llegar ---
    const hide = buildHideout(P); hide.position.set(12, 0, -3); group.add(hide);
    ctx.addObstacle(12, -4.5, 3.4, 1.4); // el fondo de la cueva bloquea; la boca (+z) queda libre

    // compañero ya agazapado dentro de la cueva (da sentido de "refugio")
    const buddy: Minifigure = createMinifigure(P, ESPIA2_SIGILO);
    buddy.root.position.set(13.4, 0, -3.2); buddy.root.rotation.y = 0.4; group.add(buddy.root);
    // proxy del propio espía agazapado (se muestra al esconderse; el jugador se oculta)
    const crouch: Minifigure = createMinifigure(P, ESPIA1_SIGILO);
    crouch.root.position.set(11.0, 0, -2.6); crouch.root.rotation.y = -0.2;
    crouch.root.scale.setScalar(0.9); crouch.root.visible = false; group.add(crouch.root);

    // --- Fogata del escondite (única luz cálida añadida: 1 sola, móvil-friendly) ---
    const fire = buildFirePit(P, { x: 10.2, z: -1.2 }); fire.visible = false; group.add(fire);

    // --- PATRULLA de Jericó (2 guardias con antorcha) que barre el monte ---
    type Guard = { fig: Minifigure; flame: THREE.Mesh; base: number; phase: number };
    const guards: Guard[] = [];
    for (let i = 0; i < 2; i++) {
      const fig = createMinifigure(P, GUARDIA_SKIN);
      fig.root.position.set(-18 + i * 6, 0, 7 + i * 1.5);
      group.add(fig.root);
      // antorcha emisiva SIN PointLight (brilla por el bloom → 0 coste de luz en móvil)
      const torch = new THREE.Group();
      torch.add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.4, 6),
        new THREE.MeshStandardMaterial({ color: 0x5a3c1e })).translateY(0.7));
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.7, 8),
        new THREE.MeshBasicMaterial({ color: 0xff9a3a, toneMapped: false }));
      flame.position.y = 1.7; torch.add(flame);
      torch.position.set(0.7, 2.4, 0.2); fig.root.add(torch);
      guards.push({ fig, flame, base: 7 + i * 1.5, phase: i * Math.PI });
    }

    const o = escena29.objetivo.target!;
    const beacon = new GuideBeacon(o.x, o.z, { action: true });
    group.add(beacon.group);

    // luciérnagas (motas verdosas) para dar vida al monte de noche
    const fN = 26, fGeo = new THREE.BufferGeometry(), fpos = new Float32Array(fN * 3);
    for (let i = 0; i < fN; i++) { fpos[i * 3] = (Math.random() - 0.5) * 40; fpos[i * 3 + 1] = 0.6 + Math.random() * 4; fpos[i * 3 + 2] = (Math.random() - 0.5) * 30; }
    fGeo.setAttribute('position', new THREE.BufferAttribute(fpos, 3));
    const fireflies = new THREE.Points(fGeo, new THREE.PointsMaterial({ color: 0xbfff8a, size: 0.16, transparent: true, opacity: 0.8, depthWrite: false }));
    group.add(fireflies);

    ctx.scene.add(group);

    type Phase = 'toHide' | 'hidden' | 'dawn';
    let phase: Phase = 'toHide';
    let alarm = 0, night = 0, hideT0 = 0, dawnT = 0;
    let doneFlag = false;
    const R = escena29.objetivo.radio ?? 2.6;

    // recorrido de la patrulla: barren en x, con leve vaivén en z
    function moveGuards(dt: number, t: number, sweep: boolean): void {
      for (const g of guards) {
        const span = 22, speed = sweep ? 6 : 3;
        const x = Math.sin(t * (speed / span) + g.phase) * span;
        const prev = g.fig.root.position.x;
        g.fig.root.position.set(x, 0, g.base + Math.sin(t * 0.6 + g.phase) * 2);
        g.fig.root.rotation.y = (x >= prev ? Math.PI / 2 : -Math.PI / 2);
        g.flame.scale.setScalar(0.85 + Math.sin(t * 9 + g.phase) * 0.2);
        g.fig.update(dt, true, 0.7);
      }
    }

    return {
      group,
      update(dt, t, player): void {
        beacon.update(t);
        buddy.update(dt, false);
        // luciérnagas suben lento
        const fp = fireflies.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < fN; i++) { let y = fp.getY(i) + dt * (0.2 + (i % 4) * 0.05); if (y > 5) y = 0.6; fp.setY(i, y); }
        fp.needsUpdate = true;

        if (phase === 'toHide') {
          moveGuards(dt, t, false);
          // aviso amable si se despista en campo abierto cerca de una antorcha (sin castigo)
          let nearest = 99;
          for (const g of guards) nearest = Math.min(nearest, Math.hypot(player.x - g.fig.root.position.x, player.z - g.fig.root.position.z));
          const inOpen = Math.hypot(player.x - o.x, player.z - o.z) > R + 1;
          if (inOpen && nearest < 6) alarm = Math.min(1, alarm + dt * 0.6);
          else alarm = Math.max(0, alarm - dt * 0.8);

          const near = Math.hypot(player.x - o.x, player.z - o.z) < R;
          if (near && ctx.wantsInteract()) {
            phase = 'hidden'; night = 1; hideT0 = t; alarm = 0;
            ctx.setPlayerVisible?.(false);
            crouch.root.visible = true; fire.visible = true;
            ctx.sound.pickup?.();
          }
        } else if (phase === 'hidden') {
          moveGuards(dt, t, true); // barren más rápido, buscando
          crouch.root.position.y = Math.sin(t * 2) * 0.03; // respira agazapado
          crouch.update(dt, false);
          // Elipsis de las 3 noches cronometrada con el RELOJ DE PARED `t` (no con
          // `dt` acumulado): avanza igual a 60 fps que en un móvil/headless lento.
          const elapsed = t - hideT0;
          const nn = Math.min(NIGHTS, Math.floor(elapsed / NIGHT_DUR) + 1);
          if (nn !== night) { night = nn; ctx.sound.footTick?.(0.2, true, false); }
          if (elapsed >= NIGHTS * NIGHT_DUR) { phase = 'dawn'; ctx.sound.success?.(); }
        } else {
          dawnT += dt;
          crouch.update(dt, false);
          // los guardias se retiran (salen por un lado)
          for (const g of guards) { g.fig.root.position.x -= dt * 8; g.fig.update(dt, true, 0.9); }
          if (dawnT > 1.2) doneFlag = true;
        }
      },
      status(): string | null {
        if (phase === 'toHide') return alarm > 0.35 ? '👀 ¡Te buscan! Corre a la cueva' : '🌲 Sube al monte y escóndete en la cueva';
        if (phase === 'hidden') return `🌙 Noche ${Math.min(night, NIGHTS)} de ${NIGHTS}… quietecito`;
        return '🌅 Amanece el tercer día. ¡Se han ido!';
      },
      hud() {
        const p = ctx.getPlayer();
        if (phase === 'toHide') {
          const near = Math.hypot(p.x - o.x, p.z - o.z) < R;
          return { prompt: near ? '🕳️ Pulsa E para esconderte' : undefined, alarm,
                   progress: THREE.MathUtils.clamp(1 - Math.hypot(p.x - o.x, p.z - o.z) / 22, 0, 1) };
        }
        if (phase === 'hidden') return { progress: THREE.MathUtils.clamp((night - 1) / NIGHTS + 0.34, 0, 1) };
        return { progress: 1 };
      },
      isDone(): boolean { return doneFlag; },
      dispose(): void {
        beacon.dispose();
        group.traverse((obj) => { const m = obj as THREE.Mesh; if (m.geometry) m.geometry.dispose(); });
      }
    };
  }
};
