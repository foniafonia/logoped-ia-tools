import * as THREE from 'three';
import { PlasticMaterialFactory } from '../../../materials/PlasticMaterialFactory';
import { BrickPalette } from '../../../materials/BrickPalette';

/**
 * ESCONDITES ESTRELLA del tramo 10–15 (la esc. 23 "escóndete"). Reúno aquí las
 * dos mecánicas de escondite de la posada de Rahab:
 *
 *  1) `RugHide` — esconderse TRAS EL TAPIZ del letrero "Restaurante de Rahab":
 *     la tela colgada se abomba hacia la cámara (bulto que respira + piececitos +
 *     manita). Es el helper del muñequero ya adaptado a la 3ª persona del juego en
 *     el tramo 5–10 (`min05/props/RugHide`); lo re-exporto para que las escenas de
 *     min10 lo importen desde su propia carpeta y lo aten al `StealthSystem`.
 *
 *  2) `PotHide` — meterse EN LA MACETA GRANDE: la planta se ahueca y tiembla, con
 *     dos piececitos asomando por delante y una manita agarrada al borde. Es el
 *     segundo escondite gracioso de la escena. Código propio de min10.
 *
 * Ambos son un `HidingSpot` más para el `StealthSystem` (los conos pasan por
 * encima); el cuerpo real del jugador se oculta con `ctx.setPlayerVisible(false)`
 * mientras está dentro. Portables (THREE puro + plastic + paleta compartida).
 */

export { RugHide } from '../../min05/props/RugHide';
export type { RugHideOpts } from '../../min05/props/RugHide';

export interface PotHideOpts {
  /** Centro de la maceta (mundo). */
  x: number; z: number;
  /** Radio del escondite (dónde se considera "escondido"). */
  radio?: number;
}

/**
 * MACETA GRANDE en la que esconderse. Una tinaja de barro con una planta frondosa
 * que, al meterse el espía, se AHUECA hacia la cámara (bulto de hojas que respira),
 * asoma dos piececitos por delante y una manita agarra el borde. Gracioso y claro.
 */
export class PotHide {
  readonly group = new THREE.Group();
  readonly x: number;
  readonly z: number;
  readonly radio: number;

  private leaves: THREE.Group;
  private feet: THREE.Group;
  private hand: THREE.Mesh;
  private reveal = 0;
  private static readonly POT_R = 1.7;

