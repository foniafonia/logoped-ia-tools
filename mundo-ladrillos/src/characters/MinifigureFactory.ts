import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { PlasticMaterialFactory } from '../materials/PlasticMaterialFactory';

/**
 * Minifigura procedural con silueta clásica de juguete de ladrillo (cabeza
 * cilíndrica, torso trapezoidal, brazos/piernas rígidos, manos de pinza).
 * Todo el aspecto —cara, tocado, barba, accesorios— se configura por "skin"
 * para clavar un personaje concreto de la película, manteniéndolo SIMPÁTICO
 * y animable. Geometría 100% propia de bloques (sin marcas).
 */

/** Expresión de las cejas para dar carácter (amable, serio, preocupado…). */
export type Emotion = 'happy' | 'neutral' | 'worried' | 'stern';

export interface MinifigureSkin {
  head: number;      // color piel/cabeza
  torso: number;     // color túnica / traje
  belt: number;      // cinturón / ropa interior
  legs: number;      // piernas
  arms: number;      // mangas
  hands: number;     // manos

  headwear?: number; // color del tocado / máscara / pelo — opcional
  headStyle?:
    | 'turban'       // turbante con banda y cola (Yehoshúa, beduino)
    | 'hood'         // capucha cerrada
    | 'ninja'        // máscara con franja de ojos (espías)
    | 'coneHelmet'   // casco cónico metálico (guardia)
    | 'plumeHelmet'  // casco con plumas (jefe de guardia)
    | 'mitre'        // mitra alta (sacerdote)
    | 'kippah'       // kipá + pelo corto (rabino)
    | 'longHair';    // melena larga (Rahab)

  beard?: number;             // barba (color) — opcional
  beardStyle?: 'short' | 'long'; // corta (rabino) o larga (Yehoshúa/sacerdote)
  mustache?: number;          // bigote suelto (jefe de guardia)

  emotion?: Emotion;          // expresión de las cejas (por defecto 'happy')
  glasses?: number;           // montura de gafas cuadradas (rabino)

  straps?: number;            // correas tácticas del chaleco (espía ninja)
  cape?: number;              // capa que cuelga de los hombros (Yehoshúa…)
  tunicStripe?: number;       // color de las rayas verticales de la túnica (guardia)
  turbanStripe?: number;      // franjas del turbante (blanco en Yehoshúa)
  pectoral?: number;          // pectoral dorado del sacerdote
  patches?: number;           // remiendos de la túnica (beduino)

  shield?: number;            // escudo redondo con león (color del borde)
  accessory?: 'sword' | 'staff' | 'spear' | 'shofar' | 'none'; // objeto en la mano
}

/** Yehoshúa: turbante cobalto con franjas blancas, barba blanca larga,
 *  túnica marrón claro, capa azul y bastón de madera. */
export const YOSHUA_SKIN: MinifigureSkin = {
  head: 0xf2c141,
  torso: 0xbe9c6a,       // túnica marrón claro
  belt: 0x6e4a2c,
  legs: 0x8a6a3e,
  arms: 0xbe9c6a,
  hands: 0xf2c141,
  headwear: 0x1c4f9c,    // turbante azul cobalto
  headStyle: 'turban',
  turbanStripe: 0xf4efe4,
  beard: 0xe8e4da,
  beardStyle: 'long',
  cape: 0x22467e,        // capa azul
  emotion: 'happy',
  accessory: 'staff'
};

/** Espía 1 (ninja simpático): traje azul pizarra, máscara azulada, cara amable. */
export const SPY_SKIN: MinifigureSkin = {
  head: 0xf2c141,
  torso: 0x2c3550,
  belt: 0x3a4a6b,
  legs: 0x2c3550,
  arms: 0x2c3550,
  hands: 0xf2c141,
  headwear: 0x3a4362,   // máscara azul oscuro (no negro)
  headStyle: 'ninja',
  straps: 0x5b7bb0,     // correas azul claro (detalle alegre)
  emotion: 'happy',
  accessory: 'sword'
};

