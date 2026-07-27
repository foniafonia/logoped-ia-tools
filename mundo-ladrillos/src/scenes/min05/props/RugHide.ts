import * as THREE from 'three';
import { PlasticMaterialFactory } from '../../../materials/PlasticMaterialFactory';
import { BrickPalette } from '../../../materials/BrickPalette';
import { kilimTexture, KILIM_PALS, KilimPal } from '../../min00/textiles';

/**
 * ESCONDITE ESTRELLA — esconderse tras la ALFOMBRA colgada (spec del muñequero,
 * `rug-hide.ts`), el "toque memorable" del tramo. Adaptado a la cámara 3ª persona
 * del juego (mira hacia +z): la alfombra cuelga de una barra ENCARADA a la cámara
 * y, cuando el espía se agacha detrás, la tela se abomba HACIA la cámara con un
 * BULTO que respira, unas piernas asomando y una manita agarrando el borde.
 *
 * Es un `HidingSpot` más para el `StealthSystem` (los conos pasan por encima).
 * El cuerpo real del jugador se oculta con `ctx.setPlayerVisible(false)` mientras
 * está escondido; al salir, vuelve. Portable (Three.js puro + kilim compartido).
 */
export interface RugHideOpts {
  /** Posición del centro de la barra (mundo). La alfombra cuelga hacia abajo. */
  x: number; z: number;
  /** Paleta de kilim (por defecto rojo/verde). */
  pal?: KilimPal;
  /** Radio del escondite (dónde se considera "escondido"). */
  radio?: number;
}

export class RugHide {
  readonly group = new THREE.Group();
  readonly x: number;
  readonly z: number;
  readonly radio: number;

  private geo: THREE.PlaneGeometry;
  private base: THREE.BufferAttribute;
  private legs: THREE.Group;
  private hand: THREE.Mesh;
  private reveal = 0; // 0 = alfombra lisa .. 1 = bulto asomando

  private static readonly RW = 4.6;
  private static readonly RH = 6.6;
  private static readonly TOP_Y = 8.4; // altura de la barra

  constructor(plastic: PlasticMaterialFactory, opts: RugHideOpts) {
    this.x = opts.x; this.z = opts.z; this.radio = opts.radio ?? 2.2;
    const pal = opts.pal ?? KILIM_PALS[0];

    // El grupo mira a la cámara (que enfoca hacia +z): girando π, la CARA de la
    // alfombra (+z local) queda hacia −z (hacia la cámara) y el bulto (+z local)
    // empuja hacia la cámara. El jugador se esconde por el lado +z (detrás).
    this.group.position.set(opts.x, 0, opts.z);
    this.group.rotation.y = Math.PI;

    const RW = RugHide.RW, RH = RugHide.RH, TOP = RugHide.TOP_Y;

    // barra de la que cuelga
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, RW + 0.9, 10), plastic.get(BrickPalette.DARK_BROWN));
    rod.rotation.z = Math.PI / 2; rod.position.set(0, TOP, 0); rod.castShadow = true;
    this.group.add(rod);
    for (const sx of [-1, 1]) { // soportes
      const sup = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 0.3), plastic.get(BrickPalette.DARK_GRAY));
      sup.position.set(sx * (RW / 2 + 0.35), TOP, 0.15); this.group.add(sup);
    }

    // la alfombra (plano segmentado, se deforma por vértices)
    this.geo = new THREE.PlaneGeometry(RW, RH, 16, 22);
    this.base = this.geo.attributes.position.clone() as THREE.BufferAttribute;
    const mat = new THREE.MeshStandardMaterial({ map: kilimTexture(pal), roughness: 0.96, side: THREE.DoubleSide });
    const rug = new THREE.Mesh(this.geo, mat);
    rug.position.set(0, TOP - RH / 2 - 0.15, 0); rug.castShadow = true; rug.receiveShadow = true;
    this.group.add(rug);

    // piernas asomando por debajo (hacia la cámara), ocultas hasta esconderse
    this.legs = new THREE.Group();
    for (const lx of [-0.55, 0.55]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.27, 1.9, 8), plastic.get(BrickPalette.DARK_BLUE));
      leg.position.set(lx, 0.95, 0.7); this.legs.add(leg);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.34, 0.85), plastic.get(BrickPalette.DARK_GRAY));
      foot.position.set(lx, 0.17, 1.05); this.legs.add(foot);
    }
    this.legs.visible = false; this.group.add(this.legs);

    // manita agarrando el borde lateral de la alfombra (detalle simpático)
    this.hand = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.2, 0.16), plastic.get(BrickPalette.YELLOW));
    this.hand.position.set(RW / 2 - 0.3, TOP - RH / 2 - 0.6, 0.5); this.hand.rotation.z = -0.2;
    this.hand.visible = false; this.group.add(this.hand);
  }

  /** El escondite para registrar en el StealthSystem. */
  get hidingSpot(): { x: number; z: number; radio: number } {
    return { x: this.x, z: this.z, radio: this.radio };
  }

  /** ¿El jugador (px,pz) está dentro del escondite? */
  contains(px: number, pz: number): boolean {
    return Math.hypot(px - this.x, pz - this.z) < this.radio;
  }

  /** Anima la tela. `hidden` = el jugador está escondido detrás ahora mismo. */
  update(dt: number, t: number, hidden: boolean): void {
    // transición suave entre lisa y con bulto
    const target = hidden ? 1 : 0;
    this.reveal += (target - this.reveal) * Math.min(1, dt * 8);
    if (this.reveal < 0.02) this.reveal = 0;

    const RW = RugHide.RW, RH = RugHide.RH;
    const p = this.geo.attributes.position; const b = this.base;
    for (let i = 0; i < p.count; i++) {
      const bx = b.getX(i), by = b.getY(i);
      const droop = (RH / 2 - by) / RH;                 // 0 arriba (fija) .. 1 abajo
      // ondeo suave de la tela colgando
      let z = 0.07 * droop * droop * Math.sin(bx * 0.7 + t * 1.6);
      if (this.reveal > 0) {
        // BULTO del cuerpo + cabeza (empuja la tela hacia la cámara) que respira
        const body = Math.exp(-((bx) ** 2) / 2.1 - ((by + 0.7) ** 2) / 4.4) * 2.3;
        const head = Math.exp(-((bx) ** 2) / 0.8 - ((by - 1.8) ** 2) / 1.2) * 1.35;
        const bulge = (body + head) * this.reveal;
        z += bulge + Math.sin(t * 3) * 0.06 * bulge;     // respiración
      }
      p.setZ(i, z);
    }
    p.needsUpdate = true; this.geo.computeVertexNormals();

    // piernas + manita solo cuando el bulto ya asoma
    const show = this.reveal > 0.5;
    this.legs.visible = show; this.hand.visible = show;
    if (show) {
      this.legs.position.y = Math.sin(t * 3) * 0.04;     // leve balanceo
      this.hand.position.x = (RW / 2 - 0.3) + Math.sin(t * 2) * 0.03;
    }
  }
}
