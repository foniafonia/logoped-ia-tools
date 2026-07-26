import { jericoBackdrop } from './jericoBackdrop';
import { bgCampamento } from './bgCampamento';
import { bgJordanNoche } from './bgJordanNoche';
import { bgJericoMurallas } from './bgJericoMurallas';

/**
 * Catálogo de telones de fondo por TRAMO de la historia (la caída de Jericó).
 * Todos son imágenes reales de Higgsfield (soul_location), incrustadas como
 * data-URI y verificadas por md5 — se empaquetan en el build single-file y
 * esquivan la CSP. Se enchufan con `addBackdrop(scene, BACKDROPS.<tramo>)`.
 *
 * Recorrido narrativo:
 *   0–5   campamento   → el campamento de Israel al amanecer (antes de cruzar)
 *   5–10  jordanNoche  → el río Jordán de noche (el cruce)
 *   10–15 llanura      → la llanura de Jericó al atardecer (aproximación)
 *   climax murallas     → las murallas de Jericó a hora dorada (el asedio/caída)
 */
export const BACKDROPS = {
  /** Tramo 0–5: campamento de Israel (Machaneh Yisrael) al amanecer. */
  campamento: bgCampamento,
  /** Tramo 5–10: el río Jordán de noche, el cruce. */
  jordanNoche: bgJordanNoche,
  /** Tramo 10–15: llanura de Jericó al atardecer (aproximación a la ciudad). */
  llanura: jericoBackdrop,
  /** Clímax: las murallas de Jericó a hora dorada (el asedio y la caída). */
  murallas: bgJericoMurallas
} as const;

export type BackdropKey = keyof typeof BACKDROPS;
