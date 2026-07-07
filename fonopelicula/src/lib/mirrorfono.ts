/**
 * PORT de MirrorFono (mirrorfono-game/src/lib/movementMetrics.ts +
 * src/data/exercises.ts): métricas faciales de praxias a partir de los
 * landmarks de MediaPipe Face Landmarker, con modo simulación de respaldo.
 * Lógica copiada del original; solo se adaptan los tipos al proyecto.
 */

export type ExerciseId =
  | 'smile'
  | 'kiss'
  | 'open_mouth'
  | 'inflate_cheeks'
  | 'blow';

export interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
}

export interface FacialMetrics {
  smileAmplitude: number;
  mouthOpenness: number;
  lipProtrusion: number;
  cheekInflation: number;
  blowControl: number;
  symmetry: number;
  stability: number;
  precision: number;
}

export interface TrackingFrame {
  timestamp: number;
  mode: 'camera' | 'simulation';
  metrics: FacialMetrics;
}

export interface ExerciseDefinition {
  id: ExerciseId;
  label: string;
  icon: string;
  prompt: string;
  description: string;
  target: {
    primary: keyof FacialMetrics;
    activationThreshold: number;
    idealMin: number;
    idealMax: number;
  };
}

/* Ejercicios del original (subconjunto sin los linguales, cuya detección
   el propio MirrorFono marca como heurística provisional). */
export const EXERCISES: ExerciseDefinition[] = [
  {
    id: 'smile',
    label: 'Sonrisa solar',
    icon: '😊',
    prompt: 'Sonríe enseñando control lateral y suavidad.',
    description: 'Aumenta amplitud de sonrisa y simetría bilateral.',
    target: { primary: 'smileAmplitude', activationThreshold: 0.4, idealMin: 0.62, idealMax: 0.98 },
  },
  {
    id: 'kiss',
    label: 'Beso cometa',
    icon: '💋',
    prompt: 'Protruye los labios como si enviaras un beso.',
    description: 'Entrena protrusión labial y sello oral.',
    target: { primary: 'lipProtrusion', activationThreshold: 0.3, idealMin: 0.5, idealMax: 0.9 },
  },
  {
    id: 'open_mouth',
    label: 'Boca cueva',
    icon: '😮',
    prompt: 'Abre la boca con control sin perder estabilidad.',
    description: 'Trabajo de apertura mandibular y ritmo.',
    target: { primary: 'mouthOpenness', activationThreshold: 0.28, idealMin: 0.45, idealMax: 0.86 },
  },
  {
    id: 'inflate_cheeks',
    label: 'Mejillas globo',
    icon: '🎈',
    prompt: 'Infla las mejillas sin dejar escapar aire.',
    description: 'Control de presión intraoral y mejillas.',
    target: { primary: 'cheekInflation', activationThreshold: 0.3, idealMin: 0.52, idealMax: 0.95 },
  },
  {
    id: 'blow',
    label: 'Soplo estelar',
    icon: '🌬️',
    prompt: 'Redondea labios y mantén ritmo de soplo.',
    description: 'Control respiratorio y estabilidad labial.',
    target: { primary: 'blowControl', activationThreshold: 0.24, idealMin: 0.46, idealMax: 0.84 },
  },
];

/* Índices de landmarks (idénticos al original) */
const FACE_HEIGHT_TOP = 10;
const CHIN = 152;
const LEFT_EYE_OUTER = 33;
const RIGHT_EYE_OUTER = 263;
const LEFT_MOUTH = 61;
const RIGHT_MOUTH = 291;
const UPPER_LIP = 13;
const LOWER_LIP = 14;
const LEFT_UPPER_LIP = 78;
const RIGHT_UPPER_LIP = 308;
const LEFT_CHEEK = 234;
const RIGHT_CHEEK = 454;
const NOSE_TIP = 1;

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const distance = (a: LandmarkPoint, b: LandmarkPoint) =>
  Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

const getPoint = (landmarks: LandmarkPoint[], index: number) =>
  landmarks[index] ?? { x: 0, y: 0, z: 0 };

const average = (values: number[]) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

const standardDeviation = (values: number[]) => {
  if (values.length <= 1) return 0;
  const mean = average(values);
  return Math.sqrt(average(values.map((value) => (value - mean) ** 2)));
};

export const computeStability = (
  frameHistory: TrackingFrame[],
  primaryMetric: keyof FacialMetrics,
  fallbackValue: number,
) => {
  const samples = frameHistory.slice(-18).map((frame) => frame.metrics[primaryMetric]);
  if (!samples.length) return clamp(1 - Math.abs(fallbackValue - 0.55));
  return clamp(1 - standardDeviation(samples) * 2.4);
};

