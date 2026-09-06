import * as THREE from 'three';

/** Parámetros de acabado de plástico (ajustables desde config/panel). */
export interface PlasticConfig {
  roughness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  envMapIntensity: number;
}

export const DEFAULT_PLASTIC: PlasticConfig = {
  roughness: 0.32,
  clearcoat: 0.4,
  clearcoatRoughness: 0.2,
  envMapIntensity: 1.15
};

/**
 * Materiales de plástico moldeado (ABS). MeshPhysicalMaterial con clearcoat
 * para el brillo característico de los juguetes de construcción.
 * Se cachean por color para compartir material entre piezas.
 */
export class PlasticMaterialFactory {
  private cache = new Map<number, THREE.MeshPhysicalMaterial>();
  private cfg: PlasticConfig;

  constructor(cfg: PlasticConfig = DEFAULT_PLASTIC) {
    this.cfg = { ...cfg };
  }

  get(colorHex: number): THREE.MeshPhysicalMaterial {
    let m = this.cache.get(colorHex);
    if (!m) {
      m = new THREE.MeshPhysicalMaterial({
        color: colorHex,
        metalness: 0,
        roughness: this.cfg.roughness,
        clearcoat: this.cfg.clearcoat,
        clearcoatRoughness: this.cfg.clearcoatRoughness,
        envMapIntensity: this.cfg.envMapIntensity
      });
      this.cache.set(colorHex, m);
    }
    return m;
  }

  /** Reajusta el acabado en caliente (para el panel de depuración). */
  update(partial: Partial<PlasticConfig>): void {
    Object.assign(this.cfg, partial);
    for (const m of this.cache.values()) {
      m.roughness = this.cfg.roughness;
      m.clearcoat = this.cfg.clearcoat;
      m.clearcoatRoughness = this.cfg.clearcoatRoughness;
      m.envMapIntensity = this.cfg.envMapIntensity;
      m.needsUpdate = true;
    }
  }
}
