import * as THREE from 'three';

/**
 * Paleta centralizada. Los tonos "sand/tan/warm" están afinados hacia la
 * arenisca cálida de la película de referencia (murallas de la ciudad).
 * (Se recalibrará contra los fotogramas en la fase de biblia visual.)
 */
export const BrickPalette = {
  RED: 0xb62b2b,
  DARK_RED: 0x7d1c1c,
  BLUE: 0x1f6fb2,
  DARK_BLUE: 0x143f66,
  YELLOW: 0xf0b429,
  ORANGE: 0xdd7a1e,
  GREEN: 0x4c9e5e,
  DARK_GREEN: 0x2f6b3d,
  WHITE: 0xf4efe4,
  BLACK: 0x1c150e,
  LIGHT_GRAY: 0xb9b2a4,
  DARK_GRAY: 0x6b675e,
  TAN: 0xe4cf9f,
  SAND: 0xdcc08a,
  WARM_SAND: 0xe9d6a8,
  DARK_SAND: 0xc2a56f,
  BROWN: 0x7a5433,
  DARK_BROWN: 0x4e341f,
  GOLD: 0xcaa14a,
  SILVER: 0xbfc2c4
} as const;

export type BrickColorName = keyof typeof BrickPalette;

export function color(name: BrickColorName): THREE.Color {
  return new THREE.Color(BrickPalette[name]);
}
