/**
 * Tipos del motor de historias sociales en video interactivo.
 *
 * Una HISTORIA es un grafo de NODOS. Cada nodo puede reproducir un clip de
 * video (o mostrar una imagen), plantear una pregunta y ofrecer opciones que
 * llevan a otros nodos. El motor recorre el grafo segun las elecciones.
 */

/** Tono clinico del feedback. No hay "correcto/incorrecto" punitivo. */
export type FeedbackTone =
  | "positive"
  | "reflective"
  | "neutral"
  | "consequence"
  | "repair"
  | "observation";

/** Categoria de una eleccion (uso interno / analitica, nunca punitivo). */
export type ChoiceCategory = "helpful" | "unhelpful" | "neutral" | string;

/** Nivel de dificultad de la historia. */
export type DifficultyLevel = 1 | 2 | 3;

export interface Choice {
  id: string;
  label: string;
  /** Imagen o pictograma opcional. */
  image?: string;
  /** Texto alternativo de la imagen (accesibilidad). */
  imageAlt?: string;
  /** Audio opcional que lee la opcion en voz alta. */
  audio?: string;
  /** Nodo destino al elegir esta opcion. */
  next: string;
  category?: ChoiceCategory;
}

export interface Feedback {
  title?: string;
  text?: string;
  audio?: string;
  tone?: FeedbackTone;
}

/** Configuracion por historia (puede sobrescribirse en la sesion). */
export interface StorySettings {
  showText?: boolean;
  showImages?: boolean;
  showAudioButtons?: boolean;
  /** Reproducir audios (pregunta/feedback) automaticamente. */
  autoplayAudio?: boolean;
  showSubtitles?: boolean;
  allowBack?: boolean;
  allowReplay?: boolean;
  showFeedback?: boolean;
  /** Milisegundos de pausa tras el clip antes de mostrar opciones. */
  pauseBeforeChoices?: number;
  /** Intentar autoplay del video. */
  autoplayVideo?: boolean;
}

export type NodeType =
  | "video"
  | "image"
  | "feedback"
  | "choice"
  | "ending"
  | "pause"
  | "observation";

/**
 * Nodo de la historia. Todos los campos opcionales conviven en una sola
 * interfaz para simplificar el JSON; el motor interpreta segun `type`.
 */
export interface StoryNode {
  type: NodeType;

  // Medios
  video?: string;
  /** Subtitulos WebVTT opcionales para el video. */
  subtitles?: string;
  image?: string;
  imageAlt?: string;
  /** Poster / ultimo fotograma para congelar mientras aparecen opciones. */
  poster?: string;

  // Contenido
  title?: string;
  message?: string;
  question?: string;
  questionAudio?: string;

  // Feedback clinico
  feedback?: Feedback;

  // Navegacion
  choices?: Choice[];
  /** Avance automatico a otro nodo (cuando no hay opciones). */
  next?: string;

  // Flags de nodo final
  allowReplay?: boolean;
  allowChooseAnotherPath?: boolean;

  // Nodo de pausa (para el profesional)
  pauseLabel?: string;
}

export interface Story {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  level?: DifficultyLevel;
  /** Etiquetas libres (tema, edad, etc.). */
  tags?: string[];
  startNode: string;
  settings?: StorySettings;
  nodes: Record<string, StoryNode>;
}

/** Entrada del catalogo de historias (public/stories/index.json). */
export interface StoryCatalogEntry {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  level?: DifficultyLevel;
  tags?: string[];
  /** Ruta al JSON de la historia. */
  src: string;
}

/** Preferencias de accesibilidad globales de la sesion (sin datos personales). */
export interface SessionPreferences {
  showText: boolean;
  showImages: boolean;
  showAudioButtons: boolean;
  autoplayAudio: boolean;
  showSubtitles: boolean;
  allowBack: boolean;
  allowReplay: boolean;
  showFeedback: boolean;
  autoplayVideo: boolean;
  reduceMotion: boolean;
  soundEnabled: boolean;
  /** Escala de fuente: 1 = normal. */
  fontScale: number;
  /** Ocultar elementos no esenciales (interfaz minima). */
  minimalUI: boolean;
}