/** Espía 2 (ninja gris azulado): compañero. */
export const SPY2_SKIN: MinifigureSkin = {
  head: 0xf2c141,
  torso: 0x6b7684,
  belt: 0x4a525e,
  legs: 0x5a6472,
  arms: 0x6b7684,
  hands: 0xf2c141,
  headwear: 0x545e6c,   // máscara gris azulada
  headStyle: 'ninja',
  straps: 0x9aa7b5,
  emotion: 'happy',
  accessory: 'sword'
};

/** Rahab: melena plateada larga, vestido gris claro humilde, cara amable. */
export const RAHAB_SKIN: MinifigureSkin = {
  head: 0xf4c98f,
  torso: 0xcdcdd2,       // vestido gris claro
  belt: 0xb0aeb0,
  legs: 0xc2c2c8,
  arms: 0xcdcdd2,
  hands: 0xf4c98f,
  headwear: 0xd6d8db,    // pelo plateado
  headStyle: 'longHair',
  emotion: 'happy',
  accessory: 'none'
};

/** Guardia de Jericó: casco cónico plateado, túnica de rayas rojas/amarillas,
 *  escudo redondo con león y lanza. */
export const GUARD_SKIN: MinifigureSkin = {
  head: 0xe0a878,
  torso: 0xb62b2b,       // rojo
  belt: 0x8a6a3a,
  legs: 0x8a6a3a,
  arms: 0xb62b2b,
  hands: 0xe0a878,
  headwear: 0xbfc2c4,    // casco plateado
  headStyle: 'coneHelmet',
  tunicStripe: 0xf0b429, // rayas amarillas
  emotion: 'stern',
  shield: 0xcaa14a,
  accessory: 'spear'
};

/** Jefe de guardia: casco con plumas negras, bigote marrón, rayas rojas/amarillas. */
export const GUARD_CHIEF_SKIN: MinifigureSkin = {
  head: 0xd89a68,
  torso: 0xb62b2b,
  belt: 0x5a3f22,
  legs: 0x6b675e,
  arms: 0xb62b2b,
  hands: 0xd89a68,
  headwear: 0xa8adb0,    // casco metálico
  headStyle: 'plumeHelmet',
  tunicStripe: 0xf0b429,
  mustache: 0x5a3f22,    // bigote marrón
  emotion: 'stern',
  accessory: 'spear'
};

/** Sacerdote (Cohen): túnica blanca con pectoral, mitra blanca, barba negra, shofar. */
export const PRIEST_SKIN: MinifigureSkin = {
  head: 0xefc08a,
  torso: 0xf4efe4,       // túnica blanca
  belt: 0xcaa14a,
  legs: 0xece7dc,
  arms: 0xf4efe4,
  hands: 0xefc08a,
  headwear: 0xf7f3ea,    // mitra blanca
  headStyle: 'mitre',
  beard: 0x2a221c,       // barba negra
  beardStyle: 'long',
  pectoral: 0xcaa14a,
  emotion: 'neutral',
  accessory: 'shofar'
};

/** Beduino cómico: turbante beige, túnica verde oliva con remiendos, barba negra,
 *  cejas de preocupación. */
export const BEDOUIN_SKIN: MinifigureSkin = {
  head: 0xd7a06a,
  torso: 0x6b7233,       // verde oliva
  belt: 0x4a4a24,
  legs: 0x5a5a2c,
  arms: 0x6b7233,
  hands: 0xd7a06a,
  headwear: 0xd9c6a0,    // turbante beige
  headStyle: 'turban',
  beard: 0x2a221c,       // barba negra
  beardStyle: 'short',
  patches: 0x8a7a3a,     // remiendos
  emotion: 'worried',
  accessory: 'none'
};

/** Rabino director: traje azul marino, gafas negras cuadradas, barba gris corta, kipá. */
export const RABBI_SKIN: MinifigureSkin = {
  head: 0xe8b988,
  torso: 0x1c2a4a,       // azul marino
  belt: 0x141e33,
  legs: 0x1c2a4a,
  arms: 0x1c2a4a,
  hands: 0xe8b988,
  headwear: 0x141a2c,    // kipá oscura
  headStyle: 'kippah',
  beard: 0x9a958c,       // barba gris corta
  beardStyle: 'short',
  glasses: 0x14140f,     // gafas negras
  emotion: 'happy',
  accessory: 'none'
};

