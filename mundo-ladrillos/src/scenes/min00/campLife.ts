import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { PlasticMaterialFactory } from '../../materials/PlasticMaterialFactory';
import { Minifigure, createMinifigure, villagerSkin, BEDOUIN_SKIN } from '../../characters/MinifigureFactory';
import { hintArrow } from './camp';
import { Dust } from '../../effects/Dust';
import { IS_MOBILE } from '../../core/Quality';

// La multitud usa los PRESETS del muñequero (villagerSkin): comunidad variada
// —hombres, mujeres con vestido y melena, ancianos— con caras expresivas y sin
// arma. El beduino usa el skin del muñequero directamente.

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
interface Wander { fig: Minifigure; tx: number; tz: number; speed: number; ph: number; pause: number; }
interface Load { mesh: THREE.Mesh; base: THREE.Vector3; vel: THREE.Vector3; }
interface Bicho { g: THREE.Group; vy: number; hopCd: number; target?: boolean; penned?: boolean; hint?: THREE.Mesh; }
type Oficio = 'moler' | 'amasar' | 'alfarero' | 'sentado';
interface Faena { fig: Minifigure; tipo: Oficio; ph: number; spin?: THREE.Object3D; }

/**
 * VIDA del campamento: aldeanos que deambulan (con animación de andar),
 * animales, y el gag recurrente del beduino cuya carga se derrumba en una
 * nube de polvo. Todo se actualiza con update(dt, t).
 */
