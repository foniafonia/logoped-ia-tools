import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { PlasticMaterialFactory } from '../../materials/PlasticMaterialFactory';
import { Minifigure, createMinifigure, MinifigureSkin } from '../../characters/MinifigureFactory';
import { IS_MOBILE } from '../../core/Quality';

const CARAVAN_SKINS: MinifigureSkin[] = [
  { head: 0xf2c141, torso: 0x2f6db0, belt: 0x24507e, legs: 0x3a4a6a, arms: 0x2c5f96, hands: 0xf2c141, headwear: 0x9fb8d6, headStyle: 'turban', sword: false },
  { head: 0xf2c141, torso: 0xb9a36f, belt: 0x7a5230, legs: 0x8a6a3a, arms: 0xa8895f, hands: 0xf2c141, headwear: 0xc9b083, headStyle: 'turban', sword: false },
  { head: 0xf2c141, torso: 0x9a9184, belt: 0x5a5248, legs: 0x6f6558, arms: 0x8a8278, hands: 0xf2c141, headwear: 0xb9b2a4, headStyle: 'turban', sword: false }
];

function rbox(w: number, h: number, d: number, color: number, plastic: PlasticMaterialFactory, x: number, y: number, z: number): THREE.Mesh {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, 0.06), plastic.get(color));
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
  return m;
}

function buildCamel(plastic: PlasticMaterialFactory, color = 0xc9a24a): THREE.Group {
  const g = new THREE.Group();
  g.add(rbox(1.3, 1.2, 3.0, color, plastic, 0, 2.2, 0));
  g.add(rbox(1.0, 0.9, 1.1, color, plastic, 0, 3.1, 0.1));
  g.add(rbox(0.7, 1.7, 0.7, color, plastic, 0, 3.0, 1.5));
  g.add(rbox(0.6, 0.6, 1.0, color, plastic, 0, 3.7, 2.0));
  for (const [lx, lz] of [[-0.5, 1.1], [0.5, 1.1], [-0.5, -1.1], [0.5, -1.1]] as Array<[number, number]>) {
    g.add(rbox(0.4, 2.2, 0.4, color, plastic, lx, 1.1, lz));
  }
  return g;
}

interface March { root: THREE.Object3D; fig?: Minifigure; speed: number; }

/**
 * EL VIAJE (minuto 0–5, segunda mitad): el río Jordán y, al otro lado, la
 * ciudad amurallada de Jericó; más una caravana que se pone en marcha desde el
 * campamento. El terreno del río nace **hundido y oculto** y "emerge" cuando la
 * narración llega al Jordán (revelarRio), para no enseñarlo antes de tiempo.
 */
export class Journey {
  /** río + Jericó, arrancan bajo tierra hasta que se revela */
  private land = new THREE.Group();
  private water: THREE.Mesh;
  private torches: THREE.PointLight[] = [];
  private caravan: March[] = [];
  private revealed = false;
  private marching = false;
  private caravanGroup = new THREE.Group();

  // z de referencia: el norte es −z (se sale del campamento hacia el río)
  static readonly ORILLA_Z = -70;   // orilla cercana (objetivo "llega al río")
  static readonly MARCHA_Z = -34;   // punto intermedio (objetivo "sigue la caravana")

