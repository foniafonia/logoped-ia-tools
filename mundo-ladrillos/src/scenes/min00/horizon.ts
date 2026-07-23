import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { IS_MOBILE } from '../../core/Quality';

/**
 * HORIZONTE que ACOTA el valle: un anillo CERRADO de cerros y mesetas de
 * arenisca (bloques de cima plana, fieles a la peli) rodeando la zona jugable,
 * MÁS relleno intermedio (palmeras, rocas, arbustos) para que no haya vacío
 * ("mundo lleno, nunca vacío"). Con la bruma cierra el mundo: nada de sensación
 * de infinito ni de estar "perdidos en la nada". Solo un valle abierto al norte.
 */
export function buildHorizon(scene: THREE.Scene): THREE.Group {
  const g = new THREE.Group();
  const tones = [0xcdb083, 0xc2a870, 0xd4bb85, 0xbfa06a, 0xd0b57e, 0xb89a68, 0xc9b58a];
  const mat = (c: number): THREE.Material => new THREE.MeshStandardMaterial({ color: c, roughness: 1, metalness: 0 });
  const cx = 0, cz = 18;

  // ---------- anillo de cerros/mesetas (cerrado, alto y cerca) ----------
  const N = IS_MOBILE ? 26 : 40;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + (Math.random() - 0.5) * 0.08;
    const north = Math.cos(a - Math.PI / 2) > 0.82;      // pasillo estrecho al norte
    const r = (north ? 165 : 100) + Math.random() * 44;
    const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
    const w = 26 + Math.random() * 40;
    const d = 24 + Math.random() * 34;
    const h = (north ? 16 : 26) + Math.random() * 30;    // más altos → cierran de verdad
    const base = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, 2.2), mat(tones[(Math.random() * tones.length) | 0]));
    base.position.set(x, h / 2 - 3, z); base.rotation.y = Math.random() * Math.PI; base.receiveShadow = true;
    g.add(base);
    if (Math.random() < 0.6) {   // meseta escalonada
      const h2 = h * (0.4 + Math.random() * 0.35);
      const top = new THREE.Mesh(new RoundedBoxGeometry(w * 0.62, h2, d * 0.62, 2, 1.6), mat(tones[(Math.random() * tones.length) | 0]));
      top.position.set(x + (Math.random() - 0.5) * 6, h + h2 / 2 - 3, z + (Math.random() - 0.5) * 6);
      top.rotation.y = Math.random() * Math.PI; g.add(top);
    }
  }

  // ---------- relleno intermedio: palmeras + rocas (que no haya vacío) ----------
  const trunkMat = mat(0x6f5230), palmMat = mat(0x3f7a3a), rockMat = mat(0x9a8f7e);
  const nFill = IS_MOBILE ? 16 : 26;
  for (let i = 0; i < nFill; i++) {
    const a = Math.random() * Math.PI * 2;
    if (Math.cos(a - Math.PI / 2) > 0.7) continue;        // deja libre el pasillo norte
    const r = 84 + Math.random() * 34;                    // borde exterior de la zona jugable
    const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
    if (Math.random() < 0.5) {
      // palmera (tronco + penacho)
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 5.5, 6), trunkMat);
      trunk.position.set(x, 2.75, z); trunk.castShadow = true; g.add(trunk);
      for (let k = 0; k < 5; k++) {
        const a2 = (k / 5) * Math.PI * 2;
        const frond = new THREE.Mesh(new THREE.ConeGeometry(0.5, 3, 4), palmMat);
        frond.position.set(x + Math.cos(a2) * 1.3, 5.6, z + Math.sin(a2) * 1.3);
        frond.rotation.z = Math.cos(a2) * 0.9; frond.rotation.x = Math.sin(a2) * 0.9; g.add(frond);
      }
    } else {
      // grupo de rocas
      for (let k = 0; k < 3; k++) {
        const s = 1 + Math.random() * 2.4;
        const rock = new THREE.Mesh(new RoundedBoxGeometry(s, s * 0.8, s, 2, 0.3), rockMat);
        rock.position.set(x + (Math.random() - 0.5) * 4, s * 0.4, z + (Math.random() - 0.5) * 4);
        rock.rotation.set(Math.random(), Math.random(), Math.random()); rock.castShadow = true; g.add(rock);
      }
    }
  }

  scene.add(g);
  return g;
}
