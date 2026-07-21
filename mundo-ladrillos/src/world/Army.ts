import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { normalizeGeometry } from '../bricks/BrickGeometryFactory';
import { IS_MOBILE } from '../core/Quality';
import { COURT, ROAD, CLASH_Z } from '../core/Layout';

/** Material de plástico ABS (clearcoat) como el del espía y la muralla. */
function plasticStd(color: number, extra: THREE.MeshPhysicalMaterialParameters = {}): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color, metalness: 0, roughness: 0.34, clearcoat: 0.4, clearcoatRoughness: 0.2,
    envMapIntensity: 1.1, ...extra
  });
}

// Israelitas (túnicas/turbantes claros) y enemigos de Jericó (oscuros/rojizos).
const ROBES = [0xb9a36f, 0x8f6a3e, 0x6f7a52, 0x9a9184, 0x7a5230, 0xc9b083, 0x86633a];
const TURBANS = [0xf1ece0, 0x2f6db0, 0x8a6a3a, 0xb9b2a4, 0xcdb98a, 0xe6ddc9];
const ENEMY_ROBES = [0x6e2b2b, 0x4a3040, 0x3a2a22, 0x5a3a1e, 0x552033];
const ENEMY_HELMS = [0x8a1f1f, 0x2b2b30, 0x4a4a52, 0x6b1414];

function rbox(w: number, h: number, d: number, x: number, y: number, z: number, rz = 0, rx = 0): THREE.BufferGeometry {
  const g = new RoundedBoxGeometry(w, h, d, 1, 0.05);
  if (rz) g.rotateZ(rz);
  if (rx) g.rotateX(rx);
  g.translate(x, y, z);
  return normalizeGeometry(g);
}
function cyl(rt: number, rb: number, h: number, x: number, y: number, z: number, seg = 10): THREE.BufferGeometry {
  return normalizeGeometry(new THREE.CylinderGeometry(rt, rb, h, seg).translate(x, y, z));
}

type SoldierState = 'hidden' | 'march' | 'idle' | 'charge' | 'fight' | 'fallen';

interface Soldier {
  team: 0 | 1;          // 0 israelita, 1 enemigo
  x: number; z: number;
  slotX: number; slotZ: number;   // sitio en formación (fin de la marcha)
  homeZ: number;         // z de arranque (sobre el camino)
  roadX: number;         // x comprimida mientras marcha por el camino
  yaw: number;
  ph: number;            // desfase del ciclo de andar
  scale: number;
  state: SoldierState;
  tx: number; tz: number;   // objetivo de la carga (batalla)
  fight: number;         // temporizador de pelea
  fall: number;          // 0..1 caída
}

/**
 * Ejército jugable: minifiguras instanciadas que MARCHAN por el camino,
 * forman delante de la muralla y, tras el derrumbe, CARGAN a la batalla
 * contra los defensores de Jericó. Todo con el acabado de plástico.
 */
export class Army {
  group = new THREE.Group();
  private meshes: Record<string, THREE.InstancedMesh> = {};
  private soldiers: Soldier[] = [];
  private dummy = new THREE.Object3D();
  private color = new THREE.Color();
  private phase: 'march' | 'formed' | 'battle' = 'march';
  private running = false;   // la marcha arranca con el primer toque
  private nIsr: number;
  private nEne: number;
  private fallenEne = 0;
  private fallenIsr = 0;

