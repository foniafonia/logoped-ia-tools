import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * MECHONES ESCULPIDOS (geometry-first).
 * La barba de la referencia no es pelo fino ni una masa inflada: es una pieza
 * moldeada formada por GRANDES MECHONES que nacen en una dirección, tienen
 * cuerpo, se curvan, se superponen y terminan a distinta altura.
 * Aquí cada mechón es un tubo de radio decreciente barrido sobre una curva.
 * 20-25 masas buenas > 500 pelos.
 */

export interface LockSpec {
  root: THREE.Vector3;      // de dónde nace
  dir: THREE.Vector3;       // hacia dónde sale
  length: number;
  radius: number;           // grosor en la raíz
  bend?: THREE.Vector3;     // desvío del extremo (curvatura)
  flatten?: number;         // aplastado en Z (1 = redondo)
  taper?: number;           // 0..1, cuánto adelgaza la punta
}

/** Tubo de radio decreciente barrido sobre una curva suave. */
export function buildLock(s: LockSpec, radialSeg = 9, steps = 14): THREE.BufferGeometry {
  const dir = s.dir.clone().normalize();
  const bend = s.bend ?? new THREE.Vector3();
  const p0 = s.root.clone();
  const p1 = p0.clone().addScaledVector(dir, s.length * 0.34).addScaledVector(bend, 0.12);
  const p2 = p0.clone().addScaledVector(dir, s.length * 0.7).addScaledVector(bend, 0.55);
  const p3 = p0.clone().addScaledVector(dir, s.length).add(bend);
  const curve = new THREE.CatmullRomCurve3([p0, p1, p2, p3]);
  const frames = curve.computeFrenetFrames(steps, false);
  const taper = s.taper ?? 0.82;
  const fz = s.flatten ?? 0.72;

  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const p = curve.getPointAt(t);
    // raíz gruesa, ligero engrosamiento en el cuerpo y punta afilada
    const bulge = 1 + 0.16 * Math.sin(Math.PI * Math.min(1, t * 1.4));
    const r = s.radius * bulge * (1 - taper * Math.pow(t, 1.5));
    const N = frames.normals[Math.min(i, steps - 1)];
    const B = frames.binormals[Math.min(i, steps - 1)];
    for (let j = 0; j <= radialSeg; j++) {
      const v = (j / radialSeg) * Math.PI * 2;
      const cx = Math.cos(v), sy = Math.sin(v);
      pos.push(
        p.x + r * (cx * N.x + sy * B.x * fz),
        p.y + r * (cx * N.y + sy * B.y * fz),
        p.z + r * (cx * N.z + sy * B.z * fz)
      );
      uv.push(j / radialSeg, 1 - t);   // v cae con el mechón → el pelo corre a lo largo
    }
  }
  const row = radialSeg + 1;
  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < radialSeg; j++) {
      const a = i * row + j, b = a + 1, c = a + row, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export function mergeLocks(specs: LockSpec[]): THREE.BufferGeometry {
  return mergeGeometries(specs.map((s) => buildLock(s)), false)!;
}

const V = (x: number, y: number, z: number): THREE.Vector3 => new THREE.Vector3(x, y, z);

/**
 * BARBA: mechones que nacen en la línea de la mandíbula (de mejilla a mejilla),
 * caen hacia abajo y adelante, más largos en el centro y más cortos y
 * envolventes en los lados. Dos capas: primarios (masa) y secundarios (relieve).
 */
export function beardLockSpecs(o: { jawY?: number; jawR?: number; z?: number } = {}): LockSpec[] {
  const Y = o.jawY ?? 3.46;      // altura de la mandíbula
  const R = o.jawR ?? 0.50;      // radio de la línea de nacimiento
  const Z = o.z ?? 0.10;
  const out: LockSpec[] = [];

  // --- 11 mechones PRIMARIOS, de la mejilla izquierda a la derecha ---
  const N = 14;
  for (let i = 0; i < N; i++) {
    const u = i / (N - 1);                 // 0..1
    const th = (-1 + 2 * u) * 1.95;        // ±112°
    const s = Math.sin(th), c = Math.cos(th);
    const centro = 1 - Math.abs(u - 0.5) * 2;          // 1 en el centro, 0 en los lados
    // más largos en el centro; los laterales suben más arriba y son cortos
    const len = 0.66 + 0.96 * Math.pow(centro, 0.7) + (((i * 29) % 7) / 7) * 0.18;
    const rootY = Y + (1 - centro) * 0.34;             // los laterales nacen más altos
    const rad = 0.20 + 0.085 * centro;
    out.push({
      root: V(R * s, rootY, Z + R * c * 0.92),
      dir: V(s * 0.30, -1, c * 0.30 + 0.16),
      length: len,
      radius: rad,
      // se curvan hacia el centro y hacia delante al caer
      bend: V(-s * 0.16 * centro, -0.04, 0.1 + 0.12 * centro),
      flatten: 0.8,
      taper: 0.5
    });
  }

  // --- 12 mechones SECUNDARIOS por delante, más finos y desplazados ---
  const M = 14;
  for (let i = 0; i < M; i++) {
    const u = (i + 0.5) / M;
    const th = (-1 + 2 * u) * 1.7;
    const s = Math.sin(th), c = Math.cos(th);
    const centro = 1 - Math.abs(u - 0.5) * 2;
    const jitter = ((i * 37) % 11) / 11;               // determinista
    const len = 0.5 + 0.86 * Math.pow(centro, 0.8) + jitter * 0.22;
    out.push({
      root: V(R * 0.82 * s, Y - 0.06 + (1 - centro) * 0.26, Z + R * 0.7 * c + 0.16),
      dir: V(s * 0.22, -1, c * 0.2 + 0.3),
      length: len,
      radius: 0.135 + 0.06 * centro,
      bend: V(-s * 0.1, -0.03, 0.12),
      flatten: 0.78,
      taper: 0.55
    });
  }
  return out;
}

/** BIGOTE: dos masas bajo la nariz, curvadas hacia abajo y afuera, por delante. */
export function moustacheLockSpecs(y = 3.86, z = 0.54): LockSpec[] {
  // DOS masas separadas: nacen bajo la nariz, se abren hacia fuera y caen por
  // los lados de la boca. El centro queda libre para que la boca se vea.
  return [-1, 1].map((sx) => ({
    root: V(sx * 0.13, y, z),
    dir: V(sx * 0.66, -0.75, 0.02),
    length: 0.34,
    radius: 0.105,
    bend: V(sx * 0.05, -0.12, -0.06),
    flatten: 0.82,
    taper: 0.42
  }));
}

/** PELO LATERAL: masas marrones que asoman entre el gorro y la barba. */
export function sideHairSpecs(y = 3.98, x = 0.56, z = 0.02): LockSpec[] {
  const out: LockSpec[] = [];
  [-1, 1].forEach((sx) => {
    for (let k = 0; k < 2; k++) {
      out.push({
        root: V(sx * x, y - k * 0.06, z - 0.06 - k * 0.16),
        dir: V(sx * 0.22, -1, -0.1),
        length: 0.5 - k * 0.08,
        radius: 0.15 - k * 0.02,
        bend: V(sx * 0.05, 0, -0.04),
        flatten: 0.8,
        taper: 0.7
      });
    }
  });
  return out;
}
