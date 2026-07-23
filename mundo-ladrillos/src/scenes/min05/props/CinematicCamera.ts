import * as THREE from 'three';

/**
 * CÁMARA CINEMÁTICA reutilizable — "a veces el audio manda sobre el juego".
 * Toma el control de la cámara unos segundos (seguir un objeto o un travelling
 * de revelado) y luego lo devuelve. Portable: sirve tanto para el preview del
 * tramo 5–10 como para el ORQUESTADOR del juego completo.
 *
 * Uso (en tu bucle):
 *   const cineCam = new CinematicCamera(camera);
 *   // engancha al contexto de escena:
 *   ctx.cameraFocus  = (t, s)      => cineCam.focus(t, s);
 *   ctx.cameraReveal = (f,t,lf,lt,s)=> cineCam.reveal(f, t, lf, lt, s);
 *   // cada frame:
 *   const cine = cineCam.active;
 *   if (!cine) miControladorDeJugador.update(dt);     // congela input en cine
 *   escena.update(dt);                                // la escena SIEMPRE avanza
 *   if (!cineCam.update(dt, jugador.x, jugador.z)) miCamaraNormal.update(jugador);
 */
type XYZ = { x: number; y: number; z: number };

export class CinematicCamera {
  private t = 0;
  private dur = 0;
  private mode: 'follow' | 'reveal' | null = null;
  private target: THREE.Object3D | null = null;
  private cvFrom = new THREE.Vector3();
  private cvTo = new THREE.Vector3();
  private clFrom = new THREE.Vector3();
  private clTo = new THREE.Vector3();
  private tmp = new THREE.Vector3();
  private look = new THREE.Vector3();

  constructor(private camera: THREE.PerspectiveCamera) {}

  /** ¿La cámara está en un momento cinemático ahora mismo? */
  get active(): boolean { return this.t > 0 && this.mode !== null; }

  /** Sigue a un objeto en movimiento (p. ej. el avión de la treta). */
  focus(target: THREE.Object3D, seconds: number): void {
    this.mode = 'follow'; this.target = target; this.t = seconds; this.dur = seconds;
  }

  /** Travelling de revelado: cámara de `from`→`to` mirando `lookFrom`→`lookTo`. */
  reveal(from: XYZ, to: XYZ, lookFrom: XYZ, lookTo: XYZ, seconds: number): void {
    this.mode = 'reveal'; this.t = seconds; this.dur = seconds;
    this.cvFrom.set(from.x, from.y, from.z); this.cvTo.set(to.x, to.y, to.z);
    this.clFrom.set(lookFrom.x, lookFrom.y, lookFrom.z); this.clTo.set(lookTo.x, lookTo.y, lookTo.z);
    this.camera.position.copy(this.cvFrom);
  }

  /** Corta la cinemática ya (devuelve el control). */
  stop(): void { this.mode = null; this.target = null; this.t = 0; }

  /**
   * Actualiza la cámara si hay cinemática. `anchorX/anchorZ` = posición del
   * jugador (para encuadrar el modo "follow"). Devuelve `true` si ha controlado
   * la cámara este frame; `false` si no (entonces usa tu cámara normal).
   */
  update(dt: number, anchorX = 0, anchorZ = 0): boolean {
    if (!this.active) return false;
    this.t -= dt;
    if (this.mode === 'follow' && this.target) {
      const tp = this.target.position;
      this.tmp.set(anchorX * 0.4 + tp.x * 0.12, 3.5, anchorZ - 20);
      this.camera.position.lerp(this.tmp, 0.09);
      this.camera.lookAt(tp.x, tp.y, tp.z);
    } else if (this.mode === 'reveal') {
      const k = THREE.MathUtils.clamp(1 - Math.max(0, this.t) / this.dur, 0, 1);
      const e = k * k * (3 - 2 * k); // smoothstep
      this.camera.position.lerpVectors(this.cvFrom, this.cvTo, e);
      this.look.lerpVectors(this.clFrom, this.clTo, e);
      this.camera.lookAt(this.look);
    }
    if (this.t <= 0) { this.mode = null; this.target = null; }
    return true;
  }
}
