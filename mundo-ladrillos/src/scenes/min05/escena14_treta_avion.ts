import * as THREE from 'three';
import { Min05Scene, SceneContext, SceneInstance } from './types';
import { BrickPalette } from '../../materials/BrickPalette';
import { studdedPlate, buildMarketStall, buildBarrel, buildPalm, buildRock, brickBox } from './props/BrickProps';
import { buildStraightWallLike } from './props/Walls';
import { buildArchGate, buildBrazier, buildLantern, buildBanner } from './props/NightAmbience';
import { buildLanternString, buildLaundryLine } from '../../world/StreetProps';
import { Wanderers } from './props/Wanderers';
import { Distraction } from './mechanics/Distraction';
import { buildGuard } from './props/Guard';
import { Collectibles } from './props/Collectibles';
import { ESPIA1_CAMP, ESPIA2_CAMP } from './skins';

/** Rectángulo redondeado en canvas (para el cartel del avión). */
function roundRect(x: CanvasRenderingContext2D, px: number, py: number, w: number, h: number, r: number): void {
  x.beginPath();
  x.moveTo(px + r, py);
  x.arcTo(px + w, py, px + w, py + h, r);
  x.arcTo(px + w, py + h, px, py + h, r);
  x.arcTo(px, py + h, px, py, r);
  x.arcTo(px, py, px + w, py, r);
  x.closePath();
}

/**
 * ESCENA 14 (512–533s) — GUARDIAS EN LA PUERTA; LA TRETA DEL "¡UN AVIÓN!".
 * Dos guardias custodian el portal arqueado de Jericó. El jugador llega al punto
 * de grito y pulsa E: «¡Mirad, un avión!». Un avión de ladrillo cruza el cielo
 * (con sonido), los guardias miran arriba y la puerta se abre. Objetivo:
 * distraerlos con la treta.
 */
