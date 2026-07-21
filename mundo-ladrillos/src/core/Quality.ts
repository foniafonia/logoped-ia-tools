/** Detección de móvil y perfil de calidad para que no se cuelgue en el teléfono. */
export const IS_MOBILE =
  /Android|iPhone|iPad|iPod|Mobile|Silk/i.test(navigator.userAgent) ||
  (('ontouchstart' in window) && Math.min(innerWidth, innerHeight) < 820);

export interface QualitySettings {
  pixelRatio: number;
  shadows: boolean;
  shadowMap: number;
  envMap: boolean;   // reflejos PMREM (caro en móvil)
  fogFar: number;
  brickSegments: number; // detalle de las piezas
  studSegments: number;
}

export const QUALITY: QualitySettings = IS_MOBILE
  ? { pixelRatio: Math.min(devicePixelRatio, 1.3), shadows: true, shadowMap: 1024, envMap: false, fogFar: 240, brickSegments: 1, studSegments: 10 }
  : { pixelRatio: Math.min(devicePixelRatio, 2), shadows: true, shadowMap: 2048, envMap: true, fogFar: 340, brickSegments: 3, studSegments: 20 };
