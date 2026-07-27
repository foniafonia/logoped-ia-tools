import * as THREE from 'three';
import { PlasticMaterialFactory } from '../../../materials/PlasticMaterialFactory';
import { SoundEngine } from '../audio/SoundEngine';

/**
 * GEMAS coleccionables (para un niño 6–8: recoger cosas brillantes por el
 * camino da motivación y recompensa constante). Giran, botan y brillan; al
 * pasar cerca, se recogen con un "ding" y suman al contador. No son necesarias
 * para el objetivo (son premio), así que nunca bloquean el avance.
 */
export class Collectibles {
  readonly group = new THREE.Group();
  private gems: Array<{ mesh: THREE.Mesh; x: number; z: number; taken: boolean; ph: number }> = [];
  private _got = 0;

  constructor(private plastic: PlasticMaterialFactory, private sound: SoundEngine, positions: Array<{ x: number; z: number }>) {
    const mat = new THREE.MeshStandardMaterial({ color: 0xffd24a, emissive: 0xffae2e, emissiveIntensity: 0.8, roughness: 0.2, metalness: 0.3 });
    positions.forEach((p, i) => {
      const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.7, 0), mat);
      mesh.position.set(p.x, 1.6, p.z);
      mesh.castShadow = true;
      this.group.add(mesh);
      // halo suave
      const halo = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.2, 16), new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.4, side: THREE.DoubleSide }));
      halo.rotation.x = -Math.PI / 2; halo.position.set(p.x, 0.2, p.z); this.group.add(halo);
      this.gems.push({ mesh, x: p.x, z: p.z, taken: false, ph: i });
    });
  }

  get total(): number { return this.gems.length; }
  get got(): number { return this._got; }

  update(dt: number, t: number, player: THREE.Vector3): void {
    for (const g of this.gems) {
      if (g.taken) continue;
      g.mesh.rotation.y += dt * 2;
      g.mesh.position.y = 1.6 + Math.sin(t * 3 + g.ph) * 0.25;
      if (Math.hypot(player.x - g.x, player.z - g.z) < 1.8) {
        g.taken = true; g.mesh.visible = false; this._got++;
        this.sound.pickup();
      }
    }
  }
}
