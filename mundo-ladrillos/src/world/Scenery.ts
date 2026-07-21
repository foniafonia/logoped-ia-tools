import * as THREE from 'three';
import { PlasticMaterialFactory } from '../materials/PlasticMaterialFactory';
import { buildBrickColumn } from '../structures/BrickStructureBuilder';
import { COURT } from '../core/Layout';
import { IS_MOBILE } from '../core/Quality';

/**
 * Decorado de la plaza: columnas de LADRILLO flanqueando la avenida y
 * antorchas encendidas a lo largo de los muros. Todo con el mismo acabado
 * de plástico que la muralla y el personaje (nada liso ni "cutre").
 */
export function buildScenery(plastic: PlasticMaterialFactory): THREE.Group {
  const group = new THREE.Group();
  const { half, back } = COURT;

  // === Columnas de ladrillo: dos hileras flanqueando el pasillo central ===
  const colProto = buildBrickColumn(plastic, IS_MOBILE ? 5 : 6);
  const colX = 11;                    // separación del eje (pasillo libre en medio)
  const zStart = 12, zEnd = back - 14, zStep = IS_MOBILE ? 13 : 12;
  for (let z = zStart; z <= zEnd; z += zStep) {
    for (const side of [-1, 1]) {
      const col = colProto.clone();
      col.position.set(side * colX, 0, z);
      group.add(col);
    }
  }

  // Un par de columnas mayores junto al shofar, como marco
  for (const side of [-1, 1]) {
    const col = buildBrickColumn(plastic, IS_MOBILE ? 7 : 8);
    col.position.set(side * 6.5, 0, 12);
    group.add(col);
  }

  // === Antorchas: brasero de ladrillo + llama emisiva + luz cálida ===
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xffb347 });
  const emberMat = new THREE.MeshBasicMaterial({ color: 0xff7a2a });
  const addTorch = (x: number, z: number): void => {
    const t = new THREE.Group();
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 4.4, 8), plastic.get(0x3a2a18));
    post.position.y = 2.2; post.castShadow = true;
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.28, 0.5, 10), plastic.get(0x2a2018));
    bowl.position.y = 4.4;
    const ember = new THREE.Mesh(new THREE.SphereGeometry(0.36, 8, 6), emberMat);
    ember.position.y = 4.6;
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.3, 8), flameMat);
    flame.position.y = 5.3;
    const light = new THREE.PointLight(0xffa64d, IS_MOBILE ? 6 : 9, 26, 2);
    light.position.set(0, 5, 0);
    t.add(post, bowl, ember, flame, light);
    t.position.set(x, 0, z);
    group.add(t);
  };

  // antorchas junto a la puerta de la muralla y repartidas por los muros
  addTorch(-6, 4.5); addTorch(6, 4.5);
  const zTorchStep = IS_MOBILE ? 22 : 26;
  for (let z = 14; z < back - 6; z += zTorchStep) {
    addTorch(-(half - 3), z); addTorch(half - 3, z);
  }

  return group;
}
