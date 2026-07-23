import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { PlasticMaterialFactory } from '../../materials/PlasticMaterialFactory';
import { Minifigure, createMinifigure, MinifigureSkin } from '../../characters/MinifigureFactory';
import { Dust } from '../../effects/Dust';
import { IS_MOBILE } from '../../core/Quality';

const VILLAGER_SKINS: MinifigureSkin[] = [
  { head: 0xf2c141, torso: 0xb9a36f, belt: 0x7a5230, legs: 0x8a6a3a, arms: 0xa8895f, hands: 0xf2c141, headwear: 0xc9b083, headStyle: 'turban', sword: false },
  { head: 0xf2c141, torso: 0x9a9184, belt: 0x5a5248, legs: 0x6f6558, arms: 0x8a8278, hands: 0xf2c141, headwear: 0xb9b2a4, headStyle: 'turban', sword: false },
  { head: 0xf2c141, torso: 0x8f6a3e, belt: 0x5a4028, legs: 0x6f5230, arms: 0x7a5a34, hands: 0xf2c141, headwear: 0xcdb98a, headStyle: 'turban', sword: false },
  { head: 0xf2c141, torso: 0x6f7a52, belt: 0x4a5030, legs: 0x556040, arms: 0x66703f, hands: 0xf2c141, headwear: 0xa9b088, headStyle: 'turban', sword: false }
];
const BEDOUIN_SKIN: MinifigureSkin = {
  head: 0xf2c141, torso: 0x7d6608, belt: 0x4a3a10, legs: 0x5a4a1a, arms: 0x6a5a18,
  hands: 0xf2c141, headwear: 0xf5cba7, headStyle: 'turban', beard: 0x2a2018, sword: false
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

/** Canasta de mimbre con panes redondos (la cargan los niños). */
function buildBasket(plastic: PlasticMaterialFactory): THREE.Group {
  const g = new THREE.Group();
  const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.4, 0.5, 12), plastic.get(0xc9a24a));
  g.add(basket);
  for (let k = 0; k < 4; k++) {
    const bread = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), plastic.get(0xd9a75a));
    bread.position.set((Math.random() - 0.5) * 0.4, 0.32, (Math.random() - 0.5) * 0.4);
    g.add(bread);
  }
  return g;
}

