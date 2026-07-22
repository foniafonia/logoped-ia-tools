import * as THREE from 'three';

/** Cámara en tercera persona: sigue al objetivo, orbita con arrastre, zoom con rueda. */
export class ThirdPersonCamera {
  yaw = 0;
  pitch = 0.24;   // más nivelada: el telón real (2.5D) llena el fondo
  dist = 21;
  private dragging = false;
  private lastX = 0;
  private lastY = 0;
  private tmp = new THREE.Vector3();

  constructor(private camera: THREE.PerspectiveCamera, dom: HTMLElement) {
    dom.addEventListener('pointerdown', (e) => { this.dragging = true; this.lastX = e.clientX; this.lastY = e.clientY; });
    addEventListener('pointerup', () => { this.dragging = false; });
    addEventListener('pointermove', (e) => {
      if (!this.dragging) return;
      this.yaw -= (e.clientX - this.lastX) * 0.006;
      this.pitch = Math.max(0.05, Math.min(1.15, this.pitch - (e.clientY - this.lastY) * 0.005));
      this.lastX = e.clientX; this.lastY = e.clientY;
    });
    dom.addEventListener('wheel', (e) => {
      this.dist = Math.max(8, Math.min(46, this.dist + Math.sign(e.deltaY) * 1.6));
    }, { passive: true });
  }

  update(target: THREE.Vector3): void {
    const tx = target.x, ty = target.y + 3, tz = target.z;
    const cp = Math.cos(this.pitch);
    this.tmp.set(
      tx + Math.sin(this.yaw) * cp * this.dist,
      ty + Math.sin(this.pitch) * this.dist,
      tz + Math.cos(this.yaw) * cp * this.dist
    );
    this.camera.position.lerp(this.tmp, 0.18);
    this.camera.lookAt(tx, ty, tz);
  }
}
