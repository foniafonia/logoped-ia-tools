import * as THREE from 'three';
import { Min10Scene, SceneContext, SceneInstance } from './types';
import { buildStreetStage, StreetStageHandle } from './props/stage';
import { createMinifigure, villagerSkin, Minifigure } from '../../characters/MinifigureFactory';
import { buildCrateStack, buildSackPile, buildPotCluster, buildPalm } from '../../world/Clutter';

/**
 * ESCENA 18 (10:55) — ENCONTRAR EL RESTAURANTE DE RAHAB (mini-búsqueda).
 * Feedback del niño (aprobado): la posada NO debe encontrarse yendo directo. El
 * "Restaurante de Rahab" está ESCONDIDO en un callejón y su letrero está APAGADO.
 * El niño recorre el mercado nocturno y PREGUNTA a los vecinos (pulsa E) para
 * sacarles pistas; con 2 pistas, el letrero se ENCIENDE y aparece la meta. Verbo:
 * BUSCAR / preguntar (no correr recto).
 */
interface Informante { fig: Minifigure; x: number; z: number; hablado: boolean; pista: string; }

export const escena18: Min10Scene = {
  id: 'm10_18_carrera_mercado',
  numero: 18,
  mundo: 'calle-noche',
  titulo: 'Encuentra el Restaurante de Rahab',
  subtitulo: 'La posada está escondida y su letrero apagado. Pregunta a los vecinos (E) para dar con ella.',
  jugador: 'spy',
  noche: true,
  ambiente: 'street',
  spawn: { x: 0, z: -2 },
  objetivo: { tipo: 'ir_a', texto: 'Pregunta a los vecinos (E) y encuentra la posada escondida', target: { x: -9, z: 51 }, radio: 3.4 },
  exito: '¡Has dado con la posada de Rahab, escondida en el callejón!',
  camara: { yaw: Math.PI, pitch: 0.44, dist: 28 },

  build(ctx: SceneContext): SceneInstance {
    const group = new THREE.Group();
    const P = ctx.plastic;
    const street: StreetStageHandle = buildStreetStage(ctx, { gente: 'mucha' }); // sin letrero automático
    group.add(street.group);

    // ENTRADA ESCONDIDA de la posada, en un callejón a la IZQUIERDA del fondo,
    // con el letrero APAGADO hasta que el niño consigue las pistas.
    const EX = escena18.objetivo.target!.x, EZ = escena18.objetivo.target!.z;
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x5a3a1e, emissive: 0x000000, emissiveIntensity: 0, roughness: 0.8 });
    const door = new THREE.Mesh(new THREE.BoxGeometry(3, 4.8, 0.4), doorMat);
    door.position.set(EX, 2.6, EZ + 1.4); group.add(door);
    const signMat = new THREE.MeshStandardMaterial({ color: 0x8a7a55, emissive: 0xffb24d, emissiveIntensity: 0, roughness: 0.8 });
    const sign = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.8, 0.3), signMat);
    sign.position.set(EX, 6, EZ + 1.2); group.add(sign);
    const doorLight = new THREE.PointLight(0xffb066, 0, 22, 1.6); doorLight.position.set(EX, 4, EZ); group.add(doorLight);
    const goal = new THREE.Mesh(new THREE.RingGeometry(1.4, 2, 24), new THREE.MeshBasicMaterial({ color: 0x8fe0ff, transparent: true, opacity: 0, side: THREE.DoubleSide }));
    goal.rotation.x = -Math.PI / 2; goal.position.set(EX, 0.2, EZ); group.add(goal);

    // INFORMANTES: vecinos a los que preguntar (E cerca). Cada uno da una pista.
    const informantes: Informante[] = [
      { fig: createMinifigure(P, villagerSkin(20)), x: 7, z: 10, hablado: false, pista: '🗣️ «¿Rahab? No está en la calle grande… métete por un callejón.»' },
      { fig: createMinifigure(P, villagerSkin(21)), x: -7, z: 24, hablado: false, pista: '🗣️ «Junto al pozo, tuerce a la IZQUIERDA, al fondo.»' },
      { fig: createMinifigure(P, villagerSkin(22)), x: 6, z: 36, hablado: false, pista: '🗣️ «Su letrero se enciende cuando sabes buscarlo. Ya casi.»' }
    ];
    informantes.forEach((inf) => { inf.fig.root.position.set(inf.x, 0, inf.z); inf.fig.root.rotation.y = inf.x < 0 ? 1.2 : -1.2; group.add(inf.fig.root); });
    // signo "?" sobre los informantes sin hablar
    const marks = informantes.map((inf) => { const s = makeSprite('?', '#ffd24a'); s.position.set(0, 5.6, 0); inf.fig.root.add(s); return s; });

    // === REGLA Nº1: vestir el PRIMER PLANO (junto al spawn) y rincones sueltos ===
    // El mercado ya está poblado de z=4 a z=46; lo pelado era la entrada (z≈-2..2) y
    // algún hueco. Attrezzo reutilizable del muñequero (world/Clutter), arrimado a las
    // paredes (x≈±9.5) para NO tapar el pasillo central por donde sube el niño.
    const clutter: THREE.Group[] = [];
    const drop = (g: THREE.Group, x: number, z: number, rx = 1, rz = 1): void => {
      group.add(g); clutter.push(g); ctx.addObstacle(x, z, rx, rz);
    };
    drop(buildCrateStack(P, { x: -9.5, z: 0.5, yaw: 0.3, n: 3 }), -9.5, 0.5, 1.1, 1.1);
    drop(buildPotCluster(P, { x: -9.3, z: -1.6 }), -9.3, -1.6, 1, 1);
    drop(buildSackPile(P, { x: 9.4, z: 1.4 }), 9.4, 1.4, 1.1, 1);
    drop(buildCrateStack(P, { x: 9.5, z: -1.4, yaw: -0.25, n: 2 }), 9.5, -1.4, 1, 1);
    // rincones sueltos lejos de puestos/barriles: palmera de encuadre y vasijas al fondo
    drop(buildPalm(P, { x: -9.6, z: 33, height: 6 }), -9.6, 33, 1, 1);
    drop(buildPotCluster(P, { x: 9.5, z: 49 }), 9.5, 49, 1, 1);

    ctx.scene.add(group);

    let pistas = 0;
    let encontrada = false;
    let doneFlag = false;
    let hintT = 0;
    let hint = '';
    const o = escena18.objetivo.target!;
    return {
      group,
      update(dt, t, player): void {
        street.update(dt, t);
        informantes.forEach((inf, i) => {
          inf.fig.update(dt, false);
          inf.fig.root.rotation.y = (inf.x < 0 ? 1.2 : -1.2) + Math.sin(t * 0.7 + i) * 0.15;
          marks[i].visible = !inf.hablado;
          if (marks[i].visible) marks[i].position.y = 5.6 + Math.sin(t * 3 + i) * 0.12;
          // preguntar: E cerca de un informante sin hablar
          if (!inf.hablado && Math.hypot(player.x - inf.x, player.z - inf.z) < 3.4 && ctx.wantsInteract()) {
            inf.hablado = true; pistas++; hint = inf.pista; hintT = 4; ctx.sound.pickup();
          }
        });
        if (hintT > 0) hintT -= dt;
        // con 2 pistas, el letrero se ENCIENDE y aparece la meta
        if (pistas >= 2 && !encontrada) {
          encontrada = true; ctx.sound.success();
          doorMat.emissive.setHex(0xff8a2a); doorMat.emissiveIntensity = 0.7;
          signMat.emissiveIntensity = 0.95;
          (goal.material as THREE.MeshBasicMaterial).opacity = 0.75;
        }
        if (encontrada) {
          doorLight.intensity = 2.6 + Math.sin(t * 6) * 0.3;
          goal.scale.setScalar(1 + Math.sin(t * 3) * 0.08);
          if (Math.hypot(player.x - o.x, player.z - o.z) < (escena18.objetivo.radio ?? 3.4)) doneFlag = true;
        }
      },
      status(): string | null {
        if (hintT > 0) return hint;
        if (doneFlag) return '✅ ¡La posada escondida!';
        if (encontrada) return '💡 ¡El letrero se ha encendido! Ve al callejón de la izquierda';
        return `🔎 Pregunta a los vecinos (❓) para dar con la posada — pistas ${pistas}/2`;
      },
      hud() {
        const p = ctx.getPlayer();
        // prompt si estás cerca de un informante sin hablar
        const near = informantes.find((inf) => !inf.hablado && Math.hypot(p.x - inf.x, p.z - inf.z) < 3.4);
        return {
          progress: encontrada ? THREE.MathUtils.clamp((p.z - 20) / (o.z - 20), 0, 1) : pistas / 2,
          prompt: near ? '🗣️ Pulsa E para preguntar' : (encontrada ? '➡️ A la posada, callejón izquierdo' : undefined)
        };
      },
      isDone(): boolean { return doneFlag; },
      dispose(): void { street.dispose(); }
    };
  }
};

function makeSprite(txt: string, color: string): THREE.Sprite {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d')!;
  x.fillStyle = color; x.font = 'bold 54px system-ui'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(txt, 32, 36);
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false }));
  spr.scale.set(1.7, 1.7, 1);
  return spr;
}
