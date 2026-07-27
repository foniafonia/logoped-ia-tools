import * as THREE from 'three';
import { PlasticMaterialFactory } from '../../../materials/PlasticMaterialFactory';
import { BrickPalette } from '../../../materials/BrickPalette';
import { BRICK_HEIGHT } from '../../../bricks/BrickDimensions';
import { brickBox } from './BrickProps';

/**
 * Ambiente NOCTURNO cálido, calcado de `referencias/escenas/jerico-noche`:
 * noche azul con luna creciente y estrellas, pero la arquitectura iluminada por
 * MUCHOS faroles colgantes y braseros (acogedor y legible, no negro).
 */

/** Farol colgante de ladrillo con luz puntual cálida y llama parpadeante. */
export function buildLantern(
  plastic: PlasticMaterialFactory, x = 0, y = 5, z = 0, hangFrom?: number
): { group: THREE.Group; update: (t: number) => void } {
  const g = new THREE.Group();
  // brazo/soporte si cuelga de una pared (hangFrom = altura del anclaje)
  if (hangFrom !== undefined) {
    g.add(brickBox(plastic, 0.25, 0.25, 1.4, BrickPalette.DARK_GRAY, 0, hangFrom, -0.7));
    g.add(brickBox(plastic, 0.12, hangFrom - y, 0.12, BrickPalette.DARK_GRAY, 0, (hangFrom + y) / 2, -0.05));
  }
  // caja del farol (marco metálico + cristal ámbar emisivo)
  const frame = plastic.get(BrickPalette.DARK_GRAY);
  for (const [ax, az] of [[-0.32, -0.32], [0.32, -0.32], [-0.32, 0.32], [0.32, 0.32]] as const) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.0, 0.09), frame);
    post.position.set(ax, y, az); g.add(post);
  }
  g.add(brickBox(plastic, 0.85, 0.16, 0.85, BrickPalette.DARK_GRAY, 0, y + 0.55, 0));
  const capMesh = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.5, 4), frame);
  capMesh.position.set(0, y + 0.85, 0); capMesh.rotation.y = Math.PI / 4; g.add(capMesh);
  const glassMat = new THREE.MeshStandardMaterial({ color: 0xffcf7a, emissive: 0xffab45, emissiveIntensity: 1.4, transparent: true, opacity: 0.9 });
  const glass = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 0.5), glassMat);
  glass.position.set(0, y, 0); g.add(glass);
  const light = new THREE.PointLight(0xffb257, 3.2, 22, 1.7);
  light.position.set(0, y, 0); g.add(light);
  return {
    group: g,
    update: (t: number) => {
      const f = 0.88 + Math.sin(t * 12 + x * 3) * 0.08 + Math.sin(t * 27 + z) * 0.04;
      light.intensity = 3.2 * f;
      glassMat.emissiveIntensity = 1.4 * f;
    }
  };
}

/** Brasero de pared (pebetero con fuego), como los de la muralla de noche. */
export function buildBrazier(
  plastic: PlasticMaterialFactory, x = 0, y = 8, z = 0
): { group: THREE.Group; update: (t: number) => void } {
  const g = new THREE.Group();
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.4, 0.7, 12), plastic.get(BrickPalette.DARK_GRAY));
  bowl.position.set(x, y, z); bowl.castShadow = true; g.add(bowl);
  g.add(brickBox(plastic, 0.3, 1.4, 0.3, BrickPalette.DARK_GRAY, x, y - 0.9, z)); // pie
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xffb347 });
  const flames: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const fl = new THREE.Mesh(new THREE.ConeGeometry(0.4 - i * 0.1, 1.3 - i * 0.2, 7), flameMat);
    fl.position.set(x + (i - 1) * 0.22, y + 0.7 + i * 0.15, z); g.add(fl); flames.push(fl);
  }
  const light = new THREE.PointLight(0xff9a40, 4.0, 26, 1.6);
  light.position.set(x, y + 1.1, z); g.add(light);
  return {
    group: g,
    update: (t: number) => {
      const f = 0.85 + Math.sin(t * 10 + x) * 0.1 + Math.sin(t * 21 + z) * 0.05;
      light.intensity = 4.0 * f;
      flames.forEach((fl, i) => fl.scale.set(0.9 + f * 0.2, f * (1 + i * 0.1), 0.9 + f * 0.2));
    }
  };
}

/** Estandarte/banderola colgante (color a elegir) para dar vida a los muros. */
export function buildBanner(plastic: PlasticMaterialFactory, color: number, w = 1.6, h = 4): THREE.Group {
  const g = new THREE.Group();
  g.add(brickBox(plastic, w + 0.4, 0.3, 0.3, BrickPalette.DARK_BROWN, 0, h, 0)); // barra
  const cloth = brickBox(plastic, w, h, 0.12, color, 0, h / 2, 0.02);
  g.add(cloth);
  // fleco inferior (triángulos)
  for (const sx of [-w / 3, 0, w / 3]) g.add(brickBox(plastic, w / 3.2, 0.5, 0.12, color, sx, -0.2, 0.02));
  // emblema claro
  g.add(brickBox(plastic, w * 0.5, w * 0.5, 0.14, BrickPalette.WARM_SAND, 0, h * 0.6, 0.05));
  return g;
}

/**
 * Puerta ARQUEADA de ladrillo (arco de medio punto con dovelas + clave), estilo
 * de los portales de Jericó. Con dos hojas de madera opcionales que se abren.
 */
