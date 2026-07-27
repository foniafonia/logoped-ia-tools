import * as THREE from 'three';
import { PlasticMaterialFactory } from '../../../materials/PlasticMaterialFactory';
import { BrickPalette } from '../../../materials/BrickPalette';
import { brickBox } from '../props/BrickProps';

/**
 * CRUZAR POR CUERDA (escena 13): un PUENTE DE CUERDA tendido sobre el río, de
 * la orilla `zA` a la orilla `zB`. Tiene dos cuerdas-pasamanos en alto y una
 * pasarela de tablones a ras del agua que BASCULA lateralmente (la corriente y
 * el viento la mecen). El jugador cruza por la pasarela; si se desvía en X más
 * que el ancho seguro respecto al centro (que oscila), resbala al agua y vuelve
 * al inicio. Todo a ras de suelo: no hay que manipular la altura del jugador.
 */
export class RopeCrossing {
  readonly group = new THREE.Group();
  private ropes: THREE.Mesh[] = [];
  private planks: THREE.Mesh[] = [];
  private zA: number;
  private zB: number;
  private amp: number;       // amplitud del vaivén lateral (X)
  private safeHalf: number;  // margen a cada lado antes de resbalar
  private fellFlash = 0;
  private postH: number;

  constructor(
    plastic: PlasticMaterialFactory,
    zA: number, zB: number,
    opts: { amp?: number; safeHalf?: number; postH?: number } = {}
  ) {
    this.zA = zA; this.zB = zB;
    this.amp = opts.amp ?? 1.4;
    this.safeHalf = opts.safeHalf ?? 1.7;
    this.postH = opts.postH ?? 6;

    // postes de amarre + travesaño en las dos orillas
    for (const z of [zA, zB]) {
      for (const sx of [-2.4, 2.4]) {
        this.group.add(brickBox(plastic, 1, this.postH, 1, BrickPalette.DARK_BROWN, sx, this.postH / 2, z));
      }
      this.group.add(brickBox(plastic, 6, 0.6, 0.9, BrickPalette.BROWN, 0, this.postH, z));
    }

    // dos cuerdas-pasamanos en alto (tubos curvados), a izquierda y derecha
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0x8a6b3a, roughness: 0.9 });
    for (const side of [-1, 1]) {
      const rope = new THREE.Mesh(new THREE.TubeGeometry(this.handCurve(0, side), 34, 0.1, 6, false), ropeMat);
      rope.castShadow = true;
      rope.userData.side = side;
      this.ropes.push(rope);
      this.group.add(rope);
    }

    // pasarela de tablones a ras del agua
    const n = 16;
    for (let i = 0; i < n; i++) {
      const plank = brickBox(plastic, 3, 0.28, 1.1, i % 2 ? BrickPalette.BROWN : BrickPalette.DARK_BROWN, 0, 0.2, 0);
      this.planks.push(plank);
      this.group.add(plank);
    }
  }

  /** Curva del pasamanos `side` (izq/der) con vaivén `lateral` en el centro. */
  private handCurve(lateral: number, side: number): THREE.CatmullRomCurve3 {
    const pts: THREE.Vector3[] = [];
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const z = THREE.MathUtils.lerp(this.zA, this.zB, u);
      const droop = Math.sin(u * Math.PI) * 1.2;
      const x = side * 1.6 + Math.sin(u * Math.PI) * lateral;
      pts.push(new THREE.Vector3(x, this.postH - 0.4 - droop, z));
    }
    return new THREE.CatmullRomCurve3(pts);
  }

  private uFor(pz: number): number {
    return THREE.MathUtils.clamp((pz - this.zA) / (this.zB - this.zA), 0, 1);
  }

  /** Centro X (que oscila) de la pasarela para el progreso `u`. */
  private centerX(u: number, lateral: number): number {
    return Math.sin(u * Math.PI) * lateral;
  }

  get fellRecently(): boolean { return this.fellFlash > 0; }
  get safeMargin(): number { return this.safeHalf; }

  /**
   * Cada frame: aplica el vaivén, recoloca cuerdas y tablones, y comprueba el
   * equilibrio del jugador. Devuelve si está sobre el puente, si ha caído, y el
   * centro X actual (para que la escena pinte una guía).
   */
  update(dt: number, t: number, player: THREE.Vector3): { onSpan: boolean; fell: boolean; centerX: number; nearMiss: boolean } {
    if (this.fellFlash > 0) this.fellFlash -= dt;
    const lateral = Math.sin(t * 1.05) * this.amp;

    // reconstruir pasamanos con el vaivén
    for (const rope of this.ropes) {
      rope.geometry.dispose();
      rope.geometry = new THREE.TubeGeometry(this.handCurve(lateral, rope.userData.side), 34, 0.1, 6, false);
    }
    // recolocar tablones sobre la pasarela (a ras de agua) siguiendo el centro
    for (let i = 0; i < this.planks.length; i++) {
      const u = (i + 0.5) / this.planks.length;
      const z = THREE.MathUtils.lerp(this.zA, this.zB, u);
      const cx = this.centerX(u, lateral);
      this.planks[i].position.set(cx, 0.2 + Math.sin(u * Math.PI) * 0.15, z);
      this.planks[i].rotation.z = lateral * 0.04;
    }

    const zMin = Math.min(this.zA, this.zB) + 1.2;
    const zMax = Math.max(this.zA, this.zB) - 1.2;
    const onSpan = player.z > zMin && player.z < zMax;
    if (!onSpan) return { onSpan: false, fell: false, centerX: 0, nearMiss: false };

    const u = this.uFor(player.z);
    const cx = this.centerX(u, lateral);
    const offset = Math.abs(player.x - cx);
    if (offset > this.safeHalf) {
      this.fellFlash = 1.2;
      return { onSpan: true, fell: true, centerX: cx, nearMiss: false };
    }
    return { onSpan: true, fell: false, centerX: cx, nearMiss: offset > this.safeHalf * 0.6 };
  }
}
