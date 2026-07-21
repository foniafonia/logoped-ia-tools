import * as THREE from 'three';
import { makeBrickGeometry } from '../bricks/BrickGeometryFactory';
import { PlasticMaterialFactory } from '../materials/PlasticMaterialFactory';
import { BrickPalette } from '../materials/BrickPalette';
import { AudioManager } from '../audio/AudioManager';

interface Rubble { mesh: THREE.Mesh; vel: THREE.Vector3; rot: THREE.Vector3; settled: boolean; }

/**
 * El jugador encuentra el shofar; al pulsar E cerca, suena y la muralla
 * se resquebraja (grietas + temblor + piezas que caen + estruendo/gritos).
 */
export class ShofarInteraction {
  private shofar = new THREE.Group();
  private ring: THREE.Mesh;
  private cracks: THREE.Mesh[] = [];
  private rubble: Rubble[] = [];
  private prompt: HTMLDivElement;
  private used = false;
  private near = false;
  private damaging = false;
  private shakeT = 0;
  private crackAlpha = 0;
  private bob = 0;
  private jerichoBase: THREE.Vector3;

  constructor(
    private scene: THREE.Scene,
    private plastic: PlasticMaterialFactory,
    private audio: AudioManager,
    private jericho: THREE.Group,
    private getSpy: () => THREE.Vector3
  ) {
    this.jerichoBase = jericho.position.clone();

    // --- Shofar (cuerno curvo) flotando con anillo brillante ---
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.9, -0.1, 0), new THREE.Vector3(-0.4, 0.05, 0),
      new THREE.Vector3(0.2, 0.35, 0), new THREE.Vector3(0.7, 0.45, 0),
      new THREE.Vector3(1.0, 0.3, 0)
    ]);
    const tube = new THREE.TubeGeometry(curve, 48, 0.16, 14, false);
    const horn = new THREE.Mesh(tube, this.plastic.get(0x8a663a));
    horn.castShadow = true;
    const bell = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.35, 16, 1, true), this.plastic.get(0x7a5730));
    bell.position.set(1.05, 0.28, 0); bell.rotation.z = -1.0;
    this.shofar.add(horn, bell);
    this.shofar.position.set(-5, 1.4, 13);
    this.scene.add(this.shofar);

    this.ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.9, 0.06, 10, 32),
      new THREE.MeshBasicMaterial({ color: 0xffcf6a, transparent: true, opacity: 0.9 })
    );
    this.ring.rotation.x = Math.PI / 2;
    this.ring.position.copy(this.shofar.position).setY(0.15);
    this.scene.add(this.ring);

    // --- Grietas (ocultas) sobre la cara del muro ---
    for (const x of [-14, -7, 8, 14]) this.cracks.push(this.makeCrack(x));

    // --- Piezas de escombro (ocultas hasta el derrumbe) ---
    for (let i = 0; i < 16; i++) {
      const { geometry } = makeBrickGeometry(2, 2, 'brick');
      const col = [BrickPalette.SAND, BrickPalette.WARM_SAND, BrickPalette.DARK_SAND][i % 3];
      const m = new THREE.Mesh(geometry, this.plastic.get(col));
      m.castShadow = true; m.visible = false;
      this.scene.add(m);
      this.rubble.push({ mesh: m, vel: new THREE.Vector3(), rot: new THREE.Vector3(), settled: false });
    }

    // --- Aviso de interacción ---
    this.prompt = document.createElement('div');
    this.prompt.textContent = '🎺 Pulsa  E  para tocar el shofar';
    Object.assign(this.prompt.style, {
      position: 'fixed', left: '50%', bottom: '16%', transform: 'translateX(-50%)',
      background: 'rgba(10,7,4,.8)', color: '#ffe6b0', font: '600 16px system-ui, sans-serif',
      padding: '10px 18px', borderRadius: '22px', border: '1px solid #e8b04b',
      pointerEvents: 'none', opacity: '0', transition: 'opacity .2s', zIndex: '10'
    } as CSSStyleDeclaration);
    document.body.appendChild(this.prompt);

    addEventListener('keydown', (e) => { if (e.code === 'KeyE') this.tryActivate(); });
  }

  private makeCrack(cx: number): THREE.Mesh {
    // línea quebrada vertical hecha de segmentos finos oscuros
    const parts: THREE.BufferGeometry[] = [];
    let x = cx, y = 8.2;
    for (let i = 0; i < 9; i++) {
      const seg = new THREE.BoxGeometry(0.22, 1.0, 0.2);
      const nx = x + (i % 2 ? 0.5 : -0.5);
      seg.translate((x + nx) / 2, y - 0.5, 0);
      seg.rotateZ(Math.atan2(nx - x, 1.0) * 0.6);
      parts.push(seg);
      x = nx; y -= 0.9;
    }
    const merged = parts.reduce((a, b) => { a.push(b); return a; }, [] as THREE.BufferGeometry[]);
    const geo = mergeSimple(merged);
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x140d07, transparent: true, opacity: 0 }));
    mesh.position.z = 1.18;
    this.scene.add(mesh);
    return mesh;
  }

  private tryActivate(): void {
    if (this.used || !this.near) return;
    this.used = true;
    this.prompt.style.opacity = '0';
    this.shofar.visible = false;
    this.ring.visible = false;
    this.audio.play('shofar', 1.0, 5);
    setTimeout(() => this.startCollapse(), 1100);
  }

  private startCollapse(): void {
    this.damaging = true;
    this.shakeT = 1.4;
    this.audio.play('rumble', 1.0);
    setTimeout(() => this.audio.play('shout', 0.85), 500);
    // lanzar escombros desde lo alto del muro
    for (let i = 0; i < this.rubble.length; i++) {
      const r = this.rubble[i];
      const ang = (i / this.rubble.length) * Math.PI - Math.PI / 2;
      r.mesh.position.set(Math.sin(ang) * 15, 6.5 + Math.random() * 2, 1.2);
      r.mesh.visible = true;
      r.settled = false;
      r.vel.set(Math.sin(ang) * (1.5 + Math.random() * 2), 0.4 + Math.random() * 1.4, 2.5 + Math.random() * 3.5);
      r.rot.set((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6);
    }
  }

  update(dt: number): void {
    // shofar flotante
    this.bob += dt;
    if (!this.used) {
      this.shofar.position.y = 1.4 + Math.sin(this.bob * 2) * 0.15;
      this.shofar.rotation.y += dt * 0.8;
      this.ring.rotation.z += dt * 1.2;
      const d = this.getSpy().distanceTo(this.shofar.position);
      const near = d < 3.2;
      if (near !== this.near) { this.near = near; this.prompt.style.opacity = near ? '1' : '0'; }
    }

    // temblor de la muralla
    if (this.shakeT > 0) {
      this.shakeT -= dt;
      const a = Math.max(0, this.shakeT) * 0.25;
      this.jericho.position.set(
        this.jerichoBase.x + (Math.random() - 0.5) * a,
        this.jerichoBase.y + (Math.random() - 0.5) * a,
        this.jerichoBase.z + (Math.random() - 0.5) * a
      );
      if (this.shakeT <= 0) this.jericho.position.copy(this.jerichoBase);
    }

    // aparición de grietas
    if (this.damaging && this.crackAlpha < 0.92) {
      this.crackAlpha = Math.min(0.92, this.crackAlpha + dt * 0.9);
      for (const c of this.cracks) (c.material as THREE.MeshBasicMaterial).opacity = this.crackAlpha;
    }

    // física simple de los escombros
    if (this.damaging) {
      for (const r of this.rubble) {
        if (!r.mesh.visible || r.settled) continue;
        r.vel.y -= 22 * dt;
        r.mesh.position.addScaledVector(r.vel, dt);
        r.mesh.rotation.x += r.rot.x * dt;
        r.mesh.rotation.y += r.rot.y * dt;
        if (r.mesh.position.y <= 0.2) {
          r.mesh.position.y = 0.2;
          r.settled = true;
        }
      }
    }
  }
}

/** Une geometrías sencillas (posición/normal) para las grietas. */
function mergeSimple(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  const pos: number[] = [];
  for (const geo of geos) {
    const ng = geo.index ? geo.toNonIndexed() : geo;
    const p = ng.attributes.position.array as ArrayLike<number>;
    for (let i = 0; i < p.length; i++) pos.push(p[i]);
  }
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}
