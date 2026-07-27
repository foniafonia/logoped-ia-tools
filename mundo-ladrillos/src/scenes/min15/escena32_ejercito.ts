import * as THREE from 'three';
import { Min15Scene, SceneContext, SceneInstance } from './types';
import { GuideBeacon, makeBubble } from './props/guide';
import { buildGround, buildMoonNight, buildPine } from './props/wild';
import { buildTent } from '../min05/props/BrickProps';
import { buildBanner } from '../min05/props/NightAmbience';
import { buildFirePit, buildCrateStack, buildSackPile } from '../../world/Clutter';
import { createMinifigure, Minifigure, villagerSkin } from '../../characters/MinifigureFactory';
import { ESPIA1_SIGILO, YEHOSHUA_SKIN, GUARDIA_SKIN } from '../min05/skins';
import { BrickPalette } from '../../materials/BrickPalette';

/**
 * ESCENA 32 (18:47) — JOSUÉ MANDA REUNIR AL EJÉRCITO.
 * Dado el parte, Josué se levanta de mañana y ordena reunir a todo el pueblo para
 * la marcha sobre Jericó. Los soldados están dispersos por el campamento (junto a
 * fogatas y tiendas) y hay que llamarlos a FORMAR.
 *
 * MINI-JUEGO (reunir): el niño (mensajero de Josué) corre por el campamento hasta
 * cada CORRO de soldados y pulsa E para darles la orden; entonces ese escuadrón
 * marcha y se pone FIRME en la formación, delante de Josué. Cuando los tres
 * escuadrones están formados, ¡el ejército está listo! La baliza salta al
 * siguiente corro por llamar (nunca se pierde a dónde ir).
 */
type Squad = {
  soldiers: Minifigure[];
  origins: THREE.Vector3[];
  slots: THREE.Vector3[];
  rally: { x: number; z: number };
  mustered: boolean;
  marchT0: number; // reloj de pared en que empezaron a marchar (0 = aún no)
};
const MARCH_DUR = 1.8; // segundos de marcha del corro a la formación

// corros de soldados por el campamento (dentro de los bounds de la escena)
const RALLIES: Array<{ x: number; z: number }> = [
  { x: -9, z: -5 }, { x: -4, z: 8 }, { x: 5, z: -6 }
];
// centro de la formación (delante de Josué), en filas de 3
const FORM_CX = 9, FORM_CZ = 0;

