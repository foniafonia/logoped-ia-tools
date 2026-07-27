import * as THREE from 'three';
import { PlasticMaterialFactory } from '../../../materials/PlasticMaterialFactory';
import { BrickPalette } from '../../../materials/BrickPalette';
import { brickBox } from '../props/BrickProps';
import { Npc } from '../props/Npc';

/**
 * LA TRETA DEL "¡UN AVIÓN!" (escena 14). Al activarla (tecla E), un AVIÓN DE
 * LADRILLO grande cruza BAJO y ruidoso, con ESTELA y una SOMBRA que barre el
 * suelo; los guardias miran arriba boquiabiertos y SEÑALAN (brazo en alto, "!"),
 * bajando la guardia. Devuelve `active` para abrir la ventana de sigilo.
 */
export class Distraction {
  readonly group = new THREE.Group();
  private plane: THREE.Group;
  private shadow: THREE.Mesh;
  private marks: THREE.Sprite[] = [];
  private puffs: Array<{ m: THREE.Mesh; life: number }> = [];
  private puffTimer = 0;
  private timer = 0;
  private readonly DUR = 7;
  private readonly Z = -3;         // cruza JUSTO por encima del jugador → su sombra te barre
  private readonly Y = 12;         // altura de vuelo (bajo → dramático y en cuadro)
  private readonly SPEED = 22;
  private guards: Npc[];
  private guardBaseYaw: number[];
  private used = false;

  constructor(private plastic: PlasticMaterialFactory, guards: Npc[]) {
    this.guards = guards;
    this.guardBaseYaw = guards.map((g) => g.yaw);
    this.plane = this.buildPlane(plastic);
    this.plane.visible = false;
    this.group.add(this.plane);

    // SOMBRA del avión (disco oscuro achatado a ras de suelo), grande y visible
    this.shadow = new THREE.Mesh(
      new THREE.CircleGeometry(5, 24),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45, depthWrite: false })
    );
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.scale.set(2.6, 1, 1); // alargada como una silueta de avión
    this.shadow.visible = false;
    this.group.add(this.shadow);

    // "!" de sorpresa sobre cada guardia
    for (const g of this.guards) {
      const spr = this.makeMark();
      spr.visible = false;
      g.root.add(spr);
      this.marks.push(spr);
    }
  }

  private makeMark(): THREE.Sprite {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d')!;
    x.fillStyle = '#ffe08a'; x.font = 'bold 54px system-ui'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText('!', 32, 36);
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false }));
    spr.position.set(0, 5.8, 0); spr.scale.set(1.7, 1.7, 1);
    return spr;
  }

  /** Avión de juguete de ladrillo, más grande (fuselaje, alas, cola, hélice). */
  private buildPlane(plastic: PlasticMaterialFactory): THREE.Group {
    const g = new THREE.Group();
    g.add(brickBox(plastic, 1.6, 1.4, 7, BrickPalette.RED, 0, 0, 0));          // fuselaje
    g.add(brickBox(plastic, 10, 0.5, 2, BrickPalette.WHITE, 0, 0.2, 0.4));     // ala
    g.add(brickBox(plastic, 3.6, 0.5, 1.2, BrickPalette.WHITE, 0, 0.6, -3));   // cola horizontal
    g.add(brickBox(plastic, 0.5, 1.7, 1.2, BrickPalette.RED, 0, 1.4, -3));     // deriva
    g.add(brickBox(plastic, 1.2, 1.1, 1.2, BrickPalette.DARK_BLUE, 0, 1.0, 1));// cabina
    g.add(brickBox(plastic, 2, 0.4, 0.5, BrickPalette.YELLOW, 3.4, 0.1, 0.4)); // puntas de ala
    g.add(brickBox(plastic, 2, 0.4, 0.5, BrickPalette.YELLOW, -3.4, 0.1, 0.4));
    const prop = brickBox(plastic, 0.35, 3, 0.35, BrickPalette.DARK_GRAY, 0, 0, 3.6);
    prop.name = 'prop';
    g.add(prop);
    g.scale.setScalar(1.7);
    return g;
  }

  get active(): boolean { return this.timer > 0; }
  get spent(): boolean { return this.used && this.timer <= 0; }
  /** El avión (para que la cámara lo enfoque en el momento cinemático). */
  get planeObject(): THREE.Object3D { return this.plane; }
  /** Fracción 0..1 de la ventana de distracción (para el HUD "¡AHORA!"). */
  get window(): number { return Math.max(0, this.timer / this.DUR); }

  trigger(): void {
    if (this.used) return;
    this.used = true;
    this.timer = this.DUR;
    this.plane.visible = true;
    this.shadow.visible = true;
    this.plane.position.set(-60, this.Y, this.Z);
  }

  private spawnPuff(x: number, y: number, z: number): void {
    const m = brickBox(this.plastic, 0.6, 0.6, 0.6, BrickPalette.WHITE, x, y, z);
    (m.material as THREE.Material).transparent = true;
    this.group.add(m);
    this.puffs.push({ m, life: 1.4 });
  }

  update(dt: number, t: number): void {
    // estela: los puff se encogen y se desvanecen
    for (const p of this.puffs) {
      p.life -= dt;
      const k = Math.max(0, p.life / 1.4);
      p.m.scale.setScalar(0.4 + k * 1.2);
      (p.m.material as any).opacity = k * 0.7;
    }
    const dead = this.puffs.filter((p) => p.life <= 0);
    for (const p of dead) { this.group.remove(p.m); p.m.geometry.dispose(); }
    this.puffs = this.puffs.filter((p) => p.life > 0);

    if (this.timer <= 0) return;
    this.timer -= dt;

    // el avión cruza de -X a +X, bajo, con leve balanceo
    this.plane.position.x += this.SPEED * dt;
    this.plane.position.y = this.Y + Math.sin(t * 2.2) * 1.2;
    this.plane.rotation.z = Math.sin(t * 2.2) * 0.12;     // alabeo
    this.plane.rotation.y = -0.06;
    const prop = this.plane.getObjectByName('prop');
    if (prop) prop.rotation.z += dt * 50;

    // SOMBRA bajo el avión (sigue su x, a ras de suelo)
    this.shadow.position.set(this.plane.position.x, 0.16, this.Z);
    (this.shadow.material as THREE.MeshBasicMaterial).opacity = 0.6;

    // estela de humo cada poco
    this.puffTimer -= dt;
    if (this.puffTimer <= 0) { this.puffTimer = 0.1; this.spawnPuff(this.plane.position.x - 5, this.plane.position.y, this.Z); }

    // guardias: miran al avión, alzan la vista y SEÑALAN con "!"
    this.guards.forEach((g, i) => {
      g.lookAt(this.plane.position.x, this.plane.position.z);
      g.root.rotation.x = -0.55;              // mirando arriba
      g.fig.armR.rotation.x = -2.4;           // brazo señalando el cielo
      this.marks[i].visible = true;
      this.marks[i].position.y = 5.8 + Math.sin(t * 6 + i) * 0.2;
    });

    if (this.timer <= 0) {
      this.plane.visible = false;
      this.shadow.visible = false;
      this.guards.forEach((g, i) => {
        g.root.rotation.x = 0;
        g.fig.armR.rotation.x = 0;
        g.root.rotation.y = this.guardBaseYaw[i];
        this.marks[i].visible = false;
      });
    }
  }
}
