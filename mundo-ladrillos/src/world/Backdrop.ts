import * as THREE from 'three';

/**
 * Backdrop — telón de fondo anclado AL MUNDO (matte-painting), en 1 línea.
 *
 * El problema del "pegote": una imagen puesta como `scene.background` va pegada
 * al cristal — al mover la cámara (sobre todo cenital) parece un sticker quieto.
 * Aquí el fondo es un CILINDRO gigante y lejano (cara interior) centrado delante
 * de la cámara: se ve una porción frontal de la imagen, se mueve acompasado con
 * la escena (paralaje real) y nunca queda como pared plana aunque gires.
 *
 * USO:
 *   import { addBackdrop, backdropRails } from './world/Backdrop';
 *   import { bgCampamento } from '../assets/bgCampamento';
 *   const bd = addBackdrop(scene, bgCampamento);           // <- 1 línea
 *   backdropRails(controls);                                // limita la cámara
 *
 * Los assets viven en `src/assets/*.ts` como data-URI (Higgsfield, verificados
 * por md5) — se empaquetan sí o sí en el build single-file y esquivan la CSP.
 * Ver `referencias/RECURSOS-HIGGSFIELD.md`.
 */

export interface BackdropOptions {
  /** Radio del cilindro (distancia al telón). Def. 82. Más grande = más lejano. */
  radius?: number;
  /** Alto del cilindro. Def. 150. */
  height?: number;
  /** Arco frontal cubierto, en radianes. Def. 2.5. */
  arc?: number;
  /** Centro del telón (dónde apunta la cámara). Def. (0, 10, 5). */
  center?: THREE.Vector3 | [number, number, number];
  /** Color de respaldo del cielo (fog / hueco). Def. tomado del borde cálido. */
  skyColor?: THREE.ColorRepresentation;
}

export interface BackdropHandle {
  mesh: THREE.Mesh;
  texture: THREE.Texture;
  /** Recoloca el centro del telón (p.ej. si la cámara se reencuadra). */
  setCenter(x: number, y: number, z: number): void;
  dispose(): void;
}

/**
 * Añade el telón curvo a la escena y lo devuelve. `src` es un data-URI (o URL)
 * de la imagen de fondo. También fija `scene.background` a un color de cielo para
 * que nunca se vea negro en los huecos del arco.
 */
export function addBackdrop(
  scene: THREE.Scene,
  src: string,
  opts: BackdropOptions = {}
): BackdropHandle {
  const radius = opts.radius ?? 82;
  const height = opts.height ?? 150;
  const arc = opts.arc ?? 2.5;
  const c = opts.center ?? [0, 10, 5];
  const center = Array.isArray(c) ? new THREE.Vector3(c[0], c[1], c[2]) : c;

  const tex = new THREE.TextureLoader().load(src);
  tex.colorSpace = THREE.SRGBColorSpace;
  // Cara interior: repetir en X con signo negativo para no ver la imagen espejada.
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.x = -1;
  tex.offset.x = 1;

  const geo = new THREE.CylinderGeometry(radius, radius, height, 64, 1, true, Math.PI - arc / 2, arc);
  const mat = new THREE.MeshBasicMaterial({
    map: tex, toneMapped: false, fog: false, depthWrite: false, side: THREE.BackSide
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(center);
  mesh.renderOrder = -1;
  scene.add(mesh);

  // Cielo de respaldo: si no lo ponen, un cálido de atardecer (nunca negro).
  if (opts.skyColor !== undefined) scene.background = new THREE.Color(opts.skyColor);
  else if (!scene.background) scene.background = new THREE.Color(0xf3c48a);

  return {
    mesh,
    texture: tex,
    setCenter(x, y, z) { mesh.position.set(x, y, z); },
    dispose() {
      scene.remove(mesh);
      geo.dispose();
      mat.dispose();
      tex.dispose();
    }
  };
}

/**
 * Limita una cámara OrbitControls al arco frontal del telón: no deja mirar por
 * detrás, ni desde arriba del todo (cenital rompería la ilusión del matte).
 * Ajusta los topes por escena si necesitas más/menos libertad.
 */
export function backdropRails(
  controls: { minAzimuthAngle: number; maxAzimuthAngle: number; minPolarAngle: number; maxPolarAngle: number },
  opts: { azimuth?: number; minPolar?: number; maxPolar?: number } = {}
): void {
  const az = opts.azimuth ?? 0.45;
  controls.minAzimuthAngle = -az;
  controls.maxAzimuthAngle = az;
  controls.minPolarAngle = opts.minPolar ?? 1.24;   // ~71°
  controls.maxPolarAngle = opts.maxPolar ?? 1.52;   // ~87°, casi horizontal
}
