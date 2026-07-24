import * as THREE from 'three';

/**
 * KIT DE HORIZONTE reutilizable — "mundo lleno, nunca vacío".
 *
 * Rellena el fondo de una escena en BLOQUES (cielo, niebla, cerros de arenisca,
 * fortaleza de Jericó, luna/estrellas, palmeras de encuadre) para que el muñeco
 * NUNCA parezca flotar en un descampado. Autocontenido: solo depende de THREE.
 *
 * USO (una línea por escena):
 *   import { buildHorizon } from '../world/Horizon';
 *   const horizon = buildHorizon(scene, 'desierto-atardecer');
 *   // ...al salir de la escena:
 *   horizon.dispose();
 *
 * Modos: 'desierto-atardecer' | 'desierto-noche' | 'rio-oasis' |
 *        'muralla-noche' | 'calle-noche'
 * (Los INTERIORES no usan esto: se visten con paredes/props.)
 */

export type HorizonMode =
  | 'desierto-atardecer'
  | 'desierto-noche'
  | 'rio-oasis'
  | 'muralla-noche'
  | 'calle-noche';

export interface HorizonOptions {
  jericho?: boolean;   // fortaleza de Jericó al fondo (por defecto según modo)
  palms?: boolean;     // palmeras de encuadre (por defecto true)
  fog?: boolean;       // niebla (por defecto true) — da profundidad y tapa el borde
}

export interface HorizonHandle {
  group: THREE.Group;
  dispose(): void;     // retira el grupo y limpia niebla/geometrías/materiales
}

const SAND = [0xc9b183, 0xbaa274, 0xd0ba8c, 0xa9906a];
const SANDSTONE = 0xdcc08a, SANDSTONE_D = 0xc2a56f;

function isNight(m: HorizonMode): boolean {
  return m === 'desierto-noche' || m === 'muralla-noche' || m === 'calle-noche';
}

