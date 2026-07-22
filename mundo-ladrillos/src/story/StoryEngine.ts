import * as THREE from 'three';
import { AudioManager } from '../audio/AudioManager';

/** Tipos de objetivo que el niño puede cumplir (crecerá con la peli). */
export type ObjetivoTipo =
  | 'cinematica'   // solo mirar/escuchar; avanza solo o al tocar
  | 'ir_a'         // llegar a un punto
  | 'esconderse'   // llegar a un escondite
  | 'cruzar'       // cruzar hasta un punto
  | 'huir'         // llegar a una salida
  | 'tocar_shofar' // gestionado por ShofarInteraction
  | 'luchar';      // gestionado por Combat

export interface Objetivo {
  tipo: ObjetivoTipo;
  texto: string;                 // lo que se muestra arriba ("Escóndete...")
  target?: { x: number; z: number };
  radio?: number;                // distancia para darlo por cumplido
  dur?: number;                  // duración de una cinemática (s)
}

export interface Escena {
  id: string;
  subtitulo: string;             // frase de la peli (abajo)
  voz?: string;                  // nombre del clip de audio (si lo hay)
  objetivo: Objetivo;
  exito: string;                 // mensaje al lograrlo
}

interface Hooks {
  onEnter?: (escena: Escena) => void;   // preparar la escena (spawnear, etc.)
  onScene?: (id: string) => void;       // notifica el id activo
  isDone?: (escena: Escena) => boolean; // condición externa (shofar/lucha)
}

/**
 * Director de la película jugable: recorre las escenas en orden. En cada una
 * reproduce la voz + subtítulo, fija un objetivo y, al cumplirse, pasa a la
 * siguiente. Es "dirigido por datos": la peli entera vive en el guión.
 */
export class StoryEngine {
  private i = -1;
  private tStart = 0;    // marca de tiempo (reloj) del inicio de la fase
  private state: 'idle' | 'activo' | 'exito' | 'fin' = 'idle';
  private marker = new THREE.Group();
  private ring: THREE.Mesh;
  private arrow: THREE.Mesh;
  private sub: HTMLDivElement;
  private obj: HTMLDivElement;
  private flash: HTMLDivElement;

