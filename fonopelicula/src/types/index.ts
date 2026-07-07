export type ActivityType = 'quiz' | 'trueFalse' | 'sequence' | 'emotion' | 'memory';

export type PedagogicalObjective =
  | 'Comprensión oral'
  | 'Memoria narrativa'
  | 'Secuenciación temporal'
  | 'Vocabulario'
  | 'Inferencia emocional'
  | 'Atención auditiva'
  | 'Comprensión causa-efecto';

export interface ActivityOption {
  id: string;
  label: string;
  emoji?: string;
}

export interface MemoryPair {
  id: string;
  word: string;
  emoji: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  objective: PedagogicalObjective;
  prompt: string;
  /** quiz / trueFalse / emotion */
  options?: ActivityOption[];
  correctOptionId?: string;
  /** sequence: items en el orden correcto (se barajan al mostrar) */
  sequenceItems?: ActivityOption[];
  /** memory */
  memoryPairs?: MemoryPair[];
  explanation?: string;
}

export type RewardType = 'sticker' | 'gem' | 'chest' | 'badge';

export interface Reward {
  id: string;
  type: RewardType;
  name: string;
  emoji: string;
}

export interface Scene {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  emoji: string;
  /** color hex de la escena, se usa como estilo inline */
  color: string;
  /** segundo de inicio/fin del fragmento en el vídeo real de YouTube */
  videoStart: number;
  videoEnd: number;
  narrative: string;
  activities: Activity[];
  rewardId: string;
}

export interface Film {
  title: string;
  tagline: string;
  guideName: string;
  guideEmoji: string;
  /** id del vídeo de YouTube; cámbialo por la película real */
  youtubeId: string;
  scenes: Scene[];
}

export interface Avatar {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export interface SceneResult {
  completed: boolean;
  stars: number;
  firstTryCorrect: number;
  totalActivities: number;
  plays: number;
}

export interface MockStudent {
  id: string;
  name: string;
  emoji: string;
  filmPercent: number;
  stars: number;
  accuracy: number;
  lastObjective: PedagogicalObjective;
}
