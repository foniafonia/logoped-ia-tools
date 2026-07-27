import { Min15Scene } from './types';
import { escena26 } from './escena26_confesion';
import { escena27 } from './escena27_cordon_rojo';
import { escena28 } from './escena28_descuelgue';
import { escena29 } from './escena29_monte';
import { escena30 } from './escena30_cruce';
import { escena31 } from './escena31_reporte';
import { escena32 } from './escena32_ejercito';
import { escena33 } from './escena33_preparativos';
import { escena34 } from './escena34_shofarot';

/**
 * Escenas del tramo MINUTO 15–20 ("El cordón rojo y la huida"), en orden jugable.
 * Ventana confirmada con el desglose oficial (escenas de peli 26–33).
 *
 * NOTA DE NUMERACIÓN (decisión del usuario, Hito 2): la HUIDA de la peli (una
 * escena continua de ~16 s: monte + cruce) se despliega en TRES mini-juegos
 * jugables separados, uno por latido bíblico. Eso DESPLAZA la numeración jugable
 * respecto a la de la peli a partir del reporte (el usuario lo aprobó así):
 *
 * Timestamps REALES del vídeo (referencias/transcripcion.md; el JUEGO reordena los
 * beats respecto a la peli, por eso el min-tramo del juego ≠ min de la peli):
 *   27  el CORDÓN ROJO en la ventana (señal)     ✅ HITO 1   · peli 9:38–10:01
 *   28  DESCUELGUE por la muralla con cuerdas     ✅ HITO 1   · peli 9:54
 *   29  ESCONDERSE en el monte 3 días (patrulla) 🎮 huida 1/3 · peli 9:54 "en silencio hasta la colina"
 *   30  CRUCE de vuelta del Jordán (piedras)      🎮 huida 2/3 · peli ~10:01
 *   31  el PARTE a Josué (diálogo)                🎮 huida 3/3 · peli 10:42–11:13
 *   32  Josué manda reunir al ejército            🎮 reunir    · peli 11:27–11:37
 *   33  PREPARATIVOS de guerra (afilar/flechas/escudos) 🎮 · peli 19:02 (escena_32)
 *   34  SHOFAROT del Cohén (recoger+entregar, gag del carnero) 🎮 · peli 20:14 (escena_33, taller)
 *
 * Con esc34 el tramo 15–20 queda COMPLETO (huida → parte → preparativos → shofarot).
 * El Arca + aguas divididas del Jordán (escena_34 peli) es del 20–25 (no se toca aquí).
 *
 * HITO 2 (huida): esconderse → cruzar → parte a Josué (esc 29–31). A partir de ahí,
 * los preparativos: esc32 reunir al ejército (hecho), y quedan esc33/34. El LEAD las
 * integra en el StoryEngine igual que min05/min10.
 */
export const MIN15_SCENES: Min15Scene[] = [
  escena26, escena27, escena28, escena29, escena30, escena31, escena32, escena33, escena34
];

export function sceneById(id: string): Min15Scene | undefined {
  return MIN15_SCENES.find((s) => s.id === id);
}
export function sceneByNumero(n: number): Min15Scene | undefined {
  return MIN15_SCENES.find((s) => s.numero === n);
}

/**
 * Segundo GLOBAL del vídeo (referencias/transcripcion.md) en que arranca cada beat.
 * Al cablear el audio real, saltar a este segundo. El audio sigue APAGADO hasta que
 * el usuario lo pase; lo cablea el LEAD. OJO: el JUEGO reordena los beats respecto a
 * la peli (la huida/parte/shofarot ocurren en el vídeo hacia 9:54–12:39, no en 15+),
 * por eso los segundos no crecen de forma trivial con el nº de escena del juego.
 */
export const BEAT_LOCAL: Record<number, number> = {
  26: 560, 27: 578, 28: 594, 29: 595, 30: 601, 31: 642, 32: 687, 33: 872, 34: 736
};
