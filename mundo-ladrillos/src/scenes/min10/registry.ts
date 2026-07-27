import { Min10Scene } from './types';
import { escena17 } from './escena17_huellas';
import { escena18 } from './escena18_carrera_mercado';
import { escena19 } from './escena19_entrar_posada';
import { escena20 } from './escena20_guardias_acercan';
import { escena21 } from './escena21_pacto';
import { escena22 } from './escena22_patean_puerta';
import { escena23 } from './escena23_escondite';
import { escena24 } from './escena24_rahab_miente';
import { escena25 } from './escena25_alivio';

/**
 * Todas las escenas del tramo MINUTO 10–15 ("La posada de Rahab"), en orden de la
 * película (escenas 17–25). El LEAD las integra en el StoryEngine igual que las de
 * min05 (cada `Min10Scene` extiende el contrato `Min05Scene`). El preview las
 * recorre en este orden y auto-encadena al cumplir el objetivo.
 */
export const MIN10_SCENES: Min10Scene[] = [
  escena17, escena18, escena19, escena20, escena21, escena22, escena23, escena24, escena25
];

export function sceneById(id: string): Min10Scene | undefined {
  return MIN10_SCENES.find((s) => s.id === id);
}
export function sceneByNumero(n: number): Min10Scene | undefined {
  return MIN10_SCENES.find((s) => s.numero === n);
}

/**
 * Segundo LOCAL (dentro del clip `narracion_min10-15`, que empezaría en 0) en que
 * arranca cada escena, según el minutaje oficial de la peli (global − 600s). Al
 * entrar en una escena, el AUDIO REAL DE LA PELÍCULA saltaría a este segundo para
 * que voz/música casen con lo que se ve — MISMO patrón que el tramo 5–10.
 *
 * ⚠️ AUDIO PENDIENTE: el clip del min 10–15 es material privado de la peli y aún
 * NO está en el repo. Por eso el "film-spine" del preview está CABLEADO pero
 * APAGADO (`USE_FILM_SPINE = false`) hasta que el usuario pase el audio+
 * transcripción del 10–15; hasta entonces suenan solo ambiente + SFX procedurales
 * y los subtítulos de cada escena. Cuando llegue el audio, se calibran ventanas
 * reales por escena (como `CLIP_SEG` en min05) y se enciende el spine.
 */
export const BEAT_LOCAL: Record<number, number> = {
  17: 5, 18: 55, 19: 105, 20: 118, 21: 126, 22: 155, 23: 205, 24: 241, 25: 257
};
