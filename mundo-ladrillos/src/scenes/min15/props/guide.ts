import * as THREE from 'three';

/**
 * BALIZA DE GUÍA para que el niño sepa SIEMPRE a dónde ir y qué pulsar.
 * (Mismo espíritu que el `NavBeacon` del tramo 5–10: aro en el suelo + flecha
 * que bota; DORADA cuando ahí se pulsa E.) Es un helper de UI de mi carpeta;
 * cuando el LEAD publique una baliza compartida, se sustituye por esa.
 *
 *  - color por defecto CIAN = "ve hasta aquí".
 *  - `action: true` la pinta DORADA = "aquí se pulsa E".
 */
export class GuideBeacon {
  readonly group = new THREE.Group();
  private ring: THREE.Mesh;
  private arrow: THREE.Mesh;
  private ringMat: THREE.MeshBasicMaterial;
  private arrowMat: THREE.MeshBasicMaterial;

  constructor(x: number, z: number, opts: { action?: boolean; y?: number } = {}) {
    const col = opts.action ? 0xffd24a : 0x7fe9ff;
    this.ringMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.85, depthWrite: false });
    this.arrowMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.95, depthWrite: false });
    this.ring = new THREE.Mesh(new THREE.RingGeometry(1.5, 2.0, 32), this.ringMat);
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.position.set(0, 0.06, 0);
    // flecha (cono apuntando hacia abajo) que bota sobre el aro
    this.arrow = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.3, 5), this.arrowMat);
    this.arrow.rotation.x = Math.PI; // punta hacia abajo
    this.arrow.position.set(0, 4, 0);
    this.group.add(this.ring, this.arrow);
    this.group.position.set(x, opts.y ?? 0, z);
  }

  setPos(x: number, z: number, y = 0): void { this.group.position.set(x, y, z); }
  setColor(action: boolean): void {
    const col = action ? 0xffd24a : 0x7fe9ff;
    this.ringMat.color.setHex(col); this.arrowMat.color.setHex(col);
  }
  set visible(v: boolean) { this.group.visible = v; }
  get visible(): boolean { return this.group.visible; }

  update(t: number): void {
    this.arrow.position.y = 3.6 + Math.sin(t * 3) * 0.5;
    this.arrow.rotation.y = t * 1.6;
    const pulse = 0.7 + Math.sin(t * 3) * 0.18;
    this.ringMat.opacity = pulse;
    this.ring.scale.setScalar(1 + Math.sin(t * 3) * 0.06);
  }

  dispose(): void {
    this.ring.geometry.dispose(); this.arrow.geometry.dispose();
    this.ringMat.dispose(); this.arrowMat.dispose();
  }
}

/**
 * Bocadillo de diálogo (sprite). STOPGAP hasta que exista el helper COMPARTIDO
 * `ctx.say` del LEAD; sigue el mismo patrón que ya usa el tramo 10–15
 * (escena21_pacto) para no inventar un sistema distinto. Fácil de sustituir.
 */
export function makeBubble(text: string, opts: { w?: number } = {}): THREE.Sprite {
  const c = document.createElement('canvas'); c.width = 512; c.height = 160;
  const x = c.getContext('2d')!;
  x.fillStyle = 'rgba(255,255,255,.94)';
  roundRect(x, 8, 8, 496, 120, 26); x.fill();
  x.strokeStyle = 'rgba(232,176,75,.9)'; x.lineWidth = 4; x.stroke();
  x.fillStyle = '#1a1208'; x.font = 'bold 40px Georgia, serif';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  wrapText(x, text, 256, 68, 460, 46);
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false }));
  const w = opts.w ?? 6.4; spr.scale.set(w, w * 0.31, 1);
  return spr;
}

function wrapText(x: CanvasRenderingContext2D, text: string, cx: number, cy: number, maxW: number, lh: number): void {
  const words = text.split(' '); const lines: string[] = []; let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (x.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  const startY = cy - ((lines.length - 1) * lh) / 2;
  lines.forEach((l, i) => x.fillText(l, cx, startY + i * lh));
}

function roundRect(x: CanvasRenderingContext2D, px: number, py: number, w: number, h: number, r: number): void {
  x.beginPath(); x.moveTo(px + r, py); x.arcTo(px + w, py, px + w, py + h, r); x.arcTo(px + w, py + h, px, py + h, r);
  x.arcTo(px, py + h, px, py, r); x.arcTo(px, py, px + w, py, r); x.closePath();
}
