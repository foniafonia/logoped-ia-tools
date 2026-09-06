import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { QUALITY, IS_MOBILE } from './Quality';

/**
 * PreciousRender — el acabado "precioso" empaquetado para enchufar en 1 línea.
 *
 * Reúne lo que hace bonito el juego sin salir de la web/tiempo real:
 *   · IBL (RoomEnvironment vía PMREM) → el plástico refleja y brilla
 *   · tono cinemático ACES + exposición + sombras suaves
 *   · post-proceso: bloom (UnrealBloomPass) + SMAA (antialias) + OutputPass
 * Respeta `Quality.ts`: en móvil baja el pixelRatio, apaga el IBL/PMREM
 * (`QUALITY.envMap`) y usa sombras más baratas, para que no se cuelgue.
 *
 * USO (1 línea + render + resize):
 *   const fx = setupPreciousRender(renderer, scene, camera);
 *   // en el bucle:            fx.render();          // en vez de renderer.render(scene,camera)
 *   // en 'resize':            fx.setSize(innerWidth, innerHeight);
 *   // al desmontar la escena: fx.dispose();
 *
 * Los MATERIALES siguen siendo del que llama: para lucir el brillo, usa
 * `PlasticMaterialFactory` con clearcoat + envMapIntensity (ya lo hace). Las
 * LUCES y sus sombras también las pone el tramo; este helper solo activa
 * `renderer.shadowMap` y el tono/post-proceso.
 */

export interface PreciousOptions {
  /** Exposición del tono ACES. Def. 1.08. */
  exposure?: number;
  /**
   * Preset de bloom por tipo de escena (elige umbral/fuerza con gusto):
   *   · 'day'      exterior diurno — sutil, NO lava (umbral alto). RECOMENDADO de día.
   *   · 'night'    nocturno — glow marcado (faroles, luna, oro).
   *   · 'interior' posada/tienda — intermedio.
   * Si no se indica, usa un default seguro (umbral alto) que no lava los diurnos.
   * `bloom` (abajo) siempre tiene prioridad sobre el preset.
   */
  preset?: 'day' | 'night' | 'interior';
  /** Bloom (brillo cinemático). Sobrescribe el preset. Def. seguro: strength .35 / radius .55 / threshold .90. */
  bloom?: { strength?: number; radius?: number; threshold?: number };
  /** Fuerza el IBL on/off. Por defecto sigue `QUALITY.envMap` (off en móvil). */
  ibl?: boolean;
  /** Sigma del PMREM (suavizado del entorno). Def. 0.03. */
  iblSigma?: number;
  /** Antialias SMAA. Def. true (se salta en modo lite). */
  smaa?: boolean;
  /**
   * Modo "lite" adaptativo para móvil (por defecto = IS_MOBILE): salta SMAA y
   * aligera el bloom para que no ahogue el teléfono. Fuérzalo con true/false.
   */
  lite?: boolean;
}

export interface PreciousHandle {
  composer: EffectComposer;
  bloomPass: UnrealBloomPass;
  lite: boolean;   // true si va en modo ligero (móvil): sin SMAA, bloom aligerado, sin IBL
  render(): void;
  setSize(w: number, h: number): void;
  dispose(): void;
}

export function setupPreciousRender(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  opts: PreciousOptions = {}
): PreciousHandle {
  const exposure = opts.exposure ?? 1.08;
  const lite = opts.lite ?? IS_MOBILE;
  // Presets de bloom por escena. El default sube el UMBRAL (0.90) para NO lavar
  // los exteriores diurnos (el 5–10 avisó de esto). 'night' recupera el glow.
  const PRESETS = {
    day: { strength: 0.20, radius: 0.50, threshold: 0.92 },
    night: { strength: 0.50, radius: 0.70, threshold: 0.70 },
    interior: { strength: 0.34, radius: 0.60, threshold: 0.82 }
  };
  const DEFAULT_BLOOM = { strength: 0.35, radius: 0.55, threshold: 0.90 };
  const preBase = opts.preset ? PRESETS[opts.preset] : DEFAULT_BLOOM;
  // En lite aligeramos el bloom del preset (kernel menor + algo menos de fuerza + umbral algo más alto)
  const lit = lite
    ? { strength: preBase.strength * 0.75, radius: 0.4, threshold: Math.min(0.95, preBase.threshold + 0.03) }
    : preBase;
  const bloomCfg = { ...lit, ...opts.bloom }; // `bloom` explícito siempre gana
  const useIbl = opts.ibl ?? QUALITY.envMap;      // ya off en móvil (Quality)
  const useSmaa = (opts.smaa ?? true) && !lite;   // SMAA se salta en móvil (caro)

  // --- Ajustes del renderer (tono cinemático + sombras suaves) ---
  renderer.setPixelRatio(QUALITY.pixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = exposure;
  renderer.shadowMap.enabled = QUALITY.shadows;
  renderer.shadowMap.type = QUALITY.envMap ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;

  // --- IBL: reflejos de estudio suaves (lo que hace brillar el plástico) ---
  let pmrem: THREE.PMREMGenerator | null = null;
  if (useIbl) {
    pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), opts.iblSigma ?? 0.03).texture;
  }

  // --- Post-proceso ---
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(innerWidth, innerHeight),
    bloomCfg.strength, bloomCfg.radius, bloomCfg.threshold
  );
  composer.addPass(bloomPass);
  if (useSmaa) composer.addPass(new SMAAPass(innerWidth, innerHeight));
  composer.addPass(new OutputPass());

  return {
    composer,
    bloomPass,
    lite,
    render: () => composer.render(),
    setSize: (w: number, h: number) => composer.setSize(w, h),
    dispose: () => {
      composer.dispose();
      pmrem?.dispose();
      if (scene.environment) { scene.environment.dispose?.(); scene.environment = null; }
    }
  };
}