  constructor(
    private scene: THREE.Scene,
    private getSpy: () => THREE.Vector3,
    private audio: AudioManager,
    private escenas: Escena[],
    private hooks: Hooks = {}
  ) {
    // --- Marcador 3D del objetivo (anillo + haz + flecha que bota) ---
    this.ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.4, 0.12, 10, 28),
      new THREE.MeshBasicMaterial({ color: 0x8fe0ff, transparent: true, opacity: 0.9 })
    );
    this.ring.rotation.x = Math.PI / 2;
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 1.3, 20, 16, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x8fe0ff, transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false })
    );
    beam.position.y = 10;
    this.arrow = new THREE.Mesh(
      new THREE.ConeGeometry(0.6, 1.2, 4),
      new THREE.MeshBasicMaterial({ color: 0x8fe0ff })
    );
    this.arrow.rotation.x = Math.PI;
    this.arrow.position.y = 4;
    this.marker.add(this.ring, beam, this.arrow);
    this.marker.visible = false;
    this.scene.add(this.marker);

    // --- HUD: subtítulo (abajo) + objetivo (arriba) + flash de éxito ---
    this.sub = this.mkDiv({
      left: '50%', bottom: '13%', transform: 'translateX(-50%)', maxWidth: '86%',
      background: 'rgba(8,6,4,.72)', color: '#ffeecb', font: '500 17px/1.35 Georgia, serif',
      padding: '10px 18px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(232,176,75,.35)'
    });
    this.obj = this.mkDiv({
      left: '50%', top: '54px', transform: 'translateX(-50%)', maxWidth: '86%',
      background: 'rgba(20,40,60,.75)', color: '#dff3ff', font: '700 16px system-ui, sans-serif',
      padding: '8px 16px', borderRadius: '20px', textAlign: 'center', border: '1px solid rgba(143,224,255,.6)'
    });
    this.flash = this.mkDiv({
      left: '50%', top: '40%', transform: 'translate(-50%,-50%)',
      color: '#bfffce', font: '800 30px system-ui, sans-serif', textShadow: '0 2px 12px rgba(0,0,0,.7)',
      pointerEvents: 'none', textAlign: 'center'
    });

    addEventListener('keydown', (e) => { if (e.code === 'Space' || e.code === 'Enter') this.skipCinematic(); });
  }

  private mkDiv(style: Partial<CSSStyleDeclaration>): HTMLDivElement {
    const d = document.createElement('div');
    Object.assign(d.style, {
      position: 'fixed', zIndex: '25', opacity: '0', transition: 'opacity .35s', pointerEvents: 'none'
    } as CSSStyleDeclaration, style);
    document.body.appendChild(d);
    return d;
  }

  start(): void { this.avanzar(); }

  private avanzar(): void {
    this.i++;
    if (this.i >= this.escenas.length) { this.terminar(); return; }
    const s = this.escenas[this.i];
    this.hooks.onEnter?.(s);
    this.hooks.onScene?.(s.id);
    this.tStart = performance.now();
    this.state = 'activo';

    this.sub.textContent = s.subtitulo;
    this.sub.style.opacity = '1';
    this.obj.textContent = '🎯 ' + s.objetivo.texto;
    this.obj.style.opacity = s.objetivo.tipo === 'cinematica' ? '0' : '1';
    this.flash.style.opacity = '0';

    if (s.voz) this.audio.play(s.voz, 1);

    const o = s.objetivo;
    if (o.target && o.tipo !== 'cinematica') {
      this.marker.position.set(o.target.x, 0, o.target.z);
      this.marker.visible = true;
    } else {
      this.marker.visible = false;
    }
  }

  private skipCinematic(): void {
    if (this.state === 'activo' && this.escenas[this.i]?.objetivo.tipo === 'cinematica') this.cumplir();
  }

  private cumplir(): void {
    if (this.state !== 'activo') return;
    const s = this.escenas[this.i];
    this.state = 'exito';
    this.marker.visible = false;
    this.obj.style.opacity = '0';
    this.flash.textContent = '✅ ' + s.exito;
    this.flash.style.opacity = '1';
    this.tStart = performance.now();
  }

  /** Para escenas gestionadas por otros sistemas (shofar, lucha). */
  completarExterno(): void { this.cumplir(); }
  get escenaActual(): Escena | undefined { return this.escenas[this.i]; }
  get _dbg(): { i: number; id?: string; state: string; t: number } {
    return { i: this.i, id: this.escenas[this.i]?.id, state: this.state, t: Math.round((performance.now() - this.tStart) / 10) / 100 };
  }

  update(dt: number): void {
    // animación del marcador
    if (this.marker.visible) {
      this.ring.rotation.z += dt * 1.5;
      this.arrow.position.y = 4 + Math.sin(performance.now() * 0.004) * 0.4;
    }
    const elapsed = (performance.now() - this.tStart) / 1000;
    if (this.state === 'activo') {
      const s = this.escenas[this.i];
      const o = s.objetivo;
      if (o.tipo === 'cinematica') {
        if (elapsed >= (o.dur ?? 5)) this.cumplir();
      } else if (o.tipo === 'tocar_shofar' || o.tipo === 'luchar') {
        if (this.hooks.isDone?.(s)) this.cumplir();
      } else if (o.target) {
        const p = this.getSpy();
        const dx = p.x - o.target.x, dz = p.z - o.target.z;
        if (Math.hypot(dx, dz) < (o.radio ?? 4)) this.cumplir();
      }
    } else if (this.state === 'exito') {
      if (elapsed > 1.6) { this.flash.style.opacity = '0'; this.sub.style.opacity = '0'; this.avanzar(); }
    }
  }

  private terminar(): void {
    this.state = 'fin';
    this.sub.style.opacity = '0';
    this.obj.style.opacity = '0';
    this.flash.textContent = '🏆 ¡Has vivido la conquista de Jericó!';
    this.flash.style.opacity = '1';
  }
}
