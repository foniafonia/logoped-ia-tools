/**
 * Sistema de medidas centralizado.
 * La unidad horizontal principal es el STUD (paso de tetón).
 * Todas las piezas son múltiplos de esta unidad. Proporciones tomadas de
 * juguetes de construcción reales (relación altura/paso ~1.2, placa ~0.4).
 */
export const STUD_WIDTH = 1.0; // paso horizontal (X)
export const STUD_DEPTH = 1.0; // paso horizontal (Z)
export const BRICK_HEIGHT = 1.2; // alto de un ladrillo estándar
export const PLATE_HEIGHT = 0.4; // alto de una placa (1/3 de ladrillo)
export const TILE_HEIGHT = 0.4; // baldosa (placa sin tetones)
export const STUD_RADIUS = 0.3; // radio del tetón
export const STUD_HEIGHT = 0.22; // altura del tetón sobre la pieza
export const BEVEL_SIZE = 0.06; // bisel sutil de los bordes
export const PIECE_GAP = 0.02; // holgura visual entre piezas (juntas)
export const CHARACTER_SCALE = 1.6; // altura relativa de la minifigura (fases posteriores)
