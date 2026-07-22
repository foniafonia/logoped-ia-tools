import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { PlasticMaterialFactory } from '../../materials/PlasticMaterialFactory';
import { Minifigure, createMinifigure, MinifigureSkin } from '../../characters/MinifigureFactory';
import { Dust } from '../../effects/Dust';
import { IS_MOBILE } from '../../core/Quality';

const VILLAGER_SKINS: MinifigureSkin[] = [
  { head: 0xf2c141, torso: 0xb9a36f, belt: 0x7a5230, legs: 0x8a6a3a, arms: 0xa8895f, hands: 0xf2c141, headwear: 0xc9b083, headStyle: 'turban' },
  { head: 0xf2c141, torso: 0x9a9184, belt: 0x5a5248, legs: 0x6f6558, arms: 0x8a8278, hands: 0xf2c141, headwear: 0xb9b2a4, headStyle: 'turban' },
  { head: 0xf2c141, torso: 0x8f6a3e, belt: 0x5a4028, legs: 0x6f5230, arms: 0x7a5a34, hands: 0xf2c141, headwear: 0xcdb98a, headStyle: 'turban' },
  { head: 0xf2c141, torso: 0x6f7a52, belt: 0x4a5030, legs: 0x556040, arms: 0x66703f, hands: 0xf2c141, headwear: 0xa9b088, headStyle: 'turban' }
];
const BEDOUIN_SKIN: MinifigureSkin = {
  head: 0xf2c141, torso: 0x7d6608, belt: 0x4a3a10, legs: 0x5a4a1a, arms: 0x6a5a18,
  hands: 0xf2c141, headwear: 0xf5cba7, headStyle: 'turban', beard: 0x2a2018
};

function rbox(w: number, h: number, d: number, color: number, plastic: PlasticMaterialFactory, x: number, y: number, z: number): THREE.Mesh {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, 0.06), plastic.get(color));
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
  return m;
}

/** Camello de ladrillo (cuerpo, joroba, cuello, cabeza, 4 patas). */
function buildCamel(plastic: PlasticMaterialFactory, color = 0xc9a24a): THREE.Group {
  const g = new THREE.Group();
  g.add(rbox(1.3, 1.2, 3.0, color, plastic, 0, 2.2, 0));          // cuerpo
  g.add(rbox(1.0, 0.9, 1.1, color, plastic, 0, 3.1, 0.1));        // joroba
  g.add(rbox(0.7, 1.7, 0.7, color, plastic, 0, 3.0, 1.5));        // cuello
  g.add(rbox(0.6, 0.6, 1.0, color, plastic, 0, 3.7, 2.0));        // cabeza
  for (const [lx, lz] of [[-0.5, 1.1], [0.5, 1.1], [-0.5, -1.1], [0.5, -1.1]] as Array<[number, number]>) {
    g.add(rbox(0.4, 2.2, 0.4, color, plastic, lx, 1.1, lz));      // patas
  }
  return g;
}

/** Oveja de ladrillo (lana clara + cara oscura + patas). */
function buildSheep(plastic: PlasticMaterialFactory): THREE.Group {
  const g = new THREE.Group();
  g.add(rbox(1.1, 1.0, 1.5, 0xeae6dc, plastic, 0, 1.1, 0));       // lana
  g.add(rbox(0.5, 0.5, 0.6, 0x3a2e24, plastic, 0, 1.2, 0.95));    // cara
  for (const [lx, lz] of [[-0.35, 0.5], [0.35, 0.5], [-0.35, -0.5], [0.35, -0.5]] as Array<[number, number]>) {
    g.add(rbox(0.22, 0.9, 0.22, 0x3a2e24, plastic, lx, 0.45, lz));
  }
  return g;
}

interface Wander { fig: Minifigure; tx: number; tz: number; speed: number; ph: number; }
interface Load { mesh: THREE.Mesh; base: THREE.Vector3; vel: THREE.Vector3; }

/**
 * VIDA del campamento: aldeanos que deambulan (con animación de andar),
 * animales, y el gag recurrente del beduino cuya carga se derrumba en una
 * nube de polvo. Todo se actualiza con update(dt, t).
 */
export class CampLife {
  private group = new THREE.Group();
  private wanderers: Wander[] = [];
  private bedouin: Minifigure;
  private loads: Load[] = [];
  private gagT = 0;
  private gagState: 'cargado' | 'derrumbe' | 'suelo' = 'cargado';

