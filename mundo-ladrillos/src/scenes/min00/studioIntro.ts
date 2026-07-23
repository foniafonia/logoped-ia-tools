import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { PlasticMaterialFactory } from '../../materials/PlasticMaterialFactory';
import { createMinifigure, Minifigure, MinifigureSkin } from '../../characters/MinifigureFactory';

/** Rabino director: traje azul marino, barba canosa, cara amable. */
const RABINO_SKIN: MinifigureSkin = {
  head: 0xf2c141, torso: 0x1a3a6b, belt: 0x14203a, legs: 0x1b2740,
  arms: 0x1a3a6b, hands: 0xf2c141, headwear: 0x141414, headStyle: 'turban', beard: 0xb9b4a6, sword: false
};
/** Beduino quejica de la peli. */
const BEDUINO_SKIN: MinifigureSkin = {
  head: 0xf2c141, torso: 0x7d6608, belt: 0x4a3a10, legs: 0x5a4a1a,
  arms: 0x6a5a18, hands: 0xf2c141, headwear: 0xf5cba7, headStyle: 'turban', beard: 0x2a2018, sword: false
};

/** Lienzo del pergamino con el título de la peli (texto dibujado, no foto). */
function pergaminoTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 512;
  const x = c.getContext('2d')!;
  // fondo pergamino
  const g = x.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, '#efe2bf'); g.addColorStop(0.5, '#e7d4a3'); g.addColorStop(1, '#dcc48c');
  x.fillStyle = g; x.fillRect(0, 0, 1024, 512);
  x.strokeStyle = 'rgba(120,90,40,.35)'; x.lineWidth = 6; x.strokeRect(24, 24, 976, 464);
  x.textAlign = 'center';
  x.fillStyle = '#7a3b12';
  x.font = '800 74px Georgia, serif';
  x.fillText('CONSTRUYENDO', 512, 150);
  x.fillText('LA CONQUISTA DE ISRAEL', 512, 240);
  x.fillStyle = '#9a6a2a';
  x.font = '600 34px Georgia, serif';
  x.fillText('Una producción de TuIA.tv', 512, 330);
  x.font = 'italic 30px Georgia, serif';
  x.fillText('Película donada · R. Amram Anidjar', 512, 388);
  // estrella de David sencilla
  x.strokeStyle = '#7a3b12'; x.lineWidth = 5;
  const star = (cx: number, cy: number, r: number): void => {
    for (let k = 0; k < 2; k++) {
      x.beginPath();
      for (let i = 0; i < 3; i++) {
        const a = Math.PI / 2 + k * Math.PI + (i * 2 * Math.PI) / 3;
        const px = cx + Math.cos(a) * r, py = cy - Math.sin(a) * r;
        i ? x.lineTo(px, py) : x.moveTo(px, py);
      }
      x.closePath(); x.stroke();
    }
  };
  star(140, 200, 60); star(884, 200, 60);
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 4;
  return t;
}

/**
 * INTRO DE ESTUDIO (minuto 0, escenas 01–02): un pequeño plató de cine de
 * ladrillo. El pergamino de la Torá con el título se despliega; el Rabino
 * director (traje azul) riñe al Beduino, que se queja de la grabación. Es una
 * cinemática de apertura: vive lejos del campamento y solo se ve por su cámara.
 */
export class StudioIntro {
  readonly group = new THREE.Group();
  private rabino: Minifigure;
  private beduino: Minifigure;
  private telaScroll: THREE.Mesh;
  private lights: THREE.PointLight[] = [];
  private center = new THREE.Vector3(0, 0, 220);   // plató, detrás del campamento

  constructor(scene: THREE.Scene, plastic: PlasticMaterialFactory) {
    this.group.position.copy(this.center);

    // suelo del plató (tarima oscura)
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(16, 16, 0.6, 32), plastic.get(0x2a2622));
    floor.position.y = -0.3; floor.receiveShadow = true; this.group.add(floor);

