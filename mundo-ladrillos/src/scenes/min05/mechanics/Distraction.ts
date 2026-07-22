import * as THREE from 'three';
import { PlasticMaterialFactory } from '../../../materials/PlasticMaterialFactory';
import { BrickPalette } from '../../../materials/BrickPalette';
import { brickBox } from '../props/BrickProps';
import { Npc } from '../props/Npc';

/**
 * LA TRETA DEL "¡UN AVIÓN!" (escena 14): el jugador llega a un punto de grito;
 * al activarla (tecla E / botón, o al entrar en la zona) un AVIÓN DE LADRILLO
 * cruza el cielo, los guardias giran la cabeza al cielo (bajan la guardia) y se
 * abre la ventana de oportunidad. Devuelve si la distracción está activa para
 * que las mecánicas de sigilo bajen los conos mientras dura.
 */
export class Distraction {
  readonly group = new THREE.Group();
  private plane: THREE.Group;
  private timer = 0;          // >0 mientras dura la distracción
  private readonly DUR = 6;
  private guards: Npc[];
  private guardBaseYaw: number[];
  private used = false;

  constructor(plastic: PlasticMaterialFactory, guards: Npc[]) {
    this.guards = guards;
    this.guardBaseYaw = guards.map((g) => g.yaw);
    this.plane = this.buildPlane(plastic);
    this.plane.visible = false;
    this.group.add(this.plane);
  }

  /** Avión de juguete de ladrillo (fuselaje, alas, cola, hélice). */
  private buildPlane(plastic: PlasticMaterialFactory): THREE.Group {
    const g = new THREE.Group();
    g.add(brickBox(plastic, 1.4, 1.2, 6, BrickPalette.RED, 0, 0, 0));          // fuselaje
    g.add(brickBox(plastic, 8, 0.4, 1.6, BrickPalette.WHITE, 0, 0.2, 0.4));    // ala
    g.add(brickBox(plastic, 3, 0.4, 1, BrickPalette.WHITE, 0, 0.6, -2.6));     // cola horizontal
    g.add(brickBox(plastic, 0.4, 1.4, 1, BrickPalette.RED, 0, 1.2, -2.6));     // deriva
    g.add(brickBox(plastic, 1, 0.9, 1, BrickPalette.DARK_BLUE, 0, 0.9, 0.8));  // cabina
    const prop = brickBox(plastic, 0.3, 2.4, 0.3, BrickPalette.DARK_GRAY, 0, 0, 3.1);
    prop.name = 'prop';
    g.add(prop);
    g.scale.setScalar(1.4);
    return g;
  }

  get active(): boolean { return this.timer > 0; }
  get spent(): boolean { return this.used && this.timer <= 0; }

  /** Dispara la treta (una vez). */
  trigger(): void {
    if (this.used) return;
    this.used = true;
    this.timer = this.DUR;
    this.plane.visible = true;
    this.plane.position.set(-70, 34, 30);
  }

  update(dt: number, t: number): void {
    if (this.timer > 0) {
      this.timer -= dt;
      // el avión cruza el cielo de -X a +X
      this.plane.position.x += 24 * dt;
      this.plane.position.y = 34 + Math.sin(t * 2) * 1.5;
      const prop = this.plane.getObjectByName('prop');
      if (prop) prop.rotation.z += dt * 40;
      // guardias miran al cielo (giran hacia el avión y alzan la vista)
      for (const g of this.guards) {
        g.lookAt(this.plane.position.x, this.plane.position.z);
        g.root.rotation.x = -0.5; // cabeza/cuerpo mirando arriba
      }
      if (this.timer <= 0) {
        this.plane.visible = false;
        for (const g of this.guards) {
          g.root.rotation.x = 0;
        }
        // los guardias vuelven a su vigilancia base
        this.guards.forEach((g, i) => (g.root.rotation.y = this.guardBaseYaw[i]));
      }
    }
  }
}