export const escena32: Min15Scene = {
  id: 'm15_32_ejercito',
  numero: 32,
  mundo: 'campamento',
  titulo: 'Josué reúne al ejército',
  subtitulo: '«¡Reúnan al ejército y a los jefes de las tribus! Vamos a cruzar el Jordán y conquistar Jericó.» Llama a cada corro de soldados (E).',
  jugador: 'spy',
  noche: true,
  ambiente: 'night',
  spawn: { x: -16, z: 0 },
  objetivo: { tipo: 'ir_a', texto: 'Llama a los tres escuadrones a formar (E)', target: { x: RALLIES[0].x, z: RALLIES[0].z }, radio: 2.4 },
  exito: '¡El ejército está formado! Todo listo para marchar sobre Jericó.',
  camara: { yaw: 0, pitch: 0.42, dist: 27 },
  intro: {
    from: { x: -24, y: 12, z: 24 }, to: { x: -15, y: 7, z: 15 },
    lookFrom: { x: 0, y: 2, z: 0 }, lookTo: { x: 12, y: 2, z: 0 }, seconds: 3.2
  },

  build(ctx: SceneContext): SceneInstance {
    const group = new THREE.Group();
    const P = ctx.plastic;

    group.add(buildGround(P, 0x6a5334, 78, 56));
    group.add(buildMoonNight(P));

    // --- Tienda de Josué + estandartes (al fondo, hacia donde miran las tropas) ---
    const bigTent = buildTent(P, BrickPalette.TAN, 12, 10, true);
    bigTent.position.set(17, 0, -5); group.add(bigTent); ctx.addObstacle(17, -5, 6, 5);
    const banA = buildBanner(P, BrickPalette.DARK_BLUE, 1.6, 4); banA.position.set(13.5, 5.2, -2.5); group.add(banA);
    const banB = buildBanner(P, BrickPalette.DARK_RED, 1.6, 4); banB.position.set(20.5, 5.2, -2.5); group.add(banB);

    // tiendas y enseres para llenar (Regla Nº1)
    const t2 = buildTent(P, BrickPalette.WARM_SAND, 8, 7, false); t2.position.set(-12, 0, -11); group.add(t2); ctx.addObstacle(-12, -11, 4, 3.5);
    const t3 = buildTent(P, BrickPalette.SAND, 7, 6, false); t3.position.set(-14, 0, 11); group.add(t3); ctx.addObstacle(-14, 11, 3.5, 3);
    const t4 = buildTent(P, BrickPalette.DARK_SAND, 6, 6, false); t4.position.set(13, 0, 12); group.add(t4); ctx.addObstacle(13, 12, 3, 3);
    group.add(buildCrateStack(P, { x: 0, z: -11, n: 3 })); ctx.addObstacle(0, -11, 1, 1);
    group.add(buildSackPile(P, { x: -6, z: 12 })); ctx.addObstacle(-6, 12, 1, 1);
    group.add(buildPine(P, -22, -6, 1.7)); group.add(buildPine(P, 23, -12, 1.6)); group.add(buildPine(P, -23, 13, 1.5));

    // fogatas cálidas (solo 2 luces reales)
    group.add(buildFirePit(P, { x: -8, z: 2 }));
    group.add(buildFirePit(P, { x: 4, z: -9 }));

    // --- JOSUÉ en su tarima, destacado, dando la orden ---
    const yehoshua: Minifigure = createMinifigure(P, YEHOSHUA_SKIN);
    yehoshua.root.position.set(16, 1.0, 0); yehoshua.root.rotation.y = -Math.PI / 2;
    yehoshua.root.scale.setScalar(1.1); group.add(yehoshua.root);
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.9, 10, 12, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xffd98a, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false }));
    pillar.position.set(16, 5, 0); group.add(pillar);
    const orderBubble = makeBubble('«¡Reúnan al ejército y a los jefes de las tribus!»', { w: 8.4 });
    orderBubble.position.set(13.5, 6.6, 0); group.add(orderBubble);

    // --- Los 3 ESCUADRONES dispersos ---
    const squads: Squad[] = RALLIES.map((rally, si) => {
      const soldiers: Minifigure[] = [];
      const origins: THREE.Vector3[] = [];
      const slots: THREE.Vector3[] = [];
      for (let k = 0; k < 3; k++) {
        const fig = createMinifigure(P, k === 0 ? GUARDIA_SKIN : villagerSkin(si * 3 + k));
        fig.root.position.set(rally.x + (k - 1) * 1.3, 0, rally.z + (k % 2) * 1.1);
        fig.root.rotation.y = (si + k) * 1.1; // orientaciones variadas, deterministas
        group.add(fig.root); soldiers.push(fig);
        origins.push(fig.root.position.clone());
        // hueco de formación: filas de 3 (una fila por escuadrón), mirando a Josué (+x)
        slots.push(new THREE.Vector3(FORM_CX + k * 1.6, 0, FORM_CZ + (si - 1) * 2.4));
      }
      return { soldiers, origins, slots, rally, mustered: false, marchT0: 0 };
    });

    const beacon = new GuideBeacon(RALLIES[0].x, RALLIES[0].z, { action: true });
    group.add(beacon.group);

    ctx.scene.add(group);

    let idx = 0;               // escuadrón que toca llamar
    let allMusteredT = 0;
    let doneFlag = false;
    const R = escena32.objetivo.radio ?? 2.4;

    return {
      group,
      update(dt, t, player): void {
        beacon.update(t);
        yehoshua.root.rotation.y = -Math.PI / 2 + Math.sin(t * 0.8) * 0.14;
        yehoshua.update(dt, false);
        pillar.material.opacity = 0.12 + Math.sin(t * 2) * 0.05;
        orderBubble.position.y = 6.6 + Math.sin(t * 3) * 0.1;

        // soldados: los sin formar hacen guardia; los llamados MARCHAN a su hueco
        // con progreso por RELOJ DE PARED `t` (fps-independiente, igual en móvil lento).
        for (const sq of squads) {
          sq.soldiers.forEach((fig, k) => {
            if (sq.mustered) {
              const prog = THREE.MathUtils.clamp((t - sq.marchT0) / MARCH_DUR, 0, 1);
              fig.root.position.lerpVectors(sq.origins[k], sq.slots[k], prog);
              fig.root.rotation.y = -Math.PI / 2; // mira a Josué
              fig.update(dt, prog < 1, 0.9); // marchando hasta cuadrar, luego firmes
            } else {
              fig.update(dt, false); // esperando junto a la fogata
            }
          });
        }

        // llamar al escuadrón actual
        if (idx < squads.length) {
          const rally = RALLIES[idx];
          const near = Math.hypot(player.x - rally.x, player.z - rally.z) < R;
          if (near && ctx.wantsInteract()) {
            squads[idx].mustered = true;
            squads[idx].marchT0 = t;
            ctx.sound.shout?.();
            idx++;
            if (idx < squads.length) beacon.setPos(RALLIES[idx].x, RALLIES[idx].z);
            else beacon.visible = false;
          }
        } else {
          // todos llamados: esperar a que el último escuadrón termine de cuadrar
          const lastT0 = squads[squads.length - 1].marchT0;
          allMusteredT = t - lastT0;
          if (allMusteredT > MARCH_DUR + 0.4) doneFlag = true;
        }
      },
      status(): string | null {
        if (idx < squads.length) return `📣 Llama a los escuadrones: ${idx}/${squads.length} formados`;
        return doneFlag ? '✅ ¡Ejército formado!' : '🪖 ¡A formar! Poniéndose firmes…';
      },
      hud() {
        const p = ctx.getPlayer();
        if (idx < squads.length) {
          const rally = RALLIES[idx];
          const near = Math.hypot(p.x - rally.x, p.z - rally.z) < R;
          return { prompt: near ? '📣 Pulsa E para dar la orden' : undefined, progress: idx / squads.length };
        }
        return { progress: 1 };
      },
      isDone(): boolean { return doneFlag; },
      dispose(): void {
        beacon.dispose();
        (orderBubble.material as THREE.SpriteMaterial).map?.dispose(); orderBubble.material.dispose();
        group.traverse((obj) => { const m = obj as THREE.Mesh; if (m.geometry) m.geometry.dispose(); });
      }
    };
  }
};
