/**
 * TRAMO MINUTO 15–20 · "EL CORDÓN ROJO Y LOS SHOFAROT" (CREADOR 15–20) —
 * escenas 26–33 de la peli.
 *
 * Arranca JUSTO DESPUÉS de la posada de Rahab (el tramo 10–15 cierra en la
 * escena 25). Cubre: la confesión de fe de Rahab en el balcón (26), el CORDÓN
 * ROJO en la ventana (27), el DESCUELGUE por la muralla con cuerdas (28), la
 * huida por el monte y el cruce de vuelta del río (29), el REPORTE a Yehoshúa
 * en la tienda (30), Yehoshúa manda reunir al ejército (31), el montaje de
 * PREPARATIVOS de guerra (32) y los SHOFAROT del Cohén (33, con el gag del
 * carnero). El clímax (marcha + cruce del Jordán = 20–25; muralla = 25–29) NO
 * es de este tramo.
 *
 * Igual que 5–10 y 10–15, REUTILIZA el contrato de escena compartido
 * (`Min05Scene` / `SceneContext` / `SceneInstance`) para que el LEAD integre sin
 * fricción: cada escena es un ESCENARIO 3D DE LADRILLO autocontenido (nunca
 * fondo plano 2.5D) + personajes como NPCs + un objetivo JUGABLE. Solo se AÑADEN
 * archivos en `src/scenes/min15/`; no se editan piezas compartidas.
 *
 * Añade un único dato propio: `mundo`, que le dice al orquestador qué ambiente
 * montar (el balcón sobre la muralla de noche, el monte/río de la huida, la
 * tienda del campamento o el taller de los shofarot).
 */
import { Min05Scene } from '../min05/types';

// Re-exporto el contrato compartido para que las escenas de min15 importen todo
// desde su propia carpeta (import ... from './types') igual que hacen min05/min10.
export type {
  SceneContext,
  SceneInstance,
  HudState,
  CameraHint,
  PlayerSkinId,
  Min05Objetivo as Min15Objetivo,
  Min05ObjetivoTipo as Min15ObjetivoTipo
} from '../min05/types';

/** En qué "mundo" transcurre la escena (para el ambiente/luz del orquestador). */
export type Min15Mundo =
  | 'balcon'      // balcón de Rahab en lo alto de la muralla, de noche (esc. 26–28)
  | 'monte'       // exterior nocturno: bosque de pinos + río de vuelta (esc. 29)
  | 'campamento'  // tienda militar / campamento de Israel de noche (esc. 30–32)
  | 'taller';     // carpa-taller de los levitas donde tallan los shofarot (esc. 33)

/** Descriptor de una escena del tramo 15–20 (el contrato de min05 + `mundo`). */
export interface Min15Scene extends Min05Scene {
  mundo: Min15Mundo;
}
