import * as THREE from 'three';
import { Min15Scene, SceneContext, SceneInstance } from './types';
import { buildWallBalcony, BalconyHandle } from './props/balcony';
import { GuideBeacon, makeBubble } from './props/guide';
import { createMinifigure, Minifigure } from '../../characters/MinifigureFactory';
import { ESPIA2_SIGILO } from '../min05/skins';

/**
 * ESCENA 26 (15:11) — LA CONFESIÓN DE RAHAB (abre la trilogía del balcón).
 * En el balcón que da al exterior de la muralla, Rahab confiesa a los espías que
 * sabe que el Dios de Israel es el único Dios verdadero —ha oído de los milagros
 * desde Egipto— y pide ser parte del pueblo de Israel.
 *
 * El niño (espía) se acerca a Rahab y ESCUCHA: cada pulsación de E avanza una
 * frase de su confesión (bocadillos), hasta que termina y se sella el momento.
 * Verbo: ESCUCHAR / hablar. (El cordón rojo es la esc. 27.)
 */
export const escena26: Min15Scene = {
  id: 'm15_26_confesion',
  numero: 26,
  mundo: 'balcon',
  titulo: 'La confesión de Rahab',
  subtitulo: 'Rahab quiere hablar contigo. Acércate y pulsa E para escuchar su confesión.',
  jugador: 'spy',
  noche: true,
  ambiente: 'night',
  spawn: { x: -6, z: 3.5 },
  objetivo: { tipo: 'ir_a', texto: 'Escucha a Rahab (pulsa E)', target: { x: 4.2, z: -1.6 }, radio: 2.6 },
  exito: 'Rahab cree en el Dios de Israel. Ahora hay que darle la señal…',
  camara: { yaw: 0, pitch: 0.3, dist: 16 },

  build(ctx: SceneContext): SceneInstance {
    const group = new THREE.Group();
    const bal: BalconyHandle = buildWallBalcony(ctx);
    group.add(bal.group);

    // Compañero: el segundo espía, de pie cerca (en la peli están los dos).
    const buddy: Minifigure = createMinifigure(ctx.plastic, ESPIA2_SIGILO);
    buddy.root.position.set(-3.4, 0, 1.2); buddy.root.rotation.y = 0.4; group.add(buddy.root);
    ctx.addObstacle(-3.4, 1.2, 0.9, 0.9);

    // Frases de la confesión (bocadillos que se van pasando con E).
    const lines = [
      '«Sé que vuestro Dios es el único Dios verdadero.»',
      '«He oído cómo os abrió el mar y os sacó de Egipto.»',
      '«Toda Jericó tiembla de miedo ante vosotros.»',
      '«Os lo ruego: dejadme ser parte del pueblo de Israel.»'
    ];
    const bubbles: THREE.Sprite[] = lines.map((t) => {
      const b = makeBubble(`${t} — Rahab`, { w: 7.2 });
      b.position.set(4.2, 6.6, -3.4); b.visible = false; group.add(b); return b;
    });

    const o = escena26.objetivo.target!;
    const beacon = new GuideBeacon(o.x, o.z, { action: true });
    group.add(beacon.group);

    ctx.scene.add(group);

    let line = -1;      // -1 = aún no ha empezado a escuchar
    let doneFlag = false;
    let endT = 0;
    const R = escena26.objetivo.radio ?? 2.6;

    const showLine = (i: number): void => {
      bubbles.forEach((b, k) => (b.visible = k === i));
    };

    return {
      group,
      update(dt, t, player): void {
        bal.update(dt, t);
        beacon.update(t);
        buddy.update(dt, false);
        const near = Math.hypot(player.x - o.x, player.z - o.z) < R;

        if (!doneFlag && near && ctx.wantsInteract()) {
          line = Math.min(line + 1, lines.length - 1);
          showLine(line);
          beacon.visible = false;
          ctx.sound.jump?.();
          if (line === lines.length - 1) endT = 0.0001; // arranca cuenta para cerrar
        }
        // bocadillo flota un poco
        if (line >= 0) bubbles[line].position.y = 6.6 + Math.sin(t * 3) * 0.08;
        // Rahab gesticula al hablar
        if (line >= 0 && !doneFlag) bal.rahab.root.rotation.x = Math.sin(t * 5) * 0.06;
        if (endT > 0) { endT += dt; if (endT > 2.2) doneFlag = true; }
      },
      status(): string | null {
        if (line < 0) return '👂 Acércate a Rahab y pulsa E';
        if (line < lines.length - 1) return `💬 Rahab habla… (E para seguir) ${line + 1}/${lines.length}`;
        return '🤝 Rahab pide unirse a Israel.';
      },
      hud() {
        const p = ctx.getPlayer();
        const near = Math.hypot(p.x - o.x, p.z - o.z) < R;
        return {
          prompt: !doneFlag && near ? (line < 0 ? '👂 Pulsa E para escuchar' : (line < lines.length - 1 ? '💬 Pulsa E para seguir' : undefined)) : undefined,
          progress: line < 0 ? THREE.MathUtils.clamp(1 - Math.hypot(p.x - o.x, p.z - o.z) / 12, 0, 1) : (line + 1) / lines.length
        };
      },
      isDone(): boolean { return doneFlag; },
      dispose(): void { bal.dispose(); beacon.dispose(); }
    };
  }
};
