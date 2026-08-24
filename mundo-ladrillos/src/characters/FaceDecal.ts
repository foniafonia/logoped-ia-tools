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

    // --- Ojos: óvalos negros con párpado, reflejo y ojera (mirada de anciano) ---
    for (const sx of [-1, 1]) {
      const ex = CX + sx * DX;
      // cuenca: sombra suave alrededor para hundir el ojo
      const soc = g.createRadialGradient(ex, EYE_Y, 6, ex, EYE_Y, 52);
      soc.addColorStop(0, 'rgba(150,105,40,.34)');
      soc.addColorStop(1, 'rgba(150,105,40,0)');
      g.fillStyle = soc;
      g.beginPath(); g.ellipse(ex, EYE_Y, 52, 44, 0, 0, Math.PI * 2); g.fill();
      // globo: óvalo negro algo mayor y más definido
      g.fillStyle = '#0d0a07';
      g.beginPath(); g.ellipse(ex, EYE_Y, 26, 32, 0, 0, Math.PI * 2); g.fill();
      // reflejo principal (arriba-izquierda) + chispa secundaria abajo
      g.fillStyle = '#ffffff';
      g.beginPath(); g.arc(ex - 9, EYE_Y - 11, 8.5, 0, Math.PI * 2); g.fill();
      g.globalAlpha = 0.5;
      g.beginPath(); g.arc(ex + 8, EYE_Y + 12, 4, 0, Math.PI * 2); g.fill();
      g.globalAlpha = 1;
      // párpado superior grueso que pisa el globo (da peso a la mirada)
      g.strokeStyle = 'rgba(78,52,24,.85)'; g.lineWidth = 8; g.lineCap = 'round';
      g.beginPath(); g.arc(ex, EYE_Y + 4, 31, Math.PI * 1.08, Math.PI * 1.92); g.stroke();
      // pliegue del párpado, por encima
      g.strokeStyle = 'rgba(150,105,40,.55)'; g.lineWidth = 5;
      g.beginPath(); g.arc(ex, EYE_Y + 12, 40, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
      // ojera / bolsa inferior
      g.strokeStyle = 'rgba(150,105,40,.42)'; g.lineWidth = 5;
      g.beginPath(); g.arc(ex, EYE_Y - 6, 34, Math.PI * 0.18, Math.PI * 0.82); g.stroke();
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
  return canvasTex(768, 768, (g) => {
    // Base con degradado: raíces más oscuras arriba, puntas claras abajo.
    const base = g.createLinearGradient(0, 0, 0, 768);
    base.addColorStop(0, '#5f574e');
    base.addColorStop(0.35, '#7c736a');
    base.addColorStop(0.75, '#98918a');
    base.addColorStop(1, '#b0aaa2');
    g.fillStyle = base; g.fillRect(0, 0, 768, 768);

    const cold = ['#b3aea7', '#9a948c', '#827c74', '#6a645c'];
    const warm = ['#a8967e', '#8f7f68', '#786952', '#5f5342']; // vetas marrones
    const r = rng(20260824);

    // 1) Mechones anchos: agrupan el pelo en madejas (lo que da el veteado).
    for (let i = 0; i < 120; i++) {
      const x = r() * 768;
      const warmish = r() < 0.5;
      g.strokeStyle = (warmish ? warm : cold)[Math.floor(r() * 4)];
      g.globalAlpha = warmish ? 0.42 : 0.4;
      g.lineWidth = 16 + r() * 40;
      g.beginPath();
      g.moveTo(x, -30);
      g.bezierCurveTo(x + (r() - 0.5) * 70, 250, x + (r() - 0.5) * 90, 500, x + (r() - 0.5) * 60, 800);
      g.stroke();
    }

    // 2) Surcos de separación: sombras finas entre madejas (dan volumen).
    for (let i = 0; i < 60; i++) {
      const x = r() * 768;
      g.strokeStyle = 'rgba(62,56,48,.55)';
      g.globalAlpha = 0.35;
      g.lineWidth = 3 + r() * 7;
      g.beginPath();
      g.moveTo(x, -20);
      g.quadraticCurveTo(x + (r() - 0.5) * 50, 380, x + (r() - 0.5) * 40, 790);
      g.stroke();
    }

    // 3) Hebras finas: el detalle que de cerca lee como pelo de verdad.
    for (let i = 0; i < 5200; i++) {
      const x = r() * 768, y0 = -40 + r() * 620, len = 120 + r() * 380;
      const warmish = r() < 0.44;
      g.strokeStyle = (warmish ? warm : cold)[Math.floor(r() * 4)];
      g.globalAlpha = 0.22 + r() * 0.5;
      g.lineWidth = 0.7 + r() * 1.7;
      const drift = (r() - 0.5) * 30;
      g.beginPath();
      g.moveTo(x, y0);
      g.bezierCurveTo(x + drift * 0.4, y0 + len * 0.35, x + drift, y0 + len * 0.7, x + drift * 1.5, y0 + len);
      g.stroke();
    }

    // 4) Puntas: hebras claras y sueltas en la parte baja (remate irregular).
    for (let i = 0; i < 900; i++) {
      const x = r() * 768, y0 = 470 + r() * 260;
      g.strokeStyle = r() < 0.5 ? '#c4beb6' : '#aea89f';
      g.globalAlpha = 0.3 + r() * 0.55;
      g.lineWidth = 0.7 + r() * 1.3;
      g.beginPath();
      g.moveTo(x, y0);
      g.quadraticCurveTo(x + (r() - 0.5) * 16, y0 + 40, x + (r() - 0.5) * 26, y0 + 80 + r() * 60);
      g.stroke();
    }
    g.globalAlpha = 1;
  });
}

/* ------------------------------------------------------------------ *
 * BORDADO DEL GORRO
 * ------------------------------------------------------------------ */

/** Banda de bordado: hilo plateado en zigzag y puntadas sobre tela azul. */
export function makeEmbroideryTexture(cloth = '#0e3a64', thread = '#e6eaee'): THREE.CanvasTexture {
  const t = canvasTex(1024, 256, (g) => {
    g.fillStyle = cloth; g.fillRect(0, 0, 1024, 256);
    // dos hilos rectos que enmarcan la banda
    g.strokeStyle = thread; g.lineWidth = 8; g.globalAlpha = 1;
    for (const y of [40, 216]) { g.beginPath(); g.moveTo(0, y); g.lineTo(1024, y); g.stroke(); }
    // zigzag central continuo
    g.lineWidth = 7; g.lineJoin = 'round';
    g.beginPath();
    for (let i = 0; i <= 72; i++) {
      const x = (i / 72) * 1024, y = i % 2 ? 92 : 164;
      i === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
    }
    g.stroke();
    // rombos entre picos (motivo angular tipo montañas)
    g.lineWidth = 5; g.globalAlpha = 0.95;
    for (let i = 0; i < 36; i++) {
      const cx = (i + 0.5) / 36 * 1024;
      g.beginPath();
      g.moveTo(cx - 9, 128); g.lineTo(cx, 116); g.lineTo(cx + 9, 128); g.lineTo(cx, 140);
      g.closePath(); g.stroke();
    }
    // puntadas cortas sobre los hilos rectos
    g.lineWidth = 2.4; g.globalAlpha = 0.5;
    for (let i = 0; i < 150; i++) {
      const x = (i / 150) * 1024;
      for (const y of [40, 216]) { g.beginPath(); g.moveTo(x, y - 6); g.lineTo(x + 6, y + 6); g.stroke(); }
    }
    g.globalAlpha = 1;
  });
  t.wrapS = THREE.RepeatWrapping;
  return t;
}

/* ------------------------------------------------------------------ *
 * TORSO IMPRESO Y GORRO DE PUNTO
 * ------------------------------------------------------------------ */

/** Túnica azul con costuras negras, chaleco y prenda interior beige con oro. */
export function makeTorsoTexture(): THREE.CanvasTexture {
  return canvasTex(512, 528, (g) => {
    const W = 512, H = 528;
    // Túnica azul profundo con volumen (más clara en el centro)
    const cloth = g.createLinearGradient(0, 0, W, 0);
    cloth.addColorStop(0, '#103c62'); cloth.addColorStop(0.5, '#1a5b8e'); cloth.addColorStop(1, '#103c62');
    g.fillStyle = cloth; g.fillRect(0, 0, W, H);

    // Chaleco: panel frontal algo más oscuro con borde marcado
    g.fillStyle = '#104263';
    g.beginPath();
    g.moveTo(W * 0.14, 0); g.lineTo(W * 0.86, 0);
    g.lineTo(W * 0.82, H); g.lineTo(W * 0.18, H);
    g.closePath(); g.fill();

    // Abertura central en V: prenda interior beige/arena
    g.fillStyle = '#d8c49b';
    g.beginPath();
    g.moveTo(W * 0.36, 0); g.lineTo(W * 0.64, 0);
    g.lineTo(W * 0.5, H * 0.42); g.closePath(); g.fill();
    // Detalles dorados apagados sobre el beige
    g.strokeStyle = '#b99a4e'; g.lineWidth = 4; g.globalAlpha = 0.85;
    for (let i = 0; i < 3; i++) {
      const y = H * (0.07 + i * 0.085), half = (W * 0.13) * (1 - i * 0.26);
      g.beginPath(); g.moveTo(W * 0.5 - half, y); g.lineTo(W * 0.5 + half, y); g.stroke();
    }
    g.fillStyle = '#c2a458';
    for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(W * 0.5, H * (0.115 + i * 0.085), 5, 0, Math.PI * 2); g.fill(); }
    g.globalAlpha = 1;

    // Costuras negras discretas: bordes del chaleco y del cuello en V
    g.strokeStyle = 'rgba(10,16,26,.72)'; g.lineWidth = 6; g.lineJoin = 'round';
    g.beginPath();
    g.moveTo(W * 0.36, 0); g.lineTo(W * 0.5, H * 0.42); g.lineTo(W * 0.64, 0);
    g.stroke();
    g.lineWidth = 5;
    g.beginPath(); g.moveTo(W * 0.14, 0); g.lineTo(W * 0.18, H); g.stroke();
    g.beginPath(); g.moveTo(W * 0.86, 0); g.lineTo(W * 0.82, H); g.stroke();

    // Pliegues: líneas finas verticales con ligera curva (la tela cae)
    const r = rng(4242);
    g.lineCap = 'round';
    for (let i = 0; i < 26; i++) {
      const x = W * (0.2 + r() * 0.6);
      g.strokeStyle = r() < 0.5 ? 'rgba(9,26,48,.4)' : 'rgba(120,168,214,.22)';
      g.lineWidth = 2 + r() * 4;
      g.beginPath();
      g.moveTo(x, H * (0.3 + r() * 0.2));
      g.quadraticCurveTo(x + (r() - 0.5) * 26, H * 0.7, x + (r() - 0.5) * 34, H);
      g.stroke();
    }
    // Sombra bajo el cuello y en los costados (integra con el 3D)
    const sh = g.createLinearGradient(0, 0, 0, H * 0.3);
    sh.addColorStop(0, 'rgba(0,0,0,.32)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = sh; g.fillRect(0, 0, W, H * 0.3);
  });
}

/** Cinturón: franjas de cuero y gran nudo ovalado delineado en negro. */
export function makeBeltTexture(): THREE.CanvasTexture {
  return canvasTex(920, 200, (g) => {
    const W = 920, H = 200;
    const lea = g.createLinearGradient(0, 0, 0, H);
    lea.addColorStop(0, '#553620'); lea.addColorStop(0.5, '#6f4a2b'); lea.addColorStop(1, '#472c19');
    g.fillStyle = lea; g.fillRect(0, 0, W, H);
    // franjas horizontales oscuras (varias tiras superpuestas)
    g.strokeStyle = 'rgba(40,22,10,.6)'; g.lineWidth = 7;
    for (const y of [H * 0.24, H * 0.52, H * 0.8]) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    // nudo / hebilla ovalada al frente, delineada en negro
    g.fillStyle = '#714b2c';
    g.beginPath(); g.ellipse(W / 2, H / 2, 92, 68, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#1b0f06'; g.lineWidth = 9;
    g.beginPath(); g.ellipse(W / 2, H / 2, 92, 68, 0, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = 'rgba(40,22,10,.75)'; g.lineWidth = 7;
    g.beginPath(); g.ellipse(W / 2, H / 2, 52, 36, 0, 0, Math.PI * 2); g.stroke();
    // brillo suave del cuero
    g.globalAlpha = 0.18; g.fillStyle = '#e2b98a';
    g.fillRect(0, H * 0.3, W, H * 0.12); g.globalAlpha = 1;
  });
}

/** Gorro: lana de punto con costillas finas + bordado plateado alrededor. */
export function makeCapTexture(cloth = '#0e3a64', thread = '#e6eaee'): THREE.CanvasTexture {
  const t = canvasTex(1024, 512, (g) => {
    const W = 1024, H = 512;
    g.fillStyle = cloth; g.fillRect(0, 0, W, H);
    const r = rng(909);
    // Punto de lana: costillas verticales finas alternando luz y sombra
    for (let i = 0; i < 150; i++) {
      const x = (i / 150) * W;
      g.strokeStyle = i % 2 ? 'rgba(255,255,255,.09)' : 'rgba(0,0,0,.22)';
      g.lineWidth = 3 + r() * 2;
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (r() - 0.5) * 6, H); g.stroke();
    }
    // Puntadas de lana (pequeñas uves) para que se lea el tejido de cerca
    g.strokeStyle = 'rgba(255,255,255,.07)'; g.lineWidth = 2;
    for (let y = 8; y < H; y += 18) {
      for (let x = 6; x < W; x += 14) {
        g.beginPath(); g.moveTo(x, y + 7); g.lineTo(x + 4, y); g.lineTo(x + 8, y + 7); g.stroke();
      }
    }
    g.globalAlpha = 1;
  });
  t.wrapS = THREE.RepeatWrapping;
  return t;
}

/* Memorización: estas texturas no dependen de la emoción, se reutilizan. */
let _beard: THREE.CanvasTexture | null = null;
let _torso: THREE.CanvasTexture | null = null;
let _belt: THREE.CanvasTexture | null = null;
let _cap: THREE.CanvasTexture | null = null;
export const beardTex = (): THREE.CanvasTexture => (_beard ??= makeBeardTexture());
export const torsoTex = (): THREE.CanvasTexture => (_torso ??= makeTorsoTexture());
export const beltTex = (): THREE.CanvasTexture => (_belt ??= makeBeltTexture());
export const capTex = (): THREE.CanvasTexture => (_cap ??= makeCapTexture());
let _emb: THREE.CanvasTexture | null = null;
export const embroideryTex = (): THREE.CanvasTexture => (_emb ??= makeEmbroideryTexture());

/** Barba con las hebras GIRADAS: sirve para que el pelo de las mejillas caiga en
 *  diagonal (hacia dentro y abajo) siguiendo la mandíbula, en vez de recto. */
const _rot = new Map<number, THREE.CanvasTexture>();
export function beardTexRot(angle: number): THREE.CanvasTexture {
  let t = _rot.get(angle);
  if (!t) {
    t = beardTex().clone();
    t.center.set(0.5, 0.5);
    t.rotation = angle;
    t.needsUpdate = true;
    _rot.set(angle, t);
  }
  return t;
}

/**
 * PELUSA para capas de pelo ("shell fur"): fondo transparente con marcas finas
 * de hebra. Superponiendo varias capas cada vez más grandes y con menos densidad
 * se consigue una barba MULLIDA y con el borde roto, en vez de una superficie
 * lisa. `density` 0..1 controla cuánta hebra sobrevive en esa capa.
 */
export function makeBeardFuzzTexture(density: number, seed: number): THREE.CanvasTexture {
  return canvasTex(768, 768, (g) => {
    g.clearRect(0, 0, 768, 768);
    const r = rng(seed);
    const tones = ['#b3aea7', '#9a948c', '#827c74', '#a8967e', '#8f7f68', '#c4beb6'];
    const n = Math.round(4200 * density);
    for (let i = 0; i < n; i++) {
      const x = r() * 768, y0 = -30 + r() * 700, len = 60 + r() * 190;
      g.strokeStyle = tones[Math.floor(r() * tones.length)];
      g.globalAlpha = 0.5 + r() * 0.5;
      g.lineWidth = 1.1 + r() * 2.2;
      g.lineCap = 'round';
      const drift = (r() - 0.5) * 26;
      g.beginPath();
      g.moveTo(x, y0);
      g.quadraticCurveTo(x + drift * 0.5, y0 + len * 0.55, x + drift, y0 + len);
      g.stroke();
    }
    g.globalAlpha = 1;
  });
}

const _fuzz = new Map<number, THREE.CanvasTexture>();
export function beardFuzz(level: number): THREE.CanvasTexture {
  let t = _fuzz.get(level);
  if (!t) {
    t = makeBeardFuzzTexture([0.7, 0.45, 0.26][level] ?? 0.2, 5150 + level * 97);
    _fuzz.set(level, t);
  }
  return t;
}
