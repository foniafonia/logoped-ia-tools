import { Camera, ChevronRight, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { startFaceCamera, loadFaceLandmarker, type FaceLandmarkerLike, type FacePoint } from '../lib/faceTracking';
import { sfx } from '../lib/audio';
import { buildSimulationFrame, deriveMetricsFromLandmarks, EXERCISES, scoreRound, type TrackingFrame } from '../lib/mirrorfono';
import type { Scene } from '../types';

/**
 * PORT de MirrorFono (mirrorfono-game): praxias orofaciales frente a la
 * cámara. Mismas métricas y fórmulas que el original (src/lib/mirrorfono.ts,
 * portado de movementMetrics.ts + exercises.ts), mismo modo simulación de
 * respaldo cuando no hay cámara.
 */

const COUNTDOWN_SECONDS = 3;
const CAPTURE_MS = 5000;
const ROUNDS_PER_SESSION = 3;

type Phase = 'intro' | 'loading' | 'countdown' | 'capture' | 'result' | 'done';

interface Props {
  scene: Scene;
  onDone: (stars: number) => void;
  onSkip: () => void;
}

export default function PraxiasGame({ scene, onDone, onSkip }: Props) {
  const rounds = Array.from(
    { length: ROUNDS_PER_SESSION },
    (_, i) => EXERCISES[(scene.order - 1 + i) % EXERCISES.length],
  );

  const [phase, setPhase] = useState<Phase>('intro');
  const [roundIndex, setRoundIndex] = useState(0);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [progress, setProgress] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastStars, setLastStars] = useState(0);

  const phaseRef = useRef<Phase>('intro');
  const roundIndexRef = useRef(0);
  const cameraOnRef = useRef(false);
  const framesRef = useRef<TrackingFrame[]>([]);
  const captureFramesRef = useRef<TrackingFrame[]>([]);
  const captureStartRef = useRef(0);
  const totalStarsRef = useRef(0);
  const pausedRef = useRef(false);
  const finishedRef = useRef(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<FaceLandmarkerLike | null>(null);
  const rafRef = useRef<number | null>(null);

  phaseRef.current = phase;
  roundIndexRef.current = roundIndex;
  cameraOnRef.current = cameraOn;

  useEffect(() => {
    const onVisibility = () => {
      pausedRef.current = document.hidden;
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

  const startWithCamera = async () => {
    sfx.click();
    setPhase('loading');
    setError(null);
    try {
      const stream = await startFaceCamera();
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      landmarkerRef.current = await loadFaceLandmarker();
      setCameraOn(true);
      beginRound(0);
    } catch (reason) {
      console.warn('Cámara no disponible, modo simulación', reason);
      stopEverything();
      setError('No se pudo activar la cámara: jugamos en modo demo. 😉');
      setCameraOn(false);
      beginRound(0);
    }
  };

  const startSimulation = () => {
    sfx.click();
    setCameraOn(false);
    beginRound(0);
  };

  const beginRound = (index: number) => {
    finishedRef.current = false;
    setRoundIndex(index);
    setCountdown(COUNTDOWN_SECONDS);
    setPhase('countdown');
    framesRef.current = [];
    runCountdown(COUNTDOWN_SECONDS);
  };

  const runCountdown = (n: number) => {
    if (n <= 0) {
      startCapture();
      return;
    }
    sfx.click();
    window.setTimeout(() => {
      if (finishedRef.current) return;
      setCountdown(n - 1);
      runCountdown(n - 1);
    }, 700);
  };

  const startCapture = () => {
    setPhase('capture');
    setProgress(0);
    captureFramesRef.current = [];
    captureStartRef.current = performance.now();
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(captureLoop);
  };

  const captureLoop = (now: number) => {
    if (finishedRef.current) return;
    if (pausedRef.current) {
      rafRef.current = requestAnimationFrame(captureLoop);
      return;
    }
    const exercise = rounds[roundIndexRef.current];
    let frame: TrackingFrame;

    if (cameraOnRef.current && landmarkerRef.current && videoRef.current) {
      const video = videoRef.current;
      let landmarks: FacePoint[] | undefined;
      if (video.videoWidth && video.readyState >= 2) {
        try {
          landmarks = landmarkerRef.current.detectForVideo(video, now).faceLandmarks?.[0];
        } catch {
          /* frame perdido */
        }
      }
      frame = landmarks?.length
        ? {
            timestamp: now,
            mode: 'camera',
            metrics: deriveMetricsFromLandmarks(landmarks, framesRef.current, exercise.target.primary),
          }
        : buildSimulationFrame(now, exercise, framesRef.current);
    } else {
      frame = buildSimulationFrame(now, exercise, framesRef.current);
    }

    framesRef.current = [...framesRef.current.slice(-59), frame];
    captureFramesRef.current.push(frame);

    const elapsed = now - captureStartRef.current;
    setProgress(Math.min(1, elapsed / CAPTURE_MS));

    if (elapsed >= CAPTURE_MS) {
      finishCapture();
      return;
    }
    rafRef.current = requestAnimationFrame(captureLoop);
  };

  const finishCapture = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    const exercise = rounds[roundIndexRef.current];
    const result = scoreRound(captureFramesRef.current, exercise);
    setLastStars(result.stars);
    totalStarsRef.current += result.stars;
    setTotalStars(totalStarsRef.current);
    if (result.stars >= 2) sfx.correct();
    else sfx.wrong();
    setPhase('result');
  };

  const nextRound = () => {
    const next = roundIndexRef.current + 1;
    if (next >= rounds.length) {
      finishedRef.current = true;
      sfx.win();
      setPhase('done');
      return;
    }
    beginRound(next);
  };

  const exercise = rounds[roundIndex];
  const playing = phase === 'countdown' || phase === 'capture' || phase === 'result';

  return (
    <div>
      {playing && (
        <div className="mb-3 flex items-center justify-between">
          <span className="chip border-sol/60 bg-sol/15 text-sm">
            {exercise.icon} Praxia {roundIndex + 1} / {rounds.length}
          </span>
          <span className="chip text-sm">
            <Sparkles size={13} /> {totalStars} estrellas
          </span>
        </div>
      )}

      <div className="relative aspect-video select-none overflow-hidden rounded-xl border-2 border-tinta/20 bg-gradient-to-b from-[#fde8f0] to-[#e6d9f7] shadow-crayon">
        <video
          ref={videoRef}
          muted
          playsInline
          className={`absolute inset-0 h-full w-full -scale-x-100 object-cover transition-opacity ${
            cameraOn && playing ? 'opacity-90' : 'opacity-0'
          }`}
        />

        {phase === 'intro' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-tinta/50 p-6 text-center backdrop-blur-sm">
            <p className="text-5xl" aria-hidden>😊✨</p>
            <h2 className="font-hand text-3xl text-white">¡Praxias mágicas!</h2>
            <p className="max-w-md text-sm font-bold text-white/85">
              {rounds.length} ejercicios de cara frente a la cámara: {rounds.map((r) => r.label).join(', ')}.
              La cámara no se graba: todo pasa en tu dispositivo.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={startWithCamera} className="btn-primary">
                <Camera size={18} /> Jugar con la cámara
              </button>
              <button onClick={startSimulation} className="btn-secondary">
                <Sparkles size={18} /> Ver una demo
              </button>
            </div>
            <button onClick={onSkip} className="text-xs font-bold text-white/70 underline underline-offset-2 hover:text-white">
              Saltar el reto e ir a la recompensa
            </button>
          </div>
        )}

        {phase === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-tinta/60 text-white">
            <Camera className="animate-bounce" size={40} />
            <p className="font-hand text-2xl">Preparando el espejo mágico…</p>
          </div>
        )}

        {phase === 'countdown' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-tinta/40 text-white">
            <p className="text-7xl" aria-hidden>{exercise.icon}</p>
            <p className="font-hand text-3xl">{exercise.label}</p>
            <p className="font-hand text-6xl">{countdown > 0 ? countdown : '¡Ya!'}</p>
          </div>
        )}

        {phase === 'capture' && (
          <div className="absolute inset-0 flex flex-col items-center justify-between p-6">
            <p className="rounded-full bg-tinta/60 px-4 py-1.5 text-center font-hand text-xl text-white">
              {exercise.prompt}
            </p>
            <div className="w-full max-w-sm">
              <div className="h-4 w-full overflow-hidden rounded-full border-2 border-white/70 bg-white/30">
                <div
                  className="h-full rounded-full bg-sol transition-[width] duration-100"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {phase === 'result' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-tinta/60 text-white">
            <div className="flex gap-1">
              {[1, 2, 3].map((n) => (
                <span key={n} className={`text-4xl ${n <= lastStars ? '' : 'opacity-25'}`} aria-hidden>
                  ⭐
                </span>
              ))}
            </div>
            <p className="font-hand text-2xl">¡{exercise.label} conseguida!</p>
            <button onClick={nextRound} className="btn-primary">
              {roundIndex + 1 >= rounds.length ? 'Ver resultado' : 'Siguiente praxia'} <ChevronRight size={18} />
            </button>
          </div>
        )}

        {phase === 'done' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-tinta/60 p-6 text-center backdrop-blur-sm">
            <p className="text-6xl" aria-hidden>🏅</p>
            <h2 className="font-hand text-3xl text-white">¡Praxias completadas!</h2>
            <p className="text-sm font-bold text-white/85">
              Has ganado {totalStars} estrellas · +{totalStars * 5} monedas extra
            </p>
            <button onClick={() => onDone(totalStars)} className="btn-primary">
              Recoger recompensa <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-center text-sm font-bold text-calabaza">{error}</p>}
      {playing && (
        <p className="mt-3 text-center text-xs font-semibold text-tinta/60">
          Port de MirrorFono · Objetivo pedagógico: praxias orofaciales, simetría y control motor
        </p>
      )}
    </div>
  );
}
