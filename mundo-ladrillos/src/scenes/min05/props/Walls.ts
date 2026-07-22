import * as THREE from 'three';
import { PlasticMaterialFactory } from '../../../materials/PlasticMaterialFactory';
import { BrickPalette } from '../../../materials/BrickPalette';
import { BRICK_HEIGHT } from '../../../bricks/BrickDimensions';
import { brickBox } from './BrickProps';

/**
 * Muro recto de ladrillo (cara frontal hacia +z), coronado con almenas — el
 * mismo lenguaje que la muralla compartida, pero autocontenido en mi carpeta
 * para no depender de funciones internas del builder del lead. Con hueco de
 * puerta opcional en el centro.
 */
export function buildStraightWallLike(
  plastic: PlasticMaterialFactory,
  widthStuds: number, courses: number, gate = false,
  gateHalf = 3
): THREE.Group {
  const g = new THREE.Group();
  const x0 = -widthStuds / 2;
  const tones = [BrickPalette.SAND, BrickPalette.WARM_SAND, BrickPalette.DARK_SAND, BrickPalette.TAN];
  for (let c = 0; c < courses; c++) {
    const y = 0.6 + c * BRICK_HEIGHT;
    const offset = c % 2 ? -1 : 0;
    for (let sx = 0; sx < widthStuds; sx += 2) {
      const cx = x0 + sx + offset + 1;
      if (gate && c < 5 && Math.abs(cx) < gateHalf) continue; // hueco de puerta
      const tone = tones[(Math.floor(cx) * 7 + c * 3) % tones.length];
      g.add(brickBox(plastic, 2, BRICK_HEIGHT, 3, tone, cx, y, 0));
    }
    if (gate && c === 5) {
      g.add(brickBox(plastic, gateHalf * 2 + 1, BRICK_HEIGHT * 1.2, 3.4, BrickPalette.DARK_SAND, 0, y, 0)); // dintel
    }
  }
  const topY = 0.6 + courses * BRICK_HEIGHT;
  // banda saliente
  g.add(brickBox(plastic, widthStuds, 0.5, 3.4, BrickPalette.SAND, 0, topY + 0.2, 0.2));
  // almenas (merlones) alternas
  for (let x = x0; x < x0 + widthStuds - 1; x += 2) {
    g.add(brickBox(plastic, 1.4, BRICK_HEIGHT, 1.5, BrickPalette.WARM_SAND, x + 1, topY + 0.9, 0.8));
  }
  return g;
}
