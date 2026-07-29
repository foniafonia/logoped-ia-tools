import * as THREE from 'three';
import { makeBrickGeometry } from '../bricks/BrickGeometryFactory';
import { PlasticMaterialFactory } from '../materials/PlasticMaterialFactory';
import { BrickPalette } from '../materials/BrickPalette';
import { AudioManager } from '../audio/AudioManager';
import { JerichoBuild } from '../structures/BrickStructureBuilder';
import { Dust } from '../effects/Dust';

interface Rubble { mesh: THREE.Mesh; vel: THREE.Vector3; rot: THREE.Vector3; active: boolean; settled: boolean; }

/**
 * El jugador encuentra el shofar; al pulsar E cerca, suena y la muralla
 * se derrumba POCO A POCO: franjas de arriba abajo, con oleadas de piezas
 * que caen, temblor progresivo y el audio de la película.
 */
export class ShofarInteraction {
  readonly group = new THREE.Group();   // TODO lo que añade el clímax cuelga de aquí → se libera de una vez
  private shofar = new THREE.Group();
  private ring: THREE.Mesh;
  private cracks: THREE.Mesh[] = [];
  private rubble: Rubble[] = [];
  private prompt: HTMLDivElement;
  private used = false;
  private near = false;
  private damaging = false;
  private shakeT = 0;
  private shakeMag = 0.3;
  private crackAlpha = 0;
  private bob = 0;

  private jgroup: THREE.Group;
  private bands: THREE.Group[];
  private towers: THREE.Group[];
  private base: THREE.Vector3;
  private wallTop: number;
  private halfW: number;

