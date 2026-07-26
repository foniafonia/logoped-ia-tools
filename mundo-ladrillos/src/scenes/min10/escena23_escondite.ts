import * as THREE from 'three';
import { Min10Scene, SceneContext, SceneInstance } from './types';
import { buildTavernStage, buildHideouts, TavernStageHandle, HideoutsHandle } from './props/stage';
import { StealthSystem } from '../min05/mechanics/StealthSystem';
import { VisionCone } from '../min05/props/Npc';
import { buildGuard } from '../min05/props/Guard';

/**
 * ESCENA 23 (13:25) — ESCÓNDETE (MINI-JUEGO ESTRELLA).
 * Un guardia ENTRA y barre la sala con la linterna. El niño tiene que quedarse
 * QUIETO en su escondite (tras el TAPIZ del letrero — que se abomba y respira — o
 * dentro de la MACETA) mientras el cono de visión pasa por encima. Barra de
 * detección: si se llena, ¡te ve! y vuelves a empezar. Corazón jugable del tramo.
 */
export const escena23: Min10Scene = {
  id: 'm10_23_escondite',
  numero: 23,
  mundo: 'interior',
  titulo: 'Escóndete del guardia',
  subtitulo: 'El guardia barre la sala con la linterna. Quédate quieto en tu escondite hasta que se rinda.',
  jugador: 'spy',
  noche: true,
  ambiente: 'street',
  spawn: { x: 0, z: 6 },
  objetivo: { tipo: 'sigilo', texto: 'Aguanta escondido mientras el guardia registra la sala', target: { x: -8.5, z: -7.5 }, radio: 2.4 },
  exito: '¡El guardia no os encontró!',
  camara: { yaw: 0, pitch: 0.4, dist: 18 },

  build(ctx: SceneContext): SceneInstance {
    const group = new THREE.Group();
    const stage: TavernStageHandle = buildTavernStage(ctx);
    const hide: HideoutsHandle = buildHideouts(ctx);
    group.add(stage.group); group.add(hide.group);

    // SIGILO: un guardia que barre la sala con la mirada (linterna = cono)
    const stealth = new StealthSystem(ctx.getPlayer, (x, z) => ctx.setPlayer(x, z), escena23.spawn, ctx.sound);
    const guard = buildGuard(ctx.plastic, 1, -5.5, 0, false);
    group.add(guard.root);
    const cone = new VisionCone(18, 24); group.add(cone.mesh);
    stealth.addGuard({ npc: guard, cone, baseYaw: 0, sweep: 0.85, sweepSpeed: 0.7 });
    stealth.addHidingSpot(hide.rug.hidingSpot);
    stealth.addHidingSpot(hide.pot.hidingSpot);
    for (const s of stealth.marksGroup) group.add(s);

    // linterna del guardia (luz que barre con su mirada)
    const flash = new THREE.SpotLight(0xffe6a0, 6, 24, 0.5, 0.5, 1.5);
    flash.position.set(1, 4, -5.5); group.add(flash); group.add(flash.target);

    ctx.scene.add(group);

    let hiddenNow = false;
    let shown = false;
    let surviveT = 0;
    let doneFlag = false;
    return {
      group,
      update(dt, t, player): void {
        stage.update(dt, t);
        const inHide = hide.update(dt, t, player.x, player.z);
        stealth.update(dt, t);
        // linterna sigue la mirada del guardia
        const yaw = guard.root.rotation.y;
        flash.position.set(guard.position.x, 4, guard.position.z);
        flash.target.position.set(guard.position.x + Math.sin(yaw) * 8, 0, guard.position.z + Math.cos(yaw) * 8);
        if (inHide !== hiddenNow) {
          hiddenNow = inHide; ctx.setPlayerVisible?.(!inHide);
          // primer plano del escondite (el bulto que respira) la primera vez
          if (inHide && !shown) {
            shown = true;
            const s = hide.rug.contains(player.x, player.z) ? hide.rug : hide.pot;
            ctx.cameraReveal?.(
              { x: s.x, y: 6.2, z: s.z + 12 }, { x: s.x, y: 5.4, z: s.z + 9 },
              { x: s.x, y: 4.1, z: s.z }, { x: s.x, y: 4.1, z: s.z }, 2.4
            );
          }
        }
        // aguanta escondido → cuenta el tiempo de supervivencia
        if (inHide && stealth.alarmLevel < 0.5) surviveT += dt; else if (!inHide) surviveT = Math.max(0, surviveT - dt * 0.5);
        if (surviveT > 6) doneFlag = true;
      },
      status(): string | null {
        if (doneFlag) return '✅ El guardia se rinde y se va.';
        return hiddenNow ? '🫥 Quieto… la linterna pasa por encima' : stealth.status() ?? '🏃 ¡Corre a un escondite!';
      },
      hud() {
        const p = ctx.getPlayer();
        const near = hide.rug.contains(p.x, p.z) || hide.pot.contains(p.x, p.z);
        return {
          alarm: stealth.alarmLevel,
          progress: THREE.MathUtils.clamp(surviveT / 6, 0, 1),
          prompt: !near ? '🫥 Escóndete tras el tapiz o en la maceta' : undefined
        };
      },
      isDone(): boolean { return doneFlag; },
      dispose(): void { stage.dispose(); }
    };
  }
};
