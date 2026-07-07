export type AgeGroup = 'mini' | 'media' | 'mayor' | 'libre';

export interface AgeConfig {
  id: AgeGroup;
  label: string;
  ages: string;
  emoji: string;
  description: string;
  /** duración máxima del fragmento de vídeo en segundos (regla de producto: 90–120 s) */
  clipSeconds: number;
  /** nº máximo de opciones en test/emociones */
  maxOptions: number;
  /** nº máximo de pasos en secuencias */
  maxSequence: number;
  /** nº de parejas en memoria */
  memoryPairs: number;
  /** objetivo del minijuego de cámara */
  catchGoal: number;
  /** velocidad de caída del minijuego (multiplicador) */
  catchSpeed: number;
}

export const ageConfigs: Record<AgeGroup, AgeConfig> = {
  mini: {
    id: 'mini',
    label: 'Peques',
    ages: '3–5 años',
    emoji: '🧸',
    description: 'Escenas de minuto y medio · 2 opciones · retos suaves',
    clipSeconds: 90,
    maxOptions: 2,
    maxSequence: 3,
    memoryPairs: 3,
    catchGoal: 5,
    catchSpeed: 0.75,
  },
  media: {
    id: 'media',
    label: 'Explorador',
    ages: '6–8 años',
    emoji: '🚀',
    description: 'Escenas de minuto y medio · 3 opciones',
    clipSeconds: 90,
    maxOptions: 3,
    maxSequence: 4,
    memoryPairs: 4,
    catchGoal: 7,
    catchSpeed: 1,
  },
  mayor: {
    id: 'mayor',
    label: 'Detective',
    ages: '9–12 años',
    emoji: '🕵️',
    description: 'Escenas de 2 minutos · máxima dificultad',
    clipSeconds: 120,
    maxOptions: 4,
    maxSequence: 4,
    memoryPairs: 4,
    catchGoal: 9,
    catchSpeed: 1.3,
  },
  libre: {
    id: 'libre',
    label: 'A mi ritmo',
    ages: 'Marcado por el profesional',
    emoji: '🎚️',
    description: 'Escenas de 2 minutos como máximo · dificultad completa',
    clipSeconds: 120,
    maxOptions: 4,
    maxSequence: 4,
    memoryPairs: 4,
    catchGoal: 8,
    catchSpeed: 1,
  },
};
