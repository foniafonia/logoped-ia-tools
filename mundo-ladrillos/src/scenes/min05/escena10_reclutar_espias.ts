import * as THREE from 'three';
import { Min05Scene, SceneContext, SceneInstance } from './types';
import { YOSHUA_SKIN, SPY_SKIN, SPY2_SKIN } from '../../characters/MinifigureFactory';
import { BrickPalette } from '../../materials/BrickPalette';
import { buildTent, buildPalm, studdedPlate, brickBox } from './props/BrickProps';
import { Npc } from './props/Npc';

/**
 * ESCENA 10 (341–439s) — YEHOSHÚA RECLUTA A LOS DOS ESPÍAS.
 * La tienda de Yehoshúa en el campamento de Israel. Yehoshúa (jugador) se
 * acerca a los dos espías para encomendarles la misión. Escenario 3D: tienda
 * de campaña de ladrillo, hoguera, cajas de suministros, empalizada. Objetivo:
 * reunirse con los dos espías dentro de la tienda (ir_a); al acercarse, los
 * espías se giran hacia Yehoshúa (aceptan la misión).
 */
export const escena10: Min05Scene = {
  id: 'm05_10_reclutar_espias',
  numero: 10,
  titulo: 'Reclutar a los espías',
  subtitulo: '«Id y reconoced la tierra, y Jericó.» Yehoshúa encomienda la misión a dos hombres.',
  jugador: 'yoshua',
  spawn: { x: 0, z: -13 },
  objetivo: { tipo: 'ir_a', texto: 'Reúnete con los dos espías en la tienda', target: { x: 0, z: 4 }, radio: 4 },
  exito: 'Los dos espías aceptan la misión',
  camara: { yaw: Math.PI, pitch: 0.38, dist: 28 },

  build(ctx: SceneContext): SceneInstance {
    const { plastic } = ctx;
    const group = new THREE.Group();

    // suelo del campamento
    const floor = studdedPlate(plastic, 64, 60, BrickPalette.TAN, false);
    floor.position.set(0, -0.4, 0);
    group.add(floor);

    // tienda grande de Yehoshúa (abierta hacia el jugador)
    const tent = buildTent(plastic, BrickPalette.DARK_RED, 16, 14, true);
    tent.position.set(0, 0, 12);
    tent.rotation.y = Math.PI;  // abertura hacia el jugador (-z)
    group.add(tent);

    // mesa de mapas dentro de la tienda
    group.add(brickBox(plastic, 5, 0.4, 3, BrickPalette.BROWN, 0, 2.4, 10));
    for (const sx of [-2, 2]) for (const sz of [-1, 1]) group.add(brickBox(plastic, 0.4, 2.4, 0.4, BrickPalette.DARK_BROWN, sx, 1.2, 10 + sz));
    group.add(brickBox(plastic, 4.2, 0.15, 2.4, BrickPalette.WARM_SAND, 0, 2.65, 10)); // mapa

    // hoguera del campamento (piedras + leños + brasa)
    const fire = new THREE.Group();
    for (let a = 0; a < 8; a++) {
      const ang = (a / 8) * Math.PI * 2;
      fire.add(brickBox(plastic, 0.8, 0.6, 0.8, BrickPalette.DARK_GRAY, Math.cos(ang) * 1.6, 0.3, Math.sin(ang) * 1.6));
    }
    fire.add(brickBox(plastic, 2.4, 0.4, 0.6, BrickPalette.DARK_BROWN, 0, 0.5, 0));
    fire.add(brickBox(plastic, 0.6, 0.4, 2.4, BrickPalette.BROWN, 0, 0.5, 0));
    const ember = brickBox(plastic, 1.4, 0.5, 1.4, BrickPalette.ORANGE, 0, 0.7, 0);
    (ember.material as THREE.MeshPhysicalMaterial).emissive = new THREE.Color(0xff6a00);
    (ember.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.8;
    fire.add(ember);
    fire.position.set(-14, 0, -4);
    const fireLight = new THREE.PointLight(0xff8a3a, 1.6, 20, 1.8);
    fireLight.position.set(-14, 2.4, -4);
    group.add(fire, fireLight);

    // cajas de suministros (a un lado) + empalizada baja al fondo lateral
    for (let i = 0; i < 5; i++) group.add(brickBox(plastic, 2, 2, 2, i % 2 ? BrickPalette.BROWN : BrickPalette.DARK_SAND, 16 + (i % 2) * 2.2, 1, 2 + i * 2.4));
    for (let x = -30; x <= 30; x += 2.4) group.add(brickBox(plastic, 0.5, 3, 0.5, BrickPalette.DARK_BROWN, x, 1.5, 26));

    group.add(buildPalm(plastic, -26, 10, 9));
    group.add(buildPalm(plastic, 26, 12, 8));

    // los DOS espías (aún de paisano), al frente de la tienda mirando al jugador
    const spyA = new Npc(plastic, SPY_SKIN, -3.5, 2, Math.PI);
    const spyB = new Npc(plastic, SPY2_SKIN, 3.5, 2, Math.PI);
    group.add(spyA.root, spyB.root);

    // (Yehoshúa NPC de referencia no: el jugador ES Yehoshúa aquí)
    void YOSHUA_SKIN;

    ctx.scene.add(group);

    let greeted = false;
    return {
      group,
      update(dt, t, player) {
        ember.scale.y = 1 + Math.sin(t * 9) * 0.25;
        fireLight.intensity = 1.6 + Math.sin(t * 9) * 0.4;
        // al acercarse Yehoshúa, los espías se giran hacia él (aceptan)
        const near = Math.hypot(player.x - 0, player.z - 4) < 9;
        if (near && !greeted) greeted = true;
        if (greeted) { spyA.lookAt(player.x, player.z); spyB.lookAt(player.x, player.z); }
        spyA.update(dt); spyB.update(dt);
      },
      isDone(p) {
        const o = escena10.objetivo.target!;
        return Math.hypot(p.x - o.x, p.z - o.z) < (escena10.objetivo.radio ?? 4);
      }
    };
  }
};
