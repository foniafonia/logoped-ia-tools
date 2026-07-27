import * as THREE from 'three';
import { Min10Scene, SceneContext, SceneInstance } from './types';
import { buildStreetStage, StreetStageHandle } from './props/stage';
import { buildFootprints } from './props/RugHide';
import { buildGuard } from '../min05/props/Guard';
import { Npc } from '../min05/props/Npc';
import { brickBox, buildBarrel } from '../min05/props/BrickProps';

/**
 * ESCENA 17 (10:05) — LAS HUELLAS DESCALZAS.
 * Al pie de la muralla, dos guardias descubren un rastro de PISADAS descalzas en
 * la arena (las de los espías) y salen corriendo a avisar. El niño (espía) ve el
 * peligro y debe escabullirse calle arriba, hacia el mercado nocturno, antes de
 * que la ciudad se ponga en alerta. Verbo: HUIR / observar.
 */
export const escena17: Min10Scene = {
  id: 'm10_17_huellas',
  numero: 17,
  mundo: 'calle-noche',
  titulo: 'Las huellas descalzas',
  subtitulo: '¡Huellas descalzas en la arena! Los guardias las han visto. Escabúllete calle arriba.',
  jugador: 'spy',
  noche: true,
  ambiente: 'street',
  spawn: { x: 2, z: 0 },
  objetivo: { tipo: 'ir_a', texto: 'Escabúllete hasta la entrada del mercado', target: { x: 0, z: 17 }, radio: 3.5 },
  exito: '¡Dentro del mercado! Los guardias siguen el rastro atrás.',
  camara: { yaw: Math.PI, pitch: 0.42, dist: 26 },
  intro: {
    from: { x: -2, y: 5, z: -12 }, to: { x: 0, y: 3.4, z: -7 },
    lookFrom: { x: 0, y: 0.4, z: -4 }, lookTo: { x: 0, y: 0.4, z: -4 }, seconds: 2.8
  },

  build(ctx: SceneContext): SceneInstance {
    const group = new THREE.Group();
    const street: StreetStageHandle = buildStreetStage(ctx, { gente: 'poca' });
    group.add(street.group);

    // rastro de huellas descalzas que suben de la playa a la calle
    const prints = buildFootprints(ctx.plastic, { ax: 1, az: -7, bx: 2, bz: 2, count: 8 });
    group.add(prints.group);

    // ---- ORILLA VESTIDA al pie de la muralla (REGLA Nº1: nada pelado) ----
    // El primer plano (z<0, de donde vienen los espías) estaba desnudo. Lo lleno con
    // gusto reutilizando piezas: cañaveral que ondea, cestos/barriles varados, un
    // ovillo de cuerda (con el que cruzaron) y cantos rodados. Todo a los lados y
    // detrás del spawn → no estorba el paso hacia el mercado (+z).
    const P = ctx.plastic;
    const shore = new THREE.Group(); group.add(shore);
    const reeds: THREE.Mesh[] = [];
    const reedClump = (cx: number, cz: number, n: number): void => {
      for (let i = 0; i < n; i++) {
        const h = 1.6 + Math.random() * 1.6;
        const r = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.09, h, 5), P.get(i % 2 ? 0x6f8f3a : 0x8a9a4a));
        r.position.set(cx + (Math.random() - 0.5) * 1.2, h / 2 - 0.2, cz + (Math.random() - 0.5) * 1.2);
        r.rotation.z = (Math.random() - 0.5) * 0.3; r.castShadow = true;
        (r as unknown as { __ph: number }).__ph = Math.random() * 6.28;
        shore.add(r); reeds.push(r);
      }
    };
    reedClump(-8, -3, 7); reedClump(-6.5, -8, 6); reedClump(7.5, -4, 7); reedClump(6, -9, 5); reedClump(-9, 2, 4);
    // cestos/barriles varados + ovillo de cuerda (con el que treparon)
    [[-4.5, -6], [5.5, -8], [-7, -10]].forEach(([x, z]) => { const b = buildBarrel(P); b.position.set(x, 0, z); b.rotation.y = Math.random() * 3; shore.add(b); });
    const coil = new THREE.Group(); coil.position.set(3.2, 0, -4.5); shore.add(coil);
    for (let i = 0; i < 4; i++) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5 - i * 0.06, 0.09, 6, 16), P.get(0xa9895f)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.1 + i * 0.09; coil.add(ring); }
    // cantos rodados dispersos
    for (let i = 0; i < 9; i++) {
      const s = 0.25 + Math.random() * 0.4;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), P.get(i % 2 ? 0x9a9184 : 0x7d746a));
      rock.position.set((Math.random() - 0.5) * 18, s * 0.4, -10 + Math.random() * 11); rock.rotation.set(Math.random(), Math.random(), Math.random()); rock.castShadow = true; shore.add(rock);
    }

    // dos guardias a los lados examinando las huellas (salen "alerta" al verte pasar)
    const g1 = buildGuard(ctx.plastic, -6, -9, 0.6, false);
    const g2 = buildGuard(ctx.plastic, 6, -9, -0.6, true);
    group.add(g1.root); group.add(g2.root);

    // signo de alarma "!" sobre los guardias cuando descubren el rastro
    const bang = makeBang();
    bang.position.set(6, 5.4, -9); bang.visible = false; group.add(bang);

    ctx.scene.add(group);

    let alerted = false;
    let doneFlag = false;
    const o = escena17.objetivo.target!;
    return {
      group,
      update(dt, t, player): void {
        street.update(dt, t);
        prints.update(t);
        for (const r of reeds) { const ph = (r as unknown as { __ph: number }).__ph; r.rotation.z = Math.sin(t * 1.6 + ph) * 0.18; }
        // los guardias miran las huellas con leve vaivén
        g1.root.rotation.y = 0.3 + Math.sin(t * 1.2) * 0.15;
        g2.root.rotation.y = -0.3 + Math.sin(t * 1.1 + 1) * 0.15;
        g1.update(dt); g2.update(dt);
        // al alejarte lo bastante, dan la voz de alarma (cosmético + sonido)
        if (!alerted && player.z > 6) {
          alerted = true; bang.visible = true; ctx.sound.alarm();
          g1.root.rotation.y = Math.PI; g2.root.rotation.y = Math.PI;
        }
        if (alerted) bang.position.y = 5.4 + Math.sin(t * 6) * 0.15;
        if (Math.hypot(player.x - o.x, player.z - o.z) < (escena17.objetivo.radio ?? 3.5)) doneFlag = true;
      },
      status(): string | null { return alerted ? '🚨 ¡Te persiguen! ¡Corre al mercado!' : '👣 Sigue el callejón hacia arriba'; },
      hud() {
        const p = ctx.getPlayer();
        return { progress: THREE.MathUtils.clamp((p.z - escena17.spawn.z) / (o.z - escena17.spawn.z), 0, 1) };
      },
      isDone(): boolean { return doneFlag; },
      dispose(): void { street.dispose(); }
    };
  }
};

function makeBang(): THREE.Sprite {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d')!;
  x.fillStyle = '#ff5a4d'; x.font = 'bold 56px system-ui'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText('!', 32, 36);
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false }));
  spr.scale.set(2, 2, 1);
  return spr;
}
