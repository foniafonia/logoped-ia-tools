import * as THREE from 'three';
import { Min15Scene, SceneContext, SceneInstance } from './types';
import { buildWallBalcony, BalconyHandle, ROPE_TOP, WALL_DROP, BALCONY_BOUNDS } from './props/balcony';
import { GuideBeacon } from './props/guide';
import { createMinifigure, Minifigure } from '../../characters/MinifigureFactory';
import { ESPIA1_SIGILO } from '../min05/skins';

/**
 * ESCENA 28 (15:51) — EL DESCUELGUE POR LA MURALLA.
 * Rahab ayuda a los espías a descender por FUERA de la muralla con cuerdas. El
 * niño va al hueco del parapeto, agarra la cuerda (E) y BAJA a golpecitos: cada
 * pulsación de E lo descuelga un tramo, despacito y en silencio, hasta tocar
 * tierra firme abajo. Verbo: DESCOLGARSE. (La huida por el monte es la esc. 29.)
 *
 * Mecánica pensada para un niño de 6–8: pulsar E rítmicamente = bajar; la barra
 * de progreso enseña cuánto falta; la cámara sigue al espía por la pared.
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
  objetivo: { tipo: 'ir_a', texto: 'Baja por la cuerda (pulsa E para descolgarte)', target: { x: ROPE_TOP.x, z: 6.2 }, radio: 2.0 },
  exito: '¡Abajo y a salvo! Los espías tocan tierra firme.',
  camara: { yaw: 0, pitch: 0.3, dist: 18 },

  build(ctx: SceneContext): SceneInstance {
    const group = new THREE.Group();
    const bal: BalconyHandle = buildWallBalcony(ctx);
    group.add(bal.group);

    // --- La CUERDA de descuelgue: del parapeto (y=0) al suelo de abajo ---
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0x8a6b3a, roughness: 0.95 });
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, WALL_DROP + 1, 6), ropeMat);
    rope.position.set(ROPE_TOP.x, -WALL_DROP / 2 + 0.4, 7.7); group.add(rope);
    // nudo de amarre arriba
    group.add(new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.13, 8, 14), ropeMat));
    (group.children[group.children.length - 1] as THREE.Mesh).position.set(-1.6, 1.4, 7.0);

    // --- ESPÍA que baja (proxy): oculto hasta agarrar la cuerda ---
    const climber: Minifigure = createMinifigure(ctx.plastic, ESPIA1_SIGILO);
    climber.root.position.set(ROPE_TOP.x, 0, 7.7);
    climber.root.visible = false; group.add(climber.root);

    // marca de "compañero ya abajo" esperando (da sensación de meta)
    const buddy = createMinifigure(ctx.plastic, ESPIA1_SIGILO);
    buddy.root.position.set(2.4, -WALL_DROP, 14); buddy.root.scale.setScalar(1);
    group.add(buddy.root);

    // baliza dorada en el punto de agarre
    const o = escena28.objetivo.target!;
    const beacon = new GuideBeacon(o.x, o.z, { action: true });
    group.add(beacon.group);

    ctx.scene.add(group);

    type Phase = 'approach' | 'rappel' | 'landed';
    let phase: Phase = 'approach';
    let descent = 0;      // 0 = arriba, 1 = suelo
    let shown = 0;        // descenso visual suavizado
    let cd = 0;
    let doneFlag = false;
    let landT = 0;
    const R = escena28.objetivo.radio ?? 2.0;

    return {
      group,
      update(dt, t, player): void {
        bal.update(dt, t);
        beacon.update(t);
        cd = Math.max(0, cd - dt);

        if (phase === 'approach') {
          const near = Math.hypot(player.x - o.x, player.z - o.z) < R;
          if (near && ctx.wantsInteract()) {
            phase = 'rappel';
            ctx.setPlayerVisible?.(false);
            climber.root.visible = true;
            beacon.visible = false;
            ctx.sound.jump?.();
            // Travelling cinemático DESDE FUERA de la muralla (coordenadas libres,
            // no atadas a los bounds del adarve): la cámara baja por la cara
            // exterior siguiendo al espía que se descuelga. Larga (cubre todo el
            // descenso a golpecitos); al acabar devuelve el control.
            ctx.cameraReveal?.(
              { x: 15, y: 3, z: 22 }, { x: 12, y: -WALL_DROP + 5, z: 20 },
              { x: 0, y: 1, z: 8 }, { x: 0, y: -WALL_DROP + 2, z: 9 },
              12
            );
          }
        } else if (phase === 'rappel') {
          if (cd <= 0 && ctx.wantsInteract()) {
            descent = Math.min(1, descent + STEP);
            cd = STEP_COOLDOWN;
            ctx.sound.footTick?.(0.2, true, false);
            if (descent >= 1) { phase = 'landed'; }
          }
          shown += (descent - shown) * Math.min(1, dt * 2.4); // glide suave hacia abajo
          climber.root.position.y = -shown * WALL_DROP;
          // balanceo suave mientras cuelga
          climber.root.rotation.z = Math.sin(t * 3) * 0.06 * (1 - shown);
          climber.root.position.x = ROPE_TOP.x + Math.sin(t * 2.2) * 0.18 * (1 - shown);
          climber.update(dt, false);
        } else {
          // landed: aterriza, se endereza, saluda al compañero
          shown += (1 - shown) * Math.min(1, dt * 8);
          climber.root.position.y = -shown * WALL_DROP;
          climber.root.rotation.z = 0;
          landT += dt;
          climber.root.rotation.y = Math.sin(t * 3) * 0.2; // saludo
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