  constructor(scene: THREE.Scene, private plastic: PlasticMaterialFactory) {
    // ---------- RÍO JORDÁN ----------
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x2f7fb0, roughness: 0.25, metalness: 0.1,
      emissive: 0x0e2f45, emissiveIntensity: 0.35, transparent: true, opacity: 0.94
    });
    this.water = new THREE.Mesh(new THREE.PlaneGeometry(440, 48, 24, 6), waterMat);
    this.water.rotation.x = -Math.PI / 2;
    this.water.position.set(0, 0.0, -108);
    this.water.receiveShadow = true;
    this.land.add(this.water);

    // riberas de juncos/palmeras en la orilla cercana
    const trunkMat = plastic.get(0x6f5230);
    const palmMat = plastic.get(0x3f7a3a);
    for (let i = 0; i < (IS_MOBILE ? 8 : 14); i++) {
      const px = -150 + Math.random() * 300;
      const pz = Journey.ORILLA_Z + 1.5 + Math.random() * 4;   // ribera cercana (arena, no dentro del agua)
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.4, 4.2, 6), trunkMat);
      trunk.position.set(px, 2, pz); trunk.castShadow = true; this.land.add(trunk);
      for (let k = 0; k < 5; k++) {
        const frond = new THREE.Mesh(new THREE.ConeGeometry(0.4, 2.4, 4), palmMat);
        const a = (k / 5) * Math.PI * 2;
        frond.position.set(px + Math.cos(a) * 1.1, 4.2, pz + Math.sin(a) * 1.1);
        frond.rotation.z = Math.cos(a) * 0.9; frond.rotation.x = Math.sin(a) * 0.9;
        this.land.add(frond);
      }
    }

    // ---------- JERICÓ (silueta amurallada al otro lado, en tierra firme) ----------
    const cityZ = -172;
    const wallMat = plastic.get(0xcdb083);
    const R = 30;
    const segs = IS_MOBILE ? 20 : 28;
    // muralla circular por bloques + almenas
    for (let i = 0; i < segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      // hueco para la puerta (mirando hacia el jugador, +z local del anillo)
      if (Math.abs(a - Math.PI / 2) < 0.28) continue;
      const bx = Math.cos(a) * R, bz = Math.sin(a) * R;
      const block = rbox(7.2, 8, 3.4, i % 2 ? 0xc7a978 : 0xd3ba8c, this.plastic, bx, 4, cityZ + bz);
      block.rotation.y = -a;
      this.land.add(block);
      const merlon = rbox(2.2, 1.6, 3.4, 0xb89a68, this.plastic, bx, 8.6, cityZ + bz);
      merlon.rotation.y = -a; this.land.add(merlon);
    }
    // torres en las esquinas del frente
    for (const tx of [-R * 0.7, R * 0.7]) {
      const tower = rbox(6, 13, 6, 0xd3ba8c, this.plastic, tx, 6.5, cityZ + R * 0.72);
      this.land.add(tower);
      this.land.add(rbox(7, 1.4, 7, 0xb89a68, this.plastic, tx, 13.5, cityZ + R * 0.72));
    }
    // TORREÓN central (silueta dominante → se reconoce la ciudad-meta desde lejos)
    this.land.add(rbox(10, 22, 10, 0xd8c090, this.plastic, 0, 11, cityZ));
    this.land.add(rbox(11.5, 2, 11.5, 0xb89a68, this.plastic, 0, 22.5, cityZ));   // corona de almenas
    for (const mx of [-4, 0, 4]) this.land.add(rbox(2, 2.2, 11.5, 0xc7a978, this.plastic, mx, 24, cityZ));
    // banderas rojas en el torreón y las torres (color + vida en la silueta)
    const flag = (fx: number, fy: number, fz: number): void => {
      this.land.add(rbox(0.3, 6, 0.3, 0x5a3f26, this.plastic, fx, fy, fz));      // asta
      const paño = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.8),
        new THREE.MeshStandardMaterial({ color: 0xc0392b, side: THREE.DoubleSide, roughness: 0.9 }));
      paño.position.set(fx + 1.6, fy + 2.2, fz); this.land.add(paño);
    };
    flag(0, 28, cityZ);
    flag(-R * 0.7, 17, cityZ + R * 0.72);
    flag(R * 0.7, 17, cityZ + R * 0.72);
    // puerta + antorchas
    const gate = rbox(6, 7, 1.2, 0x5a3f26, this.plastic, 0, 3.5, cityZ + R + 0.5);
    this.land.add(gate);
    // tejados/casas asomando por dentro
    for (let i = 0; i < 10; i++) {
      const hx = (Math.random() - 0.5) * R * 1.1, hz = (Math.random() - 0.5) * R * 1.1;
      if (Math.hypot(hx, hz) > R - 6) continue;
      this.land.add(rbox(3.5, 3 + Math.random() * 3, 3.5, i % 2 ? 0xbfa06a : 0xc9ad7d, this.plastic, hx, 2.5, cityZ + hz));
    }
    for (const tx of [-3.4, 3.4]) {
      const torch = new THREE.PointLight(0xff9a3c, 0, 24, 2);
      torch.position.set(tx, 6, cityZ + R + 1.2);
      this.torches.push(torch); this.land.add(torch);
    }

    // el terreno está en su sitio pero OCULTO → se "revela" al llegar al Jordán
    // (nace un poco hundido para un breve "emerger" al hacerse visible)
    this.land.position.y = -4;
    this.land.visible = false;
    scene.add(this.land);

    // ---------- CARAVANA (se pone en marcha en su beat) ----------
    const nCamels = IS_MOBILE ? 4 : 6;
    for (let i = 0; i < nCamels; i++) {
      const camel = buildCamel(this.plastic, i % 2 ? 0xb9924a : 0xc9a24a);
      const x = -16 + (i / Math.max(1, nCamels - 1)) * 32 + (Math.random() - 0.5) * 3;
      camel.position.set(x, 0, 12 + Math.random() * 10);
      camel.rotation.y = Math.PI; // mirando al norte (−z)
      // carga sobre el camello
      for (let k = 0; k < 3; k++) camel.add(rbox(1.0, 0.6, 1.0, 0x8a5a2c, this.plastic, 0, 4.0 + k * 0.62, 0.1));
      this.caravanGroup.add(camel);
      this.caravan.push({ root: camel, speed: 1.15 + Math.random() * 0.5 });
    }
    const nPeople = IS_MOBILE ? 8 : 13;
    for (let i = 0; i < nPeople; i++) {
      const fig = createMinifigure(this.plastic, CARAVAN_SKINS[i % CARAVAN_SKINS.length]);
      const x = -18 + Math.random() * 36;
      fig.root.position.set(x, 0, 8 + Math.random() * 16);
      fig.root.rotation.y = Math.PI;
      const s = 0.8 + Math.random() * 0.3; fig.root.scale.setScalar(s);
      this.caravanGroup.add(fig.root);
      this.caravan.push({ root: fig.root, fig, speed: 1.3 + Math.random() * 0.7 });
    }
    this.caravanGroup.visible = false;
    scene.add(this.caravanGroup);
  }

  /** La caravana emprende la marcha hacia el río. */
  arrancarCaravana(): void { this.marching = true; this.caravanGroup.visible = true; }

  /** El Jordán y Jericó "emergen" en el horizonte. */
  revelarRio(): void { this.revealed = true; this.land.visible = true; }

  /** Cae la noche: se encienden las antorchas de Jericó. */
  private nightF = 0;
  caeLaNoche(): void { this.nightF = 1; }

  update(dt: number, t: number): void {
    // el río termina de emerger a su sitio (breve)
    if (this.revealed && this.land.position.y < -0.01) {
      this.land.position.y = Math.min(0, this.land.position.y + dt * 10);
    }
    // brillo del agua
    (this.water.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3 + Math.sin(t * 1.5) * 0.12;
    this.water.position.x = Math.sin(t * 0.5) * 0.4;

    // antorchas de la ciudad al caer la noche
    if (this.nightF > 0) {
      for (const to of this.torches) to.intensity = (7 + Math.sin(t * 8 + to.position.x) * 2.5) * this.nightF;
    }

    // marcha de la caravana hacia el norte (−z): se aleja y se pierde en la
    // bruma del horizonte (no se amontona ni choca con los cerros).
    if (this.marching) {
      for (const u of this.caravan) {
        if (!u.root.visible) continue;
        u.root.position.z -= u.speed * dt;
        u.fig?.update(dt, true, 1);
        if (u.root.position.z < -118) u.root.visible = false;   // desaparece en la niebla
      }
    }
  }
}
