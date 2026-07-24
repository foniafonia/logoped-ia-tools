import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { normalizeGeometry } from '../../bricks/BrickGeometryFactory';
import { PlasticMaterialFactory } from '../../materials/PlasticMaterialFactory';
import { MinifigureSkin, Minifigure, createMinifigure, YOSHUA_SKIN } from '../../characters/MinifigureFactory';
import { buildRug, kilimTexture, KILIM_PALS } from './textiles';
import { IS_MOBILE } from '../../core/Quality';

/** Aldeano/levita jugable del campamento (túnica sencilla, turbante, cara amable). */
export const VILLAGER_SKIN: MinifigureSkin = {
  head: 0xf2c141, torso: 0xb9a36f, belt: 0x7a5230, legs: 0x8a6a3a,
  arms: 0xa8895f, hands: 0xf2c141, headwear: 0xc9b083, headStyle: 'turban', sword: false
};

export interface CampBuild {
  group: THREE.Group;
  ropes: THREE.Mesh[];      // cuerdas a recoger (objetivo)
  bultos: THREE.Mesh[];     // cargamento para la caravana (mini-juego, ocultos al inicio)
  yehoshua: Minifigure;     // el líder sobre la tarima (saluda al acercarte)
}

/**
 * CAMPAMENTO DE ISRAEL (minuto 0–5) — mundo 3D de ladrillo:
 * tiendas de campaña, fogatas, Yehoshúa sobre una tarima arengando, y cuerdas
 * enrolladas repartidas para el objetivo "recoge las cuerdas".
 */
/** Textura de LONA de tienda: casi blanca (para teñir por-instancia) con costuras
 *  verticales (paneles) y trama sutil → deja de parecer un cono liso. */
function tentClothTexture(): THREE.CanvasTexture {
  const S = 128;
  const c = document.createElement('canvas'); c.width = c.height = S;
  const x = c.getContext('2d')!;
  x.fillStyle = '#efeae0'; x.fillRect(0, 0, S, S);
  // costuras verticales (paneles de lona)
  for (let i = 0; i <= 8; i++) {
    x.strokeStyle = 'rgba(120,104,78,.28)'; x.lineWidth = i % 2 ? 1 : 2;
    const px = (i / 8) * S;
    x.beginPath(); x.moveTo(px, 0); x.lineTo(px, S); x.stroke();
  }
  // trama horizontal muy tenue
  x.strokeStyle = 'rgba(120,104,78,.08)'; x.lineWidth = 1;
  for (let y = 4; y < S; y += 6) { x.beginPath(); x.moveTo(0, y); x.lineTo(S, y); x.stroke(); }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** 4 vientos (cuerdas tensoras) que van de cerca de la cima a estacas en el suelo. */
function tentGuyRopesGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const up = new THREE.Vector3(0, 1, 0), q = new THREE.Quaternion(), mid = new THREE.Vector3();
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 4 + (k / 4) * Math.PI * 2;
    const top = new THREE.Vector3(Math.cos(a) * 0.6, 3.6, Math.sin(a) * 0.6);
    const peg = new THREE.Vector3(Math.cos(a) * 4.2, 0.05, Math.sin(a) * 4.2);
    const dir = peg.clone().sub(top); const len = dir.length();
    q.setFromUnitVectors(up, dir.clone().normalize());
    mid.copy(top).add(peg).multiplyScalar(0.5);
    const g = new THREE.BoxGeometry(0.07, len, 0.07);
    g.applyMatrix4(new THREE.Matrix4().compose(mid, q, new THREE.Vector3(1, 1, 1)));
    parts.push(g);
    // estaca (pequeño taco en el suelo)
    const pegG = new THREE.BoxGeometry(0.16, 0.4, 0.16);
    pegG.translate(peg.x, 0.2, peg.z);
    parts.push(pegG);
  }
  return mergeGeometries(parts, false)!;
}

