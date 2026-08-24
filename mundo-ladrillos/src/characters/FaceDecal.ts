import * as THREE from 'three';
import type { Emotion } from './MinifigureFactory';

/**
 * Texturas PINTADAS para clavar el acabado de un muñeco real: la cara de una
 * minifigura no es geometría, es una calcomanía impresa; y la barba de pelo son
 * hebras veteadas, no bultos. Aquí se dibujan con canvas 2D y se devuelven como
 * texturas, que es la única forma de conseguir ese acabado sin mallas esculpidas.
 * Todo procedural y determinista → cero peticiones de red, estable en resume.
 */

/** PRNG determinista (sin Math.random: estable entre recargas). */
function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d')!;
  draw(g);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/* ------------------------------------------------------------------ *
 * CARA IMPRESA
 * Se pinta sobre una "placa" curva que envuelve el frente de la cabeza.
 * Lienzo 640×480 ≈ proporción del arco frontal (126°) por la altura.
 * ------------------------------------------------------------------ */

/** Parámetros de expresión: inclinación y altura de las cejas, y forma de boca. */
function browTilt(e: Emotion): { tilt: number; lift: number } {
  const tilt: Record<string, number> = {
    neutral: 0.10, stern: 0.30, worried: 0.22, happy: -0.10, surprised: -0.08,
    alert: 0.22, angry: 0.42, sad: -0.30, scared: -0.14, sly: 0.12, joyful: -0.12,
    awe: -0.16, determined: 0.36
  };
  const lift: Record<string, number> = {
    neutral: 0, stern: -4, worried: -2, happy: 0, surprised: 14, alert: 6,
    angry: -6, sad: 4, scared: 16, sly: 2, joyful: 2, awe: 14, determined: -5
  };
  return { tilt: tilt[e] ?? 0.1, lift: lift[e] ?? 0 };
}

/**
 * Cara impresa de anciano: ojos negros ovalados pequeños con reflejo, cejas
 * gruesas café oscuro inclinadas hacia el centro, ceño vertical, líneas de edad
 * y boca pequeña entreabierta. Fondo TRANSPARENTE (la cabeza aporta el amarillo).
 */
