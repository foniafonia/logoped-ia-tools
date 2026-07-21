import { IS_MOBILE } from './Quality';

/**
 * Dimensiones del recinto amurallado (la plaza delante de la muralla).
 * Todo lo demás (soldados, columnas, límites del jugador) se ajusta a esto
 * para que el espacio esté ACOTADO y no sea un descampado infinito.
 */
export const COURT = {
  half: IS_MOBILE ? 44 : 64,     // medio ancho interior en X
  back: IS_MOBILE ? 74 : 104,    // Z del muro trasero (por donde se entra)
  front: 2,                       // los muros laterales arrancan junto a la muralla
  courses: IS_MOBILE ? 8 : 10     // altura de los muros del recinto (más bajos que la muralla)
};
