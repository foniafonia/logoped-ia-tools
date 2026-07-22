import * as THREE from 'three';
import { Min05Scene, SceneContext, SceneInstance } from './types';
import { BrickPalette } from '../../materials/BrickPalette';
import { buildHouse, buildBarrel, studdedPlate, brickBox } from './props/BrickProps';
import { buildBrazier, buildLantern, buildBanner } from './props/NightAmbience';
import { StealthSystem } from './mechanics/StealthSystem';
import { VisionCone, Npc } from './props/Npc';
import { buildGuard } from './props/Guard';
import { Collectibles } from './props/Collectibles';

/**
 * ESCENA 16 (545–604s) — LOS GUARDIAS VUELVEN POR LAS CALLES BUSCÁNDOLOS.
 * Calles de Jericó de noche (adoquines, faroles, casas), como el plano real del
 * "Restaurante de Rahab". Guardias que PATRULLAN (sus conos siguen su rumbo).
 * Objetivo (sigilo/huir): llega al refugio del fondo sin que se llene la alarma,
 * usando callejones y tinajas para esconderte.
 */
export const escena16: Min05Scene = {
  id: 'm05_16_guardias_calles',
  numero: 16,
  titulo: 'Patrullas en las calles',
  subtitulo: 'Los guardias recorren las calles buscándolos. Llega al refugio sin ser visto.',
  jugador: 'spy',
  noche: true,
  ambiente: 'street',
  spawn: { x: 0, z: -22 },
  objetivo: { tipo: 'sigilo', texto: 'Alcanza el refugio del fondo sin que se llene la alarma', target: { x: 0, z: 30 }, radio: 3.5 },
  exito: '¡A salvo en el refugio! (fin del tramo 5–10)',
  camara: { yaw: Math.PI, pitch: 0.46, dist: 32 },

  build(ctx: SceneContext): SceneInstance {
    const { plastic } = ctx;
    const group = new THREE.Group();

    const floor = studdedPlate(plastic, 56, 66, BrickPalette.DARK_SAND, false);
    floor.position.set(0, -0.4, 4); group.add(floor);

    // manzanas de casas dejando calle central + callejones (con colisión)
    const blocks: Array<[number, number, number, number]> = [
      [-16, -6, 9, 9], [16, -6, 9, 8], [-16, 12, 9, 10], [16, 12, 9, 9], [-16, 28, 9, 8], [16, 28, 9, 10]
    ];
    for (const [x, z, w, h] of blocks) {
      const house = buildHouse(plastic, w, h, 9, (x < 0 ? BrickPalette.SAND : BrickPalette.WARM_SAND), (z % 2 ? BrickPalette.DARK_RED : BrickPalette.BROWN));
      house.position.set(x, 0, z); group.add(house);
      ctx.addObstacle(x, z, w / 2, 4.5);
    }

    // refugio de Rahab al fondo (casa con puerta iluminada = meta)
    const refuge = buildHouse(plastic, 12, 10, 9, BrickPalette.TAN, BrickPalette.DARK_RED);
    refuge.position.set(0, 0, 38); group.add(refuge); ctx.addObstacle(0, 38, 6, 4.5);
    const door = brickBox(plastic, 3, 4.6, 0.4, BrickPalette.ORANGE, 0, 2.5, 33.6);
    (door.material as THREE.MeshPhysicalMaterial).emissive = new THREE.Color(0xff8a2a);
    (door.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.7; group.add(door);
    const doorLight = new THREE.PointLight(0xffb066, 2.2, 18, 1.6); doorLight.position.set(0, 4, 33); group.add(doorLight);
    group.add(brickBox(plastic, 0.4, 3, 0.4, BrickPalette.RED, 3, 6, 33.6)); // cordón rojo (guiño)
    const sign = buildBanner(plastic, BrickPalette.WARM_SAND, 4, 1.6); sign.position.set(0, 8.5, 33.7); group.add(sign);

    const braziers = [buildBrazier(plastic, -8, 10, -2), buildBrazier(plastic, 8, 10, 20)];
    braziers.forEach((b) => group.add(b.group));
    const lanterns = [buildLantern(plastic, -8, 5, 6), buildLantern(plastic, 8, 5, 14), buildLantern(plastic, -8, 5, 30)];
    lanterns.forEach((l) => group.add(l.group));

    const barrelPos = [{ x: -8, z: 3 }, { x: 8, z: 3 }, { x: -8, z: 20 }, { x: 8, z: 20 }, { x: -7, z: 33 }];
    for (const b of barrelPos) { const br = buildBarrel(plastic); br.position.set(b.x, 0, b.z); group.add(br); }

    const goal = new THREE.Mesh(new THREE.RingGeometry(1.4, 2, 24), new THREE.MeshBasicMaterial({ color: 0x8fe0ff, transparent: true, opacity: 0.75, side: THREE.DoubleSide }));
    goal.rotation.x = -Math.PI / 2; goal.position.set(0, 0.2, 30); group.add(goal);

    // === SIGILO: tres guardias patrullando ===
    const stealth = new StealthSystem(ctx.getPlayer, (x, z) => ctx.setPlayer(x, z), escena16.spawn, ctx.sound, ctx.film);
    const patrols: Array<Array<{ x: number; z: number }>> = [
      [{ x: -6, z: 6 }, { x: 6, z: 6 }, { x: 6, z: 2 }, { x: -6, z: 2 }],
      [{ x: 6, z: 24 }, { x: -6, z: 24 }, { x: -6, z: 16 }, { x: 6, z: 16 }],
      [{ x: -5, z: 30 }, { x: 5, z: 12 }]
    ];
    patrols.forEach((wp, i) => {
      const g = buildGuard(plastic, wp[0].x, wp[0].z, 0, i === 2);
      g.setPatrol(wp, 2.4 + i * 0.4);
      group.add(g.root);
      const cone = new VisionCone(16, 22); group.add(cone.mesh);
      stealth.addGuard({ npc: g, cone, baseYaw: 0, followNpc: true });
    });
    for (const b of barrelPos) stealth.addHidingSpot({ x: b.x, z: b.z, radio: 2.2 });
    for (const s of stealth.marksGroup) group.add(s);

    const gems = new Collectibles(plastic, ctx.sound, [{ x: -8, z: 3 }, { x: 8, z: 10 }, { x: -8, z: 20 }, { x: 6, z: 26 }, { x: 0, z: 30 }]);
    group.add(gems.group);

    ctx.scene.add(group);

    let doneFlag = false;
    return {
      group,
      update(dt, t, player) {
        braziers.forEach((b) => b.update(t)); lanterns.forEach((l) => l.update(t));
        stealth.update(dt, t); gems.update(dt, t, player);
        doorLight.intensity = 2.2 + Math.sin(t * 6) * 0.3;
        goal.scale.setScalar(1 + Math.sin(t * 3) * 0.08);
        const o = escena16.objetivo.target!;
        if (Math.hypot(player.x - o.x, player.z - o.z) < (escena16.objetivo.radio ?? 3.5)) doneFlag = true;
      },
      status() { return stealth.status(); },
      hud() { const p = ctx.getPlayer(); const o = escena16.objetivo.target!; return { alarm: stealth.alarmLevel, progress: THREE.MathUtils.clamp(1 - Math.hypot(p.x - o.x, p.z - o.z) / 54, 0, 1), gems: { got: gems.got, total: gems.total } }; },
      isDone() { return doneFlag; }
    };
  }
};
