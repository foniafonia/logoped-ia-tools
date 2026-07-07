import { ChevronRight, Mic, MousePointer, Timer, Wind } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { sfx } from '../lib/audio';
import type { Scene } from '../types';

/**
 * Reto de voz/soplo: mantén el sonido (voz o soplido) delante del micrófono
 * para inflar el globo; al llegar arriba, ¡explota y ganas una estrella!
 * Sin cámara ni servicios externos: WebAudio + AnalyserNode, todo local.
 * Modo alternativo sin micro: mantener pulsado un botón.
 */

const GAME_SECONDS = 45;
const BALLOONS_GOAL = 3;
const BALLOON_COLORS = ['#E4572E', '#3E7CB1', '#F7B32B', '#5F9E3E'];

type Mode = 'intro' | 'loading' | 'mic' | 'hold' | 'done';

interface Props {
  scene: Scene;
  onDone: (score: number) => void;
}

export default function BlowBalloonGame({ scene, onDone }: Props) {
  const [mode, setMode] = useState<Mode>('intro');
  const [popped, setPopped] = useState(0);
  const [size, setSize] = useState(0); // 0..1
  const [level, setLevel] = useState(0); // volumen actual 0..1
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [error, setError] = useState<string | null>(null);

  const modeRef = useRef<Mode>('intro');
  const sizeRef = useRef(0);
  const poppedRef = useRef(0);
  const holdingRef = useRef(false);
  const startRef = useRef(0);
  const lastRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const frameRef = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataRef = useRef<Uint8Array | null>(null);
  const pausedRef = useRef(false);
  const finishedRef = useRef(false);

  modeRef.current = mode;

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
    void audioCtxRef.current?.close().catch(() => undefined);
    audioCtxRef.current = null;
    analyserRef.current = null;
  };

  const startMic = async () => {
    sfx.click();
    setMode('loading');
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyserRef.current = analyser;
      dataRef.current = new Uint8Array(analyser.fftSize);
      setMode('mic');
      beginGame('mic');
    } catch {
      setError('No se pudo activar el micrófono: jugamos manteniendo pulsado. 😉');
      setMode('hold');
      beginGame('hold');
    }
  };

  const startHold = () => {
    sfx.click();
    setMode('hold');
    beginGame('hold');
  };

  const beginGame = (gameMode: 'mic' | 'hold') => {
    modeRef.current = gameMode;
    sizeRef.current = 0;
    poppedRef.current = 0;
    finishedRef.current = false;
    setPopped(0);
    setSize(0);
    setTimeLeft(GAME_SECONDS);
    startRef.current = performance.now();
    lastRef.current = performance.now();
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  };

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (poppedRef.current >= BALLOONS_GOAL) sfx.win();
    setMode('done');
  };

  const readLevel = (): number => {
    const analyser = analyserRef.current;
    const data = dataRef.current;
    if (!analyser || !data) return 0;
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128;
      sum += v * v;
    }
    return Math.min(1, Math.sqrt(sum / data.length) * 4);
  };

  const loop = (now: number) => {
    if (finishedRef.current) return;
    rafRef.current = requestAnimationFrame(loop);
    if (pausedRef.current) return;

    const dt = Math.min((now - lastRef.current) / 1000, 0.05);
    lastRef.current = now;
    frameRef.current += 1;

    const elapsed = (now - startRef.current) / 1000;
    const remaining = Math.max(0, GAME_SECONDS - elapsed);
    if (frameRef.current % 12 === 0) setTimeLeft(Math.ceil(remaining));
    if (remaining <= 0) {
      finish();
      return;
    }

    const currentLevel = modeRef.current === 'mic' ? readLevel() : holdingRef.current ? 0.6 : 0;
    const blowing = currentLevel > 0.12;
    if (blowing) {
      sizeRef.current = Math.min(1, sizeRef.current + dt * 0.45);
    } else {
      sizeRef.current = Math.max(0, sizeRef.current - dt * 0.12);
    }

    if (sizeRef.current >= 1) {
      poppedRef.current += 1;
      sizeRef.current = 0;
      sfx.pop();
      setPopped(poppedRef.current);
      if (poppedRef.current >= BALLOONS_GOAL) {
        finish();
        return;
      }
    }

    if (frameRef.current % 3 === 0) {
      setSize(sizeRef.current);
      setLevel(currentLevel);
    }
  };

  const success = popped >= BALLOONS_GOAL;
  const playing = mode === 'mic' || mode === 'hold';
  const balloonColor = BALLOON_COLORS[popped % BALLOON_COLORS.length];
  const scale = 0.35 + size * 0.75;

  return (
    <div>
      {playing && (
        <div className="mb-3 flex items-center justify-between">
          <span className="chip border-sol/60 bg-sol/15 text-sm">🎈 {popped} / {BALLOONS_GOAL}</span>
          <span className="chip text-sm">
            <Timer size={13} /> {timeLeft}s
          </span>
        </div>
      )}

      <div className="relative aspect-video select-none overflow-hidden rounded-xl border-2 border-tinta/20 bg-gradient-to-b from-[#bfe0f5] to-[#e8f4d9] shadow-crayon">
        {playing && (
          <>
            {/* globo */}
            <div className="absolute inset-0 flex items-end justify-center pb-6">
              <div
                className="origin-bottom transition-transform duration-150 ease-out"
                style={{ transform: `scale(${scale})` }}
              >
                <svg width="180" height="240" viewBox="0 0 180 240" aria-hidden>
                  <ellipse cx="90" cy="95" rx="72" ry="88" fill={balloonColor} stroke="#3B3024" strokeWidth="5" />
                  <path d="M62 50 Q 78 34 100 42" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" opacity="0.7" />
                  <path d="M83 183 L 90 196 L 97 183 Z" fill={balloonColor} stroke="#3B3024" strokeWidth="4" strokeLinejoin="round" />
                  <path d="M90 196 Q 80 215 92 236" fill="none" stroke="#3B3024" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            {/* medidor de voz */}
            <div className="absolute left-4 top-4 bottom-4 flex w-6 flex-col justify-end overflow-hidden rounded-full border-2 border-tinta/25 bg-white/70">
              <div
                className="w-full rounded-full bg-cereza transition-[height] duration-100"
                style={{ height: `${level * 100}%` }}
              />
            </div>
            <p className="absolute right-4 top-4 rounded-full bg-white/80 px-3 py-1 text-xs font-extrabold text-tinta/70">
              {mode === 'mic' ? '¡Sopla o di «aaaah» fuerte!' : '¡Mantén pulsado el botón!'}
            </p>
            {mode === 'hold' && (
              <button
                className="btn-primary absolute bottom-4 left-1/2 -translate-x-1/2 touch-none"
                onPointerDown={() => (holdingRef.current = true)}
                onPointerUp={() => (holdingRef.current = false)}
                onPointerLeave={() => (holdingRef.current = false)}
              >
                <Wind size={18} /> ¡Soplar!
              </button>
            )}
          </>
        )}

        {mode === 'intro' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-tinta/50 p-6 text-center backdrop-blur-sm">
            <p className="text-5xl" aria-hidden>🎈🌬️</p>
            <h2 className="font-hand text-3xl text-white">¡Infla los globos con tu voz!</h2>
            <p className="max-w-md text-sm font-bold text-white/85">
              Sopla o mantén un sonido («aaaah») delante del micrófono para inflar el globo.
              ¡Explota {BALLOONS_GOAL} para ganar! El sonido no se graba: todo pasa en tu dispositivo.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={startMic} className="btn-primary">
                <Mic size={18} /> Jugar con el micro
              </button>
              <button onClick={startHold} className="btn-secondary">
                <MousePointer size={18} /> Jugar sin micro
              </button>
            </div>
          </div>
        )}

        {mode === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-tinta/60 text-white">
            <Mic className="animate-bounce" size={40} />
            <p className="font-hand text-2xl">Encendiendo el micrófono…</p>
          </div>
        )}

        {mode === 'done' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-tinta/60 p-6 text-center backdrop-blur-sm">
            <p className="text-6xl" aria-hidden>{success ? '🏅' : '💪'}</p>
            <h2 className="font-hand text-3xl text-white">
              {success ? '¡Qué pulmones!' : '¡Buen intento!'}
            </h2>
            <p className="text-sm font-bold text-white/85">
              Has explotado {popped} globos · +{popped * 5} monedas extra
            </p>
            <button onClick={() => onDone(popped)} className="btn-primary">
              Recoger recompensa <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-center text-sm font-bold text-calabaza">{error}</p>}
      {playing && (
        <p className="mt-3 text-center text-xs font-semibold text-tinta/60">
          Objetivo pedagógico: control de soplo, apoyo respiratorio e intensidad vocal
          {' '}· Escena: {scene.title}
        </p>
      )}
    </div>
  );
}
