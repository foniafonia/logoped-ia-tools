import * as THREE from 'three';
import { Min15Scene, SceneContext, SceneInstance } from './types';
import { GuideBeacon } from './props/guide';
import { buildGround, buildMoonNight, buildPine } from './props/wild';
import { buildTent } from '../min05/props/BrickProps';
import { buildBanner } from '../min05/props/NightAmbience';
import { buildFirePit, buildCrateStack, buildSackPile } from '../../world/Clutter';
import { createMinifigure, Minifigure, villagerSkin } from '../../characters/MinifigureFactory';
import { GUARDIA_SKIN, YEHOSHUA_SKIN } from '../min05/skins';
import { BrickPalette } from '../../materials/BrickPalette';

/**
 * ESCENA 33 (peli 19:02 / escena_32) — PREPARATIVOS DE GUERRA.
 * Montaje enérgico de preparación del ejército de Israel (biblia peli.json
 * escena_32): «soldados afilando espadas de bronce sobre piedras de amolar que
 * giran, flechas ordenadas en el carcaj, guerreros marchando en formación con
 * escudos». Todo en el campamento, de noche cálida.
 *
 * MINI-JUEGO (preparar): el niño recorre las TRES estaciones de preparación y
 * pulsa E en cada una para ponerla en marcha —la muela gira y saltan chispas, el
 * carcaj se llena de flechas, la fila alza los escudos—. Con las tres listas, el
 * ejército queda preparado para marchar. La baliza salta a la siguiente estación.
 */
type Station = { pos: { x: number; z: number }; done: boolean; kind: 'muela' | 'flechas' | 'escudos' };

const STATIONS: Array<{ x: number; z: number; kind: Station['kind'] }> = [
  { x: -8, z: -5, kind: 'muela' },
  { x: 0, z: 7, kind: 'flechas' },
  { x: 7, z: -5, kind: 'escudos' }
];

