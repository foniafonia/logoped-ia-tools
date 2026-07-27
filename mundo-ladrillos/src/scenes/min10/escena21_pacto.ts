import * as THREE from 'three';
import { Min10Scene, SceneContext, SceneInstance } from './types';
import { buildTavernStage, buildHideouts, TavernStageHandle, HideoutsHandle } from './props/stage';
import { dlg, VOZ } from './props/rahabDialogue';

/**
 * ESCENA 21 (12:06) — EL PACTO CON RAHAB.
 * En secreto, el espía revela a Rahab que son de Israel y le JURAN salvarla a
 * ella y a su familia cuando tomen la ciudad. El niño se acerca a Rahab y susurra
 * (E). Verbo: HABLAR / jurar. (El cordón rojo llega en un tramo posterior.)
 */
export const escena21: Min10Scene = {
  id: 'm10_21_pacto',
  numero: 21,
  mundo: 'interior',
  titulo: 'El pacto con Rahab',
  subtitulo: 'Susurra a Rahab: «Somos de Israel». Júrale que la salvaréis. Acércate y pulsa E.',
  jugador: 'spy',
  noche: true,
  ambiente: 'street',
  spawn: { x: 2, z: 3 },
  objetivo: { tipo: 'ir_a', texto: 'Acércate a Rahab y susurra el pacto (E)', target: { x: -1.5, z: -3.5 }, radio: 2.4 },
  exito: 'Rahab acepta. «Escondeos, yo os cubriré.»',
  camara: { yaw: 0, pitch: 0.32, dist: 16 },

  build(ctx: SceneContext): SceneInstance {
    const group = new THREE.Group();
    const stage: TavernStageHandle = buildTavernStage(ctx);
    const hide: HideoutsHandle = buildHideouts(ctx);
    group.add(stage.group); group.add(hide.group);

    // bocadillo de "susurro" (aparece al pactar)
    const bubble = makeBubble('🤝 «Os salvaremos»');
    bubble.position.set(-1.5, 6.2, -5); bubble.visible = false; group.add(bubble);

    ctx.scene.add(group);

    let pacted = false;
    let doneFlag = false;
    let pactT = 0;
    const o = escena21.objetivo.target!;
    return {
      group,
      update(dt, t, player): void {
        stage.update(dt, t);
        hide.update(dt, t, player.x, player.z);
        const near = Math.hypot(player.x - o.x, player.z - o.z) < (escena21.objetivo.radio ?? 2.4);
        if (near && !pacted && ctx.wantsInteract()) {
          pacted = true; bubble.visible = true; ctx.sound.success();
          // El PACTO (film esc21): susurro emisario → Rahab acepta → juramento
          dlg.say('Espía', '(susurra) Somos emisarios de Israel; nos envía Josué. Escóndenos.', { color: VOZ.espia, ms: 3200 });
          dlg.say('Rahab', 'Lo sé… vuestro Dios va con vosotros. Os ayudaré.', { color: VOZ.rahab, ms: 3000 });
          dlg.say('Espía', 'Te lo juramos por Dios: salvaremos tu vida y tu casa.', { color: VOZ.espia, ms: 3200 });
        }
        if (pacted) {
          pactT += dt;
          bubble.position.y = 6.2 + Math.sin(t * 3) * 0.08;
          // Rahab asiente
          if (stage.tav.rahab) stage.tav.rahab.root.rotation.x = Math.sin(t * 4) * 0.08;
          if (pactT > 1.6) doneFlag = true;
        }
      },
      status(): string | null { return pacted ? '🤝 Rahab jura ayudaros.' : null; },
      hud() {
        const p = ctx.getPlayer();
        const near = Math.hypot(p.x - o.x, p.z - o.z) < (escena21.objetivo.radio ?? 2.4);
        return { prompt: !pacted && near ? '🤝 Pulsa E para susurrar el pacto' : undefined };
      },
      isDone(): boolean { return doneFlag; },
      dispose(): void { stage.dispose(); }
    };
  }
};

function makeBubble(text: string): THREE.Sprite {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const x = c.getContext('2d')!;
  x.fillStyle = 'rgba(255,255,255,.92)'; roundRect(x, 8, 8, 496, 96, 24); x.fill();
  x.fillStyle = '#1a1208'; x.font = 'bold 44px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(text, 256, 60);
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false }));
  spr.scale.set(6, 1.5, 1);
  return spr;
}
function roundRect(x: CanvasRenderingContext2D, px: number, py: number, w: number, h: number, r: number): void {
  x.beginPath(); x.moveTo(px + r, py); x.arcTo(px + w, py, px + w, py + h, r); x.arcTo(px + w, py + h, px, py + h, r);
  x.arcTo(px, py + h, px, py, r); x.arcTo(px, py, px + w, py, r); x.closePath();
}
