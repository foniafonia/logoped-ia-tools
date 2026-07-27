import * as THREE from 'three';
import { Min10Scene, SceneContext, SceneInstance } from './types';
import { buildTavernStage, buildHideouts, TavernStageHandle, HideoutsHandle } from './props/stage';
import { dlg, VOZ } from './props/rahabDialogue';

/**
 * ESCENA 25 (14:17) — ALIVIO (fin del tramo 10–15).
 * Pasado el peligro, el espía SALE del escondite, aliviado. Rahab dice que ya es
 * seguro. El niño camina hasta Rahab: fin feliz de la posada de Rahab. Verbo: SALIR.
 * (El cordón rojo, la huida por la muralla y el Jordán son de tramos posteriores.)
 */
export const escena25: Min10Scene = {
  id: 'm10_25_alivio',
  numero: 25,
  mundo: 'interior',
  titulo: 'Alivio en la posada',
  subtitulo: 'Ya es seguro. Sal del escondite y reúnete con Rahab. ¡Lo habéis conseguido!',
  jugador: 'spy',
  noche: true,
  ambiente: 'street',
  spawn: { x: -7.5, z: -1.6 },   // sales del hueco detrás del tapiz
  objetivo: { tipo: 'ir_a', texto: 'Sal del escondite y reúnete con Rahab', target: { x: -1.5, z: -4 }, radio: 2.6 },
  exito: '¡A salvo en la posada de Rahab! (fin del tramo 10–15)',
  camara: { yaw: 0, pitch: 0.34, dist: 17 },

  build(ctx: SceneContext): SceneInstance {
    const group = new THREE.Group();
    const stage: TavernStageHandle = buildTavernStage(ctx, { rahabAt: [-1.5, -4.5, 0] });
    const hide: HideoutsHandle = buildHideouts(ctx);
    group.add(stage.group); group.add(hide.group);

    ctx.scene.add(group);

    let hiddenNow = true;
    let doneFlag = false;
    let saidSafe = false;
    let thanked = false;
    const o = escena25.objetivo.target!;
    return {
      group,
      update(dt, t, player): void {
        stage.update(dt, t);
        if (!saidSafe) {                                 // Rahab avisa de que ya es seguro (film esc25)
          saidSafe = true;
          dlg.say('Rahab', 'Ya podéis salir… se han ido. Estáis a salvo.', { color: VOZ.rahab, ms: 3200 });
        }
        const inHide = hide.update(dt, t, player.x, player.z);
        if (inHide !== hiddenNow) { hiddenNow = inHide; ctx.setPlayerVisible?.(!inHide); }
        // Rahab, aliviada, saluda con la mano (leve vaivén alegre)
        if (stage.tav.rahab) stage.tav.rahab.root.rotation.y = Math.sin(t * 2) * 0.14;
        if (Math.hypot(player.x - o.x, player.z - o.z) < (escena25.objetivo.radio ?? 2.6)) {
          if (!doneFlag && !thanked) { thanked = true; dlg.say('Espía', 'Gracias, Rahab. Cumpliremos nuestra promesa.', { color: VOZ.espia, ms: 3000 }); }
          doneFlag = true;
        }
      },
      status(): string | null { return hiddenNow ? '🫥 Sal del escondite…' : '😌 ¡Aliviado! Ve con Rahab'; },
      hud() {
        const p = ctx.getPlayer();
        return { progress: THREE.MathUtils.clamp(1 - Math.hypot(p.x - o.x, p.z - o.z) / 14, 0, 1) };
      },
      isDone(): boolean { return doneFlag; },
      dispose(): void { stage.dispose(); }
    };
  }
};
