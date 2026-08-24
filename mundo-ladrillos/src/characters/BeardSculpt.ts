import * as THREE from 'three';

/**
 * BARBA ESCULPIDA (geometry-first).
 * Un torno de revolución da una barba tipo cono/cortina: simétrica, lisa y
 * plana. Aquí se genera una malla propia barriendo un perfil y MODULANDO el
 * radio por ángulo y altura, lo que produce:
 *   · masas grandes (mechones principales) → ~70 % de la forma
 *   · masas secundarias e irregularidad    → ~25 %
 *   · divisiones y puntas al final         → remate creíble, no una masa lisa
 * Sigue siendo UNA sola malla (nada de bolas superpuestas) y con UV limpia
 * (u = vuelta, v = altura) para que el pelo caiga en la dirección correcta.
 */

export interface BeardOpts {
  height?: number;      // largo total
  width?: number;       // radio máximo
  depth?: number;       // aplastado frontal/trasero (1 = redondo)
  lobes?: number;       // nº de mechones principales
  /** Cuánto SUBE la barba por los laterales (patillas). El borde superior no es
   *  un anillo plano: baja en el frente (para dejar la boca libre) y sube por
   *  las mejillas, de modo que patillas y barba son UNA SOLA masa continua. */
  sideRise?: number;
  seed?: number;
}

/** Perfil base: ancho en las mejillas, cuerpo columnar, remate redondeado. */
function profileRadius(v: number): number {
  // v: 0 = punta inferior, 1 = arranque en las mejillas
  const pts: Array<[number, number]> = [
    [0.00, 0.06], [0.06, 0.30], [0.14, 0.50], [0.26, 0.68],
    [0.42, 0.82], [0.60, 0.92], [0.76, 0.98], [0.88, 1.00],
    [0.95, 0.97], [1.00, 0.88]
  ];
  for (let i = 0; i < pts.length - 1; i++) {
    const [a, ra] = pts[i], [b, rb] = pts[i + 1];
    if (v >= a && v <= b) {
      const t = (v - a) / (b - a);
      return ra + (rb - ra) * (t * t * (3 - 2 * t));   // suavizado
    }
  }
  return pts[pts.length - 1][1];
}

export function buildBeardGeometry(o: BeardOpts = {}): THREE.BufferGeometry {
  const H = o.height ?? 1.62;
  const R = o.width ?? 0.46;
  const D = o.depth ?? 0.74;
  const L = o.lobes ?? 5;
  const RISE = o.sideRise ?? 0.44;
  const SU = 96, SV = 56;

  const pos: number[] = [], uv: number[] = [], idx: number[] = [];

  for (let iv = 0; iv <= SV; iv++) {
    const v = iv / SV;                       // 0 abajo (punta) … 1 arriba (mejillas)
    const y = v * H;
    const base = profileRadius(v) * R;

    // Cuánta "escultura" admite cada altura: casi nada arriba (pegada a la
    // mandíbula) y mucha abajo, donde la barba se abre en mechones.
    const carve = Math.pow(1 - v, 0.8);

    for (let iu = 0; iu <= SU; iu++) {
      const u = iu / SU;
      const th = u * Math.PI * 2;
      // Subida lateral: nula justo al frente (boca libre), máxima en mejillas y
      // nuca. Solo actúa en la parte alta (v²) para no deformar la caída.
      const f = Math.max(0, Math.cos(th));
      const rise = RISE * (1 - f * f) * v * v;

      // MASAS PRINCIPALES: mechones anchos alrededor (70 % de la forma)
      const mech = 0.13 * Math.cos(L * th) * (0.35 + 0.65 * carve);
      // MASAS SECUNDARIAS: irregularidad de segundo orden (25 %)
      const sec = 0.055 * Math.sin(3 * th + 1.27) + 0.04 * Math.sin(8 * th + 0.6) * carve;
      // DIVISIONES DEL REMATE: abajo se separa en 3 puntas
      const tips = v < 0.30 ? 0.22 * Math.cos(3 * th + 0.4) * (0.30 - v) / 0.30 : 0;
      // GROSOR FRONTAL: la barba tiene cuerpo hacia delante, no es una chapa
      const front = 0.16 * Math.max(0, Math.cos(th)) * (0.4 + 0.6 * carve);

      const r = Math.max(0.02, base * (1 + mech + sec + tips) + front * R);
      const x = r * Math.sin(th);
      const z = r * Math.cos(th) * D;
      pos.push(x, y + rise, z);
      uv.push(u, v);
    }
  }

  const row = SU + 1;
  for (let iv = 0; iv < SV; iv++) {
    for (let iu = 0; iu < SU; iu++) {
      const a = iv * row + iu, b = a + 1, c = a + row, d = c + 1;
      idx.push(a, b, c, b, d, c);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Bigote: masa propia que se funde con la barba y enmarca la boca. */
export function buildMustacheGeometry(): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(0.2, 22, 14);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    // se estira a lo ancho, se aplasta en vertical y cae por los extremos
    p.setXYZ(i, x * 1.55, y * 0.52 - Math.abs(x) * 0.5, z * 0.62 + 0.04);
  }
  g.computeVertexNormals();
  return g;
}