export class CampLife {
  private group = new THREE.Group();
  private wanderers: Wander[] = [];
  private faenas: Faena[] = [];      // aldeanos con oficio (muelen, amasan, alfarero, sentados)
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
      const fig = createMinifigure(plastic, villagerSkin(i));
      const x = (Math.random() - 0.5) * 60, z = 16 + Math.random() * 66;
      fig.root.position.set(x, 0, z);
      const s = 0.85 + Math.random() * 0.25; fig.root.scale.setScalar(s);
      this.group.add(fig.root);
      this.wanderers.push({ fig, tx: x, tz: z, speed: 2 + Math.random() * 1.5, ph: Math.random() * 6.28, pause: 0 });
    }

    // --- Aldeanos con OFICIO: cada uno en su puesto, con su gesto en bucle.
    //     Esto es lo que hace que el campamento "viva" (no solo deambular). ---
    this.buildFaenas();

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
      const hint = hintArrow(0x7bed7b); hint.visible = false; s.add(hint);   // pista verde: "arrea ESTA oveja"
      this.group.add(s);
      this.sheep.push({ g: s, vy: 0, hopCd: 0, target: true, hint });
    }

    // --- 4 niños con canastas de pan que desfilan hacia el Tabernáculo (esc. 06) ---
    for (let i = 0; i < 4; i++) {
      const fig = createMinifigure(plastic, villagerSkin(i));
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
    const helper = createMinifigure(plastic, villagerSkin(1));
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

  /** Coloca una minifigura en su puesto mirando a un punto. */
  private colocar(skinI: number, x: number, z: number, mira: number, s = 0.9): Minifigure {
    const fig = createMinifigure(this.plastic, villagerSkin(skinI));
    fig.root.position.set(x, 0, z);
    fig.root.rotation.y = mira;
    fig.root.scale.setScalar(s);
    this.group.add(fig.root);
    return fig;
  }

  /** Una pequeña fogata de troncos con llamas de ladrillo (no emite luz: barata). */
  private buildFogata(x: number, z: number): void {
    const logMat = 0x5a3f26;
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI;
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.6, 6), this.plastic.get(logMat));
      log.rotation.z = Math.PI / 2; log.rotation.y = a; log.position.set(x, 0.2, z);
      log.castShadow = true; this.group.add(log);
    }
    for (const [fh, fc] of [[1.1, 0xe8621f], [0.7, 0xffb02e]] as Array<[number, number]>) {
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.4, fh, 6),
        new THREE.MeshStandardMaterial({ color: fc, emissive: fc, emissiveIntensity: 0.9, roughness: 0.6 }));
      flame.position.set(x, 0.4 + fh / 2, z); this.group.add(flame);
    }
  }

  /** Puestos de oficio del campamento: molino, amasar pan, alfarero y corros junto al fuego. */
  private buildFaenas(): void {
    // MOLINO de mano: dos piedras + manija; la de arriba gira mientras "muele".
    const millB = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.0, 0.35, 16), this.plastic.get(0x8a8078));
    millB.position.set(18, 1.35, 52); millB.castShadow = true; this.group.add(millB);
    this.group.add(rbox(1.6, 1.2, 1.6, 0x7a5230, this.plastic, 18, 0.6, 52));   // pedestal
    const millT = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.82, 0.28, 16), this.plastic.get(0x9a9188));
    millT.position.set(18, 1.66, 52); millT.castShadow = true; this.group.add(millT);
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.55, 6), this.plastic.get(0x6f4622));
    handle.position.set(18.6, 1.95, 52); this.group.add(handle);
    this.faenas.push({ fig: this.colocar(2, 18, 53.6, Math.PI), tipo: 'moler', ph: 0, spin: millT });

    // AMASAR pan: mesa baja con masa; la aldeana empuja rítmicamente hacia abajo.
    this.group.add(rbox(2.2, 1.1, 1.3, 0x8a5a2c, this.plastic, -7, 0.55, 58));  // mesa
    const dough = new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 8), this.plastic.get(0xe4c48a));
    dough.scale.y = 0.5; dough.position.set(-7, 1.2, 58); this.group.add(dough);
    this.faenas.push({ fig: this.colocar(5, -7, 59.4, Math.PI), tipo: 'amasar', ph: 0 });

    // ALFARERO: torno con una vasija que gira; el alfarero la moldea con las manos.
    this.group.add(rbox(1.0, 0.9, 1.0, 0x6f4622, this.plastic, 22, 0.45, 64));   // base torno
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.16, 14), this.plastic.get(0x8a8078));
    wheel.position.set(22, 0.98, 64); this.group.add(wheel);
    const pot = new THREE.Group();
    pot.add(new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.7, 12), this.plastic.get(0xb5651d)));
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.3, 0.2, 12), this.plastic.get(0xa85518));
    rim.position.y = 0.35; pot.add(rim);
    pot.position.set(22, 1.4, 64); this.group.add(pot);
    this.faenas.push({ fig: this.colocar(0, 22, 65.4, Math.PI, 0.85), tipo: 'alfarero', ph: 0, spin: pot });

    // CORROS junto al fuego: gente sentada charlando (calorcito de la fogata).
    // En móvil solo uno (menos figuras) para no cargar el rendimiento.
    const corros: Array<[number, number, number[]]> = [[6, 66, [3, 6, 1]], [-22, 62, [4, 7, 2]]];
    for (const [fx, fz, skins] of (IS_MOBILE ? corros.slice(0, 1) : corros)) {
      this.buildFogata(fx, fz);
      skins.forEach((sk, k) => {
        const a = (k / skins.length) * Math.PI * 2 + 0.4;
        const px = fx + Math.cos(a) * 2.4, pz = fz + Math.sin(a) * 2.4;
        const fig = this.colocar(sk, px, pz, Math.atan2(fx - px, fz - pz), 0.9);
        // sentado en el suelo: baja la cadera casi al ras y dobla las piernas al frente
        fig.root.position.y = -0.85;
        fig.legL.rotation.x = 1.55; fig.legR.rotation.x = 1.55;
        fig.legL.rotation.z = 0.22; fig.legR.rotation.z = -0.22;   // piernas ligeramente abiertas
        this.faenas.push({ fig, tipo: 'sentado', ph: k * 1.7 + a });
      });
    }
  }

  /** Arranca el mini-juego de arrear ovejas al redil (muestra las pistas verdes). */
  activarOvejas(): void { this.penActive = true; for (const s of this.sheep) if (s.target && s.hint) s.hint.visible = true; }
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
      // pista verde que bota sobre la oveja objetivo (guía al peque)
      if (s.hint && s.hint.visible) { s.hint.rotation.y += dt * 3; s.hint.position.y = 2.6 + Math.sin(t * 3 + s.g.position.x) * 0.25; }
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
        if (d2 < this.pen.r * this.pen.r) { s.penned = true; s.vy = 0; if (s.hint) s.hint.visible = false; onPenned?.(); }
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

    // aldeanos deambulando (con pausas: caminan un rato, se paran a "mirar", siguen)
    for (const w of this.wanderers) {
      const p = w.fig.root.position;
      const dx = w.tx - p.x, dz = w.tz - p.z;
      const dist = Math.hypot(dx, dz);
      let moving = dist > 0.6 && w.pause <= 0;
      if (w.pause > 0) {
        w.pause -= dt;                                   // parado un momento
      } else if (moving) {
        p.x += (dx / dist) * w.speed * dt;
        p.z += (dz / dist) * w.speed * dt;
        w.fig.root.rotation.y = Math.atan2(dx, dz);
      } else {
        // llegó: a veces se queda quieto un momento antes del próximo destino
        if (Math.random() < 0.5) { w.pause = 1.2 + Math.random() * 2.5; moving = false; }
        w.tx = (Math.random() - 0.5) * 64;
        w.tz = 16 + Math.random() * 66;
      }
      w.fig.update(dt, moving, 1);
    }

    // aldeanos con OFICIO: cada gesto en bucle da "vida" al campamento
    for (const f of this.faenas) {
      f.fig.update(dt, false, 1);   // base (respiración/idle); luego posamos los brazos
      const w = t * 3 + f.ph;
      switch (f.tipo) {
        case 'moler':   // giro de la piedra + brazos empujando la manija en círculo
          if (f.spin) f.spin.rotation.y += dt * 2.2;
          f.fig.armR.rotation.x = -1.1 + Math.sin(w) * 0.5;
          f.fig.armL.rotation.x = -1.1 + Math.sin(w + 0.6) * 0.5;
          f.fig.root.rotation.z = Math.sin(w) * 0.05;
          break;
        case 'amasar':  // empuja la masa hacia abajo, rítmico
          f.fig.armR.rotation.x = -1.5 + Math.abs(Math.sin(w * 0.9)) * 0.7;
          f.fig.armL.rotation.x = -1.5 + Math.abs(Math.sin(w * 0.9 + 0.3)) * 0.7;
          break;
        case 'alfarero': // la vasija gira; las manos la moldean con leve vaivén
          if (f.spin) f.spin.rotation.y += dt * 4.0;
          f.fig.armR.rotation.x = -1.35 + Math.sin(w * 1.4) * 0.12;
          f.fig.armL.rotation.x = -1.35 + Math.cos(w * 1.4) * 0.12;
          break;
        case 'sentado': // charla junto al fuego: gestos con las manos (sin deriva)
          f.fig.armR.rotation.x = -0.3 + Math.sin(w * 0.8) * 0.25;
          f.fig.armL.rotation.x = -0.3 + Math.sin(w * 0.8 + 1.1) * 0.18;
          f.fig.legL.rotation.x = 1.55; f.fig.legR.rotation.x = 1.55;   // mantener sentado
          break;
      }
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