  constructor() {
    this.nIsr = IS_MOBILE ? 150 : 300;
    this.nEne = IS_MOBILE ? 70 : 140;
    const total = this.nIsr + this.nEne;

    const body = mergeGeometries([
      rbox(0.62, 1.25, 0.78, -0.32, 0.62, 0), rbox(0.62, 1.25, 0.78, 0.32, 0.62, 0),
      rbox(1.34, 0.5, 0.86, 0, 1.5, 0), rbox(1.2, 1.4, 0.8, 0, 2.5, 0),
      rbox(1.5, 0.7, 0.88, 0, 3.02, 0),
      rbox(0.42, 1.15, 0.52, -0.86, 2.55, 0.04, 0.16),
      rbox(0.44, 1.25, 0.52, 1.02, 3.95, 0, -0.7)
    ], false)!;
    const skin = mergeGeometries([
      cyl(0.26, 0.26, 0.18, 0, 3.62, 0), cyl(0.55, 0.55, 0.92, 0, 4.15, 0, 12),
      normalizeGeometry(new THREE.TorusGeometry(0.19, 0.09, 6, 12).rotateX(Math.PI / 2).translate(-1.02, 1.95, 0.16)),
      normalizeGeometry(new THREE.TorusGeometry(0.19, 0.09, 6, 12).rotateX(Math.PI / 2).translate(1.5, 4.55, 0))
    ], false)!;
    const turban = mergeGeometries([
      normalizeGeometry(new THREE.SphereGeometry(0.62, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2).scale(1.05, 0.92, 1.05).translate(0, 4.55, 0)),
      normalizeGeometry(new THREE.TorusGeometry(0.57, 0.15, 6, 14).rotateX(Math.PI / 2).translate(0, 4.55, 0))
    ], false)!;
    const beard = normalizeGeometry(new THREE.ConeGeometry(0.5, 1.0, 10).rotateX(Math.PI).scale(1, 1, 0.7).translate(0, 3.9, 0.34));
    const sword = mergeGeometries([
      rbox(0.16, 2.6, 0.06, 1.5, 6.1, 0), rbox(0.55, 0.14, 0.14, 1.5, 4.75, 0),
      cyl(0.09, 0.09, 0.5, 1.5, 4.5, 0, 6)
    ], false)!;
    const disc = new THREE.CylinderGeometry(0.6, 0.6, 0.16, 16).rotateX(Math.PI / 2).translate(-1.08, 2.5, 0.55);
    const boss = new THREE.CylinderGeometry(0.16, 0.16, 0.26, 8).rotateX(Math.PI / 2).translate(-1.08, 2.5, 0.68);
    const shield = mergeGeometries([normalizeGeometry(disc), normalizeGeometry(boss)], false)!;

    const M = (g: THREE.BufferGeometry, mat: THREE.Material, shadow = false): THREE.InstancedMesh => {
      const im = new THREE.InstancedMesh(g, mat, total);
      im.castShadow = shadow;
      im.frustumCulled = false;   // los instances cubren toda la escena (móvil+plaza)
      im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      return im;
    };
    this.meshes = {
      body: M(body, plasticStd(0xffffff), true),
      skin: M(skin, plasticStd(0xf2c141)),
      turban: M(turban, plasticStd(0xffffff), true),
      beard: M(beard, plasticStd(0xcfc8ba, { roughness: 0.6 })),
      sword: M(sword, new THREE.MeshPhysicalMaterial({ color: 0xd2d7dd, roughness: 0.28, metalness: 0.7, clearcoat: 0.3 })),
      shield: M(shield, plasticStd(0x8a5a2c))
    };

    this.placeIsraelites();
    this.placeEnemies();

    for (const m of Object.values(this.meshes)) this.group.add(m);
    this.writeAll();
  }

  // --- Formación de los israelitas (flanqueando el pasillo), pero empiezan
  //     desplazados hacia atrás, sobre el CAMINO, para entrar marchando. ---
  private placeIsraelites(): void {
    const rows = IS_MOBILE ? 9 : 13;
    const cols = Math.ceil(this.nIsr / rows);
    const spread = (COURT.half - 5) * 2;
    const laneHalf = 15;
    const roadK = (ROAD.half - 3) / (COURT.half - 5);   // compresión al ancho del camino
    const zA = 14, zB = COURT.back - 10;
    let i = 0;
    for (let r = 0; r < rows && i < this.nIsr; r++) {
      for (let c = 0; c < cols && i < this.nIsr; c++, i++) {
        let x = (c / (cols - 1) - 0.5) * spread + (Math.random() - 0.5) * 2.2;
        if (Math.abs(x) < laneHalf) x += (x < 0 ? -1 : 1) * laneHalf;
        const slotZ = zA + (r / (rows - 1)) * (zB - zA) + (Math.random() - 0.5) * 2.2;
        const s = 0.92 + Math.random() * 0.16;
        const roadX = x * roadK;
        this.soldiers.push({
          team: 0, x: roadX, z: slotZ + ROAD.len,      // arranca comprimido sobre el camino
          slotX: x, slotZ, homeZ: slotZ + ROAD.len, roadX,
          yaw: Math.PI, ph: Math.random() * 6.28, scale: s,
          state: 'march', tx: 0, tz: 0, fight: 0, fall: 0
        });
        const idx = this.soldiers.length - 1;
        this.meshes.body.setColorAt(idx, this.color.set(ROBES[(Math.random() * ROBES.length) | 0]));
        this.meshes.turban.setColorAt(idx, this.color.set(TURBANS[(Math.random() * TURBANS.length) | 0]));
      }
    }
  }

  // --- Enemigos: ocultos junto a la puerta de la muralla hasta el derrumbe. ---
  private placeEnemies(): void {
    for (let i = 0; i < this.nEne; i++) {
      const x = (Math.random() - 0.5) * (COURT.half - 6) * 2;
      const s = 0.92 + Math.random() * 0.16;
      this.soldiers.push({
        team: 1, x, z: 1.5 + Math.random() * 3,
        slotX: x, slotZ: 2, homeZ: 2, roadX: x, yaw: 0, ph: Math.random() * 6.28, scale: s,
        state: 'hidden', tx: 0, tz: 0, fight: 0, fall: 0
      });
      const idx = this.soldiers.length - 1;
      this.meshes.body.setColorAt(idx, this.color.set(ENEMY_ROBES[(Math.random() * ENEMY_ROBES.length) | 0]));
      this.meshes.turban.setColorAt(idx, this.color.set(ENEMY_HELMS[(Math.random() * ENEMY_HELMS.length) | 0]));
    }
  }

