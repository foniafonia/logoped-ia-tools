import * as THREE from 'three';
import { Min10Scene, SceneContext, SceneInstance } from './types';
import { buildStreetStage, StreetStageHandle } from './props/stage';
import { Collectibles } from '../min05/props/Collectibles';

/**
 * ESCENA 18 (10:55) — CARRERA POR EL MERCADO NOCTURNO.
 * Los espías corren por el zoco esquivando puestos y gente hasta el letrero
 * iluminado del "RESTAURANTE DE RAHAB", al fondo de la calle. El niño corre,
 * esquiva y recoge gemas por el camino. Verbo: CORRER / esquivar.
 */
export const escena18: Min10Scene = {
  id: 'm10_18_carrera_mercado',
  numero: 18,
  mundo: 'calle-noche',
  titulo: 'Carrera al Restaurante de Rahab',
  subtitulo: 'Corre por el mercado hasta el letrero del «Restaurante de Rahab». ¡Esquiva y recoge gemas!',
  jugador: 'spy',
  noche: true,
  ambiente: 'street',
  spawn: { x: 0, z: -2 },
  objetivo: { tipo: 'ir_a', texto: 'Llega a la puerta del Restaurante de Rahab', target: { x: 0, z: 52 }, radio: 3.6 },
  exito: '¡Has llegado a la posada de Rahab!',
  camara: { yaw: Math.PI, pitch: 0.44, dist: 28 },

  build(ctx: SceneContext): SceneInstance {
    const group = new THREE.Group();
    const street: StreetStageHandle = buildStreetStage(ctx, { gente: 'mucha', posada: { x: -1, z: 54 } });
    group.add(street.group);

    // puerta iluminada de la posada (meta) al fondo
    const doorLight = new THREE.PointLight(0xffb066, 2.6, 20, 1.6); doorLight.position.set(0, 4, 52); group.add(doorLight);
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(3, 4.8, 0.4),
      new THREE.MeshStandardMaterial({ color: 0xff8a2a, emissive: 0xff8a2a, emissiveIntensity: 0.7, roughness: 0.7 })
    );
    door.position.set(0, 2.6, 53.6); group.add(door);
    const goal = new THREE.Mesh(
      new THREE.RingGeometry(1.4, 2, 24),
      new THREE.MeshBasicMaterial({ color: 0x8fe0ff, transparent: true, opacity: 0.75, side: THREE.DoubleSide })
    );
    goal.rotation.x = -Math.PI / 2; goal.position.set(0, 0.2, 52); group.add(goal);

    // gemas repartidas por la calle (premio para el niño)
    const gems = new Collectibles(ctx.plastic, ctx.sound, [
      { x: -6, z: 6 }, { x: 6, z: 14 }, { x: -6, z: 22 }, { x: 6, z: 30 }, { x: -6, z: 38 }, { x: 0, z: 46 }
    ]);
    group.add(gems.group);

    ctx.scene.add(group);

    let doneFlag = false;
    const o = escena18.objetivo.target!;
    return {
      group,
      update(dt, t, player): void {
        street.update(dt, t);
        gems.update(dt, t, player);
        doorLight.intensity = 2.6 + Math.sin(t * 6) * 0.3;
        goal.scale.setScalar(1 + Math.sin(t * 3) * 0.08);
        if (Math.hypot(player.x - o.x, player.z - o.z) < (escena18.objetivo.radio ?? 3.6)) doneFlag = true;
      },
      status(): string | null { return '🏃 ¡Corre hacia el letrero del fondo!'; },
      hud() {
        const p = ctx.getPlayer();
        return {
          progress: THREE.MathUtils.clamp((p.z - escena18.spawn.z) / (o.z - escena18.spawn.z), 0, 1),
          gems: { got: gems.got, total: gems.total }
        };
      },
      isDone(): boolean { return doneFlag; },
      dispose(): void { street.dispose(); }
    };
  }
};
