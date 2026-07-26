import * as THREE from 'three';
import { PlasticMaterialFactory } from '../../../materials/PlasticMaterialFactory';
import { BrickPalette } from '../../../materials/BrickPalette';
import { kilimTexture, KILIM_PALS, KilimPal } from '../../min00/textiles';

/**
 * ESCONDITES ESTRELLA del tramo 10–15 (esc. 22–25). Feedback del niño (playtest):
 * "que pueda meterse DE VERDAD detrás del tapiz, ahora es como si lo atravesara;
 * debe rodearlo y meterse". Por eso ambos escondites son AHORA volúmenes con
 * COLISIÓN y un HUECO (nicho) real detrás:
 *
 *  1) `RugHide` — un TAPIZ de kilim colgado de un marco EXENTO (no pegado a la
 *     pared): la tela tiene colisión (no se atraviesa) y se entra al hueco de
 *     detrás RODEÁNDOLA por el lado abierto. Escondido, la tela se abomba hacia la
 *     cámara (bulto que respira) con piececitos y una manita asomando por abajo.
 *  2) `PotHide` — una TINAJA grande y sólida: te agachas detrás; la planta se
 *     ahueca y asoman piececitos.
 *
 * Ambos: `registerCollision(addObstacle)` mete sus cajas sólidas; `contains(px,pz)`
 * es TRUE solo cuando el jugador está en el HUECO de detrás (no sobre la tela).
 * El cuerpo real se oculta con `setPlayerVisible(false)` mientras está escondido.
 * El tapiz es coherente: se monta IGUAL en todas las escenas de la posada.
 */

export interface RugHideOpts {
  /** Centro del tapiz (mundo). La cara mira a la cámara (+z); el hueco está detrás (−z). */
  x: number; z: number;
  pal?: KilimPal;
  /** Lado de ENTRADA al hueco: 'derecha' (por defecto) o 'izquierda'. El otro lado se tapa. */
  entrada?: 'izquierda' | 'derecha';
}

export class RugHide {
  readonly group = new THREE.Group();
  readonly x: number;
  readonly z: number;
  private geo: THREE.PlaneGeometry;
  private base: THREE.BufferAttribute;
  private legs: THREE.Group;
  private hand: THREE.Mesh;
  private reveal = 0;
  private entrada: 'izquierda' | 'derecha';

  private static readonly RW = 4.4;   // ancho de la tela
  private static readonly RH = 5.0;   // alto de la tela
  private static readonly TOP = 6.4;  // altura de la barra
  private static readonly NOOK = 1.7; // profundidad del hueco por detrás

