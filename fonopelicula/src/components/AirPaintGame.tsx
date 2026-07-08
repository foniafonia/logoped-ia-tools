import { Camera, ChevronRight, MousePointer, Paintbrush } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { sfx } from '../lib/audio';
import { loadHandLandmarker, startHandCamera, type HandLandmarkerLike } from '../lib/handTracking';
import type { Scene } from '../types';

/**
 * PORT fiel de "Pintura en el aire: colores" (pintura-aire-colores/app.js):
 * agarra la bola de pintura cerrando el puño, lánzala abriendo la mano con
 * impulso, acierta el objeto del color pedido. Misma física, mismos objetos
 * SVG y misma clasificación de gesto que el original; adaptado a React con
 * MediaPipe Hands local y modo táctil/ratón de respaldo.
 */

const TUNING = {
  candidateRadius: 190,
  gripSmooth: 0.48,
  releaseGuardMs: 180,
  historyMs: 320,
  throwThreshold: 0.38,
  projectileMinSpeed: 420,
  projectileMaxSpeed: 980,
  projectileScale: 0.88,
  gravity: 260,
  hitPadding: 88,
  lostHandReleaseMs: 780,
};

const COLORS: Record<string, { hex: string; label: string }> = {
  rojo: { hex: '#ef4444', label: 'ROJO' },
  amarillo: { hex: '#facc15', label: 'AMARILLO' },
  azul: { hex: '#2563eb', label: 'AZUL' },
  verde: { hex: '#22c55e', label: 'VERDE' },
  morado: { hex: '#8b5cf6', label: 'MORADO' },
  naranja: { hex: '#f97316', label: 'NARANJA' },
};

const ALL_OBJECTS = [
  { id: 'apple', color: 'rojo', name: 'manzana', type: 'apple' },
  { id: 'banana', color: 'amarillo', name: 'plátano', type: 'banana' },
  { id: 'cloud', color: 'azul', name: 'nube azul', type: 'cloud' },
  { id: 'frog', color: 'verde', name: 'rana', type: 'frog' },
  { id: 'grapes', color: 'morado', name: 'uva', type: 'grapes' },
  { id: 'carrot', color: 'naranja', name: 'zanahoria', type: 'carrot' },
];

const ROUNDS = ['rojo', 'amarillo', 'azul', 'verde', 'morado', 'naranja'];