export const escena33: Min15Scene = {
  id: 'm15_33_preparativos',
  numero: 33,
  mundo: 'campamento',
  titulo: 'Preparativos de guerra',
  subtitulo: '¡A preparar el ejército! Afila las espadas, llena los carcajes de flechas y forma la fila de escudos: pulsa E en cada estación.',
  jugador: 'spy',
  noche: true,
  ambiente: 'night',
  spawn: { x: -16, z: 0 },
  objetivo: { tipo: 'ir_a', texto: 'Prepara las 3 estaciones de guerra (E)', target: { x: STATIONS[0].x, z: STATIONS[0].z }, radio: 2.4 },
  exito: '¡Ejército preparado! Espadas afiladas, carcajes llenos y escudos en alto.',
  camara: { yaw: 0, pitch: 0.42, dist: 27 },
  intro: {
    from: { x: -24, y: 12, z: 24 }, to: { x: -15, y: 7, z: 15 },
    lookFrom: { x: 0, y: 2, z: 0 }, lookTo: { x: 6, y: 2, z: 0 }, seconds: 3.0
  },

  build(ctx: SceneContext): SceneInstance {
    const group = new THREE.Group();
    const P = ctx.plastic;

    group.add(buildGround(P, 0x6a5334, 78, 56));
    group.add(buildMoonNight(P));

    // tienda de mando + estandartes al fondo, y tiendas satélite (Regla Nº1)
    const bigTent = buildTent(P, BrickPalette.TAN, 12, 10, true);
    bigTent.position.set(15, 0, -8); group.add(bigTent); ctx.addObstacle(15, -8, 6, 5);
    const banA = buildBanner(P, BrickPalette.DARK_BLUE, 1.6, 4); banA.position.set(11.5, 5.2, -5); group.add(banA);
    const banB = buildBanner(P, BrickPalette.DARK_RED, 1.6, 4); banB.position.set(18.5, 5.2, -5); group.add(banB);
    const t2 = buildTent(P, BrickPalette.WARM_SAND, 8, 7, false); t2.position.set(-13, 0, -11); group.add(t2); ctx.addObstacle(-13, -11, 4, 3.5);
    const t3 = buildTent(P, BrickPalette.SAND, 7, 6, false); t3.position.set(-15, 0, 10); group.add(t3); ctx.addObstacle(-15, 10, 3.5, 3);
    group.add(buildCrateStack(P, { x: 11, z: 9, n: 3 })); ctx.addObstacle(11, 9, 1, 1);
    group.add(buildSackPile(P, { x: -4, z: 11 })); ctx.addObstacle(-4, 11, 1, 1);
    group.add(buildPine(P, -22, -6, 1.7)); group.add(buildPine(P, 22, -12, 1.6)); group.add(buildPine(P, -23, 13, 1.5));
    group.add(buildFirePit(P, { x: -5, z: 2 }));
    group.add(buildFirePit(P, { x: 5, z: -10 }));

    // Josué supervisando desde su tarima
    const yehoshua: Minifigure = createMinifigure(P, YEHOSHUA_SKIN);
    yehoshua.root.position.set(15, 0, -2); yehoshua.root.rotation.y = -Math.PI / 2; yehoshua.root.scale.setScalar(1.08); group.add(yehoshua.root);

    // ===== ESTACIÓN 1 · PIEDRA DE AMOLAR (muela que gira + chispas + soldado) =====
    const s1 = new THREE.Group(); s1.position.set(STATIONS[0].x, 0, STATIONS[0].z); group.add(s1);
    // banco
    s1.add(new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 1.2), P.get(BrickPalette.BROWN)).translateY(1.2));
    for (const sx of [-0.9, 0.9]) s1.add(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.2, 6), P.get(BrickPalette.DARK_BROWN)).translateX(sx).translateY(0.6));
    // muela (disco vertical que gira)
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.24, 20), P.get(BrickPalette.DARK_GRAY));
    wheel.rotation.z = Math.PI / 2; wheel.position.set(0, 1.9, 0); s1.add(wheel);
    // espada apoyada
    const sword = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 1.6), P.get(BrickPalette.SILVER)); sword.position.set(0.5, 2.0, 0.2); s1.add(sword);
    const smith = createMinifigure(P, villagerSkin(2)); smith.root.position.set(0, 0, 1.2); smith.root.rotation.y = Math.PI; s1.add(smith.root);
    // chispas (emisivas, sin luz): ocultas hasta activar
    const sparkN = 24, spGeo = new THREE.BufferGeometry(), spPos = new Float32Array(sparkN * 3);
    for (let i = 0; i < sparkN; i++) { spPos[i * 3] = 0; spPos[i * 3 + 1] = 1.9; spPos[i * 3 + 2] = 0; }
    spGeo.setAttribute('position', new THREE.BufferAttribute(spPos, 3));
    const sparks = new THREE.Points(spGeo, new THREE.PointsMaterial({ color: 0xffd24a, size: 0.14, transparent: true, opacity: 0.95, depthWrite: false }));
    (sparks.material as THREE.PointsMaterial).toneMapped = false; sparks.visible = false; s1.add(sparks);
    const sparkV: THREE.Vector3[] = Array.from({ length: sparkN }, () => new THREE.Vector3());

    // ===== ESTACIÓN 2 · CARCAJ DE FLECHAS (se llena al activar) =====
    const s2 = new THREE.Group(); s2.position.set(STATIONS[1].x, 0, STATIONS[1].z); group.add(s2);
    s2.add(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 1.6, 14), P.get(BrickPalette.DARK_BROWN)).translateY(0.8)); // aljaba
    const arrows: THREE.Mesh[] = [];
    for (let i = 0; i < 7; i++) {
      const a = new THREE.Group();
      a.add(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 5), P.get(0xcaa15e)).translateY(0.9));
      a.add(new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.2, 5), P.get(BrickPalette.SILVER)).translateY(1.85));
      const fl = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.24, 0.24), P.get(BrickPalette.RED)); fl.position.y = 0.15; a.add(fl);
      a.position.set((i % 3 - 1) * 0.18, 1.2, (Math.floor(i / 3) - 1) * 0.18); a.rotation.z = (i % 3 - 1) * 0.12;
      (a as any).visible = false; s2.add(a); arrows.push(a as unknown as THREE.Mesh);
    }
    const fletcher = createMinifigure(P, villagerSkin(5)); fletcher.root.position.set(1.4, 0, 0.4); fletcher.root.rotation.y = -Math.PI / 2; s2.add(fletcher.root);

    // ===== ESTACIÓN 3 · FILA DE ESCUDOS (soldados alzan escudos al activar) =====
    const s3 = new THREE.Group(); s3.position.set(STATIONS[2].x, 0, STATIONS[2].z); group.add(s3);
    const shieldSoldiers: Array<{ fig: Minifigure; shield: THREE.Mesh }> = [];
    for (let i = 0; i < 3; i++) {
      const fig = createMinifigure(P, GUARDIA_SKIN); fig.root.position.set((i - 1) * 1.5, 0, 0); fig.root.rotation.y = -Math.PI / 2; s3.add(fig.root);
      const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.14, 16), P.get(BrickPalette.GOLD));
      shield.rotation.x = Math.PI / 2; shield.position.set((i - 1) * 1.5 - 0.9, 1.8, 0.2); s3.add(shield);
      shieldSoldiers.push({ fig, shield });
    }

    const stations: Station[] = STATIONS.map((s) => ({ pos: { x: s.x, z: s.z }, done: false, kind: s.kind }));
    const beacon = new GuideBeacon(STATIONS[0].x, STATIONS[0].z, { action: true });
    group.add(beacon.group);

    ctx.scene.add(group);

    let idx = 0, allT0 = 0;
    let doneFlag = false;
    const R = escena33.objetivo.radio ?? 2.4;

    return {
      group,
      update(dt, t, player): void {
        beacon.update(t);
        yehoshua.root.rotation.y = -Math.PI / 2 + Math.sin(t * 0.7) * 0.12; yehoshua.update(dt, false);

        // Estación 1: la muela gira siempre que esté lista; chispas mientras activa
        if (stations[0].done) {
          wheel.rotation.x += dt * 14;
          smith.update(dt, true, 0.5);
          sparks.visible = true;
          const sp = sparks.geometry.attributes.position as THREE.BufferAttribute;
          for (let i = 0; i < sparkN; i++) {
            if (sparkV[i].lengthSq() < 0.001 || sp.getY(i) < 0.2) {
              sp.setXYZ(i, 0.4, 1.9, 0.1); sparkV[i].set((Math.random() - 0.2) * 3, Math.random() * 2, (Math.random() - 0.5) * 1.5);
            }
            sparkV[i].y -= dt * 8;
            sp.setXYZ(i, sp.getX(i) + sparkV[i].x * dt, sp.getY(i) + sparkV[i].y * dt, sp.getZ(i) + sparkV[i].z * dt);
          }
          sp.needsUpdate = true;
        }
        // Estación 3: pequeño balanceo de escudos cuando está lista
        if (stations[2].done) for (const s of shieldSoldiers) { s.shield.position.y = 1.9 + Math.sin(t * 3) * 0.05; s.fig.update(dt, false); }

        // recorrer estaciones
        if (idx < stations.length) {
          const st = STATIONS[idx];
          const near = Math.hypot(player.x - st.x, player.z - st.z) < R;
          if (near && ctx.wantsInteract()) {
            stations[idx].done = true;
            if (st.kind === 'flechas') arrows.forEach((a) => (a.visible = true));
            ctx.sound.pickup?.();
            idx++;
            if (idx < stations.length) beacon.setPos(STATIONS[idx].x, STATIONS[idx].z);
            else { beacon.visible = false; allT0 = t; } // marca de reloj de pared
          }
        } else if (t - allT0 > 0.9) {
          doneFlag = true; // completado por reloj de pared (fps-independiente)
        }
      },
      status(): string | null {
        if (idx < stations.length) {
          const labels = { muela: 'afila las espadas', flechas: 'llena el carcaj', escudos: 'forma los escudos' };
          return `⚒️ Prepara: ${idx}/${stations.length} · ahora ${labels[STATIONS[idx].kind]}`;
        }
        return doneFlag ? '✅ ¡Ejército preparado!' : '🛡️ ¡Todo listo para marchar!';
      },
      hud() {
        const p = ctx.getPlayer();
        if (idx < stations.length) {
          const st = STATIONS[idx];
          const near = Math.hypot(p.x - st.x, p.z - st.z) < R;
          return { prompt: near ? '⚒️ Pulsa E para preparar' : undefined, progress: idx / stations.length };
        }
        return { progress: 1 };
      },
      isDone(): boolean { return doneFlag; },
      dispose(): void {
        beacon.dispose();
        group.traverse((obj) => { const m = obj as THREE.Mesh; if (m.geometry) m.geometry.dispose(); });
      }
    };
  }
};