interface Nino { fig: Minifigure; prog: number; }
interface Wander { fig: Minifigure; tx: number; tz: number; speed: number; ph: number; }
interface Load { mesh: THREE.Mesh; base: THREE.Vector3; vel: THREE.Vector3; }
interface Bicho { g: THREE.Group; vy: number; hopCd: number; target?: boolean; penned?: boolean; }

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
  private sheep: Bicho[] = [];      // ovejas que saltan y balan si te acercas
  private ninos: Nino[] = [];       // niños que desfilan con canastas de pan
  private readonly rutaA = new THREE.Vector3(12, 0, 46);   // ruta de los niños
  private readonly rutaB = new THREE.Vector3(31, 0, 25);   // (hacia el Tabernáculo)
  private pen = { x: -30, z: 44, r: 5.4 };   // redil (arrear ovejas)
  private penActive = false;        // el mini-juego de arrear está activo
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
      const s = buildSheep(plastic);
      s.position.set(-30 + Math.random() * 12, 0, 60 + Math.random() * 14);
      s.rotation.y = Math.random() * Math.PI; this.group.add(s);
      this.sheep.push({ g: s, vy: 0, hopCd: 0 });
    }

    // --- Redil (corral de vallas) + 3 ovejas OBJETIVO para arrear ---
    this.buildPen();
    for (const [sx, sz] of [[-19, 44], [-22, 49], [-17, 40]] as Array<[number, number]>) {
      const s = buildSheep(plastic);
      s.position.set(sx, 0, sz); s.rotation.y = Math.random() * Math.PI;
      this.group.add(s);
      this.sheep.push({ g: s, vy: 0, hopCd: 0, target: true });
    }

    // --- 4 niños con canastas de pan que desfilan hacia el Tabernáculo (esc. 06) ---
    for (let i = 0; i < 4; i++) {
      const fig = createMinifigure(plastic, VILLAGER_SKINS[i % VILLAGER_SKINS.length]);
      fig.root.scale.setScalar(0.62);
      const basket = buildBasket(plastic);
      basket.position.set(0, 2.4, 1.2); fig.root.add(basket);   // canasta delante, en las manos
      this.group.add(fig.root);
      this.ninos.push({ fig, prog: i * 0.16 });
    }

    // --- Abrevadero: dan de beber a los animales (esc. 05) ---
    const trough = new THREE.Group();
    const stone = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.9, 1.4), plastic.get(0x8a8078));
    stone.position.y = 0.45; stone.castShadow = true; trough.add(stone);
    const water = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.16, 1.0),
      new THREE.MeshStandardMaterial({ color: 0x3a8fbf, roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.9 }));
    water.position.y = 0.86; trough.add(water);
    trough.position.set(-12, 0, 30); this.group.add(trough);
    const helper = createMinifigure(plastic, VILLAGER_SKINS[1]);
    helper.root.position.set(-14.2, 0, 30); helper.root.rotation.y = Math.PI / 2;
    helper.armR.rotation.x = -0.9; helper.armL.rotation.x = -0.6;   // inclinado, dando de beber
    this.group.add(helper.root);
    const drinker = buildSheep(plastic);
    drinker.position.set(-10.4, 0, 30); drinker.rotation.y = -Math.PI / 2; drinker.rotation.x = 0.22;
    this.group.add(drinker);

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

  /** Corral de vallas de ladrillo con una abertura al este (por donde se arrea). */
  private buildPen(): void {
    const { x: cx, z: cz } = this.pen;
    const half = 6, postH = 1.8;
    const railMat = 0x8a5a2c;
    const addPost = (x: number, z: number): void => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, postH, 6), this.plastic.get(0x6f4622));
      p.position.set(x, postH / 2, z); p.castShadow = true; this.group.add(p);
    };
    // cuatro lados; el lado +x (este) queda abierto en el centro (entrada)
    for (let d = -half; d <= half; d += 1.5) {
      addPost(cx + d, cz - half);           // sur
      addPost(cx + d, cz + half);           // norte
      addPost(cx - half, cz + d);           // oeste
      if (Math.abs(d) > 2.2) addPost(cx + half, cz + d); // este (con hueco)
    }
    // travesaños (cajas finas) por los tres lados cerrados
    const rail = (x: number, z: number, w: number, dep: number): void => {
      this.group.add(rbox(w, 0.22, dep, railMat, this.plastic, x, 1.2, z));
      this.group.add(rbox(w, 0.22, dep, railMat, this.plastic, x, 0.6, z));
    };
    rail(cx, cz - half, half * 2, 0.18);    // sur
    rail(cx, cz + half, half * 2, 0.18);    // norte
    rail(cx - half, cz, 0.18, half * 2);    // oeste
    // cartel/paja en el suelo del redil
    const floor = new THREE.Mesh(new THREE.CircleGeometry(half - 0.6, 16), this.plastic.get(0xcdae6a));
    floor.rotation.x = -Math.PI / 2; floor.position.set(cx, 0.02, cz); floor.receiveShadow = true;
    this.group.add(floor);
  }

  /** Arranca el mini-juego de arrear ovejas al redil. */
  activarOvejas(): void { this.penActive = true; }
  /** Dónde está el beduino con su camello (para guiar al jugador). */
  get beduinoPos(): { x: number; z: number } { return { x: 25, z: 31 }; }
  /** Fuerza el derrumbe de la carga del camello (gag garantizado al llegar). */
  derrumbar(): void { if (this.gagState === 'cargado') this.gagT = 99; }
  get ovejasObjetivo(): number { return this.sheep.filter((s) => s.target).length; }
  get ovejasEnRedil(): number { return this.sheep.filter((s) => s.target && s.penned).length; }
  get redil(): { x: number; z: number } { return { x: this.pen.x, z: this.pen.z }; }
  /** (debug) posiciones de las ovejas objetivo, para pruebas de arreo. */
  get _targets(): Array<{ x: number; z: number; penned: boolean }> {
    return this.sheep.filter((s) => s.target).map((s) => ({ x: s.g.position.x, z: s.g.position.z, penned: !!s.penned }));
  }

  update(dt: number, t: number, playerPos?: THREE.Vector3, onBaa?: () => void, onPenned?: () => void): void {
    // ovejas: saltan y balan cuando el jugador se acerca (mundo que reacciona).
    // Las OBJETIVO, además, se arrean: si el jugador las empuja al redil, se quedan.
    for (const s of this.sheep) {
      if (s.penned) { s.g.position.y = Math.abs(Math.sin(t * 2 + s.g.position.x)) * 0.15; continue; }
      s.hopCd -= dt;
      if (playerPos && s.hopCd <= 0 && s.g.position.y < 0.05) {
        const dx = playerPos.x - s.g.position.x, dz = playerPos.z - s.g.position.z;
        if (dx * dx + dz * dz < (s.target ? 20 : 12)) {   // objetivo: radio mayor, más fácil de arrear
          s.vy = 6.2; s.hopCd = 1.0;
          s.g.rotation.y = Math.atan2(-dx, -dz);   // huye del jugador
          onBaa?.();
        }
      }
      if (s.g.position.y > 0 || s.vy > 0) {
        s.vy -= 24 * dt;
        s.g.position.y += s.vy * dt;
        const flee = s.target ? 4.2 : 1.9;           // las de arrear avanzan más por salto
        s.g.position.x += Math.sin(s.g.rotation.y) * flee * dt;
        s.g.position.z += Math.cos(s.g.rotation.y) * flee * dt;
        if (s.g.position.y < 0) { s.g.position.y = 0; s.vy = 0; }
      }
      // arrear: cuando ya está cerca del redil, deriva sola hacia dentro (menos frustración)
      if (s.target && this.penActive) {
        const px = this.pen.x - s.g.position.x, pz = this.pen.z - s.g.position.z;
        const d2 = px * px + pz * pz;
        if (s.g.position.y < 0.05 && d2 < 81) {   // a menos de ~9: imán suave al corral
          const d = Math.sqrt(d2) || 1;
          s.g.position.x += (px / d) * 0.8 * dt;
          s.g.position.z += (pz / d) * 0.8 * dt;
        }
        if (d2 < this.pen.r * this.pen.r) { s.penned = true; s.vy = 0; onPenned?.(); }
      }
    }

    // niños desfilando con canastas de pan (en fila hacia el Tabernáculo)
    const dirY = Math.atan2(this.rutaB.x - this.rutaA.x, this.rutaB.z - this.rutaA.z);
    for (const n of this.ninos) {
      n.prog += dt * 0.06;
      if (n.prog > 1.15) n.prog -= 1.15;   // bucle con pausa al final
      const p = Math.min(1, n.prog);
      n.fig.root.position.lerpVectors(this.rutaA, this.rutaB, p);
      n.fig.root.rotation.y = dirY;
      n.fig.update(dt, n.prog <= 1, 0.7);
      n.fig.armR.rotation.x = -1.2; n.fig.armL.rotation.x = -1.2;   // mantienen el pan cargado
    }

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
