import { Min05Scene } from './types';
import { escena09 } from './escena09_orilla_jordan';
import { escena10 } from './escena10_reclutar_espias';
import { escena11 } from './escena11_murallas_noche';
import { escena12 } from './escena12_trajes_sigilo';
import { escena13 } from './escena13_cruzar_rio';
import { escena14 } from './escena14_treta_avion';
import { escena15 } from './escena15_colarse_puerta';
import { escena16 } from './escena16_guardias_calles';

/**
 * Todas las escenas del tramo MINUTO 5–10, en orden de la película. El lead las
 * integra en el StoryEngine (cada `Min05Scene` trae subtítulo, objetivo y
 * constructor del escenario 3D). El preview las recorre con este mismo orden.
 */
export const MIN05_SCENES: Min05Scene[] = [
  escena09, escena10, escena11, escena12, escena13, escena14, escena15, escena16
];

export function sceneById(id: string): Min05Scene | undefined {
  return MIN05_SCENES.find((s) => s.id === id);
}

export function sceneByNumero(n: number): Min05Scene | undefined {
  return MIN05_SCENES.find((s) => s.numero === n);
}