export function buildCamp(scene: THREE.Scene, plastic: PlasticMaterialFactory): CampBuild {
  const group = new THREE.Group();

  // --- Tienda de campaña (cono de 6 lados + remate), instanciada ---
  const tentGeo = mergeGeometries([
    normalizeGeometry(new THREE.CylinderGeometry(3.15, 3.5, 0.9, 6).translate(0, 0.45, 0)),  // falda/base
    normalizeGeometry(new THREE.CylinderGeometry(0.0, 3.2, 4.2, 6).translate(0, 2.3, 0)),    // lona
    normalizeGeometry(new THREE.CylinderGeometry(0.12, 0.12, 0.7, 5).translate(0, 4.5, 0))   // palo/remate
  ], false)!;
  // textura de LONA: paneles verticales (costuras) + trama sutil; casi blanca para
  // que el color por-instancia la tiña (cada tienda su tono).
  const clothTex = tentClothTexture();
  const tentMat = new THREE.MeshStandardMaterial({ map: clothTex, roughness: 0.95, metalness: 0 });
  const cloth = [0x9a9184, 0x8a7a5a, 0xb9a36f, 0x6f6558, 0xa8926a];
  const N = IS_MOBILE ? 34 : 70;
  const tents = new THREE.InstancedMesh(tentGeo, tentMat, N);
  tents.castShadow = true; tents.receiveShadow = true;

  // --- VIENTOS (cuerdas tensoras): 4 por tienda, misma transformación que la
  //     tienda (malla instanciada aparte, color cuerda) → toda tienda los lleva. ---
  const guyGeo = tentGuyRopesGeometry();
  const guyMat = new THREE.MeshStandardMaterial({ color: 0x6f5230, roughness: 1, metalness: 0 });
  const guyRopes = new THREE.InstancedMesh(guyGeo, guyMat, N);
  guyRopes.castShadow = true;

  const d = new THREE.Object3D();
  const col = new THREE.Color();
  let placed = 0;
  for (let i = 0; i < N; i++) {
    // repartidas por el campamento, dejando libre el pasillo central del jugador
    let x = (Math.random() - 0.5) * 82;
    if (Math.abs(x) < 9) x += Math.sign(x || 1) * 9;
    const z = 12 + Math.random() * 82;
    const s = 0.8 + Math.random() * 0.7;
    d.position.set(x, 0, z); d.rotation.set(0, Math.random() * Math.PI, 0); d.scale.setScalar(s);
    d.updateMatrix();
    tents.setMatrixAt(placed, d.matrix);
    guyRopes.setMatrixAt(placed, d.matrix);
    tents.setColorAt(placed, col.set(cloth[(Math.random() * cloth.length) | 0]));
    placed++;
  }
  tents.instanceMatrix.needsUpdate = true;
  guyRopes.instanceMatrix.needsUpdate = true;
  group.add(tents); group.add(guyRopes);

  // --- MAR DE TIENDAS lejano: un campo denso hacia los cerros (a los lados y al
  //     sur), más pequeño y desaturado → el campamento se extiende hasta el
  //     horizonte, como en la peli. Instanciado (barato), no pisa el valle norte.
  const M = IS_MOBILE ? 40 : 90;
  const farTents = new THREE.InstancedMesh(tentGeo, tentMat.clone(), M);
  farTents.receiveShadow = true;
  let fp = 0;
  for (let i = 0; i < M && fp < M; i++) {
    const a = Math.random() * Math.PI * 2;
    if (Math.sin(a) < -0.3) continue;                 // deja libre el norte (camino de la caravana)
    const r = 58 + Math.random() * 34;                // entre la zona jugable y los cerros
    const x = Math.cos(a) * r, z = 18 + Math.sin(a) * r;
    const s = 0.55 + Math.random() * 0.5;
    d.position.set(x, 0, z); d.rotation.set(0, Math.random() * Math.PI, 0); d.scale.setScalar(s);
    d.updateMatrix();
    farTents.setMatrixAt(fp, d.matrix);
    farTents.setColorAt(fp, col.set(cloth[(Math.random() * cloth.length) | 0]).multiplyScalar(0.94));
    fp++;
  }
  for (let i = fp; i < M; i++) { d.scale.setScalar(0); d.updateMatrix(); farTents.setMatrixAt(i, d.matrix); }
  farTents.instanceMatrix.needsUpdate = true;
  group.add(farTents);

  // --- Fogatas (piedras + llama emisiva; unas pocas con luz cálida) ---
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x6b6058, roughness: 1 });
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xffa64d });
  const emberMat = new THREE.MeshBasicMaterial({ color: 0xff6a2a });
  const fires: Array<[number, number]> = [[-14, 22], [16, 30], [-20, 50], [10, 60], [-6, 74], [22, 68]];
  fires.forEach(([fx, fz], i) => {
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      const st = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.5), stoneMat);
      st.position.set(fx + Math.cos(a) * 1.1, 0.2, fz + Math.sin(a) * 1.1); st.castShadow = true;
      group.add(st);
    }
    const ember = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 6), emberMat);
    ember.position.set(fx, 0.35, fz); group.add(ember);
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.6, 8), flameMat);
    flame.position.set(fx, 1.1, fz); group.add(flame);
  });
  // luces cálidas (limitadas para el móvil)
  const nLights = IS_MOBILE ? 3 : 6;
  for (let i = 0; i < nLights; i++) {
    const [fx, fz] = fires[i];
    const light = new THREE.PointLight(0xffa64d, 7, 26, 2);
    light.position.set(fx, 2.2, fz);
    group.add(light);
  }

  // --- Yehoshúa sobre una tarima, arengando (brazo en alto) ---
  const platform = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.6, 1.4, 16), plastic.get(0xb9a36f));
  platform.position.set(0, 0.7, 8); platform.castShadow = true; platform.receiveShadow = true;
  group.add(platform);
  const yoshua = createMinifigure(plastic, YOSHUA_SKIN);
  yoshua.root.position.set(0, 1.4, 8);
  yoshua.root.rotation.y = Math.PI; // de cara al campamento
  yoshua.armR.rotation.x = -2.2;    // brazo en alto
  group.add(yoshua.root);

  // --- Cestas con pan (ambiente) ---
  const wickerMat = plastic.get(0xc9a24a);
  for (const [bx, bz] of [[-4, 14], [4, 16], [-8, 26]] as Array<[number, number]>) {
    const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.55, 0.7, 12), wickerMat);
    basket.position.set(bx, 0.35, bz); basket.castShadow = true; group.add(basket);
    for (let k = 0; k < 3; k++) {
      const bread = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 6), plastic.get(0xd9a75a));
      bread.position.set(bx + (Math.random() - 0.5) * 0.5, 0.8, bz + (Math.random() - 0.5) * 0.5);
      group.add(bread);
    }
  }

  // --- Cuerdas enrolladas a recoger (OBJETIVO) ---
  const ropeMat = new THREE.MeshStandardMaterial({ color: 0xb98a4a, roughness: 0.8, emissive: 0x5a3a10, emissiveIntensity: 0.4 });
  const ropes: THREE.Mesh[] = [];
  for (const [rx, rz] of [[-10, 34], [12, 44], [-2, 56]] as Array<[number, number]>) {
    const rope = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.22, 8, 20), ropeMat.clone());
    rope.rotation.x = Math.PI / 2;
    rope.position.set(rx, 0.35, rz); rope.castShadow = true;
    group.add(rope);
    ropes.push(rope);
  }

  // --- Estandartes de las tribus (poste + bandera de color) ---
  const poleMat = plastic.get(0x5a4028);
  const flagColors = [0x2f6db0, 0xc0392b, 0x2e8b57, 0xe8b04b, 0x8e44ad, 0xd9702a];
  const bannerSpots: Array<[number, number]> = [[-8, 12], [8, 13], [-16, 24], [18, 26], [0, 40], [-24, 38]];
  bannerSpots.forEach(([bx, bz], i) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 6, 6), poleMat);
    pole.position.set(bx, 3, bz); pole.castShadow = true;
    const flag = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.1, 0.1), plastic.get(flagColors[i % flagColors.length]));
    flag.position.set(bx + 0.95, 5.2, bz); flag.castShadow = true;
    group.add(pole, flag);
  });

  // --- Alfombras de kilim tendidas (detalle: patrón tejido + esquinas levantadas) ---
  const rugSpots: Array<[number, number, number, number]> = [ // x, z, giro, paleta
    [-13, 22, 0.3, 0], [16, 30, -0.5, 1], [-8, 42, 0.8, 2], [12, 52, 0.15, 3],
    [-20, 52, -0.3, 0], [6, 15, 0.6, 1], [22, 44, -0.2, 2]
  ];
  for (const [rx, rz, rot, pi] of rugSpots) {
    const holder = new THREE.Group();
    holder.add(buildRug(4.2, 6.0, KILIM_PALS[pi]));
    holder.position.set(rx, 0, rz); holder.rotation.y = rot;
    group.add(holder);
  }

  // --- TABERNÁCULO (Mishkán): recinto de cortinas de lino + tienda sagrada ---
  const tab = new THREE.Group();
  const gold = new THREE.MeshStandardMaterial({ color: 0xd9ad3c, roughness: 0.35, metalness: 0.7 });
  const linen = plastic.get(0xf0ead6);
  const W = 13, D = 8, postH = 3.2;
  const post = (x: number, z: number): void => {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, postH, 6), plastic.get(0xcdb98a));
    p.position.set(x, postH / 2, z); p.castShadow = true; tab.add(p);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 6), gold);
    cap.position.set(x, postH, z); tab.add(cap);
  };
  const curtain = (x: number, z: number, w: number, horiz: boolean): void => {
    const geo = horiz ? new THREE.BoxGeometry(w, 2.2, 0.12) : new THREE.BoxGeometry(0.12, 2.2, w);
    const m = new THREE.Mesh(geo, linen); m.position.set(x, 1.5, z); m.castShadow = true; tab.add(m);
  };
  // perímetro: lados y fondo cerrados; frente (+z) con hueco de entrada
  for (let i = 0; i <= 6; i++) { const x = -W / 2 + (i * W) / 6; post(x, -D / 2); }
  for (let i = 0; i <= 4; i++) { const z = -D / 2 + (i * D) / 4; post(-W / 2, z); post(W / 2, z); }
  curtain(0, -D / 2, W, true);                       // fondo
  curtain(-W / 2, 0, D, false); curtain(W / 2, 0, D, false); // lados
  curtain(-W / 2 + 2.6, D / 2, 5.2, true); curtain(W / 2 - 2.6, D / 2, 5.2, true); // frente con hueco
  // cortina de entrada (azul/púrpura/carmesí del Mishkán)
  const gateColors = [0x2f5fb0, 0x7a3f9a, 0xb03a3a];
  gateColors.forEach((c, i) => {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.4, 0.1), plastic.get(c));
    s.position.set(-1.35 + i * 0.9, 1.5, D / 2); tab.add(s);
  });
  // tienda sagrada central (paredes con TAPIZ de patrón + techo dorado)
  const shrineMat = new THREE.MeshStandardMaterial({ map: kilimTexture(KILIM_PALS[1]), roughness: 0.9 });
  const shrine = new THREE.Mesh(new THREE.BoxGeometry(5.6, 3.6, 3.4), shrineMat);
  shrine.position.set(0, 2.1, -1.5); shrine.castShadow = true; shrine.receiveShadow = true; tab.add(shrine);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(6, 0.5, 3.8), gold);
  roof.position.set(0, 4.1, -1.5); roof.castShadow = true; tab.add(roof);
  tab.position.set(26, 0, 22); tab.rotation.y = -0.35;
  group.add(tab);

  // --- Bultos de carga para la caravana (mini-juego; ocultos hasta su beat) ---
  const bultos: THREE.Mesh[] = [];
  const bultoSpots: Array<[number, number]> = [[-6, 26], [15, 24], [-16, 36], [9, 48], [21, 40], [-11, 18]];
  bultoSpots.forEach(([bx, bz], i) => {
    const kind = i % 3;
    let mesh: THREE.Mesh;
    if (kind === 0) mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.72, 1.3, 10), plastic.get(0xb7b7c0));      // vasija de plata
    else if (kind === 1) mesh = new THREE.Mesh(new RoundedBoxGeometry(1.2, 1.0, 1.2, 2, 0.06), plastic.get(0x9a6a3a)); // caja de madera
    else { mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.7, 8), plastic.get(0xc0392b)); mesh.rotation.z = Math.PI / 2; } // alfombra enrollada
    mesh.position.set(bx, 0.7, bz); mesh.castShadow = true; mesh.visible = false;
    group.add(mesh); bultos.push(mesh);
  });

  scene.add(group);
  return { group, ropes, bultos, yehoshua: yoshua };
}
