import * as THREE from 'three';
import { Min10Scene, SceneContext, SceneInstance } from './types';
import { buildTavernStage, buildHideouts, TavernStageHandle, HideoutsHandle } from './props/stage';
import { buildGuard } from '../min05/props/Guard';

/**
 * ESCENA 24 (14:01) — RAHAB MIENTE A LOS GUARDIAS.
 * Rahab abre y MIENTE: «Estuvieron aquí, pero huyeron; salieron por la puerta
 * hacia el río. ¡Id tras ellos!». Los guardias salen corriendo. El niño, escondido,
 * tiene que CONTENER LA RESPIRACIÓN y no moverse hasta que se vayan. Verbo: AGUANTAR.
 */
export const escena24: Min10Scene = {
  id: 'm10_24_rahab_miente',
  numero: 24,
  mundo: 'interior',
  titulo: 'Rahab miente a los guardias',
  subtitulo: 'Rahab señala al río: «¡Huyeron por allí!». No te muevas del escondite hasta que se vayan.',
  jugador: 'spy',
  noche: true,
  ambiente: 'street',
  spawn: { x: -7.5, z: -1.6 },   // empiezas ya escondido en el hueco detrás del tapiz
  objetivo: { tipo: 'esconderse', texto: 'Quédate quieto en el escondite mientras Rahab los engaña', target: { x: -7.5, z: -1.6 }, radio: 2.4 },
  exito: 'Los guardias se lo tragan y salen corriendo al río.',
  camara: { yaw: 0, pitch: 0.4, dist: 19 },

  build(ctx: SceneContext): SceneInstance {
    const group = new THREE.Group();
    const stage: TavernStageHandle = buildTavernStage(ctx, { rahabAt: [6, -8.5, Math.PI] }); // Rahab en la puerta
    const hide: HideoutsHandle = buildHideouts(ctx);
    group.add(stage.group); group.add(hide.group);

    // guardia en la puerta escuchando a Rahab
    const guard = buildGuard(ctx.plastic, 9, -9, Math.PI, true);
    group.add(guard.root);
    // bocadillo de la mentira de Rahab
    const bubble = makeBubble('«¡Huyeron al río!»');
    bubble.position.set(6, 6, -7); group.add(bubble);

    ctx.scene.add(group);

    let hiddenNow = false;
    let progress = 0;
    let leaving = false;
    let doneFlag = false;
    return {
      group,
      update(dt, t, player): void {
        stage.update(dt, t);
        const inHide = hide.update(dt, t, player.x, player.z);
        if (inHide !== hiddenNow) { hiddenNow = inHide; ctx.setPlayerVisible?.(!inHide); }
        // Rahab gesticula señalando fuera
        if (stage.tav.rahab) stage.tav.rahab.root.rotation.y = Math.PI + Math.sin(t * 3) * 0.25;
        bubble.position.y = 6 + Math.sin(t * 3) * 0.08;
        // la mentira "cuela" mientras el niño aguanta quieto y escondido
        if (inHide) progress = Math.min(1, progress + dt * 0.22);
        if (progress >= 1 && !leaving) { leaving = true; ctx.sound.gate(); }
        if (leaving) {
          // el guardia se va corriendo hacia el río (sale por el arco)
          guard.root.position.z = Math.max(-22, guard.root.position.z - dt * 9);
          guard.root.rotation.y = Math.PI;
          guard.update(dt);
          if (guard.root.position.z <= -20) doneFlag = true;
        } else {
          guard.update(dt);
        }
      },
      status(): string | null {
        if (leaving) return '🏃 ¡Se van corriendo al río!';
        if (!hiddenNow) return '⚠️ ¡Vuelve al escondite, aún están aquí!';
        return '😶‍🌫️ Aguanta la respiración… Rahab los engaña';
      },
      hud() {
        return { progress, alarm: hiddenNow ? 0 : 0.6, prompt: !hiddenNow ? '🫥 ¡Vuelve al tapiz o a la maceta!' : undefined };
      },
      isDone(): boolean { return doneFlag; },
      dispose(): void { stage.dispose(); }
    };
  }
};

function makeBubble(text: string): THREE.Sprite {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const x = c.getContext('2d')!;
  x.fillStyle = 'rgba(255,255,255,.92)';
  x.beginPath(); const r = 24, w = 496, h = 96, px = 8, py = 8;
  x.moveTo(px + r, py); x.arcTo(px + w, py, px + w, py + h, r); x.arcTo(px + w, py + h, px, py + h, r);
  x.arcTo(px, py + h, px, py, r); x.arcTo(px, py, px + w, py, r); x.closePath(); x.fill();
  x.fillStyle = '#1a1208'; x.font = 'bold 46px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(text, 256, 60);
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false }));
  spr.scale.set(6, 1.5, 1);
  return spr;
}
