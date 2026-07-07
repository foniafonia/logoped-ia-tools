import { Camera, ChevronRight, Hand, MousePointer, Timer } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { sfx } from '../lib/audio';
import type { Scene } from '../types';

/**
 * Minijuego bonus: atrapa con la mano (webcam + MediaPipe Hands local) los
 * objetos de la escena que caen. Si no hay cámara, se juega con el ratón/dedo.
 * Los assets de MediaPipe se sirven desde /public (sin CDN).
 */

const BUNDLE_URL = '/mediapipe/vision_bundle.mjs';
const WASM_ROOT = '/mediapipe';
const MODEL_URL = '/models/hand_landmarker.task';
const GAME_SECONDS = 45;

interface Props {
  scene: Scene;
  goal: number;
  speed: number;
  onDone: (caught: number) => void;
  onSkip: () => void;
}

interface Target {
  x: number; // 0..1
  y: number; // 0..1
  vy: number;
  sway: number;
  phase: number;
  emoji: string;
  bad: boolean;
  dead: boolean;
}

interface Burst {
  x: number;
  y: number;
  t: number;
  good: boolean;
}

type Mode = 'intro' | 'loading' | 'camera' | 'mouse' | 'done';

type HandLandmarkerLike = {
  detectForVideo: (video: HTMLVideoElement, ts: number) => {
    landmarks: Array<Array<{ x: number; y: number }>>;
  };
  close: () => void;
};