export const deriveMetricsFromLandmarks = (
  landmarks: LandmarkPoint[],
  frameHistory: TrackingFrame[],
  primaryMetric: keyof FacialMetrics,
): FacialMetrics => {
  const leftEye = getPoint(landmarks, LEFT_EYE_OUTER);
  const rightEye = getPoint(landmarks, RIGHT_EYE_OUTER);
  const leftMouth = getPoint(landmarks, LEFT_MOUTH);
  const rightMouth = getPoint(landmarks, RIGHT_MOUTH);
  const upperLip = getPoint(landmarks, UPPER_LIP);
  const lowerLip = getPoint(landmarks, LOWER_LIP);
  const leftLipLift = getPoint(landmarks, LEFT_UPPER_LIP);
  const rightLipLift = getPoint(landmarks, RIGHT_UPPER_LIP);
  const leftCheek = getPoint(landmarks, LEFT_CHEEK);
  const rightCheek = getPoint(landmarks, RIGHT_CHEEK);
  const noseTip = getPoint(landmarks, NOSE_TIP);
  const forehead = getPoint(landmarks, FACE_HEIGHT_TOP);
  const chin = getPoint(landmarks, CHIN);

  const eyeWidth = distance(leftEye, rightEye) || 1;
  const faceHeight = distance(forehead, chin) || 1;
  const mouthWidth = distance(leftMouth, rightMouth);
  const mouthHeight = distance(upperLip, lowerLip);
  const lipDepth = Math.abs((upperLip.z + lowerLip.z) / 2 - noseTip.z);
  const cheekWidth = distance(leftCheek, rightCheek);
  const cheekForward = Math.abs((leftCheek.z + rightCheek.z) / 2 - noseTip.z);
  const leftSmileLift = clamp(((upperLip.y - leftLipLift.y) / faceHeight) * 7);
  const rightSmileLift = clamp(((upperLip.y - rightLipLift.y) / faceHeight) * 7);

  const smileAmplitude = clamp(
    (mouthWidth / eyeWidth - 0.42) / 0.5 + average([leftSmileLift, rightSmileLift]) * 0.3,
  );
  const mouthOpenness = clamp((mouthHeight / faceHeight - 0.02) / 0.13);
  const lipProtrusion = clamp((lipDepth * 8 + (0.55 - mouthWidth / eyeWidth)) * 1.25);
  const cheekInflation = clamp((cheekForward * 9 + cheekWidth / faceHeight - 0.88) * 0.8);
  const blowControl = clamp((lipProtrusion * 0.55 + cheekInflation * 0.3 + (1 - mouthOpenness) * 0.15) * 1.05);

  const symmetryGap =
    Math.abs(leftSmileLift - rightSmileLift) + Math.abs(leftCheek.y - rightCheek.y) * 2.2;
  const symmetry = clamp(1 - symmetryGap * 1.6);

  const provisional: FacialMetrics = {
    smileAmplitude,
    mouthOpenness,
    lipProtrusion,
    cheekInflation,
    blowControl,
    symmetry,
    stability: 0,
    precision: 0,
  };

  const stability = computeStability(frameHistory, primaryMetric, provisional[primaryMetric]);
  const precision = clamp(average([provisional[primaryMetric], symmetry, stability]));

  return { ...provisional, stability, precision };
};

/* Modo simulación del original: permite jugar la demo sin cámara. */
export const buildSimulationFrame = (
  timestamp: number,
  exercise: ExerciseDefinition,
  previousFrames: TrackingFrame[],
): TrackingFrame => {
  const t = timestamp / 1000;
  const base = 0.32 + Math.sin(t * 1.7) * 0.04;
  const accent = 0.3 + Math.max(0, Math.sin(t * 2.1)) * 0.45;
  const boost = (id: ExerciseId, lo: number, hi: number) =>
    exercise.id === id ? lo + accent * hi : base;

  const metrics: FacialMetrics = {
    smileAmplitude: boost('smile', 0.44, 0.5),
    mouthOpenness: exercise.id === 'open_mouth' ? 0.36 + accent * 0.44 : 0.14 + base * 0.25,
    lipProtrusion: boost('kiss', 0.28, 0.54),
    cheekInflation: boost('inflate_cheeks', 0.34, 0.56),
    blowControl: boost('blow', 0.26, 0.52),
    symmetry: 0.78 + Math.sin(t * 1.3) * 0.06,
    stability: 0.8,
    precision: 0.82,
  };
  metrics.stability = computeStability(previousFrames, exercise.target.primary, metrics[exercise.target.primary]);
  metrics.precision = clamp(average([metrics[exercise.target.primary], metrics.symmetry, metrics.stability]));

  return { timestamp, mode: 'simulation', metrics };
};

/* Puntuación de ronda: media de métrica primaria vs rango ideal del ejercicio */
export function scoreRound(frames: TrackingFrame[], exercise: ExerciseDefinition) {
  const primary = exercise.target.primary;
  const values = frames.map((f) => f.metrics[primary]);
  const avg = average(values);
  const symmetry = average(frames.map((f) => f.metrics.symmetry));
  const stability = average(frames.map((f) => f.metrics.stability));
  const amplitude =
    avg >= exercise.target.idealMin
      ? 1
      : clamp(
          (avg - exercise.target.activationThreshold) /
            Math.max(0.01, exercise.target.idealMin - exercise.target.activationThreshold),
        );
  const overall = clamp(average([amplitude, symmetry, stability]));
  const stars = overall >= 0.72 ? 3 : overall >= 0.45 ? 2 : 1;
  return { avg, amplitude, symmetry, stability, overall, stars };
}
