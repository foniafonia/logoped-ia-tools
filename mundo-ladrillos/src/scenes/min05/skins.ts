import {
  MinifigureSkin, SPY_SKIN, SPY2_SKIN, YOSHUA_SKIN, GUARD_SKIN, GUARD_CHIEF_SKIN,
  SPY_CAMP_SKIN, SPY2_CAMP_SKIN, RAHAB_SKIN
} from '../../characters/MinifigureFactory';

/**
 * Skins del tramo 5–10. TODOS canónicos del MUÑEQUERO (`MinifigureFactory`):
 * casco cónico, capa, bastón, rayas, variantes de campamento… nativos. Aquí solo
 * se reexportan con nombres del tramo para que las escenas no dependan de los
 * nombres del catálogo.
 *
 * CLAVE narrativa (fiel a la peli): los espías van de CAMPAMENTO en las escenas
 * 9–11 y se ponen el TRAJE DE SIGILO en la escena 12. El look "ninja" del modo
 * infiltrado es FIEL al filme, con cara amable.
 */
export const YEHOSHUA_SKIN: MinifigureSkin = YOSHUA_SKIN;   // turbante cobalto, barba blanca, bastón
export const ESPIA1_SIGILO: MinifigureSkin = SPY_SKIN;      // ninja azul pizarra, cara amable
export const ESPIA2_SIGILO: MinifigureSkin = SPY2_SKIN;     // ninja gris asfalto
export const GUARDIA_SKIN: MinifigureSkin = GUARD_SKIN;     // casco cónico + rayas + escudo + lanza
export const JEFE_GUARDIA_SKIN: MinifigureSkin = GUARD_CHIEF_SKIN; // plumas + capa + alabarda
// Variantes de CAMPAMENTO de los espías (canónicas del muñequero, escenas 9–11):
export const ESPIA1_CAMP: MinifigureSkin = SPY_CAMP_SKIN;   // túnica beige + turbante gris-azulado
export const ESPIA2_CAMP: MinifigureSkin = SPY2_CAMP_SKIN;  // túnica marrón + turbante azul claro
export const RAHAB_MUJER: MinifigureSkin = RAHAB_SKIN;      // Rahab: melena larga, vestido humilde, cordón carmesí