const OBJECT_SVGS: Record<string, string> = {
  apple: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path d="M104 46 C118 25 146 25 158 34 C143 45 122 48 104 46Z" fill="#22c55e"/><path d="M98 55 C65 33 25 59 27 103 C29 151 58 178 92 161 C99 158 105 158 112 162 C146 181 177 148 175 101 C173 58 132 34 104 57 C102 58 100 58 98 55Z" fill="#ef4444"/><path d="M88 43 C91 29 100 21 112 17" fill="none" stroke="#7c2d12" stroke-width="12" stroke-linecap="round"/><path d="M61 73 C48 88 45 113 54 133" fill="none" stroke="#fff" stroke-width="13" stroke-linecap="round" opacity=".45"/></svg>`,
  banana: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path d="M35 73 C65 133 126 157 168 103 C157 167 79 184 28 91Z" fill="#facc15"/><path d="M35 73 C66 117 122 142 168 103" fill="none" stroke="#fde68a" stroke-width="22" stroke-linecap="round"/><path d="M24 83 L42 64" stroke="#7c2d12" stroke-width="12" stroke-linecap="round"/><path d="M160 105 L181 96" stroke="#7c2d12" stroke-width="10" stroke-linecap="round"/></svg>`,
  cloud: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path d="M52 128 C28 128 19 103 35 87 C43 78 55 76 66 81 C74 58 96 45 120 55 C138 62 148 77 151 94 C169 94 184 108 181 126 C178 143 164 151 145 151 L57 151 C43 151 34 142 34 132 C34 130 43 128 52 128Z" fill="#2563eb"/><path d="M58 102 C71 83 96 82 107 98 C119 85 145 93 148 115" fill="none" stroke="#bfdbfe" stroke-width="16" stroke-linecap="round" opacity=".72"/><path d="M61 152 C70 169 86 169 94 152 M113 152 C122 169 138 169 146 152" fill="none" stroke="#60a5fa" stroke-width="9" stroke-linecap="round"/></svg>`,
  frog: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><ellipse cx="100" cy="107" rx="69" ry="55" fill="#22c55e"/><circle cx="61" cy="65" r="28" fill="#22c55e"/><circle cx="139" cy="65" r="28" fill="#22c55e"/><circle cx="61" cy="64" r="12" fill="#fff"/><circle cx="139" cy="64" r="12" fill="#fff"/><circle cx="64" cy="66" r="6" fill="#111827"/><circle cx="136" cy="66" r="6" fill="#111827"/><path d="M67 119 C82 137 119 137 134 119" fill="none" stroke="#166534" stroke-width="9" stroke-linecap="round"/><circle cx="48" cy="106" r="9" fill="#86efac"/><circle cx="152" cy="106" r="9" fill="#86efac"/></svg>`,
  grapes: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path d="M105 43 C121 27 143 27 158 38 C142 47 124 50 105 43Z" fill="#22c55e"/><path d="M92 55 C94 42 102 34 114 27" fill="none" stroke="#7c2d12" stroke-width="10" stroke-linecap="round"/><g fill="#8b5cf6"><circle cx="83" cy="75" r="25"/><circle cx="117" cy="75" r="25"/><circle cx="66" cy="112" r="25"/><circle cx="100" cy="112" r="25"/><circle cx="134" cy="112" r="25"/><circle cx="84" cy="148" r="24"/><circle cx="119" cy="148" r="24"/></g><g fill="#c4b5fd" opacity=".48"><circle cx="76" cy="68" r="7"/><circle cx="110" cy="104" r="7"/><circle cx="126" cy="139" r="7"/></g></svg>`,
  carrot: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path d="M101 48 C116 82 134 125 106 174 C65 135 65 91 101 48Z" fill="#f97316"/><path d="M99 48 C82 29 76 18 76 18 C97 21 107 35 105 50Z" fill="#22c55e"/><path d="M105 51 C113 26 130 17 130 17 C135 41 123 55 105 51Z" fill="#16a34a"/><path d="M105 91 L82 99 M116 122 L91 132" stroke="#fdba74" stroke-width="8" stroke-linecap="round"/></svg>`,
};

