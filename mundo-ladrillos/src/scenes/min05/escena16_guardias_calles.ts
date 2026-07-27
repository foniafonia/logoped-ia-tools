import * as THREE from 'three';
import { Min05Scene, SceneContext, SceneInstance } from './types';
import { BrickPalette } from '../../materials/BrickPalette';
import { buildHouse, buildBarrel, buildMarketStall, studdedPlate, brickBox } from './props/BrickProps';
import { buildBrazier, buildLantern, buildBanner } from './props/NightAmbience';
import { StealthSystem } from './mechanics/StealthSystem';
import { VisionCone, Npc } from './props/Npc';
import { buildGuard } from './props/Guard';
import { Collectibles } from './props/Collectibles';
import { RugHide } from './props/RugHide';
import { KILIM_PALS } from '../min00/textiles';
import { RAHAB_MUJER } from './skins';
import { buildLanternString, buildLaundryLine, buildWell } from '../../world/StreetProps';

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
  subtitulo: '«Miren estas huellas, vienen de fuera.» Los guardias buscan a los espías por las calles.',
  jugador: 'spy',
  noche: true,
  ambiente: 'street',
  spawn: { x: 0, z: -22 },
  objetivo: { tipo: 'sigilo', texto: 'Alcanza el refugio del fondo sin que se llene la alarma', target: { x: 0, z: 30 }, radio: 3.5 },
  exito: '¡A salvo en el refugio! (fin del tramo 5–10)',
  camara: { yaw: Math.PI, pitch: 0.46, dist: 32 },
  // corredor acotado a la calle central (donde patrullan los guardias y están los
  // escondites): no se puede rodear por detrás de las casas por campo abierto.
  bounds: { minX: -13, maxX: 13, minZ: -28, maxZ: 34 },

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
    const sign = buildBanner(plastic, BrickPalette.WARM_SAND, 4, 1.6); sign.position.set(4.2, 9.2, 33.9); group.add(sign);

    // VENTANA de Rahab (iluminada) + ella asomada + el CORDÓN ROJO (la señal de
    // Josué 2: se descuelga por la ventana al llegar los espías al refugio).
    const WINX = -2.4;
    const winFrame = brickBox(plastic, 2.8, 3.2, 0.4, BrickPalette.DARK_BROWN, WINX, 7, 33.7);
    const winGlow = brickBox(plastic, 2.1, 2.5, 0.2, BrickPalette.WARM_SAND, WINX, 7, 33.55);
    (winGlow.material as THREE.MeshPhysicalMaterial).emissive = new THREE.Color(0xffcb7a);
    (winGlow.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.95;
    group.add(winFrame); group.add(winGlow);
    const winSill = brickBox(plastic, 3.0, 0.6, 0.8, BrickPalette.DARK_RED, WINX, 5.5, 33.45); group.add(winSill);
    const winLight = new THREE.PointLight(0xffcb7a, 1.7, 14, 1.6); winLight.position.set(WINX, 7, 32.5); group.add(winLight);
    // Rahab a la puerta, recibiendo a los espías (a ras de suelo, mirando la calle)
    const rahab = new Npc(plastic, RAHAB_MUJER, 1.4, 32.2, Math.PI); group.add(rahab.root);
    // el cordón rojo cuelga de la ventana; crece al cumplir el objetivo
    // el cordón de grana atado a la ventana (Josué 2:21) — la señal de salvación.
    // Lleva un leve brillo para que se lea de noche desde lejos.
    const cordMat = (plastic.get(BrickPalette.RED) as THREE.MeshPhysicalMaterial).clone();
    cordMat.emissive = new THREE.Color(0xc21f1f); cordMat.emissiveIntensity = 0.5;
    const cord = brickBox(plastic, 0.7, 5.6, 0.7, BrickPalette.RED, WINX, 4.5, 33.95);
    cord.material = cordMat; group.add(cord);
    group.add(brickBox(plastic, 0.9, 0.6, 0.9, BrickPalette.DARK_RED, WINX, 7.2, 33.98)); // nudo en la barra
    const cordTassel = brickBox(plastic, 1.1, 0.6, 0.8, BrickPalette.RED, WINX, 1.9, 33.9);
    cordTassel.material = cordMat; group.add(cordTassel); // borla al pie

    const braziers = [buildBrazier(plastic, -8, 10, -2), buildBrazier(plastic, 8, 10, 20)];
    braziers.forEach((b) => group.add(b.group));
    const lanterns = [buildLantern(plastic, -8, 5, 6), buildLantern(plastic, 8, 5, 14), buildLantern(plastic, -8, 5, 30), buildLantern(plastic, 8.6, 5, 9)];
    lanterns.forEach((l) => group.add(l.group));

    const barrelPos = [{ x: -8, z: 3 }, { x: 8, z: 3 }, { x: -8, z: 20 }, { x: 8, z: 20 }, { x: -7, z: 33 }];
    for (const b of barrelPos) { const br = buildBarrel(plastic); br.position.set(b.x, 0, b.z); group.add(br); }
    // puestos de mercado (atmósfera de zoco nocturno + hacen de cobertura)
    const stallPos: Array<[number, number, number]> = [[-9, 10, BrickPalette.DARK_RED], [9, 25, BrickPalette.DARK_BLUE]];
    for (const [sx, sz, col] of stallPos) { const st = buildMarketStall(plastic, col); st.position.set(sx, 0, sz); st.rotation.y = sx < 0 ? 0.4 : -0.4; group.add(st); ctx.addObstacle(sx, sz, 2.6, 1.6); }
    // vida de calle nocturna (helpers del muñequero): guirnaldas de farolillos
    // cruzando la calle, ropa tendida y un POZO (que además hace de escondite).
    group.add(buildLanternString(plastic, { ax: -13, az: 7, bx: 13, bz: 7, height: 9.5, count: 9, lights: 2 }));
    group.add(buildLanternString(plastic, { ax: -13, az: 23, bx: 13, bz: 23, height: 9.5, count: 9, lights: 2 }));
    group.add(buildLaundryLine(plastic, { ax: -11.5, az: 13, bx: -11.5, bz: 20, height: 5.6, seed: 2 }));
    group.add(buildLaundryLine(plastic, { ax: 11.5, az: 5, bx: 11.5, bz: 12, height: 5.6, seed: 5 }));
    const well = buildWell(plastic, { x: -8, z: 25 }); group.add(well); ctx.addObstacle(-8, 25, 1.4, 1.4);

    const goal = new THREE.Mesh(new THREE.RingGeometry(1.4, 2, 24), new THREE.MeshBasicMaterial({ color: 0x8fe0ff, transparent: true, opacity: 0.75, side: THREE.DoubleSide }));
    goal.rotation.x = -Math.PI / 2; goal.position.set(0, 0.2, 30); group.add(goal);

    // === SIGILO: tres guardias patrullando ===
    const stealth = new StealthSystem(ctx.getPlayer, (x, z) => ctx.setPlayer(x, z), escena16.spawn, ctx.sound);
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
    stealth.addHidingSpot({ x: -8, z: 25, radio: 2.6 }); // el pozo también es cobertura
    for (const s of stealth.marksGroup) group.add(s);

    // ESCONDITE ESTRELLA — la ALFOMBRA de kilim colgada (el "toque memorable").
    // Te agachas detrás y la tela se abomba hacia la cámara (bulto que respira,
    // piernas asomando). Es un escondite más para el sigilo, junto a un farol.
    const rug = new RugHide(plastic, { x: 6, z: 12, pal: KILIM_PALS[0], radio: 2.4 });
    group.add(rug.group);
    stealth.addHidingSpot(rug.hidingSpot);

    const gems = new Collectibles(plastic, ctx.sound, [{ x: -8, z: 3 }, { x: 8, z: 10 }, { x: -8, z: 20 }, { x: 6, z: 26 }, { x: 0, z: 30 }]);
    group.add(gems.group);

    ctx.scene.add(group);

    // CONVERSACIÓN de los guardias (diálogo compartido). Descubren las huellas y se
    // alarman — el gag cómico de la peli (6:07-6:16). Auto-avance; da vida al finale.
    const ROJO = 0xd06a4a, PLUMA = 0xe0b050;
    ctx.say?.('¡Miren estas huellas! Vienen de fuera…', 'Guardia', 3.2, ROJO);
    ctx.say?.('¡Ya están adentro! ¡Hay que atraparlos!', 'Jefe de guardia', 3.0, PLUMA);
    ctx.say?.('Ey, ey, cálmate. Ojos bien abiertos: busquemos por las calles.', 'Jefe de guardia', 3.6, PLUMA);

    let doneFlag = false;
    let rugHidden = false; // ¿escondido tras la alfombra ahora mismo?
    let rugShown = false;  // ¿ya se hizo el plano cinemático del escondite?
    return {
      group,
      update(dt, t, player) {
        braziers.forEach((b) => b.update(t)); lanterns.forEach((l) => l.update(t));
        stealth.update(dt, t); gems.update(dt, t, player);
        doorLight.intensity = 2.2 + Math.sin(t * 6) * 0.3;
        goal.scale.setScalar(1 + Math.sin(t * 3) * 0.08);
        // escondite de la alfombra: oculta el cuerpo del jugador y abomba la tela
        const inRug = rug.contains(player.x, player.z);
        rug.update(dt, t, inRug);
        if (inRug !== rugHidden) {
          rugHidden = inRug; ctx.setPlayerVisible?.(!inRug);
          // La PRIMERA vez que te escondes, la cámara hace un plano frontal de la
          // alfombra (se ve el bulto que respira) y luego vuelve al control manual.
          if (inRug && !rugShown) {
            rugShown = true;
            ctx.cameraReveal?.(
              { x: rug.x, y: 6.2, z: rug.z - 12 }, { x: rug.x, y: 5.4, z: rug.z - 9.5 },
              { x: rug.x, y: 4.1, z: rug.z }, { x: rug.x, y: 4.1, z: rug.z },
              2.6
            );
          }
        }
        const o = escena16.objetivo.target!;
        if (Math.hypot(player.x - o.x, player.z - o.z) < (escena16.objetivo.radio ?? 3.5)) doneFlag = true;
      },
      status() { return rugHidden ? '🫥 ¡Escondido tras la alfombra! Pasa la patrulla' : stealth.status(); },
      hud() {
        const p = ctx.getPlayer(); const o = escena16.objetivo.target!;
        const nearRug = !rugHidden && Math.hypot(p.x - rug.x, p.z - rug.z) < rug.radio + 2.4;
        return {
          alarm: stealth.alarmLevel,
          progress: THREE.MathUtils.clamp(1 - Math.hypot(p.x - o.x, p.z - o.z) / 54, 0, 1),
          gems: { got: gems.got, total: gems.total },
          prompt: nearRug ? '🫥 Métete tras la alfombra para esconderte' : undefined
        };
      },
      isDone() { return doneFlag; }
    };
  }
};