  constructor(scene: THREE.Scene, private plastic: PlasticMaterialFactory, private dust: Dust) {
    // --- Aldeanos deambulando ---
    const n = IS_MOBILE ? 8 : 14;
    for (let i = 0; i < n; i++) {
      const fig = createMinifigure(plastic, VILLAGER_SKINS[i % VILLAGER_SKINS.length]);
      const x = (Math.random() - 0.5) * 60, z = 16 + Math.random() * 66;
      fig.root.position.set(x, 0, z);
      const s = 0.85 + Math.random() * 0.25; fig.root.scale.setScalar(s);
      this.group.add(fig.root);
      this.wanderers.push({ fig, tx: x, tz: z, speed: 2 + Math.random() * 1.5, ph: Math.random() * 6.28 });
    }

    // --- Animales ---
    for (const [cx, cz] of [[28, 34], [-24, 44], [30, 58]] as Array<[number, number]>) {
      const camel = buildCamel(plastic); camel.position.set(cx, 0, cz); camel.rotation.y = Math.random() * Math.PI; this.group.add(camel);
    }
    for (let i = 0; i < (IS_MOBILE ? 7 : 12); i++) {
      const sheep = buildSheep(plastic);
      sheep.position.set(-30 + Math.random() * 12, 0, 60 + Math.random() * 14);
      sheep.rotation.y = Math.random() * Math.PI; this.group.add(sheep);
    }

    // --- Gag del beduino: figura + camello + torre de carga ---
    this.bedouin = createMinifigure(plastic, BEDOUIN_SKIN);
    this.bedouin.root.position.set(24, 0, 30);
    this.bedouin.root.rotation.y = -0.7;
    this.group.add(this.bedouin.root);
    const gagCamel = buildCamel(plastic, 0xb9924a); gagCamel.position.set(26.5, 0, 30.5); gagCamel.rotation.y = -Math.PI / 2; this.group.add(gagCamel);
    // torre de carga sobre el camello (cajas y vasijas)
    const loadColors = [0x9a6a3a, 0xb0b0b8, 0x8a5a2c, 0xc9a24a, 0x7a5230];
    for (let i = 0; i < 6; i++) {
      const box = rbox(1.0 - i * 0.05, 0.7, 1.0 - i * 0.05, loadColors[i % loadColors.length], plastic, 26.5, 4.2 + i * 0.75, 30.5);
      this.group.add(box);
      this.loads.push({ mesh: box, base: box.position.clone(), vel: new THREE.Vector3() });
    }

    scene.add(this.group);
  }

  update(dt: number, t: number): void {
    // aldeanos deambulando
    for (const w of this.wanderers) {
      const p = w.fig.root.position;
      const dx = w.tx - p.x, dz = w.tz - p.z;
      const dist = Math.hypot(dx, dz);
      const moving = dist > 0.6;
      if (moving) {
        p.x += (dx / dist) * w.speed * dt;
        p.z += (dz / dist) * w.speed * dt;
        w.fig.root.rotation.y = Math.atan2(dx, dz);
      } else {
        // nuevo destino
        w.tx = (Math.random() - 0.5) * 64;
        w.tz = 16 + Math.random() * 66;
      }
      w.fig.update(dt, moving, 1);
    }

    // gag del beduino (bucle)
    this.gagT += dt;
    if (this.gagState === 'cargado') {
      // ligero temblor de la carga antes de caer
      const sway = Math.sin(t * 3) * 0.03;
      for (const l of this.loads) l.mesh.position.x = l.base.x + sway;
      if (this.gagT > 6) { // ¡se derrumba!
        this.gagState = 'derrumbe'; this.gagT = 0;
        for (const l of this.loads) l.vel.set((Math.random() - 0.5) * 6, 2 + Math.random() * 3, (Math.random() - 0.5) * 6);
        this.dust.burst(26.5, 3, 30.5, 40);
        this.bedouin.armR.rotation.x = -2.4; this.bedouin.armL.rotation.x = -2.4; // brazos arriba
      }
    } else if (this.gagState === 'derrumbe') {
      for (const l of this.loads) {
        l.vel.y -= 22 * dt;
        l.mesh.position.addScaledVector(l.vel, dt);
        l.mesh.rotation.x += l.vel.z * dt * 0.5; l.mesh.rotation.z += l.vel.x * dt * 0.5;
        if (l.mesh.position.y < 0.4) { l.mesh.position.y = 0.4; l.vel.set(0, 0, 0); }
      }
      if (this.gagT > 3) { this.gagState = 'suelo'; this.gagT = 0; }
    } else { // suelo → recargar
      if (this.gagT > 2.5) {
        this.gagState = 'cargado'; this.gagT = 0;
        this.loads.forEach((l, i) => { l.mesh.position.copy(l.base); l.mesh.rotation.set(0, 0, 0); l.mesh.position.y = 4.2 + i * 0.75; });
        this.bedouin.armR.rotation.x = 0; this.bedouin.armL.rotation.x = 0;
      }
    }
  }
}
