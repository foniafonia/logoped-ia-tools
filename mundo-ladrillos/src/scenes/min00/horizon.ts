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
  const mat = (c: THREE.ColorRepresentation): THREE.Material => new THREE.MeshStandardMaterial({ color: c, roughness: 1, metalness: 0 });
  const cx = 0, cz = 18;

  // ---------- anillo de MESETAS de cima plana, por CAPAS (estratos) ----------
  // Buttes tipo Monument Valley/peli: cima plana nítida (poco bevel), losas
  // apiladas cada vez más estrechas y con tono alterno → leen como montaña de
  // roca, no como paredes redondeadas.
  const N = IS_MOBILE ? 24 : 38;
  const col = new THREE.Color();
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + (Math.random() - 0.5) * 0.08;
    // VALLE ABIERTO al norte (−z, amplio): ahí NO hay cerros, solo bruma — la
    // caravana marcha y se pierde en el horizonte, sin pared que la empotre.
    if (Math.sin(a) < -0.45) continue;
    const r = 92 + Math.random() * 42;
    const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
    const rot = Math.random() * Math.PI;
    const baseTone = tones[(Math.random() * tones.length) | 0];
    const h = 30 + Math.random() * 34;                    // mesetas altas → cierran los lados
    const layers = 2 + (Math.random() < 0.6 ? 1 : 0);     // 2–3 estratos
    let cw = 30 + Math.random() * 40;
    let cd = 26 + Math.random() * 30;
    let yb = -3;                                           // arranca algo bajo el suelo
    for (let L = 0; L < layers; L++) {
      const lh = h * (L === 0 ? 0.55 : 0.3) * (0.8 + Math.random() * 0.4);
      // estrato: base más oscura, cimas más claras (perspectiva aérea + roca)
      col.set(baseTone).multiplyScalar(0.86 + L * 0.09);
      const slab = new THREE.Mesh(new RoundedBoxGeometry(cw, lh, cd, 1, 0.8), mat(col.getHex()));
      slab.position.set(x + (Math.random() - 0.5) * 4, yb + lh / 2, z + (Math.random() - 0.5) * 4);
      slab.rotation.y = rot; slab.receiveShadow = true;
      g.add(slab);
      yb += lh - 0.5;
      cw *= 0.66; cd *= 0.66;
    }
  }

  // ---------- relleno intermedio: palmeras + rocas (que no haya vacío) ----------
  const trunkMat = mat(0x6f5230), palmMat = mat(0x3f7a3a), rockMat = mat(0x9a8f7e);
  const nFill = IS_MOBILE ? 16 : 26;
  for (let i = 0; i < nFill; i++) {
    const a = Math.random() * Math.PI * 2;
    if (Math.sin(a) < -0.45) continue;                    // deja libre el valle norte (−z, camino de la caravana)
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
