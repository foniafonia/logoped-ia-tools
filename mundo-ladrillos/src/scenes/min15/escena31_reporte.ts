import * as THREE from 'three';
import { Min15Scene, SceneContext, SceneInstance } from './types';
import { GuideBeacon, makeBubble } from './props/guide';
import { buildGround, buildMoonNight, buildPine } from './props/wild';
import { buildTent, buildRock } from '../min05/props/BrickProps';
import { buildBanner } from '../min05/props/NightAmbience';
import { buildFirePit, buildCrateStack, buildSackPile } from '../../world/Clutter';
import { createMinifigure, Minifigure, villagerSkin } from '../../characters/MinifigureFactory';
import { ESPIA1_SIGILO, ESPIA2_SIGILO, YEHOSHUA_SKIN, GUARDIA_SKIN } from '../min05/skins';
import { BrickPalette } from '../../materials/BrickPalette';

/**
 * ESCENA 31 (17:37) — EL PARTE A JOSUÉ (huida, latido 3 de 3).
 * De vuelta en el campamento de Israel, los espías se presentan ante Josué y le
 * dan el PARTE: «Ciertamente el Señor ha entregado en nuestras manos toda la
 * tierra; y aun todos los moradores del país tiemblan ante nosotros» (Josué 2:24).
 *
 * MINI-JUEGO (hablar): el niño lleva al espía ante Josué (baliza) y pulsa E para
 * hablar. Cada E pasa una frase del diálogo (bocadillos), hasta que Josué recibe
 * la buena nueva. Diálogo con el helper LOCAL `makeBubble` (stopgap del tramo
 * 10–15) hasta que el LEAD publique el `ctx.say` compartido; entonces se cambia.
 */
type Line = { who: 'espia' | 'yehoshua'; text: string };
const DIALOGO: Line[] = [
  { who: 'espia', text: '«¡Josué! El Señor ha entregado toda la tierra en nuestras manos.»' },
  { who: 'espia', text: '«Toda la gente de Jericó tiembla de miedo ante nosotros.»' },
  { who: 'yehoshua', text: '«¡Bendito sea el Señor! Mañana cruzaremos el Jordán.»' }
];