/** Todas las skins de referencia, para previews y selección. */
export const CHARACTER_SKINS: Record<string, MinifigureSkin> = {
  espia: SPY_SKIN,
  espia2: SPY2_SKIN,
  yehoshua: YOSHUA_SKIN,
  rahab: RAHAB_SKIN,
  guardia: GUARD_SKIN,
  jefeGuardia: GUARD_CHIEF_SKIN,
  sacerdote: PRIEST_SKIN,
  beduino: BEDOUIN_SKIN,
  rabino: RABBI_SKIN
};

export class Minifigure {
  readonly root = new THREE.Group();
  readonly legL = new THREE.Group();
  readonly legR = new THREE.Group();
  readonly armL = new THREE.Group();
  readonly armR = new THREE.Group();
  private walkPhase = 0;
  private attackT = 0;
  private readonly ATTACK_DUR = 0.42;

  constructor(private plastic: PlasticMaterialFactory, skin: MinifigureSkin = YOSHUA_SKIN) {
    this.build(skin);
    this.addAccessory(skin);
  }

  /** Lanza un espadazo. Devuelve true si conecta (no en plena animación). */
  attack(): boolean {
    if (this.attackT > 0.12) return false;
    this.attackT = this.ATTACK_DUR;
    return true;
  }
  get attacking(): boolean { return this.attackT > 0; }

  // ---------- helpers de geometría ----------

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
  private mesh(geo: THREE.BufferGeometry, color: number, x: number, y: number, z: number): THREE.Mesh {
    const m = new THREE.Mesh(geo, this.plastic.get(color));
    m.position.set(x, y, z);
    m.castShadow = true;
    return m;
  }

  // ---------- cara ----------

  /** Ojos redondeados con brillo alegre. */
  private addEyes(y: number, z: number, spread = 0.19, color = 0x2a1c12): void {
    for (const ex of [-spread, spread]) {
      this.root.add(this.box(0.12, 0.14, 0.05, color, ex, y, z));
      this.root.add(this.box(0.05, 0.06, 0.035, 0xffffff, ex - 0.045, y + 0.05, z + 0.03)); // brillo
    }
  }

  /** Cejas cuya inclinación transmite la emoción. */
  private addBrows(y: number, z: number, emotion: Emotion, color = 0x3a2a1a, spread = 0.2): void {
    // t>0 baja el extremo interior (enfado); t<0 lo sube (preocupación/amable)
    const t = { neutral: 0, stern: 0.34, worried: -0.3, happy: -0.13 }[emotion];
    const bL = this.box(0.22, 0.06, 0.05, color, -spread, y, z); bL.rotation.z = -t; this.root.add(bL);
    const bR = this.box(0.22, 0.06, 0.05, color, spread, y, z); bR.rotation.z = t; this.root.add(bR);
  }

  /** Sonrisa amable de tres piezas (curva hacia arriba). */
  private addSmile(y: number, z: number, color = 0x6e3f24): void {
    this.root.add(this.box(0.28, 0.06, 0.05, color, 0, y, z));
    this.root.add(this.box(0.09, 0.1, 0.05, color, -0.17, y + 0.05, z));
    this.root.add(this.box(0.09, 0.1, 0.05, color, 0.17, y + 0.05, z));
  }

  /** Gafas cuadradas negras (montura de cuatro barras por cristal + puente). */
  private addGlasses(y: number, z: number, color: number, spread = 0.2): void {
    const t = 0.045; // grosor de la barra
    const h = 0.15;  // medio lado del cristal
    for (const ex of [-spread, spread]) {
      this.root.add(this.box(2 * h, t, 0.05, color, ex, y + h, z));  // superior
      this.root.add(this.box(2 * h, t, 0.05, color, ex, y - h, z));  // inferior
      this.root.add(this.box(t, 2 * h, 0.05, color, ex - h, y, z));  // izquierda
      this.root.add(this.box(t, 2 * h, 0.05, color, ex + h, y, z));  // derecha
    }
    this.root.add(this.box(2 * spread - 2 * h, t, 0.05, color, 0, y, z)); // puente
  }

  // ---------- construcción ----------