  /** Arranca la marcha (con el primer toque, para ir junto al ejército). */
  start(): void { this.running = true; }

  /** Los defensores salen a luchar: enemigos cargan y los israelitas también. */
  startBattle(): void {
    if (this.phase === 'battle') return;
    this.phase = 'battle';
    for (const s of this.soldiers) {
      if (s.team === 0) {
        s.state = 'charge';
        // convergen hacia el centro para chocar con los defensores
        s.tx = s.slotX * 0.3 + (Math.random() - 0.5) * 6;
        s.tz = CLASH_Z + 1 + Math.random() * 16;
        s.yaw = Math.PI;
      } else {
        s.state = 'charge';
        s.x = s.slotX; s.z = 1.5 + Math.random() * 3;
        s.tx = s.slotX * 0.6 + (Math.random() - 0.5) * 6;
        s.tz = CLASH_Z - Math.random() * 7;
        s.yaw = 0;
      }
    }
  }

  update(dt: number, t: number): void {
    if (!this.running) return;   // en pausa hasta el primer toque
    const march = 4.6, charge = 8.0;
    let arrived = 0;
    for (let idx = 0; idx < this.soldiers.length; idx++) {
      const s = this.soldiers[idx];
      const moving = s.state === 'march' || s.state === 'charge';
      if (s.state === 'march') {
        const d = s.z - s.slotZ;
        if (d > 0.4) s.z -= Math.min(d, march * dt);
        else { s.state = 'idle'; s.z = s.slotZ; }
        // fan-out: comprimido en el camino, se abre a la formación al llegar
        const prog = Math.min(1, Math.max(0, (s.homeZ - s.z) / (s.homeZ - s.slotZ)));
        s.x = s.roadX + (s.slotX - s.roadX) * prog;
      } else if (s.state === 'charge') {
        const dx = s.tx - s.x, dz = s.tz - s.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 0.4) { s.x += (dx / dist) * charge * dt; s.z += (dz / dist) * charge * dt; }
        else { s.state = 'fight'; s.fight = 0.4 + Math.random(); }
      } else if (s.state === 'fight') {
        s.x += Math.sin(t * 9 + s.ph) * 0.015;
        s.fight -= dt;
        if (s.fight <= 0) {
          const frac = s.team === 0 ? this.fallenIsr / this.nIsr : this.fallenEne / this.nEne;
          if (frac < 0.6 && Math.random() < 0.45) {
            s.state = 'fallen'; s.fall = 0;
            if (s.team === 0) this.fallenIsr++; else this.fallenEne++;
          } else {
            s.fight = 0.5 + Math.random();   // sigue peleando
          }
        }
      } else if (s.state === 'fallen') {
        s.fall = Math.min(1, s.fall + dt * 2.2);
      } else if (s.state === 'idle') {
        arrived++;
      }

      if (s.state === 'idle' && this.phase !== 'battle') s.yaw = Math.PI;

      const bob = moving ? Math.abs(Math.sin(t * 8 + s.ph)) * 0.14 : 0;
      const pitch = moving ? Math.sin(t * 8 + s.ph) * 0.05 : 0;
      const d = this.dummy;
      if (s.state === 'hidden') {
        d.position.set(0, -100, 0); d.scale.setScalar(0.0001); d.rotation.set(0, 0, 0);
      } else if (s.state === 'fallen') {
        d.position.set(s.x, s.scale * (1 - s.fall * 0.7), s.z);
        d.rotation.set(0, s.yaw, s.fall * 1.5);
        d.scale.setScalar(s.scale);
      } else {
        d.position.set(s.x, bob, s.z);
        d.rotation.set(pitch, s.yaw, 0);
        d.scale.setScalar(s.scale);
      }
      d.updateMatrix();
      for (const m of Object.values(this.meshes)) m.setMatrixAt(idx, d.matrix);
    }

    if (this.phase === 'march' && arrived > this.nIsr * 0.9) this.phase = 'formed';
    for (const m of Object.values(this.meshes)) m.instanceMatrix.needsUpdate = true;
  }

  private writeAll(): void {
    for (let idx = 0; idx < this.soldiers.length; idx++) {
      const s = this.soldiers[idx];
      const d = this.dummy;
      if (s.state === 'hidden') { d.position.set(0, -100, 0); d.scale.setScalar(0.0001); }
      else { d.position.set(s.x, 0, s.z); d.scale.setScalar(s.scale); }
      d.rotation.set(0, s.yaw, 0);
      d.updateMatrix();
      for (const m of Object.values(this.meshes)) m.setMatrixAt(idx, d.matrix);
    }
    for (const m of Object.values(this.meshes)) {
      m.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }
  }
}