  constructor(plastic: PlasticMaterialFactory, opts: RugHideOpts) {
    this.x = opts.x; this.z = opts.z;
    this.entrada = opts.entrada ?? 'derecha';
    const pal = opts.pal ?? KILIM_PALS[0];
    const RW = RugHide.RW, RH = RugHide.RH, TOP = RugHide.TOP;
    this.group.position.set(opts.x, 0, opts.z);

    // ---- marco de madera EXENTO (dos postes + barra) ----
    const wood = plastic.get(BrickPalette.DARK_BROWN);
    for (const sx of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, TOP + 0.6, 10), wood);
      post.position.set(sx * (RW / 2 + 0.3), (TOP + 0.6) / 2, 0); post.castShadow = true; this.group.add(post);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.3, 1.1), plastic.get(BrickPalette.DARK_GRAY));
      foot.position.set(sx * (RW / 2 + 0.3), 0.15, 0); this.group.add(foot);
    }
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, RW + 1.0, 10), wood);
    rod.rotation.z = Math.PI / 2; rod.position.set(0, TOP, 0); this.group.add(rod);

    // ---- la tela (plano segmentado, cara hacia +z = la cámara) ----
    this.geo = new THREE.PlaneGeometry(RW, RH, 16, 22);
    this.base = this.geo.attributes.position.clone() as THREE.BufferAttribute;
    const mat = new THREE.MeshStandardMaterial({ map: kilimTexture(pal), roughness: 0.96, side: THREE.DoubleSide });
    const rug = new THREE.Mesh(this.geo, mat);
    rug.position.set(0, TOP - RH / 2 - 0.2, 0.05); rug.castShadow = true; rug.receiveShadow = true;
    this.group.add(rug);
    // flecos abajo
    for (let i = 0; i < 11; i++) {
      const fr = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 5), mat);
      fr.position.set(-RW / 2 + 0.2 + i * (RW - 0.4) / 10, TOP - RH - 0.35, 0.05); this.group.add(fr);
    }

    // ---- piececitos + manita asomando por DEBAJO hacia la cámara (ocultos hasta esconderse) ----
    this.legs = new THREE.Group();
    for (const lx of [-0.55, 0.55]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.27, 1.7, 8), plastic.get(BrickPalette.DARK_BLUE));
      leg.position.set(lx, 0.9, 0.55); this.legs.add(leg);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.32, 0.85), plastic.get(BrickPalette.DARK_GRAY));
      foot.position.set(lx, 0.16, 0.95); this.legs.add(foot);
    }
    this.legs.visible = false; this.group.add(this.legs);
    this.hand = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.2, 0.16), plastic.get(BrickPalette.YELLOW));
    this.hand.position.set(RW / 2 - 0.3, TOP - RH / 2 - 0.6, 0.4); this.hand.rotation.z = -0.2;
    this.hand.visible = false; this.group.add(this.hand);
  }

  /** Registra las cajas sólidas: la TELA (no atravesable) + un lateral cerrado. */
  registerCollision(addObstacle: (x: number, z: number, hw: number, hd: number) => void): void {
    const RW = RugHide.RW;
    addObstacle(this.x, this.z + 0.1, RW / 2, 0.35);                 // la tela
    // tapa un lado del hueco para forzar entrar por el otro (rodear). Tope CORTO y
    // pegado al fondo: sólo insinúa el "rodea", sin encajonar al niño en el hueco.
    const side = this.entrada === 'derecha' ? -1 : 1;               // cierra el lado opuesto a la entrada
    addObstacle(this.x + side * (RW / 2 + 0.3), this.z - RugHide.NOOK * 0.75, 0.3, RugHide.NOOK * 0.55);
  }

  /** El punto del hueco (detrás de la tela) para el sistema de sigilo. */
  get hidingSpot(): { x: number; z: number; radio: number } {
    return { x: this.x, z: this.z - RugHide.NOOK, radio: 1.6 };
  }

  /** TRUE si el jugador está en el HUECO de detrás (no sobre la tela). Zona GENEROSA
   *  (feedback del niño: "esconderse en el tapiz es difícil"): basta con estar más o
   *  menos detrás para contar como escondido. */
  contains(px: number, pz: number): boolean {
    const dz = this.z - pz;                                          // >0 = detrás
    return dz > 0.2 && dz < RugHide.NOOK + 1.7 && Math.abs(px - this.x) < RugHide.RW / 2 + 0.9;
  }

  update(dt: number, t: number, hidden: boolean): void {
    const target = hidden ? 1 : 0;
    this.reveal += (target - this.reveal) * Math.min(1, dt * 8);
    if (this.reveal < 0.02) this.reveal = 0;
    const RH = RugHide.RH;
    const p = this.geo.attributes.position, b = this.base;
    for (let i = 0; i < p.count; i++) {
      const bx = b.getX(i), by = b.getY(i);
      const droop = (RH / 2 - by) / RH;
      let z = 0.07 * droop * droop * Math.sin(bx * 0.7 + t * 1.6);   // ondeo
      if (this.reveal > 0) {
        const body = Math.exp(-((bx) ** 2) / 2.1 - ((by + 0.7) ** 2) / 4.4) * 2.3;
        const head = Math.exp(-((bx) ** 2) / 0.8 - ((by - 1.6) ** 2) / 1.2) * 1.3;
        const bulge = (body + head) * this.reveal;
        z += bulge + Math.sin(t * 3) * 0.06 * bulge;                 // respiración
      }
      p.setZ(i, z);
    }
    p.needsUpdate = true; this.geo.computeVertexNormals();
    const show = this.reveal > 0.5;
    this.legs.visible = show; this.hand.visible = show;
    if (show) { this.legs.position.y = Math.sin(t * 3) * 0.04; this.hand.position.x = (RugHide.RW / 2 - 0.3) + Math.sin(t * 2) * 0.03; }
  }
}

export interface PotHideOpts { x: number; z: number; }

/** TINAJA grande y sólida: te escondes en el HUECO de detrás (rodeándola). */
export class PotHide {
  readonly group = new THREE.Group();
  readonly x: number;
  readonly z: number;
  private leaves: THREE.Group;
  private feet: THREE.Group;
  private reveal = 0;
  private static readonly R = 1.7;
  private static readonly NOOK = 1.5;