  private build(s: MinifigureSkin): void {
    const emotion = s.emotion ?? 'happy';

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
    this.root.add(this.box(1.2, 1.4, 0.8, s.torso, 0, 2.5, 0));  // torso
    this.root.add(this.box(1.5, 0.7, 0.86, s.torso, 0, 3.0, 0)); // hombros anchos
    this.root.add(this.box(1.36, 0.28, 0.9, s.belt, 0, 1.9, 0)); // cinturón
    this.root.add(this.box(0.55, 0.55, 0.2, s.belt, 0, 3.05, 0.38)); // cuello en V

    // Rayas verticales de la túnica (guardias)
    if (s.tunicStripe !== undefined) {
      for (const sx of [-0.42, -0.14, 0.14, 0.42]) {
        this.root.add(this.box(0.16, 1.5, 0.06, s.tunicStripe, sx, 2.55, 0.42));
      }
    }
    // Remiendos de la túnica (beduino)
    if (s.patches !== undefined) {
      this.root.add(this.box(0.34, 0.34, 0.06, s.patches, -0.36, 2.35, 0.42));
      this.root.add(this.box(0.28, 0.28, 0.06, s.patches, 0.34, 2.7, 0.42));
      this.root.add(this.box(0.3, 0.3, 0.06, s.patches, 0.1, 2.0, 0.42));
    }
    // Pectoral dorado del sacerdote (placa con 4 gemas)
    if (s.pectoral !== undefined) {
      this.root.add(this.box(0.62, 0.62, 0.1, s.pectoral, 0, 2.72, 0.42));
      const gems = [0xb62b2b, 0x1f6fb2, 0x4c9e5e, 0xf0b429];
      const gp: Array<[number, number]> = [[-0.14, 2.86], [0.14, 2.86], [-0.14, 2.58], [0.14, 2.58]];
      gp.forEach(([gx, gy], i) => this.root.add(this.box(0.14, 0.14, 0.06, gems[i], gx, gy, 0.48)));
    }

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

    // Correas tácticas del chaleco (espía)
    if (s.straps !== undefined) {
      this.root.add(this.box(1.24, 0.14, 0.86, s.straps, 0, 2.75, 0.01));
      this.root.add(this.box(0.18, 1.35, 0.86, s.straps, 0.32, 2.5, 0.02));
      this.root.add(this.box(0.5, 0.34, 0.2, s.belt, 0, 2.4, 0.44));
    }

    // Capa que cuelga de los hombros (Yehoshúa)
    if (s.cape !== undefined) {
      const cape = this.box(1.5, 2.4, 0.16, s.cape, 0, 2.35, -0.5);
      cape.rotation.x = -0.06;
      this.root.add(cape);
      // Cuello de la capa sobre los hombros
      this.root.add(this.box(1.4, 0.3, 0.5, s.cape, 0, 3.16, -0.16));
    }

    // --- Cuello corto ---
    this.root.add(this.cyl(0.26, 0.16, s.head, 0, 3.35, 0));

    // --- Cabeza + cara ---
    if (s.headStyle === 'ninja') {
      const mask = s.headwear ?? 0x141517;
      this.root.add(this.cyl(0.56, 0.94, mask, 0, 3.9, 0, 30));            // capucha oscura
      this.root.add(this.box(0.9, 0.82, 0.12, s.head, 0, 3.86, 0.5));       // cara amarilla enmarcada
      this.addEyes(4.02, 0.57, 0.22, 0x2a2016);
      this.addBrows(4.2, 0.58, emotion, 0x2a2016, 0.22);
      this.addSmile(3.62, 0.57);
    } else {
      this.root.add(this.cyl(0.55, 0.92, s.head, 0, 3.9, 0, 30));           // cabeza de piel
      this.addEyes(3.98, 0.54, 0.19);
      this.addBrows(4.13, 0.54, emotion);
      if (s.glasses !== undefined) this.addGlasses(3.98, 0.56, s.glasses);
      // Boca: sonrisa si no hay barba tapándola
      if (!s.beard || s.beardStyle === 'short') this.addSmile(3.62, 0.55);
    }

    // --- Barba ---
    if (s.beard !== undefined && s.headStyle !== 'ninja') this.addBeard(s);
    // Bigote suelto (jefe de guardia)
    if (s.mustache !== undefined) {
      this.root.add(this.box(0.5, 0.12, 0.14, s.mustache, 0, 3.66, 0.5));
      this.root.add(this.box(0.14, 0.18, 0.12, s.mustache, -0.2, 3.6, 0.5));
      this.root.add(this.box(0.14, 0.18, 0.12, s.mustache, 0.2, 3.6, 0.5));
    }

    // --- Tocado ---
    this.addHeadwear(s);
  }

