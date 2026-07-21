import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { PlasticMaterialFactory } from '../materials/PlasticMaterialFactory';

/**
 * Minifigura procedural con silueta clásica (cabeza cilíndrica, torso
 * trapezoidal, brazos/piernas rígidos, manos de pinza). Complementos y
 * colores configurables por "skin" para parecerse a un personaje concreto.
 * Geometría 100% propia (sin marcas).
 */
export interface MinifigureSkin {
  head: number;      // color piel/cabeza
  torso: number;     // color túnica
  belt: number;      // cinturón / ropa interior
  legs: number;      // piernas
  arms: number;      // mangas
  hands: number;     // manos
  headwear?: number; // turbante (color) — opcional
  beard?: number;    // barba (color) — opcional
}

/** Yoshúa: turbante azul, barba gris, túnica azul con cinturón marrón. */
export const YOSHUA_SKIN: MinifigureSkin = {
  head: 0xf2c141,
  torso: 0x2f6db0,
  belt: 0x6e4a2c,
  legs: 0x2f6db0,
  arms: 0x7a5230,
  hands: 0xf2c141,
  headwear: 0x2a5fa0,
  beard: 0xd8d2c6
};

export class Minifigure {
  readonly root = new THREE.Group();
  readonly legL = new THREE.Group();
  readonly legR = new THREE.Group();
  readonly armL = new THREE.Group();
  readonly armR = new THREE.Group();
  private walkPhase = 0;

  constructor(private plastic: PlasticMaterialFactory, skin: MinifigureSkin = YOSHUA_SKIN) {
    this.build(skin);
  }

  private box(w: number, h: number, d: number, color: number, x: number, y: number, z: number): THREE.Mesh {
    const g = new RoundedBoxGeometry(w, h, d, 3, 0.05);
    const m = new THREE.Mesh(g, this.plastic.get(color));
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }
  private cyl(r: number, h: number, color: number, x: number, y: number, z: number, seg = 20): THREE.Mesh {
    const g = new THREE.CylinderGeometry(r, r, h, seg);
    const m = new THREE.Mesh(g, this.plastic.get(color));
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }

  private build(s: MinifigureSkin): void {
    // Proporciones de minifigura clásica: rechoncha, cabeza grande,
    // piernas cortas, torso trapezoidal. Altura total ~4.1.

    // --- Piernas cortas (pivote en la cadera, y ~1.25) ---
    this.legL.position.set(-0.32, 1.25, 0);
    this.legR.position.set(0.32, 1.25, 0);
    this.legL.add(this.box(0.6, 1.2, 0.8, s.legs, 0, -0.6, 0));
    this.legR.add(this.box(0.6, 1.2, 0.8, s.legs, 0, -0.6, 0));
    this.legL.add(this.box(0.62, 0.16, 0.9, 0x3a2e24, 0, -1.18, 0.05)); // pie
    this.legR.add(this.box(0.62, 0.16, 0.9, 0x3a2e24, 0, -1.18, 0.05));
    this.root.add(this.legL, this.legR);

    // --- Cadera + torso trapezoidal ---
    this.root.add(this.box(1.32, 0.5, 0.85, s.legs, 0, 1.5, 0)); // cadera
    // torso: base estrecha + hombros anchos (dos cajas)
    this.root.add(this.box(1.2, 1.4, 0.8, s.torso, 0, 2.5, 0));
    this.root.add(this.box(1.5, 0.7, 0.86, s.torso, 0, 3.0, 0)); // hombros anchos
    this.root.add(this.box(1.36, 0.28, 0.9, s.belt, 0, 1.9, 0));  // cinturón
    this.root.add(this.box(0.55, 0.55, 0.2, s.belt, 0, 3.05, 0.38)); // cuello en V

    // --- Brazos cortos (pivote en el hombro, y ~3.15) ---
    this.armL.position.set(-0.82, 3.15, 0.05);
    this.armR.position.set(0.82, 3.15, 0.05);
    this.armL.rotation.z = 0.18;
    this.armR.rotation.z = -0.18;
    this.armL.add(this.box(0.42, 1.05, 0.52, s.arms, 0, -0.5, 0.08));
    this.armR.add(this.box(0.42, 1.05, 0.52, s.arms, 0, -0.5, 0.08));
    const handGeo = new THREE.TorusGeometry(0.19, 0.1, 10, 18);
    handGeo.rotateX(Math.PI / 2);
    const handL = new THREE.Mesh(handGeo, this.plastic.get(s.hands));
    handL.position.set(0, -1.05, 0.16); handL.castShadow = true;
    this.armL.add(handL); this.armR.add(handL.clone());
    this.root.add(this.armL, this.armR);

    // --- Cuello corto + cabeza GRANDE ---
    this.root.add(this.cyl(0.26, 0.16, s.head, 0, 3.35, 0));
    this.root.add(this.cyl(0.55, 0.92, s.head, 0, 3.9, 0, 30)); // cabeza

    // ojos + cejas (encima de la barba)
    this.root.add(this.box(0.11, 0.13, 0.05, 0x2a1c12, -0.19, 3.98, 0.54));
    this.root.add(this.box(0.11, 0.13, 0.05, 0x2a1c12, 0.19, 3.98, 0.54));
    this.root.add(this.box(0.18, 0.05, 0.05, 0x3a2a1a, -0.19, 4.13, 0.54));
    this.root.add(this.box(0.18, 0.05, 0.05, 0x3a2a1a, 0.19, 4.13, 0.54));

    // --- Barba gris prominente (cono invertido) ---
    if (s.beard) {
      const bg = new THREE.ConeGeometry(0.6, 1.35, 22, 1, true);
      bg.rotateX(Math.PI);
      bg.scale(1, 1, 0.72);
      const beard = new THREE.Mesh(bg, this.plastic.get(s.beard));
      beard.position.set(0, 3.55, 0.34); beard.castShadow = true;
      this.root.add(beard);
      this.root.add(this.box(0.85, 0.4, 0.32, s.beard, 0, 3.78, 0.4)); // mejillas/bigote
    }

    // --- Turbante grande (media esfera + banda + nudo) ---
    if (s.headwear !== undefined) {
      const dome = new THREE.SphereGeometry(0.64, 26, 18, 0, Math.PI * 2, 0, Math.PI / 2);
      const domeMesh = new THREE.Mesh(dome, this.plastic.get(s.headwear));
      domeMesh.position.set(0, 4.32, 0); domeMesh.scale.set(1.05, 0.92, 1.05); domeMesh.castShadow = true;
      this.root.add(domeMesh);
      const band = new THREE.TorusGeometry(0.57, 0.16, 12, 30);
      band.rotateX(Math.PI / 2);
      const bandMesh = new THREE.Mesh(band, this.plastic.get(s.headwear));
      bandMesh.position.set(0, 4.34, 0); bandMesh.castShadow = true;
      this.root.add(bandMesh);
      this.root.add(this.cyl(0.13, 0.22, s.headwear, 0.46, 4.44, 0.3)); // nudo
    }
  }

  /** Anima el balanceo de brazos y piernas (con toque stop-motion). */
  update(dt: number, moving: boolean, speed = 1): void {
    const target = moving ? 1 : 0;
    this.walkPhase += dt * speed * 8 * target;
    // cuantización visual a ~15 fps (stop-motion)
    const q = Math.round(this.walkPhase / (Math.PI / 6)) * (Math.PI / 6);
    const swing = moving ? Math.sin(q) * 0.7 : 0;
    this.legL.rotation.x = swing;
    this.legR.rotation.x = -swing;
    this.armL.rotation.x = -swing * 0.8;
    this.armR.rotation.x = swing * 0.8;
  }
}

export function createMinifigure(plastic: PlasticMaterialFactory, skin?: MinifigureSkin): Minifigure {
  return new Minifigure(plastic, skin);
}