  constructor(plastic: PlasticMaterialFactory, opts: PotHideOpts) {
    this.x = opts.x; this.z = opts.z; this.radio = opts.radio ?? 2.0;
    this.group.position.set(opts.x, 0, opts.z);

    const R = PotHide.POT_R;
    // tinaja de barro (dos cuerpos: panza + borde)
    const belly = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.82, R * 0.62, 2.6, 16), plastic.get(0xb5673a));
    belly.position.y = 1.3; belly.castShadow = true; belly.receiveShadow = true; this.group.add(belly);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.5, 16), plastic.get(0x8a5a2c));
    rim.position.y = 2.55; rim.castShadow = true; this.group.add(rim);
    // tierra
    const soil = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.9, R * 0.9, 0.2, 14), plastic.get(BrickPalette.DARK_BROWN));
    soil.position.y = 2.7; this.group.add(soil);

    // planta: abanico de hojas (se ahueca al esconderse)
    this.leaves = new THREE.Group(); this.leaves.position.y = 2.8;
    const leafGeo = new THREE.BoxGeometry(0.5, 2.4, 0.12);
    const greens = [0x3f7a46, 0x4c9e5e, 0x2f6b3a];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const leaf = new THREE.Mesh(leafGeo, plastic.get(greens[i % greens.length]));
      leaf.position.set(Math.cos(a) * 0.5, 1.2, Math.sin(a) * 0.5);
      leaf.rotation.set(Math.cos(a) * 0.5, -a, Math.sin(a) * 0.5 + (i % 2 ? 0.2 : -0.2));
      leaf.castShadow = true;
      (leaf as any).__baseRot = leaf.rotation.clone();
      (leaf as any).__a = a;
      this.leaves.add(leaf);
    }
    this.group.add(this.leaves);

    // piececitos asomando por delante (hacia -z, la cámara), ocultos hasta esconderse
    this.feet = new THREE.Group();
    for (const fx of [-0.42, 0.42]) {
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.32, 0.8), plastic.get(BrickPalette.DARK_BLUE));
      foot.position.set(fx, 0.18, -R - 0.1); this.feet.add(foot);
      const toe = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.24, 0.3), plastic.get(BrickPalette.DARK_GRAY));
      toe.position.set(fx, 0.14, -R - 0.55); this.feet.add(toe);
    }
    this.feet.visible = false; this.group.add(this.feet);

    // manita agarrada al borde (detalle simpático)
    this.hand = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.2, 0.34), plastic.get(BrickPalette.YELLOW));
    this.hand.position.set(R - 0.2, 2.7, -0.4); this.hand.visible = false; this.group.add(this.hand);
  }

  get hidingSpot(): { x: number; z: number; radio: number } {
    return { x: this.x, z: this.z, radio: this.radio };
  }

  contains(px: number, pz: number): boolean {
    return Math.hypot(px - this.x, pz - this.z) < this.radio;
  }

  /** Anima la planta. `hidden` = el jugador está dentro de la maceta ahora mismo. */
  update(dt: number, t: number, hidden: boolean): void {
    const target = hidden ? 1 : 0;
    this.reveal += (target - this.reveal) * Math.min(1, dt * 8);
    if (this.reveal < 0.02) this.reveal = 0;

    // ahueca las hojas hacia fuera + respiración
    const breathe = Math.sin(t * 3) * 0.06;
    this.leaves.children.forEach((c) => {
      const leaf = c as THREE.Mesh;
      const base = (leaf as any).__baseRot as THREE.Euler;
      const a = (leaf as any).__a as number;
      const open = this.reveal * (0.5 + breathe);
      leaf.rotation.x = base.x + Math.cos(a) * open;
      leaf.rotation.z = base.z + Math.sin(a) * open;
      // temblor sutil cuando alguien está dentro
      leaf.position.y = 1.2 + (this.reveal > 0.1 ? Math.sin(t * 9 + a * 3) * 0.05 : 0);
    });
    this.leaves.scale.setScalar(1 + this.reveal * 0.15);

    const show = this.reveal > 0.5;
    this.feet.visible = show; this.hand.visible = show;
    if (show) {
      this.feet.position.y = Math.sin(t * 3) * 0.03;
      this.hand.position.y = 2.7 + Math.sin(t * 2.4) * 0.03;
    }
  }
}

/**
 * HUELLAS descalzas que brillan en la arena (esc. 17): los guardias las descubren.
 * Rastro de pisadas alternas con un leve emisivo para que se lean de noche. Es
 * decorado (no colisiona). `update(t)` les da un pulso suave.
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
  const px = -nz, pz = nx; // perpendicular (para alternar izq/der)
  const mat = new THREE.MeshStandardMaterial({ color: 0xdcc08a, emissive: 0xffe6a0, emissiveIntensity: 0.35, roughness: 1 });
  const prints: THREE.Mesh[] = [];
  for (let i = 0; i < count; i++) {
    const u = i / (count - 1);
    const side = (i % 2 ? 1 : -1) * 0.5;
    const cx = o.ax + dx * u + px * side;
    const cz = o.az + dz * u + pz * side;
    // planta + talón (dos cajitas planas)
    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 1.0), mat);
    sole.position.set(cx, 0.05, cz); sole.rotation.y = Math.atan2(nx, nz);
    group.add(sole); prints.push(sole);
    const heel = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 0.4), mat);
    heel.position.set(cx - nx * 0.55, 0.05, cz - nz * 0.55); heel.rotation.y = sole.rotation.y;
    group.add(heel); prints.push(heel);
  }
  return {
    group,
    update: (t: number): void => {
      const pulse = 0.28 + Math.sin(t * 2.2) * 0.14;
      mat.emissiveIntensity = pulse;
    }
  };
}
