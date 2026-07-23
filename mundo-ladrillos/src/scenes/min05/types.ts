import * as THREE from 'three';
import { PlasticMaterialFactory } from '../../materials/PlasticMaterialFactory';
import { SoundEngine } from './audio/SoundEngine';

/**
 * TRAMO MINUTO 5–10 · "El Jordán y los dos espías" (CREADOR 5–10).
 *
 * Contrato común de todas las escenas de este tramo. Cada escena es un
 * ESCENARIO 3D DE LADRILLO autocontenido (NO fondos planos 2.5D) + los
 * personajes presentes como NPCs + un objetivo JUGABLE (mover, cruzar,
 * distraer, esconderse…). El lead integra estos descriptores en el
 * StoryEngine compartido; aquí solo se añaden archivos, nunca se editan
 * las piezas compartidas.
 */

/** Contexto que el preview (o el StoryEngine del lead) pasa a cada escena. */
export interface SceneContext {
  scene: THREE.Scene;
  plastic: PlasticMaterialFactory;
  /** Posición actual del jugador (se consulta cada frame). */
  getPlayer: () => THREE.Vector3;
  /** Teletransporta al jugador (p. ej. al pillarle un guardia → vuelve al inicio). */
  setPlayer: (x: number, z: number) => void;
  /** Marca el objetivo como cumplido de forma externa (mecánicas propias). */
  markDone: () => void;
  /** Sonido: ambiente + efectos + audio real de la peli (voces/música). */
  sound: SoundEngine;
  /** True UNA vez cuando el jugador pulsa la acción (E / botón) este frame. */
  wantsInteract: () => boolean;
  /** Registra un obstáculo sólido (AABB en el plano XZ) para las colisiones. */
  addObstacle: (x: number, z: number, halfW: number, halfD: number) => void;
  /** Cambia el skin del jugador en caliente (p. ej. al ponerse el traje). */
  setPlayerSkin: (which: PlayerSkinId) => void;
}

/** Skins de jugador disponibles (campamento vs sigilo). */
export type PlayerSkinId = 'yoshua' | 'spy' | 'spy2' | 'spy_camp' | 'spy2_camp';

/** Datos para las barras/indicadores del HUD (detección, equilibrio, progreso). */
export interface HudState {
  alarm?: number;     // 0..1 nivel de alarma (sigilo)
  balance?: number;   // -1..1 desvío del equilibrio (cuerda)
  progress?: number;  // 0..1 progreso del objetivo
  prompt?: string;    // aviso de acción ("Pulsa E para…")
  gems?: { got: number; total: number }; // gemas recogidas (premio)
}

/**
 * Tipos de objetivo del tramo. Amplía los del StoryEngine con las mecánicas
 * nuevas de este tramo (distraer, sigilo). El lead mapea `cruzar/ir_a/
 * esconderse/huir/cinematica` 1:1 con el motor; `distraer` y `sigilo` los
 * resuelve la propia escena vía `isDone()` (hook `isDone` del StoryEngine).
 */
export type Min05ObjetivoTipo =
  | 'cinematica'
  | 'ir_a'
  | 'cruzar'
  | 'esconderse'
  | 'huir'
  | 'distraer'   // treta del "¡un avión!": desvía la mirada de los guardias
  | 'sigilo';    // llega al objetivo sin entrar en el cono de visión

export interface Min05Objetivo {
  tipo: Min05ObjetivoTipo;
  texto: string;
  target?: { x: number; z: number };
  radio?: number;
  dur?: number;
}

/** Ajuste inicial de cámara para encuadrar cada escena como su plano real. */
export interface CameraHint {
  yaw?: number;
  pitch?: number;
  dist?: number;
}

/** Instancia viva de una escena, tras construir su escenario 3D. */
export interface SceneInstance {
  /** Todo lo construido (se añade/quita de la escena de una vez). */
  group: THREE.Group;
  /** Lógica por frame (NPCs, mecánicas, animaciones). */
  update(dt: number, t: number, player: THREE.Vector3): void;
  /** ¿Se cumplió el objetivo? (para objetivos gestionados por la escena). */
  isDone(player: THREE.Vector3): boolean;
  /** Texto de estado opcional para el HUD (p. ej. "¡Te han visto!"). */
  status?(): string | null;
  /** Barras/indicadores del HUD (detección, equilibrio, progreso, prompt). */
  hud?(): HudState;
  /** Libera geometrías/materiales propios al salir de la escena. */
  dispose?(): void;
}

/** Descriptor de una escena del tramo (datos + constructor del escenario). */
export interface Min05Scene {
  id: string;               // p. ej. "m05_09_orilla_jordan"
  numero: number;           // 9..16 (escena real de la peli)
  titulo: string;           // título corto para el selector del preview
  subtitulo: string;        // frase de la peli (subtítulo inferior)
  objetivo: Min05Objetivo;
  exito: string;            // mensaje al lograrlo
  spawn: { x: number; z: number };
  noche?: boolean;          // ambiente nocturno (11–16 son de noche)
  ambiente?: 'day' | 'night' | 'river' | 'street'; // cama de ambiente (viento/grillos/agua)
  /** Clip de VOZ de la peli que se reproduce al entrar (diálogo/narración del beat). */
  voz?: string;
  /** Clip de la peli en bucle como fondo de la escena (música/ambiente del filme). */
  fondoClip?: string;
  fondoVol?: number;
  camara?: CameraHint;
  /** Skin del jugador en esta escena (campamento vs sigilo). */
  jugador?: PlayerSkinId;
  /** Construye el escenario 3D + NPCs. Devuelve la instancia viva. */
  build(ctx: SceneContext): SceneInstance;
}