export const escena31: Min15Scene = {
  id: 'm15_31_reporte',
  numero: 31,
  mundo: 'campamento',
  titulo: 'El parte a Josué',
  subtitulo: 'Preséntate ante Josué en la tienda militar y dale el parte (E): la ciudad es nuestra.',
  jugador: 'spy',
  noche: true,
  ambiente: 'night',
  spawn: { x: -14, z: 3 },
  objetivo: { tipo: 'ir_a', texto: 'Ve ante Josué y dale el parte (E)', target: { x: 10, z: 0 }, radio: 2.8 },
  exito: '¡Parte entregado! «El Señor ha entregado la ciudad en nuestras manos.»',
  camara: { yaw: 0, pitch: 0.3, dist: 20 },
  intro: {
    from: { x: -22, y: 9, z: 22 }, to: { x: -13, y: 6, z: 15 },
    lookFrom: { x: 10, y: 2, z: 0 }, lookTo: { x: 11, y: 2, z: -1 }, seconds: 3.0
  },

  build(ctx: SceneContext): SceneInstance {
    const group = new THREE.Group();
    const P = ctx.plastic;

    group.add(buildGround(P, 0x6a5334, 74, 54)); // suelo de tierra batida del campamento
    group.add(buildMoonNight(P));

    // --- La TIENDA de Josué (la grande, al fondo) con estandartes ---
    const bigTent = buildTent(P, BrickPalette.TAN, 12, 10, true);
    bigTent.position.set(13, 0, -6); group.add(bigTent);
    ctx.addObstacle(13, -6, 6, 5);
    const banA = buildBanner(P, BrickPalette.DARK_BLUE, 1.6, 4); banA.position.set(9.5, 5.2, -3); group.add(banA);
    const banB = buildBanner(P, BrickPalette.DARK_RED, 1.6, 4); banB.position.set(16.5, 5.2, -3); group.add(banB);
    // tarima de Josué (para que destaque, aprendido del 0–5: que se vea a quién ir)
    const dais = buildRock(P, 0.5); dais.position.set(10, 0, 0); // pequeño promontorio
    group.add(dais);

    // tiendas satélite + vivac para llenar (Regla Nº1)
    const t2 = buildTent(P, BrickPalette.WARM_SAND, 8, 7, false); t2.position.set(-10, 0, -10); group.add(t2); ctx.addObstacle(-10, -10, 4, 3.5);
    const t3 = buildTent(P, BrickPalette.SAND, 7, 6, false); t3.position.set(16, 0, 11); group.add(t3); ctx.addObstacle(16, 11, 3.5, 3);
    const t4 = buildTent(P, BrickPalette.DARK_SAND, 6, 6, false); t4.position.set(-16, 0, 8); group.add(t4); ctx.addObstacle(-16, 8, 3, 3);
    group.add(buildCrateStack(P, { x: -4, z: -9, n: 3 })); ctx.addObstacle(-4, -9, 1, 1);
    group.add(buildSackPile(P, { x: 5, z: 9 })); ctx.addObstacle(5, 9, 1, 1);
    group.add(buildPine(P, -20, -6, 1.7)); group.add(buildPine(P, 21, -12, 1.6)); group.add(buildPine(P, -22, 12, 1.5));

    // --- Fogatas (SOLO 2 luces cálidas reales; el resto, brillo emisivo) ---
    group.add(buildFirePit(P, { x: -6, z: 3 }));
    group.add(buildFirePit(P, { x: 4, z: -8 }));

    // --- JOSUÉ sobre su tarima (destacado) ---
    const yehoshua: Minifigure = createMinifigure(P, YEHOSHUA_SKIN);
    yehoshua.root.position.set(10, 1.0, 0); yehoshua.root.rotation.y = -Math.PI * 0.8;
    yehoshua.root.scale.setScalar(1.08); group.add(yehoshua.root);
    // baliza dorada de "aquí está Josué" (haz vertical) sobre la tarima
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.9, 10, 12, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xffd98a, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false }));
    pillar.position.set(10, 5, 0); group.add(pillar);

    // compañero espía que camina contigo y se queda al lado
    const buddy: Minifigure = createMinifigure(P, ESPIA2_SIGILO);
    buddy.root.position.set(7.4, 0, 1.6); buddy.root.rotation.y = -Math.PI * 0.8; group.add(buddy.root);

    // soldados del campamento (vida; instancias ligeras, quietos junto a las fogatas)
    const extras: Minifigure[] = [];
    const spots: Array<[number, number, number, number]> = [
      [-7.5, 4.5, 1, 0], [-4.5, 2, 1, 1], [3, -9.5, 2, 2], [6, -7, 2, 3], [-12, -8, 0, 4]
    ];
    for (const [x, z, kind, seed] of spots) {
      const fig = createMinifigure(P, kind === 0 ? GUARDIA_SKIN : villagerSkin(seed));
      fig.root.position.set(x, 0, z); fig.root.rotation.y = Math.atan2(-z, 5 - x);
      group.add(fig.root); extras.push(fig);
    }

    const o = escena31.objetivo.target!;
    const beacon = new GuideBeacon(o.x, o.z, { action: true });
    group.add(beacon.group);

    // --- Bocadillos de diálogo (uno por línea; se muestran de a uno) ---
    const headYeh = new THREE.Vector3(10, 6.2, 0);
    const headSpy = new THREE.Vector3(6.5, 6.0, 2);
    const bubbles = DIALOGO.map((l) => {
      const spr = makeBubble(l.text, { w: 7.4 });
      const at = l.who === 'yehoshua' ? headYeh : headSpy;
      spr.position.copy(at); spr.visible = false; group.add(spr);
      return spr;
    });

    ctx.scene.add(group);

    type Phase = 'approach' | 'talk' | 'done';
    let phase: Phase = 'approach';
    let line = -1, endT = 0;
    let doneFlag = false;
    const R = escena31.objetivo.radio ?? 2.8;

    function showLine(i: number): void {
      bubbles.forEach((b, k) => (b.visible = k === i));
    }

    return {
      group,
      update(dt, t, player): void {
        beacon.update(t);
        buddy.update(dt, false);
        yehoshua.root.rotation.y = -Math.PI * 0.8 + Math.sin(t * 0.6) * 0.12;
        yehoshua.update(dt, false);
        for (const e of extras) e.update(dt, false);
        pillar.material.opacity = 0.12 + Math.sin(t * 2) * 0.05;
        // el bocadillo activo flota suave
        if (line >= 0 && line < bubbles.length) bubbles[line].position.y = (DIALOGO[line].who === 'yehoshua' ? headYeh.y : headSpy.y) + Math.sin(t * 3) * 0.1;

        if (phase === 'approach') {
          const near = Math.hypot(player.x - o.x, player.z - o.z) < R;
          if (near && ctx.wantsInteract()) {
            phase = 'talk'; line = 0; showLine(0); beacon.visible = false; ctx.sound.pickup?.();
          }
        } else if (phase === 'talk') {
          if (ctx.wantsInteract()) {
            line++;
            if (line >= DIALOGO.length) {
              phase = 'done'; showLine(-1); ctx.sound.success?.();
            } else { showLine(line); ctx.sound.pickup?.(); }
          }
        } else {
          endT += dt;
          yehoshua.root.rotation.z = Math.sin(t * 5) * 0.05; // Josué celebra
          if (endT > 1.0) doneFlag = true;
        }
      },
      status(): string | null {
        if (phase === 'approach') return '⛺ Ve ante Josué y háblale';
        if (phase === 'talk') return `💬 El parte… (E) ${line + 1}/${DIALOGO.length}`;
        return '✅ ¡La ciudad es nuestra!';
      },
      hud() {
        const p = ctx.getPlayer();
        if (phase === 'approach') {
          const near = Math.hypot(p.x - o.x, p.z - o.z) < R;
          return { prompt: near ? '💬 Pulsa E para dar el parte' : undefined,
                   progress: THREE.MathUtils.clamp(1 - Math.hypot(p.x - o.x, p.z - o.z) / 20, 0, 1) };
        }
        if (phase === 'talk') return { prompt: '💬 Pulsa E para seguir', progress: (line + 1) / DIALOGO.length };
        return { progress: 1 };
      },
      isDone(): boolean { return doneFlag; },
      dispose(): void {
        beacon.dispose();
        bubbles.forEach((b) => { (b.material as THREE.SpriteMaterial).map?.dispose(); b.material.dispose(); });
        group.traverse((obj) => { const m = obj as THREE.Mesh; if (m.geometry) m.geometry.dispose(); });
      }
    };
  }
};