  constructor(
    private scene: THREE.Scene,
    private plastic: PlasticMaterialFactory,
    private audio: AudioManager,
    jericho: JerichoBuild,
    private getSpy: () => THREE.Vector3,
    private dust?: Dust,
    private onBattle?: () => void
  ) {
    this.jgroup = jericho.group;
    this.bands = jericho.bands;
    this.towers = jericho.towers;
    this.wallTop = jericho.wallTop;
    this.halfW = jericho.wallWidth / 2;
    this.base = this.jgroup.position.clone();

    // --- Shofar flotando con anillo brillante ---
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.9, -0.1, 0), new THREE.Vector3(-0.4, 0.05, 0),
      new THREE.Vector3(0.2, 0.35, 0), new THREE.Vector3(0.7, 0.45, 0),
      new THREE.Vector3(1.0, 0.3, 0)
    ]);
    const horn = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.16, 14, false), this.plastic.get(0x8a663a));
    horn.castShadow = true;
    const bell = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.35, 16, 1, true), this.plastic.get(0x7a5730));
    bell.position.set(1.05, 0.28, 0); bell.rotation.z = -1.0;
    this.shofar.add(horn, bell);
    this.shofar.position.set(0, 1.8, 16); // al fondo de la avenida, junto a la muralla
    this.shofar.scale.setScalar(1.5);
    this.group.add(this.shofar);

    this.ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.3, 0.09, 10, 32),
      new THREE.MeshBasicMaterial({ color: 0xffcf6a, transparent: true, opacity: 0.9 })
    );
    this.ring.rotation.x = Math.PI / 2;
    this.ring.position.copy(this.shofar.position).setY(0.15);
    this.group.add(this.ring);

    // Haz de luz dorado para verlo desde lejos
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 2.0, 30, 16, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xffd97a, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false })
    );
    beam.position.set(0, 15, 16);
    this.group.add(beam);

    // --- Grietas ocultas repartidas por todo el muro ---
    const nCracks = Math.max(6, Math.round(this.halfW / 14));
    for (let i = 0; i < nCracks; i++) {
      const x = -this.halfW + 6 + ((this.halfW * 2 - 12) * (i + 0.5)) / nCracks;
      this.cracks.push(this.makeCrack(x));
    }

    // --- Pool amplio de escombros (para las oleadas) ---
    for (let i = 0; i < 170; i++) {
      const { geometry } = makeBrickGeometry(2, 2, 'brick');
      const col = [BrickPalette.SAND, BrickPalette.WARM_SAND, BrickPalette.DARK_SAND, BrickPalette.TAN][i % 4];
      const m = new THREE.Mesh(geometry, this.plastic.get(col));
      m.castShadow = true; m.visible = false;
      this.group.add(m);
      this.rubble.push({ mesh: m, vel: new THREE.Vector3(), rot: new THREE.Vector3(), active: false, settled: false });
    }

    this.prompt = document.createElement('div');
    this.prompt.textContent = '🎺 Pulsa  E  para tocar el shofar';
    Object.assign(this.prompt.style, {
      position: 'fixed', left: '50%', bottom: '16%', transform: 'translateX(-50%)',
      background: 'rgba(10,7,4,.8)', color: '#ffe6b0', font: '600 16px system-ui, sans-serif',
      padding: '10px 18px', borderRadius: '22px', border: '1px solid #e8b04b',
      pointerEvents: 'none', opacity: '0', transition: 'opacity .2s', zIndex: '10'
    } as CSSStyleDeclaration);
    document.body.appendChild(this.prompt);

    this.scene.add(this.group);   // el contenedor del clímax entra UNA vez en la escena
    addEventListener('keydown', this.onKey);
  }

  private onKey = (e: KeyboardEvent): void => { if (e.code === 'KeyE') this.tryActivate(); };

  /** Libera TODO lo que el clímax añadió (evita acumular objetos/listeners al repetir o
   *  reentrar en la escena, o al ejecutar __dryRunAll varias veces). */
  dispose(): void {
    removeEventListener('keydown', this.onKey);
    this.prompt.remove();
    this.scene.remove(this.group);
    this.group.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose?.();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else mat?.dispose?.();
    });
  }

  private makeCrack(cx: number): THREE.Mesh {
    const parts: THREE.BufferGeometry[] = [];
    let x = cx, y = this.wallTop + 0.5;
    for (let i = 0; i < 12; i++) {
      const seg = new THREE.BoxGeometry(0.22, 1.05, 0.2);
      const nx = x + (i % 2 ? 0.5 : -0.5);
      seg.translate((x + nx) / 2, y - 0.5, 0);
      seg.rotateZ(Math.atan2(nx - x, 1.0) * 0.6);
      parts.push(seg);
      x = nx; y -= 0.95;
    }
    const geo = mergeSimple(parts);
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x140d07, transparent: true, opacity: 0 }));
    mesh.position.z = 1.18;
    this.group.add(mesh);
    return mesh;
  }

  private tryActivate(): void {
    if (this.used || !this.near) return;
    this.used = true;
    this.prompt.style.opacity = '0';
    this.shofar.visible = false;
    this.ring.visible = false;
    this.audio.play('shofar', 1.0, 6);
    setTimeout(() => this.startCollapse(), 900);
  }

  private startCollapse(): void {
    this.damaging = true;
    if (!this.audio.play('filmCollapse', 1.0)) {
      this.audio.play('rumble', 1.0);
      setTimeout(() => this.audio.play('shout', 0.85), 500);
    }
    // franjas de ARRIBA a abajo, una cada ~2.6s (derrumbe muy lento)
    const step = 2600;
    this.bands.forEach((band, i) => {
      setTimeout(() => {
        band.visible = false;
        const y = this.wallTop - i * (this.wallTop / this.bands.length);
        this.spawnWave(16, y);
        this.shakePulse(0.35);
        // grandes nubes de polvo repartidas por todo el muro
        const bursts = Math.max(4, Math.round(this.halfW / 22));
        for (let k = 0; k < bursts; k++) {
          const bx = -this.halfW + (this.halfW * 2 * (k + 0.5)) / bursts;
          this.dust?.burst(bx, y, 1.5, 30);
        }
      }, 400 + i * step);
    });
    // torres al final: gran estallido
    const end = 400 + this.bands.length * step;
    setTimeout(() => {
      this.towers.forEach((t) => { t.visible = false; });
      this.spawnWave(30, 8);
      this.shakePulse(0.6);
      for (let k = 0; k < 8; k++) this.dust?.burst((Math.random() - 0.5) * this.halfW * 2, 6, 1.5, 30);
    }, end);
    // ...y salen los defensores de Jericó a luchar: ¡a la batalla!
    setTimeout(() => {
      this.audio.play('din', 0.9, 3);   // los defensores gritan al salir
      this.onBattle?.();
    }, end + 1400);
  }

  private spawnWave(count: number, yLevel: number): void {
    let done = 0;
    for (const r of this.rubble) {
      if (r.active) continue;
      const x = (Math.random() - 0.5) * this.halfW * 1.9;
      r.mesh.position.set(x, yLevel + (Math.random() - 0.5) * 2, 1.2 + Math.random());
      r.mesh.visible = true;
      r.active = true; r.settled = false;
      r.vel.set((Math.random() - 0.5) * 3, 0.3 + Math.random() * 1.2, 2 + Math.random() * 3.5);
      r.rot.set((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6);
      if (++done >= count) break;
    }
  }

  private shakePulse(mag: number): void {
    this.shakeT = Math.max(this.shakeT, 0.55);
    this.shakeMag = mag;
  }

  update(dt: number): void {
    this.bob += dt;
    if (!this.used) {
      this.shofar.position.y = 1.4 + Math.sin(this.bob * 2) * 0.15;
      this.shofar.rotation.y += dt * 0.8;
      this.ring.rotation.z += dt * 1.2;
      const near = this.getSpy().distanceTo(this.shofar.position) < 3.4;
      if (near !== this.near) { this.near = near; this.prompt.style.opacity = near ? '1' : '0'; }
    }

    if (this.shakeT > 0) {
      this.shakeT -= dt;
      const a = Math.max(0, this.shakeT) * this.shakeMag;
      this.jgroup.position.set(
        this.base.x + (Math.random() - 0.5) * a,
        this.base.y + (Math.random() - 0.5) * a,
        this.base.z + (Math.random() - 0.5) * a
      );
      if (this.shakeT <= 0) this.jgroup.position.copy(this.base);
    }

    if (this.damaging && this.crackAlpha < 0.9) {
      this.crackAlpha = Math.min(0.9, this.crackAlpha + dt * 0.5);
      for (const c of this.cracks) (c.material as THREE.MeshBasicMaterial).opacity = this.crackAlpha;
    }

    if (this.damaging) {
      for (const r of this.rubble) {
        if (!r.active || r.settled) continue;
        r.vel.y -= 22 * dt;
        r.mesh.position.addScaledVector(r.vel, dt);
        r.mesh.rotation.x += r.rot.x * dt;
        r.mesh.rotation.y += r.rot.y * dt;
        if (r.mesh.position.y <= 0.2) { r.mesh.position.y = 0.2; r.settled = true; }
      }
    }
  }
}

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
