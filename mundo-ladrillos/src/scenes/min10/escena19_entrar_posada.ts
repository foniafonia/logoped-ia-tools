import * as THREE from 'three';
import { Min10Scene, SceneContext, SceneInstance } from './types';
import { buildTavernStage, buildHideouts, TavernStageHandle, HideoutsHandle } from './props/stage';

/**
 * ESCENA 19 (11:45) — ENTRAR EN LA POSADA.
 * Interior cálido del "Restaurante de Rahab". Los espías se sientan en la barra;
 * Rahab los recibe y piden café. Beat de CALMA tras la carrera. Verbo: SENTARSE.
 */
export const escena19: Min10Scene = {
  id: 'm10_19_entrar_posada',
  numero: 19,
  mundo: 'interior',
  titulo: 'La posada de Rahab',
  subtitulo: 'Dentro, cálido y tranquilo. Siéntate en la barra; Rahab os recibe. Pedid un café.',
  jugador: 'spy',
  noche: true,
  ambiente: 'street',
  spawn: { x: 0, z: 3 },
  objetivo: { tipo: 'ir_a', texto: 'Acércate a la barra y pulsa E para pedir café', target: { x: -1, z: -3 }, radio: 2.6 },
  exito: 'Rahab os sirve un café humeante. Por ahora, a salvo.',
  camara: { yaw: 0, pitch: 0.3, dist: 14 },

  build(ctx: SceneContext): SceneInstance {
    const group = new THREE.Group();
    const stage: TavernStageHandle = buildTavernStage(ctx);
    const hide: HideoutsHandle = buildHideouts(ctx); // el tapiz + la tinaja, coherentes en toda la posada
    group.add(stage.group); group.add(hide.group);

    // dos tazas humeantes que Rahab "sirve" al pedir (aparecen al interactuar)
    const steam = new THREE.Group(); steam.visible = false; group.add(steam);
    for (const sx of [-1.6, -0.4]) {
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.5, 10), ctx.plastic.get(0xcaa14a));
      cup.position.set(sx, 2.75, -4.6); steam.add(cup);
    }

    ctx.scene.add(group);

    let ordered = false;
    let doneFlag = false;
    const o = escena19.objetivo.target!;
    return {
      group,
      update(dt, t, player): void {
        stage.update(dt, t);
        hide.update(dt, t, player.x, player.z);
        if (steam.visible) steam.children.forEach((c, i) => { c.position.y = 2.75 + Math.sin(t * 2 + i) * 0.03; });
        // Rahab saluda con leve vaivén
        if (stage.tav.rahab) stage.tav.rahab.root.rotation.y = Math.sin(t * 0.8) * 0.1;
        const near = Math.hypot(player.x - o.x, player.z - o.z) < (escena19.objetivo.radio ?? 2.6);
        if (near && !ordered && ctx.wantsInteract()) {
          ordered = true; steam.visible = true; ctx.sound.pickup(); doneFlag = true;
        }
      },
      status(): string | null { return ordered ? '☕ Café servido. A salvo… por ahora.' : null; },
      hud() {
        const p = ctx.getPlayer();
        const near = Math.hypot(p.x - o.x, p.z - o.z) < (escena19.objetivo.radio ?? 2.6);
        return { prompt: !ordered && near ? '☕ Pulsa E para pedir café' : undefined };
      },
      isDone(): boolean { return doneFlag; },
      dispose(): void { stage.dispose(); }
    };
  }
};