    // pergamino: dos rodillos + tela con el título (se despliega)
    const rollMat = plastic.get(0x6f4a24);
    for (const rx of [-6.6, 6.6]) {
      const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 6.4, 12), rollMat);
      roll.position.set(rx, 5.2, -3); roll.castShadow = true; this.group.add(roll);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.62, 10, 8), rollMat);
      cap.position.set(rx, 8.5, -3); this.group.add(cap);
      const cap2 = cap.clone(); cap2.position.y = 1.9; this.group.add(cap2);
    }
    const telaMat = new THREE.MeshStandardMaterial({ map: pergaminoTexture(), roughness: 0.85, side: THREE.DoubleSide });
    this.telaScroll = new THREE.Mesh(new THREE.PlaneGeometry(12.4, 6.2), telaMat);
    this.telaScroll.position.set(0, 5.2, -3); this.telaScroll.castShadow = true;
    this.telaScroll.scale.x = 0.01;   // arranca enrollado
    this.group.add(this.telaScroll);

    // cámaras de cine de ladrillo (trípode + cuerpo + objetivo)
    const buildCam = (px: number, pz: number, ry: number): void => {
      const cam = new THREE.Group();
      const body = new THREE.Mesh(new RoundedBoxGeometry(1.6, 1.4, 2.4, 2, 0.08), plastic.get(0x1b1b1f));
      body.position.y = 4.2; body.castShadow = true; cam.add(body);
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.2, 14), plastic.get(0x111114));
      lens.rotation.x = Math.PI / 2; lens.position.set(0, 4.2, 1.5); cam.add(lens);
      const reel = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.3, 16), plastic.get(0x2a2a30));
      reel.position.set(0, 5.4, -0.4); cam.add(reel);
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4.2, 6), plastic.get(0x333));
        leg.position.set(Math.cos(a) * 0.9, 1.9, Math.sin(a) * 0.9);
        leg.rotation.z = Math.cos(a) * 0.22; leg.rotation.x = -Math.sin(a) * 0.22; cam.add(leg);
      }
      cam.position.set(px, 0, pz); cam.rotation.y = ry; this.group.add(cam);
    };
    buildCam(-10, 8, -0.3); buildCam(11, 7, 0.4);

    // claqueta
    const clap = new THREE.Mesh(new RoundedBoxGeometry(2, 1.4, 0.3, 2, 0.05), plastic.get(0x151515));
    clap.position.set(-4, 1, 6); clap.rotation.z = 0.1; clap.castShadow = true; this.group.add(clap);
    const clapTop = new THREE.Mesh(new THREE.BoxGeometry(2, 0.35, 0.32), plastic.get(0xf0f0f0));
    clapTop.position.set(-4, 1.8, 6); clapTop.rotation.z = 0.35; this.group.add(clapTop);

    // focos de estudio (soporte + luz cálida)
    for (const [lx, lz] of [[-12, 12], [12, 12]] as Array<[number, number]>) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 9, 6), plastic.get(0x222));
      pole.position.set(lx, 4.5, lz); this.group.add(pole);
      const head = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.2, 1.4, 12), plastic.get(0x333));
      head.position.set(lx, 9, lz); head.lookAt(this.center.x, this.center.y + 5, this.center.z); this.group.add(head);
      const light = new THREE.PointLight(0xfff0d0, 0, 40, 2);
      light.position.set(lx * 0.7, 8, lz * 0.6); this.lights.push(light); this.group.add(light);
    }

    // Rabino (riñe) y Beduino (se queja)
    this.rabino = createMinifigure(plastic, RABINO_SKIN);
    this.rabino.root.position.set(-2.2, 0, 2); this.rabino.root.rotation.y = 0.5; this.group.add(this.rabino.root);
    this.beduino = createMinifigure(plastic, BEDUINO_SKIN);
    this.beduino.root.position.set(2.4, 0, 2.4); this.beduino.root.rotation.y = -0.6; this.group.add(this.beduino.root);

    this.group.visible = false;
    scene.add(this.group);
  }

  /** Enciende/apaga el plató (solo visible durante la cinemática de intro). */
  setActive(on: boolean): void {
    this.group.visible = on;
    for (const l of this.lights) l.intensity = on ? 22 : 0;
  }

  /** Anima el pergamino y el numerito del rabino/beduino. `tl` = seg. locales de la intro. */
  update(dt: number, t: number, tl: number): void {
    // el pergamino se despliega en los primeros ~3.5 s
    const open = Math.min(1, tl / 3.5);
    this.telaScroll.scale.x = 0.01 + open * 0.99;
    // a partir de la esc_02 (~15 s local) el rabino riñe y el beduino protesta
    if (tl > 14) {
      this.rabino.armR.rotation.x = -1.1 + Math.sin(t * 6) * 0.6;   // gesticula
      this.rabino.root.rotation.z = Math.sin(t * 3) * 0.05;
      this.beduino.armR.rotation.x = -2.2 + Math.sin(t * 5) * 0.3;  // manos arriba
      this.beduino.armL.rotation.x = -2.2 - Math.sin(t * 5) * 0.3;
      this.beduino.root.position.y = Math.abs(Math.sin(t * 8)) * 0.12; // tiembla
    }
  }

  /** Coloca la cámara para la toma de la intro según el segundo local (0–25). */
  frameCamera(camera: THREE.PerspectiveCamera, tl: number): void {
    const C = this.center;
    if (tl < 14) {
      // toma del pergamino con leve push-in
      const z = 16 - tl * 0.25;
      camera.position.set(C.x + Math.sin(tl * 0.15) * 2, C.y + 6.2, C.z + z);
      camera.lookAt(C.x, C.y + 5.4, C.z - 3);
    } else {
      // toma del rabino y el beduino (plano medio, órbita lenta)
      const a = (tl - 14) * 0.12;
      camera.position.set(C.x + Math.sin(a) * 11, C.y + 4.2, C.z + 12);
      camera.lookAt(C.x, C.y + 2.6, C.z + 2);
    }
  }
}
