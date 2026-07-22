import * as THREE from 'three';
import { PlasticMaterialFactory } from '../../materials/PlasticMaterialFactory';

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
  camara?: CameraHint;
  /** Skin del jugador en esta escena ("yoshua" | "spy" | "spy2"). */
  jugador?: 'yoshua' | 'spy' | 'spy2';
  /** Construye el escenario 3D + NPCs. Devuelve la instancia viva. */
  build(ctx: SceneContext): SceneInstance;
}
