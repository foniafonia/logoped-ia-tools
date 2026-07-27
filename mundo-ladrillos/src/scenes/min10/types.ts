/**
 * TRAMO MINUTO 10–15 · "LA POSADA DE RAHAB" (CREADOR 10–15) — escenas 17–25.
 *
 * Este tramo REUTILIZA el contrato de escena del tramo 5–10 (`Min05Scene` /
 * `SceneContext` / `SceneInstance`) para que el LEAD integre sin fricción: cada
 * escena es un ESCENARIO 3D DE LADRILLO autocontenido (nunca fondo plano 2.5D) +
 * los personajes como NPCs + un objetivo JUGABLE. Solo se AÑADEN archivos en
 * `src/scenes/min10/`; no se editan piezas compartidas (las integra el LEAD).
 *
 * Añade un único dato propio: `mundo`, que le dice al orquestador si la escena es
 * la CALLE nocturna (mercado, horizonte de Jericó) o el INTERIOR de la taberna
 * (diorama cálido cerrado). El resto del contrato es idéntico al de min05.
 */
import { Min05Scene } from '../min05/types';

// Re-exporto el contrato compartido para que las escenas de min10 importen todo
// desde su propia carpeta (import ... from '../types') igual que hace min05.
export type {
  SceneContext,
  SceneInstance,
  HudState,
  CameraHint,
  PlayerSkinId,
  Min05Objetivo as Min10Objetivo,
  Min05ObjetivoTipo as Min10ObjetivoTipo
} from '../min05/types';

/** En qué "mundo" transcurre la escena (para el ambiente/luz del orquestador). */
export type Min10Mundo = 'calle-noche' | 'interior';

/** Descriptor de una escena del tramo 10–15 (el contrato de min05 + `mundo`). */
export interface Min10Scene extends Min05Scene {
  /** 'calle-noche' = exterior (mercado/calle); 'interior' = taberna de Rahab. */
  mundo: Min10Mundo;
}
