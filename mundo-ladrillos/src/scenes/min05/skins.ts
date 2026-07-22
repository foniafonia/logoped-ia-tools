import { MinifigureSkin, SPY_SKIN } from '../../characters/MinifigureFactory';

/**
 * Skins del tramo 5–10, calcados de `referencias/personajes.md` (hex
 * autoritativos de la peli). Se componen localmente (no se edita el
 * MinifigureFactory compartido). Si MUÑEQUERO publica los canónicos, se
 * sustituyen.
 *
 * CLAVE narrativa (fiel a la peli): los espías van de CAMPAMENTO en las escenas
 * 9–11 y solo se ponen el TRAJE DE SIGILO a partir de la escena 12 ("se cambian
 * a trajes de sigilo"). El look "ninja" del modo infiltrado es FIEL al filme
 * (capucha + máscara que deja ver ojos + chaleco con cinchas), con cara amable.
 */

// ---- Yehoshúa: barba blanca, turbante cobalto, túnica marrón, (capa+bastón props) ----
export const YEHOSHUA_SKIN: MinifigureSkin = {
  head: 0xf4d03f,
  torso: 0xb07a3c,   // túnica marrón claro
  belt: 0x4e341f,
  legs: 0x9a6a38,
  arms: 0xa07a44,
  hands: 0xf4d03f,
  headwear: 0x2980b9, // turbante azul cobalto
  headStyle: 'turban',
  beard: 0xd7dbde     // barba larga blanca/canosa
};

// ---- Espías en MODO CAMPAMENTO (escenas 9–11) ----
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

// ---- Espías en MODO SIGILO (escenas 12–16) ----
// Espía 1: reutiliza el skin compartido (ninja azul pizarra, cara amable).
export const ESPIA1_SIGILO: MinifigureSkin = { ...SPY_SKIN };
// Espía 2: gris asfalto (#566573) con cinchas claras.
export const ESPIA2_SIGILO: MinifigureSkin = {
  head: 0xf2c141,
  torso: 0x566573,
  belt: 0x45505c,
  legs: 0x4a545f,
  arms: 0x566573,
  hands: 0xf2c141,
  headwear: 0x4c5a66,
  headStyle: 'ninja',
  straps: 0x9aa7b5
};

// ---- Guardia de Jericó: túnica a rayas rojo (el amarillo va como prop) ----
// (el casco cónico plateado, la raya amarilla y el escudo/lanza se añaden en
//  props/Guard.ts, porque el skin no puede pintar rayas ni cascos)
export const GUARDIA_SKIN: MinifigureSkin = {
  head: 0xf2c141,
  torso: 0xc0392b,   // túnica roja
  belt: 0x7a1f16,
  legs: 0xb03020,
  arms: 0xc0392b,
  hands: 0xf2c141,
  beard: undefined
};
export const JEFE_GUARDIA_SKIN: MinifigureSkin = {
  head: 0xf2c141,
  torso: 0x8a6a3a,   // peto de metal/cuero
  belt: 0x4e341f,
  legs: 0x6f5230,
  arms: 0x7a5a34,
  hands: 0xf2c141,
  beard: 0x3a2a1a
};