function skyTexture(stops: Array<[number, string]>): THREE.Texture {
  const c = document.createElement('canvas'); c.width = 16; c.height = 256;
  const ctx = c.getContext('2d')!; const g = ctx.createLinearGradient(0, 0, 0, 256);
  for (const [o, col] of stops) g.addColorStop(o, col);
  ctx.fillStyle = g; ctx.fillRect(0, 0, 16, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/** Monta el horizonte y devuelve un handle con dispose(). */
export function buildHorizon(scene: THREE.Scene, mode: HorizonMode, opts: HorizonOptions = {}): HorizonHandle {
  const group = new THREE.Group(); group.name = 'horizon';
  const night = isNight(mode);

  const mat = (color: number, rough = 1): THREE.MeshStandardMaterial =>
    new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0 });
  const add = (geo: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, ry = 0): THREE.Mesh => {
    const mesh = new THREE.Mesh(geo, m); mesh.position.set(x, y, z); mesh.rotation.y = ry; mesh.castShadow = false; mesh.receiveShadow = true; group.add(mesh); return mesh;
  };

  // ---- CIELO + NIEBLA ----
  const sky = night
    ? skyTexture([[0, '#0e1a3e'], [0.55, '#22315e'], [0.85, '#4a5686'], [1, '#8a86a0']])
    : mode === 'rio-oasis'
      ? skyTexture([[0, '#20365f'], [0.5, '#5a6a8e'], [0.78, '#e6a463'], [1, '#f2cf9a']])
      : skyTexture([[0, '#213c73'], [0.5, '#5e6ea0'], [0.78, '#e6a866'], [1, '#f4d59a']]); // atardecer
  scene.background = sky;
  if (opts.fog !== false) scene.fog = new THREE.Fog(night ? 0x2a3860 : 0xe6b378, 55, 280);

  // ---- CERROS DE ARENISCA (mesetas + colinas) — no en calle-noche (los tapan los edificios) ----
  if (mode !== 'calle-noche') {
    for (let i = 0; i < 12; i++) {
      const ang = -Math.PI * 0.94 + (i / 11) * Math.PI * 0.88;
      const rad = 190 + (i % 3) * 30, h = 40 + (i % 4) * 18;
      const x = Math.cos(ang) * rad, z = -Math.abs(Math.sin(ang)) * rad - 40;
      const col = SAND[i % 4];
      if (i % 2 === 0) {
        const m = add(new THREE.CylinderGeometry(h * 0.62, h * 0.9, h, 7), mat(col), x, h / 2 - 6, z, i);
        m.add(new THREE.Mesh(new THREE.CylinderGeometry(h * 0.5, h * 0.62, h * 0.28, 7), mat(col)).translateY(h * 0.6));
      } else {
        const m = add(new THREE.SphereGeometry(h * 0.85, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(col), x, -4, z);
        m.scale.set(1, 0.6, 1);
      }
    }
  }

  // ---- LUNA + ESTRELLAS (modos de noche) ----
  if (night) {
    add(new THREE.SphereGeometry(6, 20, 14), new THREE.MeshBasicMaterial({ color: 0xf6f1dc, fog: false }), -46, 62, -150);
    const sp: number[] = [];
    for (let i = 0; i < 130; i++) sp.push((i * 53 % 460) - 230, 42 + (i * 31 % 90), -150 - (i * 17 % 60));
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    group.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xdfe6ff, size: 0.8, fog: false })));
  }

  // ---- FORTALEZA DE JERICÓ al fondo ----
  const wantJericho = opts.jericho ?? (mode === 'rio-oasis' || mode === 'muralla-noche' || mode === 'desierto-atardecer');
  if (wantJericho) {
    const close = mode === 'muralla-noche';
    const j = new THREE.Group(); j.position.set(6, 0, close ? -90 : -140); if (close) j.scale.setScalar(1.5);
    const WL = 120, WH = 22;
    j.add(new THREE.Mesh(new THREE.BoxGeometry(WL, WH, 6), mat(SANDSTONE)).translateY(WH / 2));
    for (let x = -WL / 2 + 3; x <= WL / 2 - 3; x += 7) j.add(new THREE.Mesh(new THREE.BoxGeometry(4, 4, 6.4), mat(SANDSTONE_D)).translateX(x).translateY(WH + 1.6));
    for (const tx of [-WL / 2, -18, 20, WL / 2]) { const th = WH + 12; j.add(new THREE.Mesh(new THREE.BoxGeometry(14, th, 14), mat(SANDSTONE)).translateX(tx).translateY(th / 2).translateZ(1)); }
    j.add(new THREE.Mesh(new THREE.BoxGeometry(12, 15, 3), mat(0x5a3f22)).translateY(7.5).translateZ(3.2)); // puerta
    group.add(j);
  }

  // ---- OASIS + AGUA (río) ----
  if (mode === 'rio-oasis') {
    const water = new THREE.Mesh(new THREE.PlaneGeometry(400, 60), new THREE.MeshStandardMaterial({ color: 0x2f6db0, roughness: 0.4, metalness: 0.1 }));
    water.rotation.x = -Math.PI / 2; water.position.set(0, 0.05, -70); group.add(water);
    for (let i = 0; i < 8; i++) { const rx = -60 + i * 16 + (i % 2) * 6; const r = new THREE.Mesh(new THREE.ConeGeometry(2.4, 7, 5), mat(0x3f7a46)); r.position.set(rx, 3, -44); group.add(r); }
  }

  // ---- PALMERAS de encuadre (cerca, a los lados) ----
  if (opts.palms !== false) {
    const palm = (x: number, z: number, s: number) => {
      const g = new THREE.Group();
      for (let k = 0; k < 6; k++) g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 2, 6), mat(0x7a5a34)).translateY(1 + k * 1.7));
      for (let f = 0; f < 5; f++) { const fr = new THREE.Mesh(new THREE.BoxGeometry(6, 0.5, 1.6), mat(night ? 0x2f6b3d : 0x3f7a46)); fr.rotation.y = (f / 5) * Math.PI * 2; fr.rotation.z = 0.35; fr.position.set(Math.cos(fr.rotation.y) * 2.6, 10.6, Math.sin(fr.rotation.y) * 2.6); g.add(fr); }
      g.position.set(x, 0, z); g.scale.setScalar(s); group.add(g);
    };
    palm(-22, -8, 1.2); palm(24, -16, 1.35);
  }

  scene.add(group);

  return {
    group,
    dispose(): void {
      scene.remove(group);
      group.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mm = (m as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mm)) mm.forEach((x) => x.dispose()); else if (mm) mm.dispose();
      });
      if (scene.fog) scene.fog = null;
    }
  };
}