  /** Barba: cono invertido (larga) o recorte corto pegado a la mandíbula. */
  private addBeard(s: MinifigureSkin): void {
    const col = s.beard!;
    if (s.beardStyle === 'short') {
      // Barba corta: banda que rodea la mandíbula + mentón
      this.root.add(this.box(0.9, 0.36, 0.28, col, 0, 3.66, 0.36));
      this.root.add(this.box(0.5, 0.28, 0.24, col, 0, 3.46, 0.42));
      this.root.add(this.box(0.2, 0.6, 0.16, col, -0.5, 3.78, 0.28)); // patilla
      this.root.add(this.box(0.2, 0.6, 0.16, col, 0.5, 3.78, 0.28));
    } else {
      // Barba larga: cono SÓLIDO invertido, colocado bajo la cara para que
      // los ojos sigan a la vista (base ~3.7, punta ~2.4).
      const bg = new THREE.ConeGeometry(0.56, 1.35, 22);
      bg.rotateX(Math.PI); // punta hacia abajo, base ancha arriba
      bg.scale(1, 1, 0.7);
      const beard = this.mesh(bg, col, 0, 3.05, 0.3);
      this.root.add(beard);
      // bigote / mejillas que enlazan con la cara
      this.root.add(this.box(0.82, 0.32, 0.34, col, 0, 3.64, 0.42));
    }
  }