function objectSvgUrl(type: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(OBJECT_SVGS[type] ?? OBJECT_SVGS.apple)}`;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const distance2d = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);
const average = (values: number[]) => (values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0);

interface StagePoint {
  x: number;
  y: number;
}

interface RoundObject {
  id: string;
  color: string;
  name: string;
  type: string;
  x: number;
  y: number;
  size: number;
  el: HTMLButtonElement | null;
}

type Mode = 'intro' | 'loading' | 'camera' | 'touch' | 'done';
type PaintStatus = 'idle' | 'hover' | 'grabbed' | 'throwing';

interface HistoryPoint {
  x: number;
  y: number;
  t: number;
}

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  el: HTMLDivElement;
  lastTrailAt: number;
}

interface Props {
  scene: Scene;
  goal: number;
  speed: number;
  onDone: (score: number) => void;
  onSkip: () => void;
}

export default function AirPaintGame({ scene, goal, speed, onDone, onSkip }: Props) {
  const roundCount = Math.max(3, Math.min(ROUNDS.length, goal));

  const [mode, setMode] = useState<Mode>('intro');
  const [roundIndex, setRoundIndex] = useState(0);
  const [hits, setHits] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [objects, setObjects] = useState<RoundObject[]>([]);
  const [feedback, setFeedback] = useState('Agarra la pintura');

  const stageRef = useRef<HTMLDivElement>(null);
  const paintRef = useRef<HTMLDivElement>(null);
  const trailLayerRef = useRef<HTMLDivElement>(null);
  const splatsLayerRef = useRef<HTMLDivElement>(null);
  const handCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const modeRef = useRef<Mode>('intro');
  const roundIndexRef = useRef(0);
  const objectsRef = useRef<RoundObject[]>([]);
  const hitsRef = useRef(0);
  const finishedRef = useRef(false);
  const pausedRef = useRef(false);
  const unmountedRef = useRef(false);

  const paintStateRef = useRef({ x: 0, y: 0, homeX: 0, homeY: 0, r: 62, grabbed: false, status: 'idle' as PaintStatus });
  const projectileRef = useRef<Projectile | null>(null);
  const handHistoryRef = useRef<HistoryPoint[]>([]);
  const touchHistoryRef = useRef<HistoryPoint[]>([]);
  const smoothedGripRef = useRef<StagePoint | null>(null);
  const stableGestureRef = useRef<'open' | 'fist' | 'other'>('other');
  const gestureCandidateRef = useRef<'open' | 'fist' | 'other'>('other');
  const stableFramesRef = useRef(0);
  const releaseGuardUntilRef = useRef(0);
  const handSeenAtRef = useRef(0);

  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<HandLandmarkerLike | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);
  const frameCountRef = useRef(0);

  /* ---------- ciclo de vida ---------- */
  useEffect(() => {
    // React.StrictMode ejecuta un ciclo fantasma mount→cleanup→mount en
    // desarrollo; reseteamos el flag para que ese ciclo no deje el
    // componente marcado como desmontado para siempre.
    unmountedRef.current = false;
    const onVisibility = () => {
      pausedRef.current = document.hidden;
      lastFrameRef.current = performance.now();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      unmountedRef.current = true;
      document.removeEventListener('visibilitychange', onVisibility);
      stopEverything();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopEverything = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    landmarkerRef.current?.close();
    landmarkerRef.current = null;
  };

  /* ---------- setup de ronda ---------- */
  const pickRoundObjects = (targetColor: string): RoundObject[] => {
    const correct = ALL_OBJECTS.find((o) => o.color === targetColor)!;
    const distractors = ALL_OBJECTS.filter((o) => o.color !== targetColor);
    const distractor = distractors[Math.floor(Math.random() * distractors.length)];
    const pair = Math.random() < 0.5 ? [correct, distractor] : [distractor, correct];
    return pair.map((o) => ({ ...o, x: 0, y: 0, size: 0, el: null }));
  };

  const layoutRound = (list: RoundObject[]) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return list;
    const compact = rect.width < 560;
    const size = clamp(Math.min(rect.width * (compact ? 0.28 : 0.22), rect.height * 0.28), compact ? 84 : 120, compact ? 108 : 160);
    const yTop = rect.height * 0.24;
    const positions = [
      { x: rect.width * 0.24, y: yTop },
      { x: rect.width * 0.76, y: yTop },
    ];
    return list.map((o, i) => ({ ...o, x: positions[i].x, y: positions[i].y, size }));
  };

  const resetPaintHome = () => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const p = paintStateRef.current;
    p.r = rect.width < 560 ? 40 : 54;
    const edge = Math.random() < 0.62;
    const ratio = !edge ? 0.22 + Math.random() * 0.56 : Math.random() < 0.5 ? Math.random() * 0.18 : 0.82 + Math.random() * 0.18;
    const margin = p.r + 12;
    p.homeX = margin + ratio * Math.max(1, rect.width - margin * 2);
    p.homeY = rect.height * 0.76;
    p.x = p.homeX;
    p.y = p.homeY;
    p.grabbed = false;
    p.status = 'idle';
    paintStateRef.current = p;
    applyPaintStyle();
  };

  const applyPaintStyle = () => {
    const el = paintRef.current;
    const p = paintStateRef.current;
    if (!el) return;
    el.style.left = `${p.x}px`;
    el.style.top = `${p.y}px`;
    el.style.width = `${p.r * 2}px`;
    el.style.height = `${p.r * 2}px`;
    el.style.setProperty('--paint-color', COLORS[ROUNDS[roundIndexRef.current]].hex);
    el.classList.toggle('grabbed', p.grabbed);
    el.style.opacity = projectileRef.current ? '0' : '1';
  };

  const startRound = (index: number) => {
    const idx = index % ROUNDS.length;
    roundIndexRef.current = idx;
    setRoundIndex(idx);
    finishedRef.current = false;
    projectileRef.current?.el.remove();
    projectileRef.current = null;
    setFeedback('Agarra la pintura');
    // El contenedor puede no tener aún su tamaño final (recién montado o
    // saliendo de la pantalla de intro); esperamos a que el layout se asiente.
    placeObjects(pickRoundObjects(ROUNDS[idx]));
  };

  const placeObjects = (picked: RoundObject[]) => {
    requestAnimationFrame(() => {
      if (unmountedRef.current) return;
      const rect = stageRef.current?.getBoundingClientRect();
      if (!rect || rect.width < 50) {
        placeObjects(picked);
        return;
      }
      const list = layoutRound(picked);
      objectsRef.current = list;
      setObjects(list);
      resetPaintHome();
    });
  };

  /* ---------- arranque ---------- */
  const startTouch = () => {
    sfx.click();
    setMode('touch');
    beginGame();
  };

  const startCamera = async () => {
    sfx.click();
    setMode('loading');
    setError(null);
    try {
      const stream = await startHandCamera();
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      landmarkerRef.current = await loadHandLandmarker(1);
      setMode('camera');
      beginGame();
    } catch (reason) {
      console.warn('Cámara no disponible, cambio a modo táctil', reason);
      stopEverything();
      setError('No se pudo activar la cámara: arrastra la pintura con el dedo. 😉');
      setMode('touch');
      beginGame();
    }
  };

  const beginGame = () => {
    hitsRef.current = 0;
    setHits(0);
    finishedRef.current = false;
    handHistoryRef.current = [];
    touchHistoryRef.current = [];
    lastFrameRef.current = performance.now();
    startRound(0);
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  };

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    sfx.win();
    setMode('done');
  };

  /* ---------- física de proyectil ---------- */
  const tick = (now: number) => {
    if (finishedRef.current) return;
    rafRef.current = requestAnimationFrame(tick);
    if (pausedRef.current) {
      lastFrameRef.current = now;
      return;
    }
    frameCountRef.current += 1;
    const dt = Math.min(0.034, Math.max(0.001, (now - lastFrameRef.current) / 1000));
    lastFrameRef.current = now;

    if (modeRef.current === 'camera' && landmarkerRef.current && videoRef.current && frameCountRef.current % 2 === 0) {
      readHandFrame(now);
    }

    if (projectileRef.current) updateProjectile(dt, now);
  };
  modeRef.current = mode;

  const readHandFrame = (now: number) => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !landmarker || !video.videoWidth || video.readyState < 2) return;
    let hand: Array<{ x: number; y: number; z: number }> | undefined;
    try {
      hand = landmarker.detectForVideo(video, now).landmarks?.[0];
    } catch {
      return;
    }
    if (!hand?.length) {
      handleNoHand(now);
      return;
    }
    handSeenAtRef.current = now;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mapped = hand.map((pt) => ({
      x: clamp((1 - pt.x) * rect.width, 0, rect.width),
      y: clamp(pt.y * rect.height, 0, rect.height),
    }));
    const grip = classifyGrip(hand);
    const rawGripPoint = averagePoints([4, 8, 12, 16, 20].map((i) => mapped[i]).filter(Boolean));
    const gripPoint = smoothGripPoint(rawGripPoint);
    pushHistory(handHistoryRef.current, gripPoint, now);
    drawHandSkeleton(mapped, grip);
    processGesture(gripPoint, grip, now);
  };

  const handleNoHand = (now: number) => {
    gestureCandidateRef.current = 'other';
    stableGestureRef.current = 'other';
    stableFramesRef.current = 0;
    handHistoryRef.current = [];
    clearHandSkeleton();
    if (paintStateRef.current.grabbed && now - handSeenAtRef.current > TUNING.lostHandReleaseMs) {
      dropPaint(paintStateRef.current.x, paintStateRef.current.y, 'Se perdió la mano');
    }
  };

  function classifyGrip(points: Array<{ x: number; y: number }>) {
    const palmSize = Math.max(distance2d(points[0], points[9]), 0.001);
    const isFingerOpen = (mcp: number, pip: number, tip: number) => {
      const tipToMcp = distance2d(points[tip], points[mcp]);
      const pipToMcp = distance2d(points[pip], points[mcp]);
      const tipToWrist = distance2d(points[tip], points[0]);
      const pipToWrist = distance2d(points[pip], points[0]);
      return tipToMcp > pipToMcp * 1.45 && tipToWrist > pipToWrist + palmSize * 0.1;
    };
    const openCount = [
      isFingerOpen(5, 6, 8),
      isFingerOpen(9, 10, 12),
      isFingerOpen(13, 14, 16),
      isFingerOpen(17, 18, 20),
    ].filter(Boolean).length;
    const tips = [8, 12, 16, 20];
    const avgTipToWrist = average(tips.map((i) => distance2d(points[i], points[0]))) / palmSize;
    const avgTipToPalm = average(tips.map((i) => distance2d(points[i], points[9]))) / palmSize;
    let name: 'open' | 'fist' | 'other' = 'other';
    if (openCount >= 3 && avgTipToWrist > 2.05 && avgTipToPalm > 1.55) name = 'open';
    if (openCount <= 2 && (avgTipToPalm < 2.05 || avgTipToWrist < 2.35)) name = 'fist';
    return { name, openCount, avgTipToWrist, avgTipToPalm };
  }

  const stabilizeGrip = (grip: 'open' | 'fist' | 'other', isHolding: boolean) => {
    if (grip !== gestureCandidateRef.current) {
      gestureCandidateRef.current = grip;
      stableFramesRef.current = 1;
    } else {
      stableFramesRef.current += 1;
    }
    if (stableFramesRef.current >= 2) stableGestureRef.current = grip;
    if (isHolding && grip === 'other') return stableGestureRef.current === 'open' ? 'other' : 'fist';
    return stableGestureRef.current;
  };

  const hasReleaseIntent = (grip: ReturnType<typeof classifyGrip>) =>
    grip.name === 'open' || grip.openCount >= 3 || grip.avgTipToPalm > 2.05 || grip.avgTipToWrist > 2.42;

  const smoothGripPoint = (point: StagePoint): StagePoint => {
    if (!smoothedGripRef.current) {
      smoothedGripRef.current = point;
      return point;
    }
    const s = smoothedGripRef.current;
    const next = { x: s.x + (point.x - s.x) * TUNING.gripSmooth, y: s.y + (point.y - s.y) * TUNING.gripSmooth };
    smoothedGripRef.current = next;
    return next;
  };

  const averagePoints = (pts: StagePoint[]): StagePoint => ({
    x: average(pts.map((p) => p.x)),
    y: average(pts.map((p) => p.y)),
  });

  const pushHistory = (history: HistoryPoint[], point: StagePoint, now: number) => {
    history.push({ x: point.x, y: point.y, t: now });
    while (history.length > 10 || (history[0] && now - history[0].t > TUNING.historyMs)) history.shift();
  };

  const velocityFromHistory = (history: HistoryPoint[]) => {
    if (history.length < 2) return { vx: 0, vy: 0, speed: 0 };
    const last = history[history.length - 1];
    let first = history[0];
    for (let i = history.length - 2; i >= 0; i -= 1) {
      if (last.t - history[i].t >= 60) {
        first = history[i];
        break;
      }
    }
    const dt = Math.max(16, last.t - first.t);
    const vx = (last.x - first.x) / dt;
    const vy = (last.y - first.y) / dt;
    return { vx, vy, speed: Math.hypot(vx, vy) };
  };

  const isNearPaint = (point: StagePoint) =>
    Math.hypot(point.x - paintStateRef.current.x, point.y - paintStateRef.current.y) <= TUNING.candidateRadius;

  const processGesture = (
    gripPoint: StagePoint,
    grip: ReturnType<typeof classifyGrip>,
    now: number,
  ) => {
    const p = paintStateRef.current;
    const stableGrip = stabilizeGrip(grip.name, p.grabbed);

    if (projectileRef.current) {
      setFeedback('Mira la pintura volar');
      return;
    }

    if (p.grabbed) {
      p.x = gripPoint.x;
      p.y = gripPoint.y;
      p.status = 'grabbed';
      applyPaintStyle();

      if (hasReleaseIntent(grip) && now > releaseGuardUntilRef.current) {
        const velocity = velocityFromHistory(handHistoryRef.current);
        if (velocity.speed >= TUNING.throwThreshold) {
          launchPaint(velocity);
        } else {
          dropPaint(gripPoint.x, gripPoint.y, 'Abre con más impulso para lanzar');
        }
        return;
      }
      setFeedback('Mueve el brazo y abre');
      return;
    }

    const nearPaint = isNearPaint(gripPoint);
    const wantsGrab = grip.name === 'fist' || stableGrip === 'fist';

    if (nearPaint && !wantsGrab) {
      setFeedback('Cierra la mano');
      return;
    }
    if (nearPaint && wantsGrab) {
      grabPaint(gripPoint);
      return;
    }
    setFeedback('Agarra la pintura');
  };

  const grabPaint = (point: StagePoint) => {
    const p = paintStateRef.current;
    p.grabbed = true;
    p.x = point.x;
    p.y = point.y;
    p.status = 'grabbed';
    releaseGuardUntilRef.current = performance.now() + TUNING.releaseGuardMs;
    applyPaintStyle();
    sfx.click();
    setFeedback('Mueve y lanza');
  };

  const dropPaint = (x: number, y: number, message: string) => {
    const p = paintStateRef.current;
    const rect = stageRef.current?.getBoundingClientRect();
    p.grabbed = false;
    p.status = 'idle';
    if (rect) {
      p.x = clamp(x, p.r + 8, rect.width - p.r - 8);
      p.y = clamp(y, p.r + 8, rect.height - p.r - 8);
    }
    applyPaintStyle();
    setFeedback(message);
  };

  const nearestObjectToVector = (origin: StagePoint, velocity: { vx: number; vy: number; speed: number }) => {
    if (!objectsRef.current.length || velocity.speed <= 0) return null;
    const vx = velocity.vx / velocity.speed;
    const vy = velocity.vy / velocity.speed;
    let best: RoundObject | null = null;
    let bestScore = Infinity;
    for (const o of objectsRef.current) {
      const dx = o.x - origin.x;
      const dy = o.y - origin.y;
      const dist = Math.max(1, Math.hypot(dx, dy));
      const dot = (dx / dist) * vx + (dy / dist) * vy;
      const score = dist * (dot > 0 ? 1 - dot * 0.55 : 1.45);
      if (score < bestScore) {
        best = o;
        bestScore = score;
      }
    }
    return best;
  };

  const launchPaint = (velocity: { vx: number; vy: number; speed: number }) => {
    const p = paintStateRef.current;
    const color = COLORS[ROUNDS[roundIndexRef.current]].hex;
    const target = nearestObjectToVector(p, velocity);
    const rawSpeed = Math.max(0.001, velocity.speed);
    let vx = velocity.vx / rawSpeed;
    let vy = velocity.vy / rawSpeed;
    if (target) {
      const tx = target.x - p.x;
      const ty = target.y - p.y;
      const len = Math.max(1, Math.hypot(tx, ty));
      const blend = velocity.vy < 0.08 ? 0.42 : 0.22;
      vx = vx * (1 - blend) + (tx / len) * blend;
      vy = vy * (1 - blend) + (ty / len) * blend;
    }
    const dirLen = Math.max(0.001, Math.hypot(vx, vy));
    vx /= dirLen;
    vy /= dirLen;
    const speedPx = clamp(velocity.speed * 1000 * TUNING.projectileScale * speed, TUNING.projectileMinSpeed, TUNING.projectileMaxSpeed);

    p.grabbed = false;
    p.status = 'throwing';
    applyPaintStyle();

    const el = document.createElement('div');
    el.className = 'air-paint-projectile';
    el.style.cssText = `position:absolute;width:${p.r * 1.04}px;height:${p.r * 1.04}px;border-radius:9999px;background:${color};box-shadow:0 6px 14px rgba(0,0,0,.28);transform:translate(-50%,-50%);z-index:5;`;
    stageRef.current?.appendChild(el);

    projectileRef.current = { x: p.x, y: p.y, vx: vx * speedPx, vy: vy * speedPx, color, el, lastTrailAt: 0 };
    sfx.pop();
    setFeedback('Pintura en camino');
  };

  const updateProjectile = (dt: number, now: number) => {
    const proj = projectileRef.current;
    if (!proj) return;
    proj.vy += TUNING.gravity * speed * dt;
    proj.x += proj.vx * dt;
    proj.y += proj.vy * dt;
    proj.el.style.left = `${proj.x}px`;
    proj.el.style.top = `${proj.y}px`;

    if (now - proj.lastTrailAt > 26) {
      proj.lastTrailAt = now;
      addTrail(proj.x, proj.y, proj.color);
    }

    const hit = objectsRef.current.find((o) => {
      const half = o.size * 0.5 + TUNING.hitPadding;
      return Math.abs(proj.x - o.x) <= half && Math.abs(proj.y - o.y) <= half;
    });
    if (hit) {
      handleHit(hit, proj.x, proj.y);
      return;
    }

    const rect = stageRef.current?.getBoundingClientRect();
    if (rect && (proj.x < -120 || proj.x > rect.width + 120 || proj.y < -120 || proj.y > rect.height + 160)) {
      endProjectile();
      resetPaintHome();
      setFeedback('Prueba otra vez');
    }
  };

  const handleHit = (item: RoundObject, x: number, y: number) => {
    const correct = item.color === ROUNDS[roundIndexRef.current];
    addSplat(x, y, COLORS[ROUNDS[roundIndexRef.current]].hex);
    endProjectile();

    if (correct) {
      sfx.correct();
      hitsRef.current += 1;
      setHits(hitsRef.current);
      setFeedback(`¡Bien! Es ${COLORS[ROUNDS[roundIndexRef.current]].label.toLowerCase()}`);
      window.setTimeout(() => {
        const next = roundIndexRef.current + 1;
        if (next >= roundCount) {
          finish();
        } else {
          startRound(next);
        }
      }, 1200);
    } else {
      sfx.wrong();
      setFeedback(`Busca algo ${COLORS[ROUNDS[roundIndexRef.current]].label.toLowerCase()}`);
      window.setTimeout(() => {
        resetPaintHome();
      }, 700);
    }
  };

  const endProjectile = () => {
    projectileRef.current?.el.remove();
    projectileRef.current = null;
    applyPaintStyle();
  };

  const addTrail = (x: number, y: number, color: string) => {
    const layer = trailLayerRef.current;
    if (!layer) return;
    const dot = document.createElement('span');
    const w = 24 + Math.random() * 20;
    dot.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${w * 0.7}px;border-radius:9999px;background:${color};opacity:.5;transform:translate(-50%,-50%);pointer-events:none;`;
    layer.appendChild(dot);
    window.setTimeout(() => dot.remove(), 500);
  };

  const addSplat = (x: number, y: number, color: string) => {
    const layer = splatsLayerRef.current;
    if (!layer) return;
    const splat = document.createElement('div');
    const size = 150 + Math.random() * 40;
    splat.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;transform:translate(-50%,-50%) rotate(${Math.random() * 60 - 30}deg);pointer-events:none;`;
    splat.innerHTML = `<svg viewBox="-70 -70 140 140"><path d="M-45,-7 C-62,-23 -36,-36 -19,-31 C-10,-61 20,-59 25,-29 C54,-42 68,-16 44,3 C68,26 43,49 18,34 C8,68 -24,61 -21,30 C-53,43 -72,17 -45,-7 Z" fill="${color}"/></svg>`;
    layer.appendChild(splat);
    window.setTimeout(() => splat.remove(), 1600);
  };

  /* ---------- overlay de mano ---------- */
  const drawHandSkeleton = (mapped: StagePoint[], grip: ReturnType<typeof classifyGrip>) => {
    const canvas = handCanvasRef.current;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!canvas || !rect) return;
    if (canvas.width !== rect.width) canvas.width = rect.width;
    if (canvas.height !== rect.height) canvas.height = rect.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.strokeStyle = grip.name === 'fist' ? 'rgba(22,163,74,.9)' : 'rgba(37,99,235,.9)';
    ctx.lineWidth = 4;
    const CONNECTIONS = [
      [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8],
      [5, 9], [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15], [15, 16],
      [13, 17], [0, 17], [17, 18], [18, 19], [19, 20],
    ];
    for (const [a, b] of CONNECTIONS) {
      const p1 = mapped[a];
      const p2 = mapped[b];
      if (!p1 || !p2) continue;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    ctx.fillStyle = '#ffffff';
    for (const pt of mapped) {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const clearHandSkeleton = () => {
    const canvas = handCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  /* ---------- modo táctil ---------- */
  const startTouchPaint = (e: React.PointerEvent) => {
    if (mode !== 'touch' || projectileRef.current) return;
    e.preventDefault();
    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      /* pointerId no capturable (p. ej. gesto sintético): seguimos igualmente */
    }
    touchHistoryRef.current = [];
    paintStateRef.current.grabbed = true;
    paintStateRef.current.status = 'grabbed';
    applyPaintStyle();
    setFeedback('Arrastra y suelta');
  };

  const moveTouchPaint = (e: React.PointerEvent) => {
    if (!paintStateRef.current.grabbed) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const point = { x: clamp(e.clientX - rect.left, 0, rect.width), y: clamp(e.clientY - rect.top, 0, rect.height) };
    paintStateRef.current.x = point.x;
    paintStateRef.current.y = point.y;
    applyPaintStyle();
    pushHistory(touchHistoryRef.current, point, performance.now());
  };

  const endTouchPaint = () => {
    if (!paintStateRef.current.grabbed) return;
    const velocity = velocityFromHistory(touchHistoryRef.current);
    if (velocity.speed >= TUNING.throwThreshold) {
      launchPaint(velocity);
    } else {
      dropPaint(paintStateRef.current.x, paintStateRef.current.y, 'Suelta con más impulso');
    }
  };

  const playing = mode === 'camera' || mode === 'touch';

  return (
    <div>
      {playing && (
        <div className="mb-3 flex items-center justify-between">
          <span className="chip border-sol/60 bg-sol/15 text-sm">
            🎨 Color {Math.min(roundIndex + 1, roundCount)} / {roundCount}
          </span>
          <span className="chip text-sm">{feedback}</span>
        </div>
      )}

      <div
        ref={stageRef}
        onPointerMove={mode === 'touch' ? moveTouchPaint : undefined}
        onPointerUp={mode === 'touch' ? endTouchPaint : undefined}
        onPointerCancel={mode === 'touch' ? endTouchPaint : undefined}
        className="relative aspect-video touch-none select-none overflow-hidden rounded-xl border-2 border-tinta/20 bg-gradient-to-b from-[#eaf6ff] to-[#dff3e0] shadow-crayon"
      >
        <video
          ref={videoRef}
          muted
          playsInline
          className={`absolute inset-0 h-full w-full -scale-x-100 object-cover transition-opacity ${
            mode === 'camera' ? 'opacity-70' : 'opacity-0'
          }`}
        />
        <canvas ref={handCanvasRef} className="absolute inset-0 h-full w-full" />

        {playing && (
          <>
            <p
              className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full border-2 border-tinta/20 bg-white/90 px-4 py-1.5 text-center font-hand text-lg shadow-crayon"
              style={{ color: COLORS[ROUNDS[roundIndex]].hex }}
            >
              Pinta algo {COLORS[ROUNDS[roundIndex]].label}
            </p>

            {objects.map((o) => (
              <button
                key={o.id}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border-2 border-tinta/15 bg-white/70 p-2 shadow-crayon"
                style={{ left: o.x, top: o.y, width: o.size, height: o.size }}
                aria-label={o.name}
                tabIndex={-1}
              >
                <img src={objectSvgUrl(o.type)} alt="" className="h-full w-full" draggable={false} />
              </button>
            ))}

            <div ref={splatsLayerRef} className="absolute inset-0" />
            <div
              ref={paintRef}
              onPointerDown={mode === 'touch' ? startTouchPaint : undefined}
              className="air-paint-ball absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow-lift"
              style={{ backgroundColor: COLORS[ROUNDS[roundIndex]].hex, touchAction: 'none' }}
            />
            <div ref={trailLayerRef} className="absolute inset-0" />
          </>
        )}

        {mode === 'intro' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-tinta/50 p-6 text-center backdrop-blur-sm">
            <p className="text-5xl" aria-hidden>🎨✋</p>
            <h2 className="font-hand text-3xl text-white">¡Pintura en el aire!</h2>
            <p className="max-w-md text-sm font-bold text-white/85">
              Cierra el puño para agarrar la pintura y ábrelo con impulso para lanzarla al objeto
              del color pedido. {roundCount} colores. La cámara no se graba: todo pasa en tu dispositivo.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={startCamera} className="btn-primary">
                <Camera size={18} /> Jugar con la cámara
              </button>
              <button onClick={startTouch} className="btn-secondary">
                <MousePointer size={18} /> Jugar arrastrando
              </button>
            </div>
            <button onClick={onSkip} className="text-xs font-bold text-white/70 underline underline-offset-2 hover:text-white">
              Saltar el reto e ir a la recompensa
            </button>
          </div>
        )}

        {mode === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-tinta/60 text-white">
            <Paintbrush className="animate-bounce" size={40} />
            <p className="font-hand text-2xl">Preparando la pintura mágica…</p>
          </div>
        )}

        {mode === 'done' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-tinta/60 p-6 text-center backdrop-blur-sm">
            <p className="text-6xl" aria-hidden>🏅</p>
            <h2 className="font-hand text-3xl text-white">¡Cuadro terminado!</h2>
            <p className="text-sm font-bold text-white/85">
              Has acertado {hits} de {roundCount} colores · +{hits * 5} monedas extra
            </p>
            <button onClick={() => onDone(hits)} className="btn-primary">
              Recoger recompensa <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-center text-sm font-bold text-calabaza">{error}</p>}
      {playing && (
        <p className="mt-3 text-center text-xs font-semibold text-tinta/60">
          Port de «Pintura en el aire: colores» · Objetivo pedagógico: coordinación visomotora
          y reconocimiento de color · Escena: {scene.title}
        </p>
      )}
    </div>
  );
}
