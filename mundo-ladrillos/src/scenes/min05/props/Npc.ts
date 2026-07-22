import * as THREE from 'three';
import { Minifigure, MinifigureSkin, createMinifigure } from '../../../characters/MinifigureFactory';
import { PlasticMaterialFactory } from '../../../materials/PlasticMaterialFactory';

/**
 * NPC del tramo: envuelve la `Minifigure` compartida (skins de la peli) y le
 * añade comportamiento sencillo — mirar a un punto, patrullar entre waypoints,
 * y (para guardias) un CONO DE VISIÓN que las mecánicas de sigilo consultan.
 */
export class Npc {
  readonly fig: Minifigure;
  readonly root: THREE.Group;
  private waypoints: THREE.Vector2[] = [];
  private wi = 0;
  private speed = 0;
  private facing = 0;
  private moving = false;

  constructor(plastic: PlasticMaterialFactory, skin: MinifigureSkin, x = 0, z = 0, facing = 0) {
    this.fig = createMinifigure(plastic, skin);
    this.root = this.fig.root;
    this.root.position.set(x, 0, z);
    this.facing = facing;
    this.root.rotation.y = facing;
  }

  setPatrol(points: Array<{ x: number; z: number }>, speed = 2): this {
    this.waypoints = points.map((p) => new THREE.Vector2(p.x, p.z));
    this.speed = speed;
    return this;
  }

  /** Orienta al NPC hacia un punto del mundo (sin moverse). */
  lookAt(x: number, z: number): void {
    this.facing = Math.atan2(x - this.root.position.x, z - this.root.position.z);
    this.root.rotation.y = this.facing;
  }

  get position(): THREE.Vector3 { return this.root.position; }
  get yaw(): number { return this.facing; }

  update(dt: number): void {
    if (this.waypoints.length > 1 && this.speed > 0) {
      const tgt = this.waypoints[this.wi];
      const dx = tgt.x - this.root.position.x;
      const dz = tgt.y - this.root.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 0.4) {
        this.wi = (this.wi + 1) % this.waypoints.length;
        this.moving = false;
      } else {
        const nx = dx / dist, nz = dz / dist;
        this.root.position.x += nx * this.speed * dt;
        this.root.position.z += nz * this.speed * dt;
        this.facing = Math.atan2(nx, nz);
        this.root.rotation.y = this.facing;
        this.moving = true;
      }
    }
    this.fig.update(dt, this.moving, 1);
  }
}

/**
 * CONO DE VISIÓN visible (para guardias). Un sector semitransparente en el
 * suelo que se puede pintar verde (vigilando) o rojo (alerta). Su geometría
 * también define el test de detección de la mecánica de sigilo.
 */
export class VisionCone {
  readonly mesh: THREE.Mesh;
  readonly halfAngle: number;
  readonly range: number;
  private mat: THREE.MeshBasicMaterial;

  constructor(range = 22, halfAngleDeg = 26) {
    this.range = range;
    this.halfAngle = (halfAngleDeg * Math.PI) / 180;
    const shape = new THREE.CircleGeometry(range, 24, -this.halfAngle + Math.PI / 2, this.halfAngle * 2);
    shape.rotateX(-Math.PI / 2);
    this.mat = new THREE.MeshBasicMaterial({
      color: 0x9be08a, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false
    });
    this.mesh = new THREE.Mesh(shape, this.mat);
    this.mesh.position.y = 0.15;
  }

  /** Coloca el cono en la posición y orientación del guardia. */
  place(x: number, z: number, yaw: number): void {
    this.mesh.position.set(x, 0.15, z);
    this.mesh.rotation.y = yaw;
  }

  setAlert(alert: boolean): void {
    this.mat.color.setHex(alert ? 0xff5a4d : 0x9be08a);
    this.mat.opacity = alert ? 0.34 : 0.22;
  }

  /** ¿El punto (px,pz) cae dentro del cono desde (ox,oz) mirando a `yaw`? */
  contains(ox: number, oz: number, yaw: number, px: number, pz: number): boolean {
    const dx = px - ox, dz = pz - oz;
    const dist = Math.hypot(dx, dz);
    if (dist > this.range || dist < 0.001) return false;
    const ang = Math.atan2(dx, dz);
    let d = ang - yaw;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return Math.abs(d) <= this.halfAngle;
  }
}
