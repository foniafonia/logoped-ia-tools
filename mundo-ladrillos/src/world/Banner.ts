import * as THREE from 'three';
import { PlasticMaterialFactory } from '../materials/PlasticMaterialFactory';

/**
 * Banner — estandarte de tribu: un asta con una tela de color que ONDEA. Da vida
 * y color al campamento y a la marcha alrededor de Jericó ("mundo lleno"). Barato:
 * la tela es un plano segmentado que se mece con un seno en `update`.
 *
 *   const b = buildBanner(plastic, { color: 0xC23B3B, height: 4 });
 *   scene.add(b.group);
 *   // en el bucle:  b.update(dt)
 *
 * `buildBannerRow` planta varios de colores distintos de una vez.
 */

const TRIBE_COLORS = [0xC23B3B, 0x2f6fb0, 0x2f9e6b, 0xE0A62E, 0x7d4bb0, 0xcf6a2a];

export interface BannerHandle {
  group: THREE.Group;
  update(dt: number): void;
  dispose(): void;
}

export function buildBanner(
  plastic: PlasticMaterialFactory,
  o: { color?: number; height?: number; emblem?: number } = {}
): BannerHandle {
  const g = new THREE.Group();
  const H = o.height ?? 4;
  const color = o.color ?? TRIBE_COLORS[0];

  // Asta + remate dorado
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, H, 10), plastic.get(0x6b4a2a));
  pole.position.y = H / 2; pole.castShadow = true; g.add(pole);
  const finial = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), plastic.get(0xE0B23C));
  finial.position.y = H + 0.05; g.add(finial);

  // Tela (plano segmentado que cuelga del asta)
  const W = 1.6, TH = 1.1, segW = 16, segH = 8;
  const clothGeo = new THREE.PlaneGeometry(W, TH, segW, segH);
  const cloth = new THREE.Mesh(clothGeo, plastic.get(color));
  (cloth.material as THREE.MeshPhysicalMaterial).side = THREE.DoubleSide;
  cloth.position.set(W / 2 + 0.06, H - 0.15 - TH / 2, 0);
  cloth.castShadow = true;
  g.add(cloth);

  // Emblema (parche cuadrado de color contrastado en el centro de la tela)
  const emblem = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), plastic.get(o.emblem ?? 0xF3E2C4));
  (emblem.material as THREE.MeshPhysicalMaterial).side = THREE.DoubleSide;
  emblem.position.set(W / 2 + 0.06, H - 0.15 - TH / 2, 0.01);
  g.add(emblem);

  // guarda posiciones base de la tela para ondearla
  const base = clothGeo.attributes.position.clone();

  let t = Math.random() * 10; // desfase por estandarte
  return {
    group: g,
    update(dt: number): void {
      t += dt;
      const pos = clothGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        const x = base.getX(i), y = base.getY(i);
        const u = (x + W / 2) / W;                 // 0 junto al asta, 1 al vuelo
        const z = Math.sin(t * 4 + u * 6) * 0.12 * u; // ondas crecen hacia el vuelo
        pos.setZ(i, z);
        pos.setX(i, x - (1 - Math.cos(u * 1.2)) * 0.05); // leve recogido
        void y;
      }
      pos.needsUpdate = true;
      clothGeo.computeVertexNormals();
      emblem.position.z = Math.sin(t * 4 + 0.5 * 6) * 0.12 * 0.5 + 0.02; // sigue a la tela
    },
    dispose(): void {
      g.traverse((n) => { const m = n as THREE.Mesh; if (m.geometry) m.geometry.dispose(); });
    }
  };
}

/** Planta una fila de estandartes de colores distintos (tribus). */
export function buildBannerRow(
  plastic: PlasticMaterialFactory,
  o: { x?: number; z?: number; gap?: number; count?: number; height?: number } = {}
): BannerHandle {
  const g = new THREE.Group();
  const parts: BannerHandle[] = [];
  const count = o.count ?? TRIBE_COLORS.length;
  const gap = o.gap ?? 2;
  const x0 = o.x ?? 0, z = o.z ?? 0;
  for (let i = 0; i < count; i++) {
    const b = buildBanner(plastic, { color: TRIBE_COLORS[i % TRIBE_COLORS.length], height: o.height });
    b.group.position.set(x0 + i * gap, 0, z);
    g.add(b.group);
    parts.push(b);
  }
  return {
    group: g,
    update: (dt) => parts.forEach((p) => p.update(dt)),
    dispose: () => parts.forEach((p) => p.dispose())
  };
}