  /** Tocados: turbante, capucha, cascos, mitra, kipá, melena. */
  private addHeadwear(s: MinifigureSkin): void {
    const hw = s.headwear;
    switch (s.headStyle) {
      case 'hood': {
        if (hw === undefined) break;
        const shell = new THREE.SphereGeometry(0.62, 28, 20);
        const shellMesh = this.mesh(shell, hw, 0, 3.95, -0.06);
        shellMesh.scale.set(1.06, 1.12, 1.1);
        this.root.add(shellMesh);
        this.root.add(this.box(0.22, 0.95, 0.2, hw, -0.5, 3.9, 0.44));
        this.root.add(this.box(0.22, 0.95, 0.2, hw, 0.5, 3.9, 0.44));
        this.root.add(this.box(0.9, 0.22, 0.22, hw, 0, 3.5, 0.46));
        this.root.add(this.box(0.9, 0.2, 0.24, hw, 0, 4.32, 0.46));
        break;
      }
      case 'turban': {
        if (hw === undefined) break;
        const dome = new THREE.SphereGeometry(0.64, 26, 18, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMesh = this.mesh(dome, hw, 0, 4.32, 0);
        domeMesh.scale.set(1.06, 0.95, 1.06);
        this.root.add(domeMesh);
        // Banda frontal (blanca si el turbante lleva franjas)
        const band = new THREE.TorusGeometry(0.6, 0.17, 12, 30);
        band.rotateX(Math.PI / 2);
        this.root.add(this.mesh(band, s.turbanStripe ?? hw, 0, 4.3, 0));
        // Cola del turbante colgando al lado
        this.root.add(this.cyl(0.13, 0.34, hw, 0.5, 4.34, 0.24));
        // Franja blanca superior envolviendo la cúpula
        if (s.turbanStripe !== undefined) {
          const st = new THREE.TorusGeometry(0.6, 0.06, 12, 30);
          st.rotateX(Math.PI / 2);
          this.root.add(this.mesh(st, s.turbanStripe, 0, 4.56, 0));
        }
        break;
      }
      case 'coneHelmet': {
        const c = hw ?? 0xbfc2c4;
        const cone = new THREE.ConeGeometry(0.6, 1.1, 22);
        this.root.add(this.mesh(cone, c, 0, 4.68, 0));
        this.root.add(this.mesh(new THREE.SphereGeometry(0.1, 12, 10), c, 0, 5.26, 0)); // remate
        const rim = new THREE.TorusGeometry(0.58, 0.09, 10, 26);
        rim.rotateX(Math.PI / 2);
        this.root.add(this.mesh(rim, c, 0, 4.16, 0));
        break;
      }
      case 'plumeHelmet': {
        const c = hw ?? 0xa8adb0;
        const cone = new THREE.ConeGeometry(0.58, 0.9, 22);
        this.root.add(this.mesh(cone, c, 0, 4.6, 0));
        const rim = new THREE.TorusGeometry(0.57, 0.09, 10, 26);
        rim.rotateX(Math.PI / 2);
        this.root.add(this.mesh(rim, c, 0, 4.18, 0));
        // Penacho de plumas negras
        for (const px of [-0.18, 0, 0.18]) {
          const plume = new THREE.ConeGeometry(0.1, 0.95, 8);
          const m = this.mesh(plume, 0x181818, px, 5.3, -0.05);
          m.rotation.x = -0.12; m.scale.z = 1.4;
          this.root.add(m);
        }
        break;
      }
      case 'mitre': {
        const c = hw ?? 0xf7f3ea;
        // Mitra alta: cilindro + cúpula redondeada
        this.root.add(this.cyl(0.5, 0.7, c, 0, 4.55, 0, 26));
        this.root.add(this.mesh(new THREE.SphereGeometry(0.5, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), c, 0, 4.9, 0));
        const band = new THREE.TorusGeometry(0.52, 0.08, 10, 26);
        band.rotateX(Math.PI / 2);
        this.root.add(this.mesh(band, 0xcaa14a, 0, 4.24, 0)); // banda dorada
        break;
      }
      case 'kippah': {
        const cap = hw ?? 0x141a2c;
        // Kipá: casquete pequeño en la coronilla
        this.root.add(this.mesh(new THREE.SphereGeometry(0.37, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), cap, 0, 4.28, -0.02));
        // Pelo corto (gris) sólo a los lados y en la nuca; la cara queda libre
        const hair = s.beard ?? 0x9a958c;
        this.root.add(this.box(0.16, 0.72, 0.5, hair, -0.5, 3.98, -0.02));
        this.root.add(this.box(0.16, 0.72, 0.5, hair, 0.5, 3.98, -0.02));
        this.root.add(this.box(1.0, 0.5, 0.3, hair, 0, 4.0, -0.44));
        break;
      }
      case 'longHair': {
        const hair = hw ?? 0x6b675e;
        // Casquete/coronilla abombada, retirada en Z para NO tapar la cara
        const shell = new THREE.SphereGeometry(0.62, 28, 20);
        const shellMesh = this.mesh(shell, hair, 0, 4.12, -0.2);
        shellMesh.scale.set(1.16, 1.08, 1.08);
        this.root.add(shellMesh);
        // Raya al medio: dos mechones de flequillo sobre las cejas
        this.root.add(this.box(0.5, 0.2, 0.24, hair, -0.3, 4.36, 0.42));
        this.root.add(this.box(0.5, 0.2, 0.24, hair, 0.3, 4.36, 0.42));
        // Mechones LARGOS que enmarcan la cara y caen por debajo de los hombros
        this.root.add(this.box(0.32, 2.1, 0.36, hair, -0.55, 3.0, 0.14));
        this.root.add(this.box(0.32, 2.1, 0.36, hair, 0.55, 3.0, 0.14));
        // Melena ancha por detrás
        this.root.add(this.box(1.15, 2.0, 0.32, hair, 0, 2.95, -0.44));
        break;
      }
    }
  }

  // ---------- accesorios de mano ----------

  private addAccessory(s: MinifigureSkin): void {
    const acc = s.accessory ?? 'sword';
    if (acc === 'sword') this.addSword();
    else if (acc === 'staff') this.addStaff();
    else if (acc === 'spear') this.addSpear();
    else if (acc === 'shofar') this.addShofar();
    if (s.shield !== undefined) this.addShield(s.shield);
  }

  /** Espada del héroe en la mano derecha. */
  private addSword(): void {
    const steel = new THREE.MeshStandardMaterial({ color: 0xdfe4ea, roughness: 0.28, metalness: 0.8 });
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.09, 2.5), steel);
    blade.position.set(0, -1.12, 1.45); blade.castShadow = true;
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.35, 4), steel);
    tip.rotation.x = Math.PI / 2; tip.position.set(0, -1.12, 2.75);
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.16), this.plastic.get(0x6e4a2c));
    guard.position.set(0, -1.12, 0.28);
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.42, 8), this.plastic.get(0x3a2a1a));
    grip.rotation.x = Math.PI / 2; grip.position.set(0, -1.12, 0.02);
    this.armR.add(blade, tip, guard, grip);
  }

  /** Bastón de madera vertical con nudo superior (Yehoshúa). */
  private addStaff(): void {
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 3.4, 10), this.plastic.get(0x6e4a2c));
    shaft.position.set(0, -0.55, 0.2); shaft.castShadow = true;
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 12), this.plastic.get(0x8a6a3a));
    knob.position.set(0, 1.2, 0.2); knob.castShadow = true;
    this.armR.add(shaft, knob);
  }

  /** Lanza de la guardia en la mano derecha. */
  private addSpear(): void {
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 4.0, 8), this.plastic.get(0x7a5433));
    shaft.position.set(0, -0.4, 0.2); shaft.castShadow = true;
    const steel = new THREE.MeshStandardMaterial({ color: 0xcfd3d6, roughness: 0.3, metalness: 0.7 });
    const point = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.6, 10), steel);
    point.position.set(0, 1.9, 0.2); point.castShadow = true;
    this.armR.add(shaft, point);
  }

  /** Shofar (cuerno curvo) del sacerdote, alzado en la mano derecha. */
  private addShofar(): void {
    const horn = this.plastic.get(0xe8dcc0);
    // Caña que sube y campana acampanada al final: silueta de cuerno.
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.17, 1.15, 12), horn);
    body.rotation.x = -1.2; body.position.set(0.08, -0.85, 0.5); body.castShadow = true;
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.27, 0.42, 12), horn);
    bell.rotation.x = -0.65; bell.position.set(0.08, -0.35, 1.02); bell.castShadow = true;
    this.armR.add(body, bell);
  }

  /** Escudo redondo con un león estilizado, en el brazo izquierdo. */
  private addShield(rim: number): void {
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.12, 26), this.plastic.get(0x8a3320));
    disc.rotation.x = Math.PI / 2; disc.position.set(0, -0.55, 0.5); disc.castShadow = true;
    const ring = new THREE.TorusGeometry(0.66, 0.09, 10, 28);
    const ringMesh = new THREE.Mesh(ring, this.plastic.get(rim));
    ringMesh.position.set(0, -0.55, 0.56);
    // León estilizado (cuerpo + cabeza + patas) en oro
    const gold = this.plastic.get(rim);
    const parts: Array<[number, number, number, number, number]> = [
      [0.34, 0.2, 0.06, 0.0, -0.55],   // cuerpo
      [0.18, 0.18, 0.06, 0.22, -0.46], // cabeza
      [0.08, 0.16, 0.06, -0.16, -0.7], // pata trasera
      [0.08, 0.16, 0.06, 0.14, -0.7],  // pata delantera
      [0.06, 0.14, 0.06, -0.24, -0.48] // cola
    ];
    const lion = new THREE.Group();
    for (const [w, h, d, lx, ly] of parts) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), gold);
      m.position.set(lx, ly + 0.55, 0.62); m.castShadow = true;
      lion.add(m);
    }
    this.armL.add(disc, ringMesh, lion);
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
    // El brazo derecho: espadazo si ataca; si no, balanceo de andar.
    if (this.attackT > 0) {
      this.attackT = Math.max(0, this.attackT - dt);
      const p = 1 - this.attackT / this.ATTACK_DUR;       // 0..1
      this.armR.rotation.x = -1.4 + Math.sin(p * Math.PI) * 3.2; // levanta y corta
    } else {
      this.armR.rotation.x = swing * 0.8;
    }
  }
}

export function createMinifigure(plastic: PlasticMaterialFactory, skin?: MinifigureSkin): Minifigure {
  return new Minifigure(plastic, skin);
}
