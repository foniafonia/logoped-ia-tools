import * as THREE from 'three';
import { PlasticMaterialFactory } from '../materials/PlasticMaterialFactory';

/**
 * Relic — reliquia RECOLECTABLE (ánfora dorada) que gira y flota con un brillo,
 * para sembrar por los tramos y sumar en el contador 🏺. Barata y llamativa.
 *
 *   const r = buildRelic(plastic);  scene.add(r.group);
 *   // en el bucle:  r.update(dt)
 *   // al recoger:   r.collect(() => { counter.inc(); r.dispose(); })
 */

export interface RelicHandle {
  group: THREE.Group;
  update(dt: number): void;
  /** Animación corta de recogida (sube y se encoge) + callback al terminar. */
  collect(done?: () => void): void;
  dispose(): void;
}

export function buildRelic(plastic: PlasticMaterialFactory, o: { color?: number; glow?: boolean } = {}): RelicHandle {
  const g = new THREE.Group();
  const gold = plastic.get(o.color ?? 0xE0B23C);
  const goldDk = plastic.get(0xB07C22);

  const add = (m: THREE.Mesh, x = 0, y = 0, z = 0): THREE.Mesh => {
    m.position.set(x, y, z); m.castShadow = true; g.add(m); return m;
  };
  // Cuerpo (esfera achatada) + cuello + boca + base
  const body = add(new THREE.Mesh(new THREE.SphereGeometry(0.4, 20, 16), gold), 0, 0.5, 0);
  body.scale.set(1, 1.15, 1);
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 0.28, 14), gold), 0, 0.98, 0);
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.1, 14), goldDk), 0, 1.14, 0);
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.1, 0.14, 14), goldDk), 0, 0.06, 0);
  // Dos asas
  for (const sx of [-1, 1]) {
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.045, 8, 16, Math.PI), gold);
    handle.position.set(sx * 0.38, 0.72, 0);
    handle.rotation.z = sx * Math.PI / 2;
    handle.castShadow = true; g.add(handle);
  }
  // Brillo interior barato
  let glow: THREE.PointLight | null = null;
  if (o.glow ?? true) {
    glow = new THREE.PointLight(0xffdf9e, 1.4, 4, 2);
    glow.position.set(0, 0.6, 0); g.add(glow);
  }

  let t = Math.random() * 6;
  let picking = 0; // >0 mientras se recoge
  let onDone: (() => void) | undefined;
  return {
    group: g,
    update(dt: number): void {
      t += dt;
      g.rotation.y = t * 1.6;                       // gira
      if (picking > 0) {
        picking -= dt;
        g.position.y += dt * 3;                      // sube
        const s = Math.max(0.01, picking / 0.4);
        g.scale.setScalar(s);
        if (glow) glow.intensity = 1.4 + (1 - s) * 4;
        if (picking <= 0) { onDone?.(); }
      } else {
        g.position.y = Math.sin(t * 2) * 0.12 + 0.1; // flota
      }
    },
    collect(done): void { picking = 0.4; onDone = done; },
    dispose(): void {
      g.traverse((n) => { const m = n as THREE.Mesh; if (m.geometry) m.geometry.dispose(); });
      g.parent?.remove(g);
    }
  };
}
