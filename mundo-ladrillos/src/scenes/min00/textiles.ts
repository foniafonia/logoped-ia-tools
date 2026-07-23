import * as THREE from 'three';

/**
 * Textiles de ladrillo con nivel de detalle "de verdad": alfombras de kilim y
 * telas con patrón dibujado (bordes en zigzag, campo de rombos, medallón,
 * flecos). Técnica de textura procedural inspirada en el escondite de la
 * alfombra del MUÑEQUERO (`rug-hide.ts`), generalizada con paleta variable.
 */
export interface KilimPal {
  bg: string; b1: string; b2: string; b3: string; rombo: string; oro: string;
}

export const KILIM_PALS: KilimPal[] = [
  { bg: '#e7d3a6', b1: '#9c3b2a', b2: '#caa14a', b3: '#2f6b5a', rombo: '#2f6b5a', oro: '#caa14a' }, // rojo/verde
  { bg: '#e7d3a6', b1: '#2f5fb0', b2: '#caa14a', b3: '#7a3f9a', rombo: '#2f5fb0', oro: '#d9ad3c' }, // azul/púrpura
  { bg: '#efe0c0', b1: '#a05a2c', b2: '#caa14a', b3: '#7a3b12', rombo: '#a05a2c', oro: '#d9ad3c' }, // terracota
  { bg: '#e3ddc8', b1: '#5a6b3a', b2: '#caa14a', b3: '#9c3b2a', rombo: '#5a6b3a', oro: '#caa14a' }  // oliva/rojo
];

/** Textura tejida de kilim (patrón dibujado en canvas). */
export function kilimTexture(pal: KilimPal): THREE.CanvasTexture {
  const c = document.createElement('canvas'); c.width = 256; c.height = 384;
  const x = c.getContext('2d')!;
  x.fillStyle = pal.bg; x.fillRect(0, 0, 256, 384);
  const border = (col: string, inset: number, w: number): void => {
    x.strokeStyle = col; x.lineWidth = w; x.strokeRect(inset, inset, 256 - inset * 2, 384 - inset * 2);
  };
  border(pal.b1, 10, 14); border(pal.b2, 26, 6); border(pal.b3, 36, 5);
  // campo de rombos con centro dorado
  for (let ry = 60; ry < 330; ry += 46) {
    for (let rx = 46; rx < 220; rx += 46) {
      x.fillStyle = ((rx + ry) % 92 === 0) ? pal.b1 : pal.rombo;
      x.beginPath(); x.moveTo(rx, ry - 16); x.lineTo(rx + 16, ry); x.lineTo(rx, ry + 16); x.lineTo(rx - 16, ry); x.closePath(); x.fill();
      x.fillStyle = pal.oro; x.fillRect(rx - 3, ry - 3, 6, 6);
    }
  }
  // medallón central (rombo doble)
  x.fillStyle = pal.b1; x.beginPath(); x.moveTo(128, 150); x.lineTo(180, 192); x.lineTo(128, 234); x.lineTo(76, 192); x.closePath(); x.fill();
  x.fillStyle = pal.bg; x.beginPath(); x.moveTo(128, 168); x.lineTo(160, 192); x.lineTo(128, 216); x.lineTo(96, 192); x.closePath(); x.fill();
  // flecos arriba y abajo
  x.strokeStyle = pal.b2; x.lineWidth = 3;
  for (let fx = 12; fx < 256; fx += 8) {
    x.beginPath(); x.moveTo(fx, 372); x.lineTo(fx, 384); x.stroke();
    x.beginPath(); x.moveTo(fx, 0); x.lineTo(fx, 12); x.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

/** Alfombra de kilim tendida en el suelo (con leve arruga en las esquinas). */
export function buildRug(w: number, h: number, pal: KilimPal): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(w, h, 8, 10);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i), py = pos.getY(i);
    const edge = Math.max(Math.abs(px) / (w / 2), Math.abs(py) / (h / 2));
    pos.setZ(i, Math.pow(edge, 3) * 0.18 + Math.sin(px * 3 + py * 2) * 0.02); // esquinas levantadas
  }
  geo.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({ map: kilimTexture(pal), roughness: 0.95, side: THREE.DoubleSide });
  const rug = new THREE.Mesh(geo, mat);
  rug.rotation.x = -Math.PI / 2; rug.position.y = 0.03; rug.receiveShadow = true;
  return rug;
}
