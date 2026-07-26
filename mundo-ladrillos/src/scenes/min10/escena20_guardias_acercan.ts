import * as THREE from 'three';
import { Min10Scene, SceneContext, SceneInstance } from './types';
import { buildTavernStage, TavernStageHandle } from './props/stage';
import { buildGuard } from '../min05/props/Guard';

/**
 * ESCENA 20 (11:58) — LOS GUARDIAS SE ACERCAN.
 * Por el arco a la calle se ve el FAROL de los guardias acercándose al letrero
 * iluminado. La tensión sube. El niño debe asomarse (pulsar E en el arco) para
 * confirmar el peligro antes de que lleguen. Verbo: VIGILAR (medidor de tiempo).
 */
export const escena20: Min10Scene = {
  id: 'm10_20_guardias_acercan',
  numero: 20,
  mundo: 'interior',
  titulo: 'Los guardias se acercan',
  subtitulo: 'Por el arco se ve un farol acercándose al letrero. Asómate (E) y avisa a Rahab.',
  jugador: 'spy',
  noche: true,
  ambiente: 'street',
  spawn: { x: 0, z: 3 },
  objetivo: { tipo: 'ir_a', texto: 'Asómate al arco (E) para ver a los guardias', target: { x: 8, z: -8 }, radio: 2.6 },
  exito: '¡Son ellos! Hay que darse prisa.',
  camara: { yaw: 0, pitch: 0.32, dist: 15 },

  build(ctx: SceneContext): SceneInstance {
    const group = new THREE.Group();
    const stage: TavernStageHandle = buildTavernStage(ctx);
    group.add(stage.group);

    // farol de los guardias que se acerca por FUERA del arco (x=8, z=-10.7)
    const lanternGlow = new THREE.PointLight(0xffb24d, 0, 14, 1.8);
    lanternGlow.position.set(8, 4, -16); group.add(lanternGlow);
    const guardOutside = buildGuard(ctx.plastic, 8, -18, 0, true);
    guardOutside.root.visible = true; group.add(guardOutside.root);

    ctx.scene.add(group);

    let tension = 0;
    let peeked = false;
    let doneFlag = false;
    const o = escena20.objetivo.target!;
    return {
      group,
      update(dt, t, player): void {
        stage.update(dt, t);
        // el farol/guardia se acerca al arco: sube la tensión con el tiempo
        tension = Math.min(1, tension + dt * 0.12);
        const gz = -18 + tension * 8;          // de -18 a -10 (junto al arco)
        guardOutside.root.position.set(8, 0, gz);
        guardOutside.root.rotation.y = Math.PI;
        guardOutside.update(dt);
        lanternGlow.position.z = gz - 1.5;
        lanternGlow.intensity = 1.5 + tension * 2.5 + Math.sin(t * 8) * 0.3;
        const near = Math.hypot(player.x - o.x, player.z - o.z) < (escena20.objetivo.radio ?? 2.6);
        if (near && !peeked && ctx.wantsInteract()) {
          peeked = true; ctx.sound.shout(); doneFlag = true;
        }
      },
      status(): string | null {
        if (peeked) return '👀 ¡Son los guardias! Corre a hablar con Rahab.';
        return tension > 0.6 ? '⏳ ¡El farol casi llega al letrero!' : '🫣 Un farol se acerca por la calle…';
      },
      hud() {
        const p = ctx.getPlayer();
        const near = Math.hypot(p.x - o.x, p.z - o.z) < (escena20.objetivo.radio ?? 2.6);
        return { alarm: tension, prompt: !peeked && near ? '👀 Pulsa E para asomarte' : undefined };
      },
      isDone(): boolean { return doneFlag; },
      dispose(): void { stage.dispose(); }
    };
  }
};
