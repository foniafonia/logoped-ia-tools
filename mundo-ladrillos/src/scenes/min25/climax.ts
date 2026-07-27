import * as THREE from 'three';
import { PlasticMaterialFactory } from '../../materials/PlasticMaterialFactory';
import { buildJericho } from '../../structures/BrickStructureBuilder';
import { Dust } from '../../effects/Dust';

/**
 * CLÍMAX · "La caída de la muralla de Jericó" (min 25–29) — PLATO FUERTE del LEAD.
 *
 * Este módulo construye la MURALLA de Jericó y su DERRUMBE "en ladrillos" (regla de
 * oro nº3: nada de violencia; la muralla se DESHACE en bloques). Reutiliza
 * `buildJericho` (que ya viene pensado para el derrumbe: devuelve las franjas de
 * arriba a abajo + las torres) y el `Dust` compartido.
 *
 * Secuencia completa del clímax (se irá montando por hitos):
 *   1) marcha con shofarot alrededor de Jericó (7 vueltas)   [hito siguiente]
 *   2) el niño TOCA EL SHOFAR → GRITO                         [hito siguiente]
 *   3) la muralla SE DESHACE EN LADRILLOS   ← ESTE HITO
 *   4) rescate de Rahab (cordón rojo)                         [hito siguiente]
 *   5) victoria                                               [hito siguiente]
 *
 * Uso:
 *   const cl = buildClimax(scene, plastic, dust);
 *   // al tocar el shofar:  cl.soplarShofar();
 *   // en el bucle:         cl.update(dt, t);
 *   // objetivo cumplido:   cl.cayo()
 */
export interface ClimaxBuild {
  group: THREE.Group;
  /** Dispara el derrumbe (tras el grito del shofar). Idempotente. */
  soplarShofar(): void;
  /** Anima el derrumbe franja a franja + torres + polvo. */
  update(dt: number, t: number): void;
  /** true cuando la muralla ya se ha deshecho del todo. */
  cayo(): boolean;
  /** z de la cara frontal de la muralla (para colocar al jugador/objetivo). */
  readonly muroZ: number;
}

interface Pieza { obj: THREE.Object3D; y0: number; vy: number; ancho: number; delay: number; vivo: boolean; }

export function buildClimax(scene: THREE.Scene, plastic: PlasticMaterialFactory, dust: Dust): ClimaxBuild {
  const group = new THREE.Group();
  const MURO_Z = -40;                       // la muralla, al norte; el jugador llega desde +z

  const jer = buildJericho(plastic);
  jer.group.position.set(0, 0, MURO_Z);
  group.add(jer.group);
  scene.add(group);

  // Piezas del derrumbe: franjas (de arriba a abajo, escalonadas) y torres (al final).
  // La geometría está horneada en coords absolutas, así que NO rotamos (los extremos
  // saldrían volando): cada pieza CAE recta y se HUNDE con MUCHO polvo → lee como que
  // se DESHACE EN LADRILLOS (regla de oro nº3, sin violencia). Escalonado arriba→abajo.
  const piezas: Pieza[] = [];
  jer.bands.forEach((b, i) => piezas.push({ obj: b, y0: b.position.y, vy: 0, ancho: jer.wallWidth, delay: i * 0.22, vivo: true }));
  jer.towers.forEach((tw, i) => piezas.push({ obj: tw, y0: tw.position.y, vy: 0, ancho: 6, delay: 1.1 + i * 0.1, vivo: true }));

  let cayendo = false;
  let tCaida = 0;
  let hechas = 0;

  const soplarShofar = (): void => { if (!cayendo) { cayendo = true; tCaida = 0; } };

  const wp = new THREE.Vector3();
  const update = (dt: number, _t: number): void => {
    if (!cayendo) return;
    tCaida += dt;
    for (let i = 0; i < piezas.length; i++) {
      const p = piezas[i];
      if (!p.vivo) continue;
      if (tCaida < p.delay) continue;
      // caída recta + hundimiento (se desmorona en su sitio)
      p.vy -= 30 * dt;
      p.obj.position.y += p.vy * dt;
      // NUBE de polvo a lo ancho de la pieza mientras cae ("se deshace en ladrillos")
      p.obj.getWorldPosition(wp);
      const n = p.ancho > 20 ? 3 : 1;
      for (let k = 0; k < n; k++) {
        dust.burst(wp.x + (Math.random() - 0.5) * p.ancho * 0.9, Math.max(0.4, p.obj.position.y + p.y0), MURO_Z + (Math.random() - 0.5) * 6, 5);
      }
      // al hundirse bajo el suelo se retira (ya "se deshizo")
      if (p.obj.position.y < p.y0 - 9) { p.obj.visible = false; p.vivo = false; hechas++; }
    }
  };

  return {
    group,
    soplarShofar,
    update,
    cayo: () => cayendo && hechas >= piezas.length,
    muroZ: MURO_Z,
  };
}