  constructor(plastic: PlasticMaterialFactory, opts: PotHideOpts) {
    this.x = opts.x; this.z = opts.z;
    this.group.position.set(opts.x, 0, opts.z);
    const R = PotHide.R;
    const belly = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.85, R * 0.6, 3.0, 16), plastic.get(0xb5673a));
    belly.position.y = 1.5; belly.castShadow = true; belly.receiveShadow = true; this.group.add(belly);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.5, 16), plastic.get(0x8a5a2c));
    rim.position.y = 3.0; rim.castShadow = true; this.group.add(rim);
    const soil = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.9, R * 0.9, 0.2, 14), plastic.get(BrickPalette.DARK_BROWN));
    soil.position.y = 3.15; this.group.add(soil);
    // planta frondosa
    this.leaves = new THREE.Group(); this.leaves.position.y = 3.2;
    const leafGeo = new THREE.BoxGeometry(0.5, 2.6, 0.12);
    const greens = [0x3f7a46, 0x4c9e5e, 0x2f6b3a];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const leaf = new THREE.Mesh(leafGeo, plastic.get(greens[i % greens.length]));
      leaf.position.set(Math.cos(a) * 0.5, 1.3, Math.sin(a) * 0.5);
      leaf.rotation.set(Math.cos(a) * 0.5, -a, Math.sin(a) * 0.5 + (i % 2 ? 0.2 : -0.2));
      leaf.castShadow = true; (leaf as any).__b = leaf.rotation.clone(); (leaf as any).__a = a;
      this.leaves.add(leaf);
    }
    this.group.add(this.leaves);
    // piececitos asomando por detrás (hacia −z)
    this.feet = new THREE.Group();
    for (const fx of [-0.42, 0.42]) {
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.32, 0.8), plastic.get(BrickPalette.DARK_BLUE));
      foot.position.set(fx, 0.18, -R - 0.3); this.feet.add(foot);
    }
    this.feet.visible = false; this.group.add(this.feet);
  }

  registerCollision(addObstacle: (x: number, z: number, hw: number, hd: number) => void): void {
    addObstacle(this.x, this.z, PotHide.R, PotHide.R);              // la tinaja (sólida)
  }

  get hidingSpot(): { x: number; z: number; radio: number } {
    return { x: this.x, z: this.z - PotHide.NOOK, radio: 1.5 };
  }

  contains(px: number, pz: number): boolean {
    const dz = this.z - pz;
    // Zona GENEROSA detrás/al lado de la tinaja (feedback: "no puede llegar a la maceta").
    return dz > PotHide.R - 0.9 && dz < PotHide.R + PotHide.NOOK + 0.7 && Math.abs(px - this.x) < PotHide.R + 0.9;
  }

  update(dt: number, t: number, hidden: boolean): void {
    const target = hidden ? 1 : 0;
    this.reveal += (target - this.reveal) * Math.min(1, dt * 8);
    if (this.reveal < 0.02) this.reveal = 0;
    const breathe = Math.sin(t * 3) * 0.06;
    this.leaves.children.forEach((c) => {
      const leaf = c as THREE.Mesh; const base = (leaf as any).__b as THREE.Euler; const a = (leaf as any).__a as number;
      const open = this.reveal * (0.45 + breathe);
      leaf.rotation.x = base.x + Math.cos(a) * open; leaf.rotation.z = base.z + Math.sin(a) * open;
    });
    this.leaves.scale.setScalar(1 + this.reveal * 0.12);
    const show = this.reveal > 0.5;
    this.feet.visible = show;
    if (show) this.feet.position.y = Math.sin(t * 3) * 0.03;
  }
}

/**
 * HUELLAS descalzas que brillan en la arena (esc. 17). Decorado (no colisiona).
 */
export function buildFootprints(
  plastic: PlasticMaterialFactory,
  o: { ax: number; az: number; bx: number; bz: number; count?: number }
): { group: THREE.Group; update: (t: number) => void } {
  const group = new THREE.Group();
  const count = o.count ?? 8;
  const dx = o.bx - o.ax, dz = o.bz - o.az;
  const len = Math.hypot(dx, dz) || 1;
  const nx = dx / len, nz = dz / len;
  const px = -nz, pz = nx;
  const mat = new THREE.MeshStandardMaterial({ color: 0xdcc08a, emissive: 0xffe6a0, emissiveIntensity: 0.35, roughness: 1 });
  for (let i = 0; i < count; i++) {
    const u = i / (count - 1);
    const side = (i % 2 ? 1 : -1) * 0.5;
    const cx = o.ax + dx * u + px * side;
    const cz = o.az + dz * u + pz * side;
    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 1.0), mat);
    sole.position.set(cx, 0.05, cz); sole.rotation.y = Math.atan2(nx, nz); group.add(sole);
    const heel = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 0.4), mat);
    heel.position.set(cx - nx * 0.55, 0.05, cz - nz * 0.55); heel.rotation.y = sole.rotation.y; group.add(heel);
  }
  return { group, update: (t: number): void => { mat.emissiveIntensity = 0.28 + Math.sin(t * 2.2) * 0.14; } };
}
