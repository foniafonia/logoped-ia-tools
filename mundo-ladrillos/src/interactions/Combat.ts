import * as THREE from 'three';
import { Minifigure } from '../characters/MinifigureFactory';
import { Army } from '../world/Army';
import { AudioManager } from '../audio/AudioManager';

/**
 * Combate del héroe: con F (o el botón ⚔️) el espía da un espadazo que derriba
 * a los enemigos que tenga delante. Muestra un tajo luminoso, suena el golpe y
 * lleva la cuenta de enemigos derribados.
 */
export class Combat {
  private slash: THREE.Mesh;
  private slashT = 0;
  private count = 0;
  private hud: HTMLDivElement;

  constructor(
    private scene: THREE.Scene,
    private spy: Minifigure,
    private army: Army,
    private audio: AudioManager,
    private getPos: () => THREE.Vector3
  ) {
    // Tajo (arco luminoso) que aparece un instante al golpear
    const geo = new THREE.TorusGeometry(1.5, 0.16, 8, 20, Math.PI * 1.1);
    this.slash = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color: 0xfff2c0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false
    }));
    this.slash.visible = false;
    this.scene.add(this.slash);

    this.hud = document.createElement('div');
    this.hud.innerHTML = '⚔️ <b>0</b>';
    Object.assign(this.hud.style, {
      position: 'fixed', top: '12px', right: '14px', zIndex: '20',
      font: '700 18px system-ui, sans-serif', color: '#fff2d6',
      background: 'rgba(20,14,8,.55)', padding: '6px 12px', borderRadius: '20px',
      border: '1px solid rgba(232,176,75,.7)', pointerEvents: 'none',
      opacity: '0', transition: 'opacity .3s'
    } as CSSStyleDeclaration);
    document.body.appendChild(this.hud);

    addEventListener('keydown', (e) => { if (e.code === 'KeyF' || e.code === 'KeyJ') this.attack(); });
  }

  attack(): void {
    if (!this.spy.attack()) return;
    const facing = this.spy.root.rotation.y;
    const dx = Math.sin(facing), dz = Math.cos(facing);
    const p = this.getPos();

    // tajo delante del espía
    this.slash.position.set(p.x + dx * 1.6, 2.1, p.z + dz * 1.6);
    this.slash.rotation.set(0, facing, Math.PI * 0.15);
    this.slash.visible = true;
    this.slashT = 0.22;

    const hits = this.army.hitNear(p.x, p.z, dx, dz, 5.5);
    if (hits > 0) {
      this.count += hits;
      this.hud.querySelector('b')!.textContent = String(this.count);
      this.hud.style.opacity = '1';
      this.audio.play('din', 0.5, 0.5);   // rugido al conectar el golpe
    }
  }

  update(dt: number): void {
    if (this.slashT > 0) {
      this.slashT -= dt;
      const a = Math.max(0, this.slashT) / 0.22;
      (this.slash.material as THREE.MeshBasicMaterial).opacity = a * 0.9;
      this.slash.scale.setScalar(1.4 - a * 0.5);
      if (this.slashT <= 0) this.slash.visible = false;
    }
  }
}
