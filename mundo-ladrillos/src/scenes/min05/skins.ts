import {
  MinifigureSkin, SPY_SKIN, SPY2_SKIN, YOSHUA_SKIN, GUARD_SKIN, GUARD_CHIEF_SKIN
} from '../../characters/MinifigureFactory';

/**
 * Skins del tramo 5–10. Ahora que están integrados los MUÑECOS NUEVOS
 * (MinifigureFactory con casco cónico, capa, bastón, rayas… nativos), los skins
 * de sigilo/guardias/Yehoshúa se toman DIRECTAMENTE de los canónicos de la peli.
 * Solo se mantienen locales las variantes de CAMPAMENTO de los espías (túnica +
 * turbante), que aún no existen como canónicas.
 *
 * CLAVE narrativa (fiel a la peli): los espías van de CAMPAMENTO en las escenas
 * 9–11 y se ponen el TRAJE DE SIGILO en la escena 12. El look "ninja" del modo
 * infiltrado es FIEL al filme, con cara amable.
 */

// ---- Canónicos (muñecos nuevos) ----
export const YEHOSHUA_SKIN: MinifigureSkin = YOSHUA_SKIN;   // turbante cobalto, barba blanca, bastón
export const ESPIA1_SIGILO: MinifigureSkin = SPY_SKIN;      // ninja azul pizarra, cara amable
export const ESPIA2_SIGILO: MinifigureSkin = SPY2_SKIN;     // ninja gris asfalto
export const GUARDIA_SKIN: MinifigureSkin = GUARD_SKIN;     // casco cónico + rayas + escudo + lanza
export const JEFE_GUARDIA_SKIN: MinifigureSkin = GUARD_CHIEF_SKIN; // plumas + capa + alabarda

// ---- Variantes de CAMPAMENTO de los espías (locales, escenas 9–11) ----
export const ESPIA1_CAMP: MinifigureSkin = {
  head: 0xf2c141,
  torso: 0xcdba8f,   // túnica beige
  belt: 0x6e4a2c,
  legs: 0x8a6a3a,
  arms: 0xbfa878,
  hands: 0xf2c141,
  headwear: 0x8290a4, // turbante gris azulado
  headStyle: 'turban'
};
export const ESPIA2_CAMP: MinifigureSkin = {
  head: 0xf2c141,
  torso: 0x8f6a3e,   // túnica marrón
  belt: 0x5a4028,
  legs: 0x6f5230,
  arms: 0x7a5a34,
  hands: 0xf2c141,
  headwear: 0x9fb6d4, // turbante azul claro
  headStyle: 'turban'
};
