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
  /** Franja de la textura que usa este mechón (0..1). Da a cada uno un tono
   *  ligeramente distinto para que se lean por separado dentro de la masa. */
  shade?: number;
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
      // franja propia de la textura (tono) + v a lo largo del mechón
      uv.push((s.shade ?? 0) + (j / radialSeg) * 0.22, 1 - t);
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
export function beardLockSpecs(
  o: { jawY?: number; jawR?: number; z?: number; skullR?: number; cheekTopY?: number } = {}
): LockSpec[] {
  const Y = o.jawY ?? 3.46;      // altura de la mandíbula
  const R = o.jawR ?? 0.47;      // radio de la línea de nacimiento
  const Z = o.z ?? 0.10;
  const out: LockSpec[] = [];

  // --- 11 mechones PRIMARIOS, de la mejilla izquierda a la derecha ---
  const N = 14;
  for (let i = 0; i < N; i++) {
    const u = i / (N - 1);                 // 0..1
    const th = (-1 + 2 * u) * 2.3;         // ±132°: envuelve también hacia atrás
    const s = Math.sin(th), c = Math.cos(th);
    const centro = 1 - Math.abs(u - 0.5) * 2;          // 1 en el centro, 0 en los lados
    // más largos en el centro; los laterales suben más arriba y son cortos
    const len = 0.33 + 0.77 * Math.pow(centro, 1.25) + (((i * 29) % 7) / 7) * 0.09;
    const rootY = Y + (1 - centro) * 0.34;             // los laterales nacen más altos
    const rad = 0.20 + 0.085 * centro;
    out.push({
      root: V(R * s, rootY, Z + R * c * 0.92),
      // hacia dentro: cuanto más lateral, más converge al centro (barba recogida)
      dir: V(s * (0.34 - 0.78 * (1 - centro)), -1, c * 0.10 + 0.03),
      length: len,
      radius: rad,
      // se curvan hacia el centro y hacia delante al caer
      bend: V(-s * (0.14 + 0.42 * (1 - centro)), -0.05, 0.01 + 0.03 * centro),
      flatten: 0.8,
      taper: 0.5,
      shade: ((i * 3) % 7) / 9
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
    const len = 0.255 + 0.63 * Math.pow(centro, 1.2) + jitter * 0.11;
    out.push({
      root: V(R * 0.82 * s, Y - 0.06 + (1 - centro) * 0.26, Z + R * 0.7 * c + 0.16 + (i % 2 ? 0.07 : -0.03)),
      dir: V(s * (0.26 - 0.66 * (1 - centro)), -1, c * 0.08 + 0.1),
      length: len,
      radius: 0.135 + 0.06 * centro,
      bend: V(-s * (0.1 + 0.34 * (1 - centro)), -0.03, 0.02),
      flatten: 0.78,
      taper: 0.55,
      shade: ((i * 4 + 2) % 7) / 9
    });
  }
  // --- MEJILLAS: la barba sube por el lado de la cara hasta ENGANCHAR con el
  //     pelo que baja del gorro. Antes nacían a radio 0.44 (dentro del cráneo,
  //     que es de 0.66) y por eso sólo asomaban trozos sueltos y colgantes.
  //     Ahora nacen SOBRE la superficie de la cabeza, de fuera hacia dentro.
  const SK = o.skullR ?? 0.685;      // radio de la cabeza + un pelo
  const TOP = o.cheekTopY ?? 3.92;   // arranque, justo bajo el borde del gorro
  const C = 5;                       // por lado
  [-1, 1].forEach((sx) => {
    for (let k = 0; k < C; k++) {
      const u = k / (C - 1);                 // 0 = pegado al pelo, 1 = hacia el centro
      const th = sx * (0.98 - 0.38 * u);     // de 0.98 rad (lateral) a 0.60 (frontal)
      const sn = Math.sin(th), cs = Math.cos(th);
      out.push({
        root: V(SK * sn, TOP - u * 0.30, SK * cs),
        // cae hacia abajo y va cerrándose hacia el centro y hacia delante
        dir: V(-sn * 0.16, -1, cs * 0.06 + 0.05),
        length: 0.62 + u * 0.34,
        radius: 0.125 + 0.02 * u,
        bend: V(-sn * (0.16 + 0.14 * u), -0.03, 0.03),
        flatten: 0.8,
        taper: 0.46,
        shade: ((k * 5) % 7) / 9
      });
    }
  });
  return out;
}

/** BIGOTE: dos masas bajo la nariz, curvadas hacia abajo y afuera, por delante. */
export function moustacheLockSpecs(y = 3.86, z = 0.54): LockSpec[] {
  // DOS masas separadas: nacen bajo la nariz, se abren hacia fuera y caen por
  // los lados de la boca. El centro queda libre para que la boca se vea.
  const out: LockSpec[] = [];
  // PUENTE CENTRAL: cruza el labio de lado a lado y cierra el hueco que quedaba
  // entre las dos mitades. El bigote pasa a ser una pieza continua.
  out.push({
    root: V(-0.15, y + 0.05, z + 0.02),
    dir: V(1, -0.08, 0),
    length: 0.3,
    radius: 0.115,
    bend: V(0, -0.03, 0),
    flatten: 0.9,
    taper: 0.1
  });
  [-1, 1].forEach((sx) => {
    // masa principal: nace bajo la nariz, se abre y cae por el lado de la boca
    out.push({
      root: V(sx * 0.07, y + 0.05, z),
      dir: V(sx * 0.82, -0.62, 0.04),
      length: 0.4,
      radius: 0.135,
      bend: V(sx * 0.06, -0.2, -0.05),
      flatten: 0.86,
      taper: 0.4
    });
    // refuerzo por delante y algo más abajo: le da volumen y remate
    out.push({
      root: V(sx * 0.16, y - 0.02, z + 0.04),
      dir: V(sx * 0.62, -0.82, 0.0),
      length: 0.3,
      radius: 0.1,
      bend: V(sx * 0.04, -0.1, -0.04),
      flatten: 0.84,
      taper: 0.5
    });
  });
  return out;
}

/** NUCA: mechones oscuros bajo el gorro por detrás (antes era una caja plana). */
export function napeHairSpecs(y = 3.98, r = 0.6): LockSpec[] {
  const out: LockSpec[] = [];
  const N = 10;
  for (let i = 0; i < N; i++) {
    const u = i / (N - 1);
    // Arco trasero CORTO: si se abre más, el pelo de la nuca asoma por los
    // lados y ensancha la silueta de la cara, cosa que en la referencia no pasa.
    const th = Math.PI + (-1.05 + 2.1 * u);
    const sn = Math.sin(th), cs = Math.cos(th);
    const lado = Math.abs(u - 0.5) * 2;               // 0 en la nuca, 1 en los lados
    out.push({
      // en los lados el mechón se mete hacia dentro para no ensanchar la cara
      root: V(r * sn * (1 - 0.12 * lado), y, r * cs),
      dir: V(sn * 0.06, -1, cs * 0.2),
      length: 0.78 + (((i * 13) % 5) / 5) * 0.16,
      radius: 0.155 - 0.03 * lado,
      bend: V(0, -0.02, cs * 0.05),
      flatten: 0.85,
      taper: 0.55
    });
  }
  return out;
}

/**
 * FLEQUILLO: mechones cortos que nacen JUSTO BAJO EL BORDE DEL GORRO y caen
 * sobre las sienes. En la hoja oficial el gorro no se apoya sobre piel pelada:
 * de debajo asoma pelo que baja y se encuentra con la barba.
 */
export function fringeSpecs(y = 4.16, r = 0.70): LockSpec[] {
  const out: LockSpec[] = [];
  // Medido en la hoja: a la altura de las cejas el pelo ocupa solo el 10 % de
  // media cara; justo bajo el gorro se ensancha hasta un 30 %. O sea, un
  // flequillo CORTO en la esquina de la frente, no una cortina sobre los ojos.
  const N = 3;                       // por lado: tres mechones, no una cortina
  [-1, 1].forEach((sx) => {
    for (let k = 0; k < N; k++) {
      const u = k / (N - 1);                     // 0 = lateral, 1 = esquina de la frente
      const th = sx * (0.99 - 0.13 * u);         // arco muy corto, pegado al borde
      const sn = Math.sin(th), cs = Math.cos(th);
      out.push({
        root: V(r * sn, y - u * 0.02, r * cs),
        // cae a plomo y se retira hacia fuera al bajar (deja la sien libre)
        dir: V(sn * 0.10, -1, cs * 0.04 + 0.03),
        length: (0.24 - u * 0.05) + (((k * 17) % 5) / 5) * 0.05,
        radius: 0.07 - 0.015 * u,
        bend: V(sn * 0.03, -0.02, 0.02),
        flatten: 0.78,
        taper: 0.66,
        shade: ((k * 3) % 7) / 9
      });
    }
  });
  return out;
}

/** PELO LATERAL: masas marrones que asoman entre el gorro y la barba. */
export function sideHairSpecs(y = 3.98, x = 0.53, z = 0.02): LockSpec[] {
  const out: LockSpec[] = [];
  [-1, 1].forEach((sx) => {
    for (let k = 0; k < 2; k++) {
      out.push({
        root: V(sx * x, y - k * 0.06, z - 0.06 - k * 0.16),
        dir: V(sx * 0.06, -1, -0.1),
        length: 0.68 - k * 0.08,
        radius: 0.125 - k * 0.02,
        bend: V(sx * 0.05, 0, -0.04),
        flatten: 0.8,
        taper: 0.7
      });
    }
  });
  return out;
}