export function buildArchGate(
  plastic: PlasticMaterialFactory, widthStuds = 8, pierH = 9
): { group: THREE.Group; setOpen: (k: number) => void } {
  const g = new THREE.Group();
  const half = widthStuds / 2;
  const pierW = 3;
  // pilares
  for (const side of [-1, 1]) {
    for (let c = 0; c < pierH; c++) {
      const y = 0.6 + c * BRICK_HEIGHT;
      g.add(brickBox(plastic, pierW, BRICK_HEIGHT, 3, c % 2 ? BrickPalette.SAND : BrickPalette.DARK_SAND, side * (half + pierW / 2), y, 0));
    }
  }
  // arco de dovelas
  const springY = 0.6 + pierH * BRICK_HEIGHT;
  const R = half + 0.5;
  const N = 11;
  for (let i = 0; i <= N; i++) {
    const a = Math.PI * (i / N);
    const vx = -Math.cos(a) * R;
    const vy = springY + Math.sin(a) * R;
    const dov = brickBox(plastic, 1.0, 1.3, 3.2, i === Math.round(N / 2) ? BrickPalette.WARM_SAND : BrickPalette.DARK_SAND, vx, vy, 0);
    dov.rotation.z = a - Math.PI / 2;
    g.add(dov);
  }
  // almenas sobre el arco
  for (let x = -half - pierW / 2; x <= half + pierW / 2; x += 2) {
    g.add(brickBox(plastic, 1.3, BRICK_HEIGHT, 1.4, BrickPalette.WARM_SAND, x, springY + R + 0.6, 0));
  }
  // dos hojas de madera articuladas
  const doors: { leaf: THREE.Group; side: number }[] = [];
  const leafW = half - 0.15;
  const leafH = springY - 0.4;
  for (const side of [-1, 1]) {
    const leaf = new THREE.Group();
    leaf.position.set(side * half, 0, 0);
    leaf.add(brickBox(plastic, leafW, leafH, 0.5, BrickPalette.DARK_BROWN, -side * (leafW / 2), leafH / 2 + 0.4, 0));
    for (let i = 0; i < 3; i++) leaf.add(brickBox(plastic, leafW - 0.4, 0.3, 0.62, BrickPalette.BROWN, -side * (leafW / 2), 1.5 + i * 3, 0.05));
    g.add(leaf); doors.push({ leaf, side });
  }
  const setOpen = (k: number): void => { for (const { leaf, side } of doors) leaf.rotation.y = -side * k * 1.7; };
  setOpen(0);
  return { group: g, setOpen };
}

/**
 * Cielo nocturno: domo azul con degradado + luna creciente + estrellas. Devuelve
 * la malla del domo (para añadir a la escena) y un grupo de estrellas.
 */
export function buildNightSky(): THREE.Group {
  const g = new THREE.Group();
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(340, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false,
      uniforms: { top: { value: new THREE.Color(0x060b18) }, mid: { value: new THREE.Color(0x14233f) }, bot: { value: new THREE.Color(0x2a3c5c) } },
      vertexShader: `varying float h; void main(){ vec4 wp = modelMatrix*vec4(position,1.0); h = normalize(wp.xyz).y; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
      fragmentShader: `varying float h; uniform vec3 top; uniform vec3 mid; uniform vec3 bot; void main(){ float t=clamp(h,0.0,1.0); vec3 c = mix(mix(bot,mid,smoothstep(0.0,0.35,t)), top, smoothstep(0.3,1.0,t)); gl_FragColor=vec4(c,1.0);} `
    })
  );
  g.add(sky);
  // estrellas (puntos)
  const starGeo = new THREE.BufferGeometry();
  const N = 420; const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    // distribución en la cúpula (y>0)
    const u = i * 0.61803398875; const az = u * Math.PI * 2;
    const el = 0.12 + (((i * 733) % 1000) / 1000) * 1.35;
    const rr = 300;
    pos[i * 3] = Math.cos(az) * Math.cos(el) * rr;
    pos[i * 3 + 1] = Math.sin(el) * rr;
    pos[i * 3 + 2] = Math.sin(az) * Math.cos(el) * rr;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xdfe8ff, size: 1.6, sizeAttenuation: true, transparent: true, opacity: 0.9 }));
  g.add(stars);
  // luna creciente (disco claro + disco oscuro desplazado)
  const moon = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CircleGeometry(11, 32), new THREE.MeshBasicMaterial({ color: 0xf3ecd0 }));
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(10, 32), new THREE.MeshBasicMaterial({ color: 0x14233f }));
  shadow.position.set(4.5, 1.5, 0.1); moon.add(disc, shadow);
  moon.position.set(-150, 150, -240); moon.lookAt(0, 40, 0);
  g.add(moon);
  return g;
}

/** Textura de calle empedrada (adoquines redondeados), para el suelo urbano. */
export function cobbleTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d')!;
  x.fillStyle = '#5a5148'; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 90; i++) {
    const cx = Math.random() * 256, cy = Math.random() * 256, r = 8 + Math.random() * 10;
    const tone = 90 + Math.floor(Math.random() * 50);
    const g = x.createRadialGradient(cx - 3, cy - 3, 1, cx, cy, r);
    g.addColorStop(0, `rgb(${tone + 30},${tone + 22},${tone + 8})`);
    g.addColorStop(1, `rgb(${tone - 20},${tone - 26},${tone - 34})`);
    x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill();
    x.strokeStyle = 'rgba(30,24,16,.5)'; x.lineWidth = 2; x.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
  return t;
}