export function makeElderFaceTexture(emotion: Emotion): THREE.CanvasTexture {
  return canvasTex(640, 480, (g) => {
    g.clearRect(0, 0, 640, 480);
    const { tilt, lift } = browTilt(emotion);
    const EYE_Y = 209, BROW_Y = 146 + lift, CX = 320, DX = 102;

    // --- Cejas gruesas, con extremo interior más bajo (mirada severa) ---
    const brow = (sx: number): void => {
      const inner = CX + sx * 42, outer = CX + sx * 158;
      g.save();
      g.strokeStyle = '#4a3520';
      g.lineCap = 'round';
      g.lineWidth = 26;
      g.beginPath();
      g.moveTo(inner, BROW_Y + tilt * 62);
      g.quadraticCurveTo((inner + outer) / 2, BROW_Y - 14 + tilt * 18, outer, BROW_Y + 2);
      g.stroke();
      // pelillos: unas cerdas finas para que no lea como una barra lisa
      const r = rng(sx > 0 ? 77 : 31);
      g.lineWidth = 3; g.strokeStyle = 'rgba(40,28,16,.75)';
      for (let i = 0; i < 26; i++) {
        const t = r();
        const x = inner + (outer - inner) * t;
        const y = BROW_Y + tilt * 62 * (1 - t) - 10 * Math.sin(t * Math.PI) + (r() - 0.5) * 6;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + sx * 8, y - 12 - r() * 8); g.stroke();
      }
      g.restore();
    };
    brow(-1); brow(1);

    // --- Ceño: línea vertical corta entre las cejas ---
    g.strokeStyle = 'rgba(150,110,50,.55)'; g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(CX, BROW_Y + 26); g.lineTo(CX - 2, BROW_Y + 58); g.stroke();

    // --- Ojos: óvalos negros pequeños con reflejo blanco redondo ---
    for (const sx of [-1, 1]) {
      const ex = CX + sx * DX;
      g.fillStyle = '#120d08';
      g.beginPath(); g.ellipse(ex, EYE_Y, 24, 29, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#ffffff';
      g.beginPath(); g.arc(ex - 8, EYE_Y - 9, 8, 0, Math.PI * 2); g.fill();
      // párpado superior: sombra fina que da edad
      g.strokeStyle = 'rgba(90,62,30,.5)'; g.lineWidth = 6; g.lineCap = 'round';
      g.beginPath(); g.arc(ex, EYE_Y + 2, 30, Math.PI * 1.12, Math.PI * 1.88); g.stroke();
    }

    // --- Líneas de edad en las mejillas (discretas) ---
    g.strokeStyle = 'rgba(150,110,50,.42)'; g.lineWidth = 5;
    for (const sx of [-1, 1]) {
      g.beginPath();
      g.moveTo(CX + sx * 176, EYE_Y + 54);
      g.quadraticCurveTo(CX + sx * 190, EYE_Y + 96, CX + sx * 168, EYE_Y + 128);
      g.stroke();
    }

    // --- Boca pequeña entreabierta (queda bajo el bigote) ---
    const MY = 344;
    g.fillStyle = '#5d3218';
    g.beginPath(); g.ellipse(CX, MY, 40, 20, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#8a4d27';
    g.beginPath(); g.ellipse(CX, MY + 12, 34, 9, 0, 0, Math.PI * 2); g.fill();
  });
}

/* ------------------------------------------------------------------ *
 * BARBA DE PELO (hebras veteadas)
 * ------------------------------------------------------------------ */

/**
 * Textura de barba: base gris plateada con miles de hebras finas en varios
 * grises (frío, cálido y oscuro) que corren a lo largo de la barba. Es lo que
 * da el aspecto de PELO en vez de plástico liso.
 */
export function makeBeardTexture(): THREE.CanvasTexture {
  return canvasTex(512, 512, (g) => {
    g.fillStyle = '#c2c7cc'; g.fillRect(0, 0, 512, 512);
    const tones = ['#d7dade', '#b3b8bd', '#9aa0a6', '#c8c1b4', '#8d9298', '#e2e4e6'];
    const r = rng(20260824);
    // Mechones anchos que agrupan el pelo (veteado en bandas suaves)
    for (let i = 0; i < 90; i++) {
      const x = r() * 512;
      g.strokeStyle = tones[(i * 7) % tones.length] + '';
      g.globalAlpha = 0.35;
      g.lineWidth = 12 + r() * 26;
      g.beginPath();
      g.moveTo(x, -20);
      g.bezierCurveTo(x + (r() - 0.5) * 60, 170, x + (r() - 0.5) * 80, 340, x + (r() - 0.5) * 50, 532);
      g.stroke();
    }
    // Hebras finas: el detalle que lee como pelo
    g.globalAlpha = 1;
    for (let i = 0; i < 2600; i++) {
      const x = r() * 512, len = 90 + r() * 300, y0 = -30 + r() * 400;
      g.strokeStyle = tones[Math.floor(r() * tones.length)];
      g.globalAlpha = 0.25 + r() * 0.5;
      g.lineWidth = 0.8 + r() * 1.8;
      g.beginPath();
      g.moveTo(x, y0);
      g.quadraticCurveTo(x + (r() - 0.5) * 26, y0 + len * 0.5, x + (r() - 0.5) * 34, y0 + len);
      g.stroke();
    }
    g.globalAlpha = 1;
  });
}

/* ------------------------------------------------------------------ *
 * BORDADO DEL GORRO
 * ------------------------------------------------------------------ */

/** Banda de bordado: hilo plateado en zigzag y puntadas sobre tela azul. */
export function makeEmbroideryTexture(cloth = '#1c2e5a', thread = '#e6eaee'): THREE.CanvasTexture {
  const t = canvasTex(1024, 256, (g) => {
    g.fillStyle = cloth; g.fillRect(0, 0, 1024, 256);
    // dos hilos rectos que enmarcan la banda
    g.strokeStyle = thread; g.lineWidth = 10; g.globalAlpha = 1;
    for (const y of [40, 216]) { g.beginPath(); g.moveTo(0, y); g.lineTo(1024, y); g.stroke(); }
    // zigzag central continuo
    g.lineWidth = 11; g.lineJoin = 'round';
    g.beginPath();
    for (let i = 0; i <= 32; i++) {
      const x = (i / 32) * 1024, y = i % 2 ? 96 : 160;
      i === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
    }
    g.stroke();
    // rombos entre picos (motivo angular tipo montañas)
    g.lineWidth = 5; g.globalAlpha = 0.85;
    for (let i = 0; i < 16; i++) {
      const cx = (i + 0.5) / 16 * 1024;
      g.beginPath();
      g.moveTo(cx - 20, 128); g.lineTo(cx, 108); g.lineTo(cx + 20, 128); g.lineTo(cx, 148);
      g.closePath(); g.stroke();
    }
    // puntadas cortas sobre los hilos rectos
    g.lineWidth = 4; g.globalAlpha = 0.7;
    for (let i = 0; i < 64; i++) {
      const x = (i / 64) * 1024;
      for (const y of [40, 216]) { g.beginPath(); g.moveTo(x, y - 9); g.lineTo(x + 10, y + 9); g.stroke(); }
    }
    g.globalAlpha = 1;
  });
  t.wrapS = THREE.RepeatWrapping;
  return t;
}
