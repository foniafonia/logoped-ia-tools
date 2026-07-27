import { Min15Scene } from './types';
import { escena27 } from './escena27_cordon_rojo';
import { escena28 } from './escena28_descuelgue';
import { escena29 } from './escena29_monte';
import { escena30 } from './escena30_cruce';
import { escena31 } from './escena31_reporte';
import { escena32 } from './escena32_ejercito';

/**
 * Escenas del tramo MINUTO 15–20 ("El cordón rojo y la huida"), en orden jugable.
 * Ventana confirmada con el desglose oficial (escenas de peli 26–33).
 *
 * NOTA DE NUMERACIÓN (decisión del usuario, Hito 2): la HUIDA de la peli (una
 * escena continua de ~16 s: monte + cruce) se despliega en TRES mini-juegos
 * jugables separados, uno por latido bíblico. Eso DESPLAZA la numeración jugable
 * respecto a la de la peli a partir del reporte (el usuario lo aprobó así):
 *
 *   27  el CORDÓN ROJO en la ventana (señal de salvación)   ✅ HITO 1
 *   28  DESCUELGUE por la muralla con cuerdas                ✅ HITO 1
 *   29  ESCONDERSE en el monte 3 días (patrulla)            🎮 HITO 2 (huida 1/3)
 *   30  CRUCE de vuelta del Jordán (de piedra en piedra)    🎮 HITO 2 (huida 2/3)
 *   31  el PARTE a Josué en el campamento (diálogo)         🎮 HITO 2 (huida 3/3)
 *   32  (peli 31) Josué manda reunir al ejército            🎮 (reunir/formar)
 *   33  (peli 32) montaje de PREPARATIVOS de guerra         — pendiente
 *   34  (peli 33) los SHOFAROT del Cohén (gag del carnero)  — pendiente (taller)
 *
 * HITO 2 (huida): esconderse → cruzar → parte a Josué (esc 29–31). A partir de ahí,
 * los preparativos: esc32 reunir al ejército (hecho), y quedan esc33/34. El LEAD las
 * integra en el StoryEngine igual que min05/min10.
 */
export const MIN15_SCENES: Min15Scene[] = [
  escena27, escena28, escena29, escena30, escena31, escena32
];

export function sceneById(id: string): Min15Scene | undefined {
  return MIN15_SCENES.find((s) => s.id === id);
}
export function sceneByNumero(n: number): Min15Scene | undefined {
  return MIN15_SCENES.find((s) => s.numero === n);
}

/**
 * Segundo LOCAL (dentro del clip `narracion_min15-20`, que empezaría en 0) en que
 * arranca cada escena, según el minutaje oficial (global − 900s). Al entrar en una
 * escena, el audio real de la peli saltaría a este segundo. MISMO patrón que
 * min05/min10, y APAGADO hasta que llegue el audio privado del usuario.
 */
export const BEAT_LOCAL: Record<number, number> = {
  26: 11, 27: 40, 28: 51, 29: 120, 30: 128, 31: 137, 32: 227, 33: 242, 34: 314
};
