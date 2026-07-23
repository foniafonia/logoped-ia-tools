import * as THREE from 'three';
import { PlasticMaterialFactory } from '../../../materials/PlasticMaterialFactory';
import { BrickPalette } from '../../../materials/BrickPalette';

/**
 * KIT DE HORIZONTE reutilizable — respuesta a la auditoría del muñequero
 * ("mundos vacíos/lavados": nunca un muñeco flotando en un descampado pálido).
 * Rodea SIEMPRE al jugador de dunas y cerros de arenisca que se funden en la
 * niebla, y da un cielo con color. Barato (mallas lejanas, se instancian una
 * vez) y portable: sirve para el preview del tramo y para el orquestador.
 *
 * Uso:
 *   const horizon = buildHorizon(plastic);
 *   scene.add(horizon.group);                 // dunas/cerros (día y noche)
 *   // al montar cada escena, según sea de día o de noche:
 *   scene.background = noche ? nightSky : horizon.daySky;
 *   scene.fog = new THREE.Fog(noche ? 0x162943 : horizon.horizonColor, 60, 340);
 */
export interface HorizonKit {
  /** Dunas + cerros lejanos. Iluminados por las luces de la escena (día/noche). */
  group: THREE.Group;
  /** Textura de cielo cálido de desierto (para `scene.background` de día). */
  daySky: THREE.CanvasTexture;
  /** Color del horizonte (para casar la niebla de día). */
  horizonColor: number;
}

/** Cielo de desierto: cénit azul-atardecer → franja cálida en el horizonte. */
function daySkyTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 16; c.height = 256;
  const ctx = c.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0.0, '#2b4a7a');   // cénit
  g.addColorStop(0.42, '#7a86a2');
  g.addColorStop(0.68, '#e8b779');   // franja cálida del horizonte
  g.addColorStop(1.0, '#f3d9ab');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 16, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * Construye el anillo de dunas y cerros. NO incluye Jericó (las escenas que lo
 * necesitan de cerca lo ponen ellas). Determinista (sin Math.random).
 */
export function buildHorizon(plastic: PlasticMaterialFactory): HorizonKit {
  const group = new THREE.Group();
  const sandTones = [BrickPalette.SAND, BrickPalette.WARM_SAND, BrickPalette.DARK_SAND, BrickPalette.TAN];

  const mound = (geo: THREE.BufferGeometry, color: number, x: number, y: number, z: number, sx = 1, sy = 1, sz = 1): THREE.Mesh => {
    const m = new THREE.Mesh(geo, plastic.get(color));
    m.position.set(x, y, z); m.scale.set(sx, sy, sz);
    m.receiveShadow = true; // no proyectan (están lejos): ahorra sombras
    return m;
  };

  // --- DUNAS: montículos bajos y anchos, repartidos en un cinturón cercano ---
  // Ángulos/ radios deterministas para cubrir todo el círculo sin huecos.
  const duneSphere = new THREE.SphereGeometry(1, 14, 8);
  const N_DUNES = 26;
  for (let i = 0; i < N_DUNES; i++) {
    const ang = (i / N_DUNES) * Math.PI * 2 + (i % 2) * 0.21;
    const rad = 90 + ((i * 37) % 60);           // 90..150
    const r = 12 + ((i * 53) % 22);             // radio 12..34
    const x = Math.cos(ang) * rad;
    const z = Math.sin(ang) * rad;
    const col = sandTones[i % sandTones.length];
    group.add(mound(duneSphere, col, x, -r * 0.72, z, r, r * 0.34, r));
  }

  // --- CERROS / MESETAS lejanos (fondo), fundidos en niebla ---
  const butte = new THREE.CylinderGeometry(0.62, 0.92, 1, 7);
  const hill = new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const N_FAR = 16;
  for (let i = 0; i < N_FAR; i++) {
    const ang = (i / N_FAR) * Math.PI * 2 + 0.13;
    const rad = 210 + ((i * 41) % 70);          // 210..280
    const h = 44 + ((i * 29) % 60);             // 44..104
    const x = Math.cos(ang) * rad;
    const z = Math.sin(ang) * rad;
    const col = sandTones[(i + 2) % sandTones.length];
    if (i % 2 === 0) {
      const m = mound(butte, col, x, h / 2 - 8, z, h * 0.9, h, h * 0.9);
      m.rotation.y = i;
      group.add(m);
    } else {
      group.add(mound(hill, col, x, -6, z, h * 0.95, h * 0.62, h * 0.95));
    }
  }

  return { group, daySky: daySkyTexture(), horizonColor: 0xe8b779 };
}
