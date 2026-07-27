import * as THREE from 'three';
import { Min15Scene, SceneContext, SceneInstance } from './types';
import { buildWallBalcony, BalconyHandle, ROPE_TOP, ROPE_LINE, WALL_DROP } from './props/balcony';
import { GuideBeacon } from './props/guide';
import { createMinifigure, Minifigure } from '../../characters/MinifigureFactory';
import { ESPIA1_SIGILO, ESPIA2_SIGILO } from '../min05/skins';

/**
 * ESCENA 28 (15:51) — EL DESCUELGUE POR LA MURALLA.
 * Rahab ayuda a los espías a descender por FUERA de la muralla con cuerdas. El
 * niño va al hueco del parapeto, agarra la cuerda (E) y BAJA a golpecitos: cada
 * pulsación de E lo descuelga un tramo, despacito, hasta tocar tierra firme.
 *
 * La cuerda y el espía cuelgan POR DELANTE de la cara exterior (no dentro de la
 * piedra), y la cámara se coloca FUERA de la muralla, de frente, para que se vea
 * TODO el descenso tramo a tramo. Verbo: DESCOLGARSE.
 */
const STEP = 0.13;          // cuánto baja cada pulsación de E (~8 toques hasta el suelo)
const STEP_COOLDOWN = 0.1;  // anti doble-conteo (no frena al niño que teclea)

export const escena28: Min15Scene = {
  id: 'm15_28_descuelgue',
  numero: 28,
  mundo: 'balcon',
  titulo: 'Descolgarse por la muralla',
  subtitulo: 'Agarra la cuerda en el parapeto y baja por fuera de la muralla. Pulsa E una y otra vez para descolgarte despacito.',
  jugador: 'spy',
  noche: true,
  ambiente: 'night',
  spawn: { x: 4, z: 2.5 },
  objetivo: { tipo: 'ir_a', texto: 'Baja por la cuerda (pulsa E para descolgarte)', target: { x: ROPE_TOP.x, z: ROPE_TOP.z }, radio: 2.0 },
  exito: '¡Abajo y a salvo! Los espías tocan tierra firme.',
  camara: { yaw: 0, pitch: 0.3, dist: 18 },

  build(ctx: SceneContext): SceneInstance {
    const group = new THREE.Group();
    const bal: BalconyHandle = buildWallBalcony(ctx);
    group.add(bal.group);

    // --- La CUERDA de descuelgue: POR DELANTE de la cara exterior (z = ROPE_LINE.z) ---
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0x8a6b3a, roughness: 0.95 });
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, WALL_DROP + 1.5, 6), ropeMat);
    rope.position.set(ROPE_LINE.x, -WALL_DROP / 2 + 0.6, ROPE_LINE.z); group.add(rope);
    // nudo de amarre arriba (sobre el poste del parapeto) y tramo que salva el parapeto
    const knot = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.13, 8, 14), ropeMat); knot.position.set(-1.6, 1.4, 7.0); group.add(knot);
    const lintel = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 3.4, 6), ropeMat);
    lintel.rotation.x = Math.PI / 2.4; lintel.position.set(-0.8, 1.2, 8.1); group.add(lintel);

    // --- ESPÍA que baja (proxy): oculto hasta agarrar la cuerda, cuelga en ROPE_LINE ---
    const climber: Minifigure = createMinifigure(ctx.plastic, ESPIA1_SIGILO);
    climber.root.position.set(ROPE_LINE.x, 0, ROPE_LINE.z);
    climber.root.visible = false; group.add(climber.root);

    // compañero ya abajo esperando (da sensación de meta)
    const buddy = createMinifigure(ctx.plastic, ESPIA2_SIGILO);
    buddy.root.position.set(2.6, -WALL_DROP, 14); buddy.root.rotation.y = Math.PI; group.add(buddy.root);

    const o = escena28.objetivo.target!;
    const beacon = new GuideBeacon(o.x, o.z, { action: true });
    group.add(beacon.group);

    ctx.scene.add(group);

    type Phase = 'approach' | 'rappel' | 'landed';
    let phase: Phase = 'approach';
    let descent = 0, shown = 0, cd = 0, landT = 0;
    let doneFlag = false;
    const R = escena28.objetivo.radio ?? 2.0;

    return {
      group,
      update(dt, t, player): void {
        bal.update(dt, t);
        beacon.update(t);
        buddy.update(dt, false);
        cd = Math.max(0, cd - dt);

        if (phase === 'approach') {
          const near = Math.hypot(player.x - o.x, player.z - o.z) < R;
          if (near && ctx.wantsInteract()) {
            phase = 'rappel';
            ctx.setPlayerVisible?.(false);
            climber.root.visible = true;
            beacon.visible = false;
            ctx.sound.jump?.();
            // Travelling DESDE FUERA de la muralla mirando la cara exterior y la
            // cuerda (z = ROPE_LINE.z): baja siguiendo al espía, siempre a la vista.
            ctx.cameraReveal?.(
              { x: 10, y: 3, z: 24 }, { x: 8, y: -WALL_DROP + 6, z: 22 },
              { x: 0, y: 0, z: ROPE_LINE.z }, { x: 0, y: -WALL_DROP + 2, z: ROPE_LINE.z },
              13
            );
          }
        } else if (phase === 'rappel') {
          if (cd <= 0 && ctx.wantsInteract()) {
            descent = Math.min(1, descent + STEP);
            cd = STEP_COOLDOWN;
            ctx.sound.footTick?.(0.2, true, false);
            if (descent >= 1) phase = 'landed';
          }
          shown += (descent - shown) * Math.min(1, dt * 2.4); // glide suave hacia abajo
          climber.root.position.y = -shown * WALL_DROP;
          climber.root.position.x = ROPE_LINE.x + Math.sin(t * 2.2) * 0.16 * (1 - shown); // balanceo
          climber.root.rotation.z = Math.sin(t * 3) * 0.06 * (1 - shown);
          climber.update(dt, true, 0.6); // piernecillas moviéndose (trepa)
        } else {
          shown += (1 - shown) * Math.min(1, dt * 2.4);
          climber.root.position.y = -shown * WALL_DROP;
          climber.root.position.x = ROPE_LINE.x;
          climber.root.rotation.z = 0;
          landT += dt;
          climber.root.rotation.y = Math.sin(t * 3) * 0.25; // saluda al compañero
          climber.update(dt, false);
          if (landT > 1.2) doneFlag = true;
        }
      },
      status(): string | null {
        if (phase === 'approach') return '🪢 Ve al hueco del parapeto y agarra la cuerda';
        if (phase === 'rappel') return `⬇️ Bajando… ${Math.round(descent * 100)}%`;
        return '🎉 ¡En tierra firme!';
      },
      hud() {
        const p = ctx.getPlayer();
        if (phase === 'approach') {
          const near = Math.hypot(p.x - o.x, p.z - o.z) < R;
          return { prompt: near ? '🪢 Pulsa E para agarrar la cuerda' : undefined,
                   progress: THREE.MathUtils.clamp(1 - Math.hypot(p.x - o.x, p.z - o.z) / 10, 0, 1) };
        }
        if (phase === 'rappel') return { prompt: '⬇️ Pulsa E para bajar', progress: descent };
        return { progress: 1 };
      },
      isDone(): boolean { return doneFlag; },
      dispose(): void { bal.dispose(); beacon.dispose(); }
    };
  }
};
