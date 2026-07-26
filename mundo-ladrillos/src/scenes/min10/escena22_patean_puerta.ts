import * as THREE from 'three';
import { Min10Scene, SceneContext, SceneInstance } from './types';
import { buildTavernStage, buildHideouts, TavernStageHandle, HideoutsHandle } from './props/stage';

/**
 * ESCENA 22 (12:35) — ¡PATEAN LA PUERTA! → ESCÓNDETE.
 * Rahab acepta y los manda esconderse justo cuando los guardias PATEAN la puerta
 * (¡BUM!). Transición a sigilo: el niño corre a meterse tras el TAPIZ del letrero
 * o en la MACETA grande antes de que entren. Verbo: ESCONDERSE (contrarreloj).
 */
export const escena22: Min10Scene = {
  id: 'm10_22_patean_puerta',
  numero: 22,
  mundo: 'interior',
  titulo: '¡Patean la puerta!',
  subtitulo: '¡BUM! Golpean la puerta. Rahab señala: «¡Escondeos!». Corre al tapiz o a la maceta.',
  jugador: 'spy',
  noche: true,
  ambiente: 'street',
  spawn: { x: 0, z: 5 },
  objetivo: { tipo: 'esconderse', texto: 'Escóndete tras el tapiz o dentro de la maceta', target: { x: -8.5, z: -7.5 }, radio: 2.4 },
  exito: '¡Escondido justo a tiempo!',
  camara: { yaw: 0, pitch: 0.36, dist: 18 },

  build(ctx: SceneContext): SceneInstance {
    const group = new THREE.Group();
    const stage: TavernStageHandle = buildTavernStage(ctx);
    const hide: HideoutsHandle = buildHideouts(ctx);
    group.add(stage.group); group.add(hide.group);

    // puerta del arco que se sacude con cada patada
    const door = new THREE.Mesh(new THREE.BoxGeometry(3, 5, 0.5), ctx.plastic.get(0x5a3a1e));
    door.position.set(8, 2.6, -10.4); group.add(door);

    ctx.scene.add(group);

    let hiddenNow = false;
    let doneFlag = false;
    let kickT = 0;
    return {
      group,
      update(dt, t, player): void {
        stage.update(dt, t);
        const inHide = hide.update(dt, t, player.x, player.z);
        if (inHide !== hiddenNow) { hiddenNow = inHide; ctx.setPlayerVisible?.(!inHide); }
        // patadas periódicas a la puerta (sacudida + golpe grave)
        kickT -= dt;
        if (kickT <= 0 && !doneFlag) { kickT = 1.2; ctx.sound.gate(); door.position.z = -10.4; }
        door.position.z = -10.4 + Math.max(0, kickT > 1.05 ? (kickT - 1.05) * 4 : 0);
        // Rahab señala los escondites (brazo/vaivén nervioso)
        if (stage.tav.rahab) stage.tav.rahab.root.rotation.y = 0.5 + Math.sin(t * 6) * 0.2;
        if (inHide) doneFlag = true;
      },
      status(): string | null { return hiddenNow ? '🫥 ¡Escondido!' : '🏃 ¡Corre a esconderte, ya entran!'; },
      hud() {
        const p = ctx.getPlayer();
        const nearRug = hide.rug.contains(p.x, p.z);
        const nearPot = hide.pot.contains(p.x, p.z);
        return { prompt: !hiddenNow && !nearRug && !nearPot ? '🫥 Métete tras el tapiz o en la maceta' : undefined };
      },
      isDone(): boolean { return doneFlag; },
      dispose(): void { stage.dispose(); }
    };
  }
};
