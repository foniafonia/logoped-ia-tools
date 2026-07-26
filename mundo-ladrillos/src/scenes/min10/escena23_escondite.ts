import * as THREE from 'three';
import { Min10Scene, SceneContext, SceneInstance } from './types';
import { buildTavernStage, buildHideouts, TavernStageHandle, HideoutsHandle } from './props/stage';
import { VisionCone } from '../min05/props/Npc';
import { buildGuard } from '../min05/props/Guard';

/**
 * ESCENA 23 (13:25) — ESCÓNDETE (MINI-JUEGO ESTRELLA · gato y ratón).
 * Un guardia REGISTRA la sala: patrulla barriendo la linterna y, cada pocos
 * segundos, va a INSPECCIONAR uno de los dos escondites (el TAPIZ del letrero o la
 * MACETA). El niño tiene que estar SIEMPRE en el escondite que el guardia NO va a
 * mirar: cuando lo veas ir a por uno, cruza al otro sin que el cono te pille.
 * Aguanta 3 inspecciones y el guardia se rinde. Corazón jugable del tramo.
 */

type Fase = 'patrulla' | 'yendo' | 'mirando' | 'volviendo';

export const escena23: Min10Scene = {
  id: 'm10_23_escondite',
  numero: 23,
  mundo: 'interior',
  titulo: 'Escóndete del guardia',
  subtitulo: 'El guardia registra la sala. Métete en el escondite que NO va a mirar y aguanta 3 rondas.',
  jugador: 'spy',
  noche: true,
  ambiente: 'street',
  spawn: { x: 0, z: 6 },
  objetivo: { tipo: 'sigilo', texto: 'Aguanta 3 rondas: escóndete siempre en el sitio que el guardia NO inspecciona', target: { x: -8.5, z: -7.5 }, radio: 2.4 },
  exito: '¡El guardia se rinde y no os encontró!',
  camara: { yaw: 0, pitch: 0.4, dist: 18 },

  build(ctx: SceneContext): SceneInstance {
    const group = new THREE.Group();
    const stage: TavernStageHandle = buildTavernStage(ctx);
    const hide: HideoutsHandle = buildHideouts(ctx);
    group.add(stage.group); group.add(hide.group);

    // guardia (lo conduzco a mano para el gato y ratón)
    const guard = buildGuard(ctx.plastic, 0, -1.5, Math.PI, false);
    group.add(guard.root);
    const cone = new VisionCone(16, 26); group.add(cone.mesh);
    // linterna (spot que sigue la mirada)
    const flash = new THREE.SpotLight(0xffe6a0, 7, 22, 0.5, 0.5, 1.5);
    group.add(flash); group.add(flash.target);
    // "!" sobre el guardia cuando te ve
    const bang = makeSprite('!', '#ff5a4d'); bang.position.set(0, 6, 0); bang.visible = false; guard.root.add(bang);

    // escondites como puntos de inspección: [posición, punto para asomarse]
    const spots = [
      { name: 'el TAPIZ', hx: hide.rug.x, hz: hide.rug.z, peerX: hide.rug.x, peerZ: hide.rug.z + 3.2, contains: (p: THREE.Vector3) => hide.rug.contains(p.x, p.z) },
      { name: 'la MACETA', hx: hide.pot.x, hz: hide.pot.z, peerX: hide.pot.x, peerZ: hide.pot.z + 3.2, contains: (p: THREE.Vector3) => hide.pot.contains(p.x, p.z) }
    ];
    const home = new THREE.Vector2(0, -1.5);

    ctx.scene.add(group);

    let fase: Fase = 'patrulla';
    let faseT = 0;
    let target = 0;                  // qué escondite va a inspeccionar
    let alarm = 0;
    let rondas = 0;                  // inspecciones superadas
    let cooldown = 0;                // tras pillarte, invulnerable un momento
    let hiddenNow = false;
    let shownReveal = false;
    let doneFlag = false;
    let gx = 0, gz = -1.5, gyaw = Math.PI;

    const moveTo = (tx: number, tz: number, dt: number, speed: number): boolean => {
      const dx = tx - gx, dz = tz - gz; const d = Math.hypot(dx, dz);
      if (d < 0.25) return true;
      const nx = dx / d, nz = dz / d;
      gx += nx * speed * dt; gz += nz * speed * dt;
      gyaw = Math.atan2(nx, nz);
      return false;
    };

    return {
      group,
      update(dt, t, player): void {
        stage.update(dt, t);
        const inHide = hide.update(dt, t, player.x, player.z);
        if (inHide !== hiddenNow) {
          hiddenNow = inHide; ctx.setPlayerVisible?.(!inHide);
          if (inHide && !shownReveal) {
            shownReveal = true;
            const s = hide.rug.contains(player.x, player.z) ? hide.rug : hide.pot;
            ctx.cameraReveal?.({ x: s.x, y: 6, z: s.z + 11 }, { x: s.x, y: 5.2, z: s.z + 8.5 }, { x: s.x, y: 4, z: s.z }, { x: s.x, y: 4, z: s.z }, 2.2);
          }
        }
        if (cooldown > 0) cooldown -= dt;

        // ----- máquina de estados del guardia -----
        faseT += dt;
        let moving = true;
        if (fase === 'patrulla') {
          // ronda por el centro barriendo la mirada
          const px = Math.sin(t * 0.6) * 4;
          moving = !moveTo(px, -1.5, dt, 2.4);
          gyaw = Math.PI + Math.sin(t * 0.9) * 0.9;         // barrido de la linterna
          if (faseT > 3.2) { fase = 'yendo'; faseT = 0; target = (target + 1) % 2; }
        } else if (fase === 'yendo') {
          const s = spots[target];
          if (moveTo(s.peerX, s.peerZ, dt, 3.0)) { fase = 'mirando'; faseT = 0; }
          gyaw = Math.atan2(spots[target].hx - gx, spots[target].hz - gz);
        } else if (fase === 'mirando') {
          moving = false;
          gyaw = Math.atan2(spots[target].hx - gx, spots[target].hz - gz);
          if (faseT > 2.2) { fase = 'volviendo'; faseT = 0; rondas++; }   // superada esta ronda
        } else { // volviendo
          if (moveTo(home.x, home.y, dt, 3.0)) { fase = 'patrulla'; faseT = 0; }
        }

        // aplicar al modelo + cono + linterna
        guard.root.position.set(gx, 0, gz); guard.root.rotation.y = gyaw;
        guard.fig.update(dt, moving, 1);
        cone.place(gx, gz, gyaw);
        flash.position.set(gx, 4, gz);
        flash.target.position.set(gx + Math.sin(gyaw) * 8, 0, gz + Math.cos(gyaw) * 8);

        // ----- detección -----
        const seenByCone = !hiddenNow && cooldown <= 0 && cone.contains(gx, gz, gyaw, player.x, player.z);
        const bustedInSpot = fase === 'mirando' && cooldown <= 0 && spots[target].contains(player);
        const seen = seenByCone || bustedInSpot;
        cone.setAlert(seen); bang.visible = seen;
        if (seen) {
          alarm = Math.min(1, alarm + dt * (bustedInSpot ? 1.6 : 0.9));
          if (alarm < 1 && Math.random() < dt * 2) ctx.sound.shout();
          if (alarm >= 1) {                              // ¡pillado! → vuelves al inicio
            alarm = 0; cooldown = 1.6; rondas = Math.max(0, rondas - 1);
            ctx.sound.alarm(); ctx.setPlayer(escena23.spawn.x, escena23.spawn.z);
          }
        } else {
          alarm = Math.max(0, alarm - dt * 0.8);
        }

        if (rondas >= 3) doneFlag = true;
      },
      status(): string | null {
        if (doneFlag) return '✅ El guardia se rinde y se va.';
        if (cooldown > 0) return '🚨 ¡Te ha visto! Vuelves a empezar';
        if (fase === 'yendo' || fase === 'mirando') return `🔦 ¡Va a mirar ${spots[target].name}! Vete al OTRO escondite`;
        return hiddenNow ? '🫥 Quieto… vigila a dónde va el guardia' : '🏃 Métete en un escondite';
      },
      hud() {
        const p = ctx.getPlayer();
        const near = hide.rug.contains(p.x, p.z) || hide.pot.contains(p.x, p.z);
        return {
          alarm,
          progress: THREE.MathUtils.clamp(rondas / 3, 0, 1),
          prompt: !near ? '🫥 Escóndete tras el tapiz o en la maceta' : (fase === 'yendo' || fase === 'mirando') ? `⚠️ Va a por ${spots[target].name}` : undefined
        };
      },
      isDone(): boolean { return doneFlag; },
      dispose(): void { stage.dispose(); }
    };
  }
};

function makeSprite(txt: string, color: string): THREE.Sprite {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d')!;
  x.fillStyle = color; x.font = 'bold 56px system-ui'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(txt, 32, 36);
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false }));
  spr.scale.set(1.8, 1.8, 1);
  return spr;
}