export const escena14: Min05Scene = {
  id: 'm05_14_treta_avion',
  numero: 14,
  titulo: 'La treta del avión',
  subtitulo: '«Es una noche bastante tranquila, ¿no crees?» — «¡UN AVIÓN!» Y todos alzan la vista.',
  jugador: 'spy',
  noche: true,
  ambiente: 'street',
  spawn: { x: -10, z: -16 },
  objetivo: { tipo: 'distraer', texto: 'Ve a la marca, pulsa E («¡un avión!») y cuélate por la puerta', target: { x: 0, z: 22 }, radio: 4 },
  exito: '¡Colado por la puerta mientras miraban al cielo!',
  camara: { yaw: Math.PI, pitch: 0.32, dist: 30 },

  build(ctx: SceneContext): SceneInstance {
    const { plastic } = ctx;
    const group = new THREE.Group();

    const floor = studdedPlate(plastic, 70, 50, BrickPalette.DARK_SAND, false);
    floor.position.set(0, -0.4, 2); group.add(floor);

    const wallL = buildStraightWallLike(plastic, 28, 12, false); wallL.position.set(-23, 0, 16); group.add(wallL); ctx.addObstacle(-23, 16, 14, 2);
    const wallR = buildStraightWallLike(plastic, 28, 12, false); wallR.position.set(23, 0, 16); group.add(wallR); ctx.addObstacle(23, 16, 14, 2);
    const gate = buildArchGate(plastic, 9, 10); gate.group.position.set(0, 0, 16); group.add(gate.group);
    ctx.addObstacle(-7, 16, 2, 2); ctx.addObstacle(7, 16, 2, 2);

    const braziers = [buildBrazier(plastic, -11, 12, 15), buildBrazier(plastic, 11, 12, 15)];
    braziers.forEach((b) => group.add(b.group));
    const lantern = buildLantern(plastic, 0, 9, 13); group.add(lantern.group);
    const spotLantern = buildLantern(plastic, -6, 5, -2); group.add(spotLantern.group); // ilumina la zona de la marca
    for (const x of [-16, 16]) { const b = buildBanner(plastic, BrickPalette.DARK_RED, 1.4, 4.5); b.position.set(x, 9, 14.6); group.add(b); }

    // === AMUEBLADO de la plaza (antes muy vacía) — props SIN luz + 1 guirnalda ===
    group.add(buildLanternString(plastic, { ax: -14, az: 4, bx: 14, bz: 4, height: 8, count: 8, lights: 2 }));
    group.add(buildLaundryLine(plastic, { ax: -18, az: 8, bx: -18, bz: 14, height: 5.2, seed: 5 }));
    const stallA = buildMarketStall(plastic, BrickPalette.DARK_BLUE); stallA.position.set(-17, 0, 2); stallA.rotation.y = 0.5; group.add(stallA); ctx.addObstacle(-17, 2, 2.6, 1.6);
    const stallB = buildMarketStall(plastic, BrickPalette.DARK_RED); stallB.position.set(17, 0, 0); stallB.rotation.y = -0.5; group.add(stallB); ctx.addObstacle(17, 0, 2.6, 1.6);
    for (const [cx, cz] of [[-15, -8], [-13.5, -9], [15, -6], [13, -10], [19, 6]] as const) { group.add(brickBox(plastic, 1.8, 1.8, 1.8, (cx < 0 ? BrickPalette.BROWN : BrickPalette.DARK_SAND), cx, 0.9, cz)); ctx.addObstacle(cx, cz, 0.95, 0.95); }
    for (const [bx, bz] of [[-12, -12], [16, -12], [-18, 6]] as const) { const br = buildBarrel(plastic); br.position.set(bx, 0, bz); group.add(br); ctx.addObstacle(bx, bz, 1, 1); }
    for (const [px, pz] of [[-21, -6], [21, -8]] as const) { group.add(buildPalm(plastic, px, pz, 8)); ctx.addObstacle(px, pz, 1, 1); }
    for (const [rx, rz, s] of [[-20, -14, 1.0], [20, -15, 0.9]] as const) { const rk = buildRock(plastic, s); rk.position.set(rx, 0, rz); group.add(rk); ctx.addObstacle(rx, rz, 1.5 * s, 1.3 * s); }
    // vecinos de la calle (acotados a las esquinas, no estorban la marca ni la puerta)
    const life = new Wanderers(plastic, [ESPIA1_CAMP, ESPIA2_CAMP], 3, { minX: -21, maxX: -14, minZ: -12, maxZ: 2 });
    group.add(life.group);

    // dos guardias delante de la puerta
    const gA = buildGuard(plastic, -5, 11, Math.PI);
    const gB = buildGuard(plastic, 5, 11, Math.PI, true); // jefe
    gA.lookAt(-5, -20); gB.lookAt(5, -20);
    group.add(gA.root, gB.root);

    const distr = new Distraction(plastic, [gA, gB]); group.add(distr.group);

    const gems = new Collectibles(plastic, ctx.sound, [{ x: -10, z: -10 }, { x: -4, z: -8 }, { x: 4, z: -8 }, { x: 8, z: -4 }, { x: 0, z: -12 }]);
    group.add(gems.group);

    // marca del grito (antes) y meta al otro lado de la puerta (después)
    const spot = new THREE.Mesh(new THREE.RingGeometry(1.4, 2, 24), new THREE.MeshBasicMaterial({ color: 0xffd24a, transparent: true, opacity: 0.75, side: THREE.DoubleSide }));
    spot.rotation.x = -Math.PI / 2; spot.position.set(0, 0.2, -4); group.add(spot);
    const goal = new THREE.Mesh(new THREE.RingGeometry(1.4, 2, 24), new THREE.MeshBasicMaterial({ color: 0x8fe0ff, transparent: true, opacity: 0.75, side: THREE.DoubleSide }));
    goal.rotation.x = -Math.PI / 2; goal.position.set(0, 0.2, 22); goal.visible = false; group.add(goal);

    // CARTEL grande "¡MIRA, UN AVIÓN!" (gag VISUAL: se entiende CON o SIN voz de peli).
    // Billboard en el cielo, sobre el avión; aparece al disparar la treta.
    const avionSign = (() => {
      const c = document.createElement('canvas'); c.width = 1024; c.height = 256;
      const x = c.getContext('2d')!;
      x.fillStyle = 'rgba(10,14,22,.82)'; roundRect(x, 8, 8, 1008, 240, 40); x.fill();
      x.lineWidth = 8; x.strokeStyle = '#ffd24a'; x.stroke();
      x.fillStyle = '#ffe08a'; x.font = 'bold 120px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText('✈  ¡MIRA, UN AVIÓN!  ✈', 512, 138);
      const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false }));
      spr.scale.set(20, 5, 1); spr.position.set(0, 15, 4); spr.visible = false; spr.renderOrder = 10;
      return spr;
    })();
    group.add(avionSign);

    ctx.scene.add(group);

    // BANTER de apertura (diálogo compartido): los espías fingen calma antes de la
    // treta. Prepara el gag visual "¡UN AVIÓN!" (frases reales de la peli, 5:12).
    const AZUL = 0x6f9fc4;
    ctx.say?.('Es una noche bastante tranquila, ¿no crees?', 'Espía', 3.0, AZUL);
    ctx.say?.('Sí… demasiado tranquila. Ve a la marca y grita lo del avión.', 'Espía 2', 3.6, 0xc98b5a);

    const GOAL_Z = 20;
    let triggered = false;
    let doneFlag = false;
    let planeSfx: { stop: () => void } | null = null;
    let gateSoundDone = false;
    return {
      group,
      update(dt, t, player) {
        braziers.forEach((b) => b.update(t)); lantern.update(t); spotLantern.update(t);
        distr.update(dt, t); life.update(dt);
        gems.update(dt, t, player);
        if (!triggered) {
          gA.update(dt); gB.update(dt);
          spot.scale.setScalar(1 + Math.sin(t * 4) * 0.1);
          const near = Math.hypot(player.x - 0, player.z - (-4)) < 3.2;
          if (near && ctx.wantsInteract()) {
            distr.trigger(); triggered = true;
            planeSfx = ctx.sound.plane(); ctx.sound.playClip('m0510_14_avion', 1.6);
            ctx.flash?.('✈  ¡MIRA, UN AVIÓN!  ✈', 3.2);   // gag VISUAL siempre en cuadro (con o sin voz)
            spot.visible = false; goal.visible = true;
            // la cámara mira arriba al avión ~2,4 s y luego devuelve el control
            ctx.cameraFocus?.(distr.planeObject, 2.4);
          }
        } else {
          gate.setOpen(1);                       // una vez hecha la treta, la puerta queda abierta
          if (!gateSoundDone) { ctx.sound.gate(); gateSoundDone = true; }
          if (!distr.active && planeSfx) { planeSfx.stop(); planeSfx = null; }
          // CARTEL "¡MIRA, UN AVIÓN!" mientras dura la distracción (bota y late)
          avionSign.visible = distr.active;
          if (distr.active) {
            avionSign.position.set(0, 15 + Math.sin(t * 3) * 0.5, 4);
            const s = 20 + Math.sin(t * 8) * 0.8; avionSign.scale.set(s, s * 0.25, 1);
          }
          goal.scale.setScalar(1 + Math.sin(t * 3) * 0.1);
          if (player.z > GOAL_Z) doneFlag = true; // ¡colado por la puerta!
        }
      },
      status() {
        if (!triggered) return null;
        return distr.active ? '✈️ ¡Miran al cielo! ¡Corre, cuélate!' : '🚪 ¡La puerta sigue abierta, entra!';
      },
      hud() {
        const p = ctx.getPlayer();
        if (!triggered) {
          // objetivo dinámico FASE 1: guía a la MARCA de la treta (no a la puerta)
          const near = Math.hypot(p.x - 0, p.z - (-4)) < 3.2;
          return { progress: 0, goal: [0, -4] as [number, number], prompt: near ? 'Pulsa E: «¡un avión!»' : undefined, gems: { got: gems.got, total: gems.total } };
        }
        // objetivo dinámico FASE 2: ahora sí, guía a la PUERTA
        const prog = THREE.MathUtils.clamp((p.z - (-4)) / (GOAL_Z + 4), 0, 1);
        return { progress: prog, goal: [0, GOAL_Z + 2] as [number, number], prompt: distr.active ? '🏃 ¡AHORA! ¡Cuélate por la puerta!' : undefined, gems: { got: gems.got, total: gems.total } };
      },
      isDone() { return doneFlag; }
    };
  }
};
