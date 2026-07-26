import { Min15Scene } from './types';
import { escena27 } from './escena27_cordon_rojo';
import { escena28 } from './escena28_descuelgue';

/**
 * Escenas del tramo MINUTO 15–20 ("El cordón rojo y los shofarot"), en orden de
 * la película. Ventana confirmada con el desglose oficial: escenas 26–33.
 *
 *   26  balcón: Rahab confiesa su fe y pide unirse a Israel   (911–939s)
 *   27  el CORDÓN ROJO en la ventana (señal de salvación)     (940–950s)  ✅ HITO 1
 *   28  DESCUELGUE por la muralla con cuerdas                 (951–1019s) ✅ HITO 1
 *   29  huida: bosque de pinos + cruce de vuelta del río      (1020–1036s)
 *   30  REPORTE a Yehoshúa en la tienda militar               (1037–1126s)
 *   31  Yehoshúa manda reunir al gran ejército                (1127–1141s)
 *   32  montaje de PREPARATIVOS de guerra                     (1142–1213s)
 *   33  los SHOFAROT del Cohén (gag del carnero)              (1214–1305s)
 *
 * HITO 1 (este commit): escenas 27 y 28 jugables con vida. El resto llega en los
 * siguientes hitos. El LEAD las integra en el StoryEngine igual que min05/min10.
 */
export const MIN15_SCENES: Min15Scene[] = [
  escena27, escena28
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
  26: 11, 27: 40, 28: 51, 29: 120, 30: 137, 31: 227, 32: 242, 33: 314
};
