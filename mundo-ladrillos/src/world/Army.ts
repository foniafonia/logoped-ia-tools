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
// Tropa de Jericó ALINEADA al guardia canónico del muñequero (recado de
// coherencia): túnicas ROJAS (#C0392B y variantes), cascos PLATA (#95A5A6) y
// estandartes rojo/amarillo → de cerca y de lejos son el MISMO ejército, no dos.
const ENEMY_ROBES = [0xc0392b, 0xa93226, 0xb03a2e, 0x922b21, 0xcb4335];
const ENEMY_HELMS = [0x95a5a6, 0xaab4b5, 0x8b979a, 0x9fa8a9];
const ISR_BANNERS = [0x2f6db0, 0xd8b24a, 0xe6ddc9, 0x3f7a46];
const ENE_BANNERS = [0xc0392b, 0xf1c40f, 0x8a1f1f];

const KIND_SWORD = 0, KIND_ARCHER = 1, KIND_BANNER = 2;

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
  team: 0 | 1;
  kind: number;          // 0 espada, 1 arco, 2 estandarte
  mounted: boolean;
  x: number; z: number;
  slotX: number; slotZ: number;
  homeZ: number; roadX: number;
  yaw: number; ph: number; scale: number;
  state: SoldierState;
  tx: number; tz: number;
  fight: number; fall: number;
}

const MOUNT_Y = 1.05;   // el jinete se sienta sobre el caballo (piernas a los lados)

/**
 * Ejército jugable: infantería, ARQUEROS, CABALLERÍA y ESTANDARTES. Marcha por
 * el camino junto al espía, se despliega y, tras el derrumbe, carga a la
 * batalla contra los defensores de Jericó. Todo instanciado y con plástico.
 */
export class Army {
  group = new THREE.Group();
  private meshes: Record<string, THREE.InstancedMesh> = {};
  private soldiers: Soldier[] = [];
  private dummy = new THREE.Object3D();
  private color = new THREE.Color();
  private zero = new THREE.Matrix4().makeScale(0, 0, 0);
  private phase: 'march' | 'formed' | 'battle' = 'march';
  private running = false;
  private nIsr: number; private nEne: number;
  private fallenEne = 0; private fallenIsr = 0;

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

    // Arco (madera curvada + cuerda) en la mano en alto
    const bowArc = new THREE.TorusGeometry(0.85, 0.07, 6, 14, Math.PI * 1.15).rotateZ(Math.PI * 0.42).translate(1.55, 4.7, 0);
    const bowStr = rbox(0.03, 1.6, 0.03, 1.05, 4.7, 0);
    const bow = mergeGeometries([normalizeGeometry(bowArc), bowStr], false)!;

    // Estandarte: asta larga + paño (el color lo pone instanceColor)
    const pole = cyl(0.07, 0.07, 5.4, 1.5, 6.9, 0, 6);
    const flag = rbox(1.7, 1.15, 0.06, 2.45, 8.6, 0);
    const banner = mergeGeometries([pole, flag], false)!;

    // Caballo de ladrillo (cuerpo + cuello + cabeza + 4 patas + cola)
    const horse = mergeGeometries([
      rbox(1.15, 1.15, 2.7, 0, 1.75, 0.1),                 // cuerpo
      rbox(0.72, 1.35, 0.72, 0, 2.35, 1.15, 0, -0.5),      // cuello
      rbox(0.6, 0.62, 1.15, 0, 2.9, 1.75),                 // cabeza
      rbox(0.34, 1.8, 0.4, -0.42, 0.9, 1.0), rbox(0.34, 1.8, 0.4, 0.42, 0.9, 1.0),
      rbox(0.34, 1.8, 0.4, -0.42, 0.9, -0.8), rbox(0.34, 1.8, 0.4, 0.42, 0.9, -0.8),
      rbox(0.18, 1.1, 0.18, 0, 2.2, -1.35, 0, 0.6)         // cola
    ], false)!;

    const M = (g: THREE.BufferGeometry, mat: THREE.Material, shadow = false): THREE.InstancedMesh => {
      const im = new THREE.InstancedMesh(g, mat, total);
      im.castShadow = shadow;
      im.frustumCulled = false;
      im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      return im;
    };
    this.meshes = {
      horse: M(horse, plasticStd(0x5a3a22, { roughness: 0.6 }), true),
      body: M(body, plasticStd(0xffffff), true),
      skin: M(skin, plasticStd(0xf2c141)),
      turban: M(turban, plasticStd(0xffffff), true),
      beard: M(beard, plasticStd(0xcfc8ba, { roughness: 0.6 })),
      sword: M(sword, new THREE.MeshPhysicalMaterial({ color: 0xd2d7dd, roughness: 0.28, metalness: 0.7, clearcoat: 0.3 })),
      bow: M(bow, plasticStd(0x6b4a2a, { roughness: 0.6 })),
      banner: M(banner, plasticStd(0xffffff)),
      shield: M(shield, plasticStd(0x8a5a2c))
    };

