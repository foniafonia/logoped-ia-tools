import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { IS_MOBILE } from '../../core/Quality';

/**
 * HORIZONTE que ACOTA el valle: un anillo de cerros y mesetas de arenisca
 * (bloques de cima plana, fieles a la peli — no pirámides ni dunas redondas)
 * rodeando la zona jugable. Con la bruma cierra el mundo para que no parezca
 * infinito ni "perdido en la nada". Se deja un valle abierto al norte, por donde
 * marcha la caravana.
 */
export function buildHorizon(scene: THREE.Scene): THREE.Group {
  const g = new THREE.Group();
  const tones = [0xcdb083, 0xc2a870, 0xd4bb85, 0xbfa06a, 0xd0b57e, 0xb89a68];
  const mat = (c: number): THREE.Material => new THREE.MeshStandardMaterial({ color: c, roughness: 1, metalness: 0 });
  const cx = 0, cz = 18;                 // centro de la zona jugable
  const N = IS_MOBILE ? 18 : 28;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + (Math.random() - 0.5) * 0.12;
    // valle abierto hacia el norte (−z): allí los cerros van más lejos y bajos
    const north = Math.cos(a - Math.PI / 2) > 0.72;   // sector norte
    const r = (north ? 175 : 128) + Math.random() * 42;
    const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
    const w = 24 + Math.random() * 34;
    const d = 22 + Math.random() * 30;
    const h = (north ? 10 : 16) + Math.random() * 24;
    const base = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, 1.6), mat(tones[(Math.random() * tones.length) | 0]));
    base.position.set(x, h / 2 - 2.5, z); base.rotation.y = Math.random() * Math.PI; base.receiveShadow = true;
    g.add(base);
    // meseta escalonada: a veces una segunda capa más pequeña encima
    if (Math.random() < 0.55) {
      const h2 = h * (0.4 + Math.random() * 0.3);
      const top = new THREE.Mesh(new RoundedBoxGeometry(w * 0.6, h2, d * 0.6, 2, 1.3), mat(tones[(Math.random() * tones.length) | 0]));
      top.position.set(x + (Math.random() - 0.5) * 5, h + h2 / 2 - 2.5, z + (Math.random() - 0.5) * 5);
      top.rotation.y = Math.random() * Math.PI; g.add(top);
    }
  }
  scene.add(g);
  return g;
}
