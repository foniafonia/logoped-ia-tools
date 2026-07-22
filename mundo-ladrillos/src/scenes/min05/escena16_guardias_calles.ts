import * as THREE from 'three';
import { Min05Scene, SceneContext, SceneInstance } from './types';
import { SPY2_SKIN } from '../../characters/MinifigureFactory';
import { BrickPalette } from '../../materials/BrickPalette';
import { buildHouse, buildBarrel, buildTorch, studdedPlate, brickBox } from './props/BrickProps';
import { StealthSystem } from './mechanics/StealthSystem';
import { Npc, VisionCone } from './props/Npc';

/**
 * ESCENA 16 (545–604s) — LOS GUARDIAS VUELVEN POR LAS CALLES BUSCÁNDOLOS.
 * Las calles de Jericó de noche. Guardias que PATRULLAN (sus conos de visión
 * siguen su rumbo). Objetivo (sigilo/huir): llega a la puerta segura del fondo
 * (el refugio de Rahab) sin que ningún guardia te vea. Aprovecha los callejones
 * y las tinajas para esconderte cuando pase una patrulla.
 */
export const escena16: Min05Scene = {
  id: 'm05_16_guardias_calles',
  numero: 16,
  titulo: 'Patrullas en las calles',
  subtitulo: 'Los guardias recorren las calles buscándolos. Llega al refugio sin ser visto.',
  jugador: 'spy',
  noche: true,
  spawn: { x: 0, z: -22 },
  objetivo: { tipo: 'sigilo', texto: 'Alcanza el refugio del fondo sin que te vean', target: { x: 0, z: 30 }, radio: 3.5 },
  exito: '¡A salvo en el refugio! (fin del tramo 5–10)',
  camara: { yaw: Math.PI, pitch: 0.48, dist: 32 },

  build(ctx: SceneContext): SceneInstance {
    const { plastic } = ctx;
    const group = new THREE.Group();

    const floor = studdedPlate(plastic, 56, 66, BrickPalette.DARK_SAND, false);
    floor.position.set(0, -0.4, 4); group.add(floor);

    // manzanas de casas dejando una calle central + dos callejones
    const blocks: Array<[number, number, number, number]> = [
      [-16, -6, 9, 9], [16, -6, 9, 8], [-16, 12, 9, 10], [16, 12, 9, 9], [-16, 28, 9, 8], [16, 28, 9, 10]
    ];
    for (const [x, z, w, h] of blocks) {
      const house = buildHouse(plastic, w, h, 9, (x < 0 ? BrickPalette.SAND : BrickPalette.WARM_SAND), (z % 2 ? BrickPalette.DARK_RED : BrickPalette.BROWN));
      house.position.set(x, 0, z);
      group.add(house);
    }

    // refugio de Rahab al fondo (casa con puerta iluminada = meta)
    const refuge = buildHouse(plastic, 12, 10, 9, BrickPalette.TAN, BrickPalette.DARK_RED);
    refuge.position.set(0, 0, 38); group.add(refuge);
    const door = brickBox(plastic, 3, 4.6, 0.4, BrickPalette.ORANGE, 0, 2.5, 33.6);
    (door.material as THREE.MeshPhysicalMaterial).emissive = new THREE.Color(0xff8a2a);
    (door.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.7;
    group.add(door);
    const doorLight = new THREE.PointLight(0xffb066, 1.4, 16, 1.6); doorLight.position.set(0, 4, 33); group.add(doorLight);
    // cordón rojo asomando en la ventana (guiño a la trama)
    group.add(brickBox(plastic, 0.4, 3, 0.4, BrickPalette.RED, 3, 6, 33.6));

    // antorchas de la calle
    const torches = [buildTorch(plastic, -8, -2, 5), buildTorch(plastic, 8, 20, 5), buildTorch(plastic, -8, 34, 5)];
    torches.forEach((tr) => group.add(tr.group));

    // tinajas/escondites en los callejones
    const barrelPos = [{ x: -8, z: 3 }, { x: 8, z: 3 }, { x: -8, z: 20 }, { x: 8, z: 20 }, { x: -7, z: 33 }];
    for (const b of barrelPos) { const br = buildBarrel(plastic); br.position.set(b.x, 0, b.z); group.add(br); }

    // meta (marca en la puerta del refugio)
    const goal = new THREE.Mesh(new THREE.RingGeometry(1.4, 2, 24), new THREE.MeshBasicMaterial({ color: 0x8fe0ff, transparent: true, opacity: 0.7, side: THREE.DoubleSide }));
    goal.rotation.x = -Math.PI / 2; goal.position.set(0, 0.15, 30); group.add(goal);

    // === SIGILO: tres guardias patrullando la calle central ===
    const stealth = new StealthSystem(ctx.getPlayer, (x, z) => ctx.setPlayer(x, z), escena16.spawn);
    const guardSkins = [
      { ...SPY2_SKIN, torso: 0x8a3a2a, headwear: 0x6b2a1e, headStyle: 'turban' as const },
      { ...SPY2_SKIN, torso: 0x3a4a6b, headwear: 0x2a3550, headStyle: 'turban' as const },
      { ...SPY2_SKIN, torso: 0x4c6b3a, headwear: 0x2f4a24, headStyle: 'turban' as const }
    ];
    const patrols: Array<Array<{ x: number; z: number }>> = [
      [{ x: -6, z: 6 }, { x: 6, z: 6 }, { x: 6, z: 2 }, { x: -6, z: 2 }],
      [{ x: 6, z: 24 }, { x: -6, z: 24 }, { x: -6, z: 16 }, { x: 6, z: 16 }],
      [{ x: -5, z: 30 }, { x: 5, z: 12 }]
    ];
    patrols.forEach((wp, i) => {
      const g = new Npc(plastic, guardSkins[i], wp[0].x, wp[0].z, 0);
      g.setPatrol(wp, 2.4 + i * 0.4);
      // lanza
      const spear = brickBox(plastic, 0.25, 6.5, 0.25, BrickPalette.BROWN, 0.9, 3.2, 0.4); g.root.add(spear);
      group.add(g.root);
      const cone = new VisionCone(16, 22);
      group.add(cone.mesh);
      stealth.addGuard({ npc: g, cone, baseYaw: 0, followNpc: true });
    });
    for (const b of barrelPos) stealth.addHidingSpot({ x: b.x, z: b.z, radio: 2.2 });

    ctx.scene.add(group);

    let doneFlag = false;
    return {
      group,
      update(dt, t, player) {
        for (const tr of torches) tr.update(t);
        stealth.update(dt, t);
        doorLight.intensity = 1.4 + Math.sin(t * 6) * 0.25;
        goal.scale.setScalar(1 + Math.sin(t * 3) * 0.08);
        const o = escena16.objetivo.target!;
        if (Math.hypot(player.x - o.x, player.z - o.z) < (escena16.objetivo.radio ?? 3.5)) doneFlag = true;
      },
      status() { return stealth.status(); },
      isDone() { return doneFlag; }
    };
  }
};