    this.placeIsraelites();
    this.placeEnemies();
    for (const m of Object.values(this.meshes)) this.group.add(m);
    this.writeAll();
  }

  private placeIsraelites(): void {
    const rows = IS_MOBILE ? 9 : 13;
    const cols = Math.ceil(this.nIsr / rows);
    const spread = (COURT.half - 5) * 2;
    const laneHalf = 15;
    const roadK = (ROAD.half - 3) / (COURT.half - 5);
    const zA = 14, zB = COURT.back - 10;
    const nMounted = IS_MOBILE ? 12 : 24;
    let mounted = 0, i = 0;
    for (let r = 0; r < rows && i < this.nIsr; r++) {
      for (let c = 0; c < cols && i < this.nIsr; c++, i++) {
        let x = (c / (cols - 1) - 0.5) * spread + (Math.random() - 0.5) * 2.2;
        if (Math.abs(x) < laneHalf) x += (x < 0 ? -1 : 1) * laneHalf;
        const slotZ = zA + (r / (rows - 1)) * (zB - zA) + (Math.random() - 0.5) * 2.2;
        const isMount = r === 0 && mounted < nMounted;
        if (isMount) mounted++;
        // primera fila: caballería con estandartes/espadas; filas traseras: arqueros
        let kind = KIND_SWORD;
        if (i % 13 === 0 || (isMount && mounted % 3 === 0)) kind = KIND_BANNER;
        else if (!isMount && r >= rows - 3) kind = KIND_ARCHER;
        const s = 0.92 + Math.random() * 0.16;
        const roadX = x * roadK;
        this.soldiers.push({
          team: 0, kind, mounted: isMount,
          x: roadX, z: slotZ + ROAD.len, slotX: x, slotZ, homeZ: slotZ + ROAD.len, roadX,
          yaw: Math.PI, ph: Math.random() * 6.28, scale: s,
          state: 'march', tx: 0, tz: 0, fight: 0, fall: 0
        });
        const idx = this.soldiers.length - 1;
        this.meshes.body.setColorAt(idx, this.color.set(ROBES[(Math.random() * ROBES.length) | 0]));
        this.meshes.turban.setColorAt(idx, this.color.set(TURBANS[(Math.random() * TURBANS.length) | 0]));
        this.meshes.banner.setColorAt(idx, this.color.set(ISR_BANNERS[(Math.random() * ISR_BANNERS.length) | 0]));
      }
    }
  }

  private placeEnemies(): void {
    for (let i = 0; i < this.nEne; i++) {
      const x = (Math.random() - 0.5) * (COURT.half - 6) * 2;
      const s = 0.92 + Math.random() * 0.16;
      const kind = i % 9 === 0 ? KIND_BANNER : KIND_SWORD;
      this.soldiers.push({
        team: 1, kind, mounted: false,
        x, z: 1.5 + Math.random() * 3, slotX: x, slotZ: 2, homeZ: 2, roadX: x,
        yaw: 0, ph: Math.random() * 6.28, scale: s,
        state: 'hidden', tx: 0, tz: 0, fight: 0, fall: 0
      });
      const idx = this.soldiers.length - 1;
      this.meshes.body.setColorAt(idx, this.color.set(ENEMY_ROBES[(Math.random() * ENEMY_ROBES.length) | 0]));
      this.meshes.turban.setColorAt(idx, this.color.set(ENEMY_HELMS[(Math.random() * ENEMY_HELMS.length) | 0]));
      this.meshes.banner.setColorAt(idx, this.color.set(ENE_BANNERS[(Math.random() * ENE_BANNERS.length) | 0]));
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

  /**
   * El héroe golpea: derriba a los enemigos cercanos que tenga DELANTE.
   * (x,z) posición del espía; (dx,dz) su dirección de mirada. Devuelve
   * cuántos enemigos ha tumbado.
   */
  hitNear(x: number, z: number, dx: number, dz: number, range = 5.5): number {
    let hits = 0;
    const r2 = range * range;
    for (const s of this.soldiers) {
      if (s.team !== 1 || s.state === 'hidden' || s.state === 'fallen') continue;
      const ex = s.x - x, ez = s.z - z;
      const d2 = ex * ex + ez * ez;
      if (d2 > r2) continue;
      const d = Math.sqrt(d2) || 1;
      if ((ex / d) * dx + (ez / d) * dz < 0.15) continue;   // debe estar por delante
      s.state = 'fallen'; s.fall = 0; this.fallenEne++;
      hits++;
    }
    return hits;
  }

  update(dt: number, t: number): void {
    if (!this.running) return;
    const march = 4.6, charge = 8.0;
    let arrived = 0;
    for (let idx = 0; idx < this.soldiers.length; idx++) {
      const s = this.soldiers[idx];
      const moving = s.state === 'march' || s.state === 'charge';
      if (s.state === 'march') {
        const d = s.z - s.slotZ;
        if (d > 0.4) s.z -= Math.min(d, march * dt);
        else { s.state = 'idle'; s.z = s.slotZ; }
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
          } else { s.fight = 0.5 + Math.random(); }
        }
      } else if (s.state === 'fallen') {
        s.fall = Math.min(1, s.fall + dt * 2.2);
      } else if (s.state === 'idle') { arrived++; }

      if (s.state === 'idle' && this.phase !== 'battle') s.yaw = Math.PI;

      const bob = moving ? Math.abs(Math.sin(t * 8 + s.ph)) * 0.14 : 0;
      const pitch = moving ? Math.sin(t * 8 + s.ph) * 0.05 : 0;
      const d = this.dummy;
      const mountY = s.mounted ? MOUNT_Y : 0;
      if (s.state === 'hidden') {
        d.position.set(0, -100, 0); d.scale.setScalar(0.0001); d.rotation.set(0, 0, 0);
      } else if (s.state === 'fallen') {
        d.position.set(s.x, mountY + s.scale * (1 - s.fall * 0.7), s.z);
        d.rotation.set(0, s.yaw, s.fall * 1.5);
        d.scale.setScalar(s.scale);
      } else {
        d.position.set(s.x, mountY + bob, s.z);
        d.rotation.set(pitch, s.yaw, 0);
        d.scale.setScalar(s.scale);
      }
      d.updateMatrix();
      const body = d.matrix.clone();
      this.meshes.body.setMatrixAt(idx, body);
      this.meshes.skin.setMatrixAt(idx, body);
      this.meshes.turban.setMatrixAt(idx, body);
      this.meshes.beard.setMatrixAt(idx, body);
      this.meshes.shield.setMatrixAt(idx, body);
      // arma en la mano según tipo
      this.meshes.sword.setMatrixAt(idx, s.kind === KIND_SWORD && s.state !== 'hidden' ? body : this.zero);
      this.meshes.bow.setMatrixAt(idx, s.kind === KIND_ARCHER && s.state !== 'hidden' ? body : this.zero);
      this.meshes.banner.setMatrixAt(idx, s.kind === KIND_BANNER && s.state !== 'hidden' ? body : this.zero);
      // caballo bajo el jinete (sin el desplazamiento de montura)
      if (s.mounted && s.state !== 'hidden' && s.state !== 'fallen') {
        d.position.set(s.x, bob, s.z); d.rotation.set(0, s.yaw, 0); d.scale.setScalar(s.scale);
        d.updateMatrix();
        this.meshes.horse.setMatrixAt(idx, d.matrix);
      } else {
        this.meshes.horse.setMatrixAt(idx, this.zero);
      }
    }
    if (this.phase === 'march' && arrived > this.nIsr * 0.9) this.phase = 'formed';
    for (const m of Object.values(this.meshes)) m.instanceMatrix.needsUpdate = true;
  }

  private writeAll(): void {
    for (let idx = 0; idx < this.soldiers.length; idx++) {
      const s = this.soldiers[idx];
      const d = this.dummy;
      const mountY = s.mounted ? MOUNT_Y : 0;
      if (s.state === 'hidden') { d.position.set(0, -100, 0); d.scale.setScalar(0.0001); }
      else { d.position.set(s.x, mountY, s.z); d.scale.setScalar(s.scale); }
      d.rotation.set(0, s.yaw, 0);
      d.updateMatrix();
      const body = d.matrix.clone();
      this.meshes.body.setMatrixAt(idx, body);
      this.meshes.skin.setMatrixAt(idx, body);
      this.meshes.turban.setMatrixAt(idx, body);
      this.meshes.beard.setMatrixAt(idx, body);
      this.meshes.shield.setMatrixAt(idx, body);
      this.meshes.sword.setMatrixAt(idx, s.kind === KIND_SWORD && s.state !== 'hidden' ? body : this.zero);
      this.meshes.bow.setMatrixAt(idx, s.kind === KIND_ARCHER && s.state !== 'hidden' ? body : this.zero);
      this.meshes.banner.setMatrixAt(idx, s.kind === KIND_BANNER && s.state !== 'hidden' ? body : this.zero);
      if (s.mounted && s.state !== 'hidden') {
        d.position.set(s.x, 0, s.z); d.updateMatrix();
        this.meshes.horse.setMatrixAt(idx, d.matrix);
      } else this.meshes.horse.setMatrixAt(idx, this.zero);
    }
    for (const m of Object.values(this.meshes)) {
      m.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }
  }
}