export default function HandCatchGame({ scene, goal, speed, onDone, onSkip }: Props) {
  const [mode, setMode] = useState<Mode>('intro');
  const [caught, setCaught] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const modeRef = useRef<Mode>('intro');
  const cursorRef = useRef({ x: 0.5, y: 0.8, seen: false });
  const targetsRef = useRef<Target[]>([]);
  const burstsRef = useRef<Burst[]>([]);
  const caughtRef = useRef(0);
  const spawnAtRef = useRef(0);
  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef(0);
  const frameCountRef = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<HandLandmarkerLike | null>(null);
  const pausedRef = useRef(false);
  const finishedRef = useRef(false);

  modeRef.current = mode;

  const goodEmojis = [scene.emoji, ...(scene.activities.flatMap((a) => a.memoryPairs?.map((p) => p.emoji) ?? [])), '⭐', '🎞️'];

  /* ---------- ciclo de vida ---------- */
  useEffect(() => {
    const onVisibility = () => {
      pausedRef.current = document.hidden;
      lastRef.current = performance.now();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
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

  /* ---------- arranque ---------- */
  const startMouse = () => {
    sfx.click();
    setMode('mouse');
    beginGame('mouse');
  };

  const startCamera = async () => {
    sfx.click();
    setMode('loading');
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      const mod = (await import(/* @vite-ignore */ BUNDLE_URL)) as {
        FilesetResolver: { forVisionTasks: (root: string) => Promise<unknown> };
        HandLandmarker: {
          createFromOptions: (vision: unknown, opts: unknown) => Promise<HandLandmarkerLike>;
        };
      };
      const vision = await mod.FilesetResolver.forVisionTasks(WASM_ROOT);
      landmarkerRef.current = await mod.HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL },
        runningMode: 'VIDEO',
        numHands: 1,
      });
      setMode('camera');
      beginGame('camera');
    } catch (reason) {
      console.warn('Cámara no disponible, cambio a modo ratón', reason);
      stopEverything();
      setError('No se pudo activar la cámara: jugamos con el ratón. 😉');
      setMode('mouse');
      beginGame('mouse');
    }
  };

  const beginGame = (gameMode: 'camera' | 'mouse') => {
    modeRef.current = gameMode;
    targetsRef.current = [];
    burstsRef.current = [];
    caughtRef.current = 0;
    finishedRef.current = false;
    setCaught(0);
    setTimeLeft(GAME_SECONDS);
    startRef.current = performance.now();
    lastRef.current = performance.now();
    spawnAtRef.current = 0;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  };

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (caughtRef.current >= goal) sfx.win();
    setMode('done');
  };

  /* ---------- bucle principal ---------- */
  const loop = (now: number) => {
    if (finishedRef.current) return;
    rafRef.current = requestAnimationFrame(loop);
    if (pausedRef.current) return;

    const dt = Math.min((now - lastRef.current) / 1000, 0.05);
    lastRef.current = now;
    frameCountRef.current += 1;

    const elapsed = (now - startRef.current) / 1000;
    const remaining = Math.max(0, GAME_SECONDS - elapsed);
    if (frameCountRef.current % 12 === 0) setTimeLeft(Math.ceil(remaining));
    if (remaining <= 0) {
      finish();
      return;
    }

    /* mano (cada 2 frames para no saturar) */
    if (modeRef.current === 'camera' && landmarkerRef.current && videoRef.current && frameCountRef.current % 2 === 0) {
      const video = videoRef.current;
      if (video.videoWidth && video.readyState >= 2) {
        try {
          const result = landmarkerRef.current.detectForVideo(video, now);
          const hand = result.landmarks?.[0];
          if (hand?.[8]) {
            // punta del índice, espejada
            cursorRef.current = { x: 1 - hand[8].x, y: hand[8].y, seen: true };
          } else {
            cursorRef.current.seen = false;
          }
        } catch {
          /* frame perdido: seguimos */
        }
      }
    }

    /* spawn */
    spawnAtRef.current -= dt;
    if (spawnAtRef.current <= 0 && targetsRef.current.filter((t) => !t.dead).length < 6) {
      spawnAtRef.current = 0.75 + Math.random() * 0.5;
      const bad = Math.random() < 0.18;
      targetsRef.current.push({
        x: 0.1 + Math.random() * 0.8,
        y: -0.08,
        vy: (0.16 + Math.random() * 0.1) * speed,
        sway: (Math.random() - 0.5) * 0.12,
        phase: Math.random() * Math.PI * 2,
        emoji: bad ? '💣' : goodEmojis[Math.floor(Math.random() * goodEmojis.length)],
        bad,
        dead: false,
      });
    }

    /* física + colisiones */
    const cursor = cursorRef.current;
    for (const t of targetsRef.current) {
      if (t.dead) continue;
      t.y += t.vy * dt;
      t.x += Math.sin(t.phase + t.y * 9) * t.sway * dt;
      if (t.y > 1.12) t.dead = true;
      const dx = t.x - cursor.x;
      const dy = t.y - cursor.y;
      if ((modeRef.current === 'mouse' || cursor.seen) && dx * dx + dy * dy < 0.0065) {
        t.dead = true;
        burstsRef.current.push({ x: t.x, y: t.y, t: 0, good: !t.bad });
        if (t.bad) {
          caughtRef.current = Math.max(0, caughtRef.current - 1);
          sfx.bomb();
        } else {
          caughtRef.current += 1;
          sfx.pop();
        }
        setCaught(caughtRef.current);
        if (caughtRef.current >= goal) {
          draw();
          finish();
          return;
        }
      }
    }
    targetsRef.current = targetsRef.current.filter((t) => !t.dead).slice(-24);
    for (const b of burstsRef.current) b.t += dt;
    burstsRef.current = burstsRef.current.filter((b) => b.t < 0.5);

    draw();
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);

    for (const t of targetsRef.current) {
      if (t.dead) continue;
      ctx.font = `${Math.round(h * 0.11)}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t.emoji, t.x * w, t.y * h);
    }

    for (const b of burstsRef.current) {
      const r = 12 + b.t * 90;
      ctx.strokeStyle = b.good ? 'rgba(95,158,62,0.9)' : 'rgba(228,87,46,0.9)';
      ctx.lineWidth = 5 * (1 - b.t * 2);
      ctx.beginPath();
      ctx.arc(b.x * w, b.y * h, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    const cursor = cursorRef.current;
    if (modeRef.current === 'mouse' || cursor.seen) {
      ctx.beginPath();
      ctx.arc(cursor.x * w, cursor.y * h, h * 0.055, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(247,179,43,0.35)';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#F7B32B';
      ctx.stroke();
      ctx.font = `${Math.round(h * 0.06)}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✋', cursor.x * w, cursor.y * h);
    } else if (modeRef.current === 'camera') {
      ctx.font = `bold ${Math.round(h * 0.045)}px Nunito, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.textAlign = 'center';
      ctx.fillText('Enseña la mano a la cámara ✋', w / 2, h * 0.12);
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (modeRef.current !== 'mouse') return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    cursorRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
      seen: true,
    };
  };

  const success = caught >= goal;
  const playing = mode === 'camera' || mode === 'mouse';

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-hand text-xl text-tinta/70">Reto mágico · Capítulo {scene.order}</p>
        {playing && (
          <div className="flex items-center gap-2">
            <span className="chip border-sol/60 bg-sol/15 text-sm">✋ {caught} / {goal}</span>
            <span className="chip text-sm">
              <Timer size={13} /> {timeLeft}s
            </span>
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        onPointerMove={onPointerMove}
        className="relative aspect-video touch-none select-none overflow-hidden rounded-xl border-2 border-tinta/20 bg-gradient-to-b from-cielo to-[#1a3352] shadow-crayon"
      >
        <video
          ref={videoRef}
          muted
          playsInline
          className={`absolute inset-0 h-full w-full -scale-x-100 object-cover transition-opacity ${
            mode === 'camera' ? 'opacity-90' : 'opacity-0'
          }`}
        />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {mode === 'intro' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-tinta/50 p-6 text-center backdrop-blur-sm">
            <p className="text-5xl" aria-hidden>✋✨</p>
            <h2 className="font-hand text-3xl text-white">¡Caza los objetos de la escena!</h2>
            <p className="max-w-md text-sm font-bold text-white/85">
              Atrapa {goal} objetos con tu mano antes de que caigan. ¡Cuidado con las bombas 💣!
              La cámara funciona solo en tu dispositivo: no se graba ni se envía nada.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={startCamera} className="btn-primary">
                <Camera size={18} /> Jugar con la cámara
              </button>
              <button onClick={startMouse} className="btn-secondary">
                <MousePointer size={18} /> Jugar sin cámara
              </button>
            </div>
            <button onClick={onSkip} className="text-xs font-bold text-white/70 underline underline-offset-2 hover:text-white">
              Saltar el reto e ir a la recompensa
            </button>
          </div>
        )}

        {mode === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-tinta/60 text-white">
            <Hand className="animate-bounce" size={40} />
            <p className="font-hand text-2xl">Preparando la magia de la cámara…</p>
          </div>
        )}

        {mode === 'done' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-tinta/60 p-6 text-center backdrop-blur-sm">
            <p className="text-6xl" aria-hidden>{success ? '🏅' : '💪'}</p>
            <h2 className="font-hand text-3xl text-white">
              {success ? '¡Reto conseguido!' : '¡Buen intento!'}
            </h2>
            <p className="text-sm font-bold text-white/85">
              Has atrapado {caught} objetos · +{caught * 5} monedas extra
            </p>
            <button onClick={() => onDone(caught)} className="btn-primary">
              Recoger recompensa <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-center text-sm font-bold text-calabaza">{error}</p>}
      {playing && (
        <p className="mt-3 text-center text-xs font-semibold text-tinta/60">
          {mode === 'camera'
            ? 'Mueve tu mano delante de la cámara para atrapar los objetos.'
            : 'Mueve el ratón o el dedo para atrapar los objetos.'}
          {' '}Objetivo pedagógico: atención sostenida y coordinación visomotora.
        </p>
      )}
    </div>
  );
}
