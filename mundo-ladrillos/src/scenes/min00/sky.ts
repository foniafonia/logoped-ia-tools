import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { IS_MOBILE } from '../../core/Quality';

/**
 * CIELO del valle: telón de fondo pintado (montañas/mesetas con perspectiva
 * aérea + cielo cálido) + NUBES de juguete que derivan. Da la profundidad de la
 * peli sin romper el mundo cerrado: el telón va detrás de todo (fog:false, es
 * "el infinito"), la bruma funde los cerros 3D contra él, y las nubes dan
 * parallax. Barato: el telón es 1 draw call; las nubes, pocas piezas.
 */

/** Textura del telón: cielo + 3 capas de mesetas a la ALTURA DEL HORIZONTE. */
function backdropTexture(): THREE.CanvasTexture {
  const W = 2048, H = 512;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d')!;
  const HORIZ = H * 0.72;   // línea de horizonte dentro del lienzo (mapeada a y≈0 en 3D)

  // --- cielo (arriba claro → horizonte cálido) ---
  const sky = ctx.createLinearGradient(0, 0, 0, HORIZ);
  sky.addColorStop(0, '#f2e0b0');
  sky.addColorStop(0.5, '#f6e6b6');
  sky.addColorStop(0.85, '#f7dfa0');
  sky.addColorStop(1, '#f6dc94');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, HORIZ + 4);
  // franja cálida bajo el horizonte (por si asoma; se funde con el suelo/bruma)
  ctx.fillStyle = '#eccf86'; ctx.fillRect(0, HORIZ, W, H - HORIZ);

  // --- nubes pintadas MUY sutiles (las de verdad son 3D; estas solo dan textura) ---
  ctx.globalAlpha = 0.28;
  for (let i = 0; i < 6; i++) {
    const cx = Math.random() * W, cy = 40 + Math.random() * (HORIZ - 180), r = 20 + Math.random() * 34;
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grd.addColorStop(0, 'rgba(255,255,255,.85)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grd;
    for (let k = 0; k < 4; k++) ctx.fillRect(cx - r + k * r * 0.5 - r * 0.5, cy - r * 0.5, r * 1.3, r);
  }
  ctx.globalAlpha = 1;

  // --- mesetas de cima plana en el horizonte (capas con perspectiva aérea:
  //     lejana clara → cercana oscura). Siluetas MARCADAS: cima plana nítida,
  //     estrato horizontal y sombra lateral para que lean como mesetas. ---
  const mesaBand = (baseY: number, tones: string[], minH: number, maxH: number, step: number, strata: boolean): void => {
    let x = -70;
    while (x < W + 70) {
      const w = 90 + Math.random() * 170;
      const h = minH + Math.random() * (maxH - minH);
      const top = baseY - h;
      const shoulder = 4 + Math.random() * 7;    // hombro corto → cima bien plana
      const tone = tones[(Math.random() * tones.length) | 0];
      ctx.fillStyle = tone;
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.lineTo(x + shoulder, top + 2);
      ctx.lineTo(x + w - shoulder, top + 2);   // cima plana (misma altura)
      ctx.lineTo(x + w, baseY);
      ctx.closePath(); ctx.fill();
      // cara sombreada (ladera derecha) → volumen
      ctx.fillStyle = 'rgba(60,44,20,.16)';
      ctx.beginPath();
      ctx.moveTo(x + w * 0.6, top + 3); ctx.lineTo(x + w - shoulder, top + 2);
      ctx.lineTo(x + w, baseY); ctx.lineTo(x + w * 0.72, baseY); ctx.closePath(); ctx.fill();
      // estrato horizontal (línea de roca)
      if (strata) {
        ctx.strokeStyle = 'rgba(70,50,24,.18)'; ctx.lineWidth = 2;
        const sy = top + h * (0.4 + Math.random() * 0.25);
        ctx.beginPath(); ctx.moveTo(x + shoulder, sy); ctx.lineTo(x + w - shoulder, sy); ctx.stroke();
      }
      x += w * step - Math.random() * 22;
    }
  };
  // capa lejana (perspectiva aérea: desaturada, sin estrato)
  mesaBand(HORIZ - 2, ['#d8c592', '#d2bd88', '#dccb9a'], 60, 120, 0.54, false);
  // capa media (estrato visible)
  mesaBand(HORIZ + 8, ['#bda169', '#b0955f', '#c3a970'], 90, 175, 0.60, true);
  // capa cercana (silueta oscura y marcada) — se funde con los cerros 3D
  mesaBand(HORIZ + 22, ['#9c8050', '#8f7647', '#a68b58'], 78, 150, 0.64, true);

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = false;              // nítido (sin desenfoque de mip)
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

export interface SkyBuild {
  update: (dt: number, nightF: number) => void;
}

export function buildSky(scene: THREE.Scene): SkyBuild {
  const g = new THREE.Group();

  // ---------- telón de fondo (cilindro pintado, "el infinito") ----------
  const backMat = new THREE.MeshBasicMaterial({
    map: backdropTexture(), side: THREE.BackSide, fog: false, depthWrite: false
  });
  // altura/posición calculadas para que la línea de horizonte pintada (v≈0.28)
  // caiga en y≈0 (el suelo del valle) → las montañas asoman DETRÁS de los cerros.
  const backdrop = new THREE.Mesh(new THREE.CylinderGeometry(250, 250, 180, 64, 1, true), backMat);
  backdrop.position.set(0, 40, 18);
  backdrop.rotation.y = Math.PI;   // costura del textil hacia el norte (fuera de vista habitual)
  backdrop.renderOrder = -1;
  g.add(backdrop);

  // ---------- nubes de juguete (racimos de bloques redondeados) ----------
  const cloudMat = new THREE.MeshStandardMaterial({ color: 0xfdf7ec, roughness: 1, metalness: 0, fog: false });
  const puff = new RoundedBoxGeometry(1, 1, 1, 3, 0.42);
  const clouds: THREE.Group[] = [];
  const N = IS_MOBILE ? 8 : 15;
  for (let i = 0; i < N; i++) {
    const cloud = new THREE.Group();
    const lumps = 4 + ((Math.random() * 4) | 0);
    for (let k = 0; k < lumps; k++) {
      const w = 8 + Math.random() * 12, h = w * (0.42 + Math.random() * 0.2);
      const m = new THREE.Mesh(puff, cloudMat);
      m.position.set((k - lumps / 2) * (w * 0.55), (Math.random() - 0.5) * h * 0.5, (Math.random() - 0.5) * 6);
      m.scale.set(w, h, w * 0.8);
      cloud.add(m);
    }
    const a = Math.random() * Math.PI * 2;
    const r = 46 + Math.random() * 78;
    cloud.position.set(Math.cos(a) * r, 30 + Math.random() * 22, 18 + Math.sin(a) * r);
    cloud.userData.speed = 0.6 + Math.random() * 0.9;
    clouds.push(cloud); g.add(cloud);
  }

  scene.add(g);

  const nightTint = new THREE.Color(0x2a3355);
  const dayWhite = new THREE.Color(0xffffff);
  const cloudDay = new THREE.Color(0xfdf7ec);
  const tmp = new THREE.Color();
  return {
    update: (dt: number, nightF: number): void => {
      // deriva de nubes (envuelven el valle)
      for (const cl of clouds) {
        cl.position.x += cl.userData.speed * dt;
        if (cl.position.x > 190) cl.position.x = -190;
      }
      // oscurecer telón + nubes al caer la noche
      backMat.color.copy(dayWhite).lerp(nightTint, nightF);
      (cloudMat.color as THREE.Color).copy(cloudDay).lerp(tmp.copy(nightTint), nightF);
    }
  };
}
