import * as THREE from 'three';
import { Min15Scene, SceneContext, SceneInstance } from './types';
import { buildWallBalcony, BalconyHandle, WINDOW_POS, BALCONY_BOUNDS } from './props/balcony';
import { GuideBeacon, makeBubble } from './props/guide';

/**
 * ESCENA 27 (15:40) — EL CORDÓN ROJO.
 * El espía entrega a Rahab un cordón rojo brillante y le indica que lo ate FUERTE
 * en la ventana del balcón: será la SEÑAL sagrada para que, cuando Israel tome la
 * ciudad, se perdone la vida de todos los que estén dentro de esa casa.
 * Verbo del niño: ATAR el cordón en la ventana (acércate a la ventana + E).
 */
export const escena27: Min15Scene = {
  id: 'm15_27_cordon_rojo',
  numero: 27,
  mundo: 'balcon',
  titulo: 'El cordón rojo',
  subtitulo: 'Ata el cordón rojo en la ventana de Rahab: será la señal para salvar a su familia. Ve a la ventana y pulsa E.',
  jugador: 'spy',
  noche: true,
  ambiente: 'night',
  spawn: { x: -5, z: 3.5 },
  objetivo: { tipo: 'ir_a', texto: 'Ata el cordón rojo en la ventana (E)', target: { x: WINDOW_POS.x, z: -5.0 }, radio: 2.2 },
  exito: '¡Cordón rojo atado! Esta casa quedará a salvo.',
  camara: { yaw: 0, pitch: 0.32, dist: 17 },

  build(ctx: SceneContext): SceneInstance {
    const group = new THREE.Group();
    const bal: BalconyHandle = buildWallBalcony(ctx);
    group.add(bal.group);

    // --- El CORDÓN ROJO: al principio enrollado en la mano; al atarlo, cuelga ---
    const cordMat = new THREE.MeshStandardMaterial({ color: 0xd2241f, emissive: 0x5a0a08, emissiveIntensity: 0.35, roughness: 0.7 });
    // ovillo que el niño lleva (marca de "objeto en mano") junto al spawn
    const coil = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.22, 10, 20), cordMat);
    coil.position.set(escena27.spawn.x, 3.2, escena27.spawn.z); group.add(coil);

    // cordón atado (oculto hasta atarlo): baja desde el alféizar por la fachada
    const tied = new THREE.Group(); tied.visible = false; group.add(tied);
    const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.28, 0.12, 40, 6), cordMat);
    knot.position.set(WINDOW_POS.x, WINDOW_POS.y - 1.6, -5.9); tied.add(knot);
    const hang = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 5.2, 6), cordMat);
    hang.position.set(WINDOW_POS.x, WINDOW_POS.y - 4.2, -5.85); tied.add(hang);

    // baliza dorada sobre la ventana (aquí se pulsa E)
    const o = escena27.objetivo.target!;
    const beacon = new GuideBeacon(o.x, o.z, { action: true });
    group.add(beacon.group);

    // bocadillo de Rahab al atar
    const bubble = makeBubble('«¡Que Dios os proteja!» — Rahab');
    bubble.position.set(4.2, 6.4, -3.4); bubble.visible = false; group.add(bubble);

    ctx.scene.add(group);

    let tiedDone = false;
    let doneFlag = false;
    let tT = 0;
    const R = escena27.objetivo.radio ?? 2.2;
    return {
      group,
      update(dt, t, player): void {
        bal.update(dt, t);
        beacon.update(t);
        coil.rotation.y = t * 1.5; coil.position.y = 3.2 + Math.sin(t * 2) * 0.08;
        const near = Math.hypot(player.x - o.x, player.z - o.z) < R;
        if (near && !tiedDone && ctx.wantsInteract()) {
          tiedDone = true; coil.visible = false; tied.visible = true;
          bubble.visible = true; beacon.visible = false;
          ctx.sound.success();
        }
        if (tiedDone) {
          tT += dt;
          bubble.position.y = 6.4 + Math.sin(t * 3) * 0.08;
          // Rahab asiente agradecida
          bal.rahab.root.rotation.x = Math.sin(t * 4) * 0.08;
          if (tT > 1.6) doneFlag = true;
        }
      },
      status(): string | null { return tiedDone ? '🔴 Cordón atado. La casa está marcada.' : '🧶 Lleva el cordón a la ventana…'; },
      hud() {
        const p = ctx.getPlayer();
        const near = Math.hypot(p.x - o.x, p.z - o.z) < R;
        return {
          prompt: !tiedDone && near ? '🔴 Pulsa E para atar el cordón' : undefined,
          progress: THREE.MathUtils.clamp(1 - Math.hypot(p.x - o.x, p.z - o.z) / 12, 0, 1)
        };
      },
      isDone(): boolean { return doneFlag; },
      dispose(): void { bal.dispose(); beacon.dispose(); }
    };
  }
};
