import * as THREE from 'three';
import { Min15Scene, SceneContext, SceneInstance } from './types';
import { buildWallBalcony, BalconyHandle, WINDOW_POS } from './props/balcony';
import { GuideBeacon, makeBubble } from './props/guide';
import { buildCrateStack, buildSackPile, buildPotCluster } from '../../world/Clutter';

/**
 * ESCENA 27 (15:40) — EL CORDÓN ROJO.
 * El espía entrega a Rahab un cordón rojo brillante para que sea la SEÑAL sagrada:
 * cuando Israel tome la ciudad, se perdonará a todos los que estén en esa casa.
 *
 * El niño lo hace EN DOS PASOS (táctil, nada mágico):
 *   1) va al ovillo del cordón sobre la mesita y pulsa E → lo COGE (lo lleva en la
 *      mano, le sigue a todas partes);
 *   2) lo lleva a la ventana de Rahab y pulsa E → lo ATA (queda colgando).
 */
export const escena27: Min15Scene = {
  id: 'm15_27_cordon_rojo',
  numero: 27,
  mundo: 'balcon',
  titulo: 'El cordón rojo',
  subtitulo: 'Coge el cordón rojo (E) y llévalo a la ventana de Rahab para atarlo: será la señal que salve a su familia.',
  jugador: 'spy',
  noche: true,
  ambiente: 'night',
  spawn: { x: -6, z: 4 },
  objetivo: { tipo: 'ir_a', texto: 'Coge el cordón y átalo en la ventana (E)', target: { x: WINDOW_POS.x, z: -4.6 }, radio: 2.2 },
  exito: '¡Cordón rojo atado! Esta casa quedará a salvo.',
  camara: { yaw: 0, pitch: 0.32, dist: 17 },

  build(ctx: SceneContext): SceneInstance {
    const group = new THREE.Group();
    const bal: BalconyHandle = buildWallBalcony(ctx);
    group.add(bal.group);

    const cordMat = new THREE.MeshStandardMaterial({ color: 0xd2241f, emissive: 0x6a0c0a, emissiveIntensity: 0.4, roughness: 0.65 });

    // --- Mesita con el OVILLO del cordón (punto de recogida) ---
    const pickup = new THREE.Vector3(-6, 0, 1.2);
    const table = new THREE.Group(); table.position.copy(pickup); group.add(table);
    table.add(new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.3, 1.6), new THREE.MeshStandardMaterial({ color: 0x6d4a2a, roughness: 0.9 })).translateY(1.6));
    for (const [sx, sz] of [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]]) table.add(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.6, 6), new THREE.MeshStandardMaterial({ color: 0x5a3c22 })).translateX(sx).translateY(0.8).translateZ(sz));
    const coil = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.22, 12, 22), cordMat);
    coil.position.set(0, 2.2, 0); coil.rotation.x = Math.PI / 2; table.add(coil);

    // --- Cordón que el niño LLEVA en la mano (sigue al jugador) ---
    const carried = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.18, 10, 18), cordMat);
    carried.rotation.x = Math.PI / 2; carried.visible = false; group.add(carried);

    // --- Cordón ATADO en la ventana (oculto hasta atarlo) ---
    const tied = new THREE.Group(); tied.visible = false; group.add(tied);
    const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.28, 0.12, 40, 6), cordMat);
    knot.position.set(WINDOW_POS.x + 1.5, WINDOW_POS.y - 1.7, -5.55); tied.add(knot);
    const hang = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 5.6, 6), cordMat);
    hang.position.set(WINDOW_POS.x + 1.5, WINDOW_POS.y - 4.4, -5.5); tied.add(hang);

    // --- Baliza de guía (primero al ovillo, luego a la ventana) ---
    const beacon = new GuideBeacon(pickup.x, pickup.z, { action: true });
    group.add(beacon.group);

    const bubble = makeBubble('«¡Que Dios os proteja!» — Rahab');
    bubble.position.set(4.2, 6.4, -3.4); bubble.visible = false; group.add(bubble);

    // === REGLA Nº1: enseres de azotea en esquinas y lado derecho (no tapan el
    // recorrido spawn→mesita(-6,1.2)→ventana(0,-4.6) ni a Rahab en (4.2,-3.4)).
    // Attrezzo reutilizable del muñequero (world/Clutter): vasijas, cajas y sacos. ===
    const drop = (g: THREE.Group, x: number, z: number, r = 1): void => { group.add(g); ctx.addObstacle(x, z, r, r); };
    drop(buildCrateStack(ctx.plastic, { x: -8.2, z: -4.3, yaw: 0.3, n: 2 }), -8.2, -4.3);
    drop(buildPotCluster(ctx.plastic, { x: 7.6, z: -4.4 }), 7.6, -4.4);
    drop(buildSackPile(ctx.plastic, { x: 8.6, z: 2.2 }), 8.6, 2.2);
    drop(buildPotCluster(ctx.plastic, { x: -8.5, z: 6 }), -8.5, 6);
    drop(buildCrateStack(ctx.plastic, { x: 8.7, z: 6, yaw: -0.3, n: 3 }), 8.7, 6);

    ctx.scene.add(group);

    type Phase = 'toPickup' | 'toWindow' | 'tied';
    let phase: Phase = 'toPickup';
    let doneFlag = false;
    let tT = 0;
    const win = escena27.objetivo.target!;
    const RP = 2.0, RW = escena27.objetivo.radio ?? 2.2;

    return {
      group,
      update(dt, t, player): void {
        bal.update(dt, t);
        beacon.update(t);
        coil.rotation.z = t * 1.4;

        if (phase === 'toPickup') {
          const near = Math.hypot(player.x - pickup.x, player.z - pickup.z) < RP;
          if (near && ctx.wantsInteract()) {
            phase = 'toWindow';
            coil.visible = false; carried.visible = true;
            beacon.setPos(win.x, win.z); // la guía salta a la ventana
            ctx.sound.jump?.();
          }
        } else if (phase === 'toWindow') {
          // el cordón sigue al niño (en la mano)
          carried.position.set(player.x + 0.5, 2.6 + Math.sin(t * 4) * 0.06, player.z + 0.3);
          carried.rotation.z = t * 2;
          const near = Math.hypot(player.x - win.x, player.z - win.z) < RW;
          if (near && ctx.wantsInteract()) {
            phase = 'tied';
            carried.visible = false; tied.visible = true; bubble.visible = true; beacon.visible = false;
            ctx.sound.success();
          }
        } else {
          tT += dt;
          bubble.position.y = 6.4 + Math.sin(t * 3) * 0.08;
          bal.rahab.root.rotation.x = Math.sin(t * 4) * 0.08;
          if (tT > 1.6) doneFlag = true;
        }
      },
      status(): string | null {
        if (phase === 'toPickup') return '🧶 Ve al cordón rojo y cógelo (E)';
        if (phase === 'toWindow') return '🔴 ¡Lo llevas! Átalo en la ventana (E)';
        return '🔴 Cordón atado. La casa está marcada.';
      },
      hud() {
        const p = ctx.getPlayer();
        if (phase === 'toPickup') {
          const near = Math.hypot(p.x - pickup.x, p.z - pickup.z) < RP;
          return { prompt: near ? '🧶 Pulsa E para coger el cordón' : undefined,
                   progress: THREE.MathUtils.clamp(1 - Math.hypot(p.x - pickup.x, p.z - pickup.z) / 10, 0, 1) };
        }
        if (phase === 'toWindow') {
          const near = Math.hypot(p.x - win.x, p.z - win.z) < RW;
          return { prompt: near ? '🔴 Pulsa E para atar el cordón' : undefined,
                   progress: THREE.MathUtils.clamp(1 - Math.hypot(p.x - win.x, p.z - win.z) / 12, 0, 1) };
        }
        return { progress: 1 };
      },
      isDone(): boolean { return doneFlag; },
      dispose(): void { bal.dispose(); beacon.dispose(); }
    };
  }
};
