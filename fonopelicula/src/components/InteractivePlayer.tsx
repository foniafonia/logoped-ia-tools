import {
  ArrowRight,
  Check,
  ChevronLeft,
  Pause,
  Play,
  RotateCcw,
  Scissors,
  Target,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ageConfigs } from '../data/ages';
import { film } from '../data/demoFilm';
import { sfx } from '../lib/audio';
import { useGameStore } from '../store/gameStore';
import type { Scene } from '../types';
import SceneArt from './SceneArt';

/**
 * Reproductor con corte forzoso: usa la IFrame API de YouTube con los controles
 * nativos ocultos y vigila el tiempo cada 400 ms. El niño SOLO puede ver el
 * fragmento de su capítulo (90–120 s según edad); cualquier intento de salirse
 * del rango devuelve el vídeo al inicio del fragmento.
 */

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}

interface YTNamespace {
  Player: new (el: HTMLElement, opts: unknown) => YTPlayer;
  PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
}

let ytApiPromise: Promise<YTNamespace> | null = null;

function loadYouTubeApi(): Promise<YTNamespace> {
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    const w = window as unknown as {
      YT?: YTNamespace & { loaded?: number };
      onYouTubeIframeAPIReady?: () => void;
    };
    if (w.YT?.Player) {
      resolve(w.YT);
      return;
    }
    const previous = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(w.YT as YTNamespace);
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(script);
  });
  return ytApiPromise;
}

type PlayerStatus = 'poster' | 'loading' | 'playing' | 'paused' | 'ended';

interface Props {
  scene: Scene;
}

export default function InteractivePlayer({ scene }: Props) {
  const setPhase = useGameStore((s) => s.setPhase);
  const goMap = useGameStore((s) => s.goMap);
  const ageGroup = useGameStore((s) => s.ageGroup);
  const cfg = ageConfigs[ageGroup ?? 'libre'];

  const clipEnd = Math.min(scene.videoStart + cfg.clipSeconds, scene.videoEnd);
  const clipLength = clipEnd - scene.videoStart;

  const [status, setStatus] = useState<PlayerStatus>('poster');
  const [ready, setReady] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const ytRef = useRef<YTNamespace | null>(null);
  const statusRef = useRef<PlayerStatus>('poster');
  statusRef.current = status;

  /* vigilancia del fragmento: corte forzoso y anti-saltos */
  useEffect(() => {
    const interval = window.setInterval(() => {
      const player = playerRef.current;
      if (!player || typeof player.getCurrentTime !== 'function') return;
      if (statusRef.current !== 'playing' && statusRef.current !== 'paused') return;
      let t = 0;
      try {
        t = player.getCurrentTime();
      } catch {
        return;
      }
      setElapsed(Math.max(0, Math.min(t - scene.videoStart, clipLength)));
      if (t >= clipEnd - 0.4) {
        try {
          player.pauseVideo();
        } catch {
          /* sin efecto */
        }
        setStatus('ended');
        setReady(true);
        sfx.unlock();
      } else if (t < scene.videoStart - 1.5 || t > clipEnd + 1.5) {
        // intento de salirse del fragmento: volvemos al inicio del capítulo
        player.seekTo(scene.videoStart, true);
      }
    }, 400);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id, clipEnd]);

  /* limpieza al desmontar */
  useEffect(() => {
    return () => {
      try {
        playerRef.current?.destroy();
      } catch {
        /* sin efecto */
      }
      playerRef.current = null;
    };
  }, []);

  const startPlayback = async () => {
    sfx.click();
    setStatus('loading');
    try {
      const YT = await loadYouTubeApi();
      ytRef.current = YT;
      if (!hostRef.current) return;
      playerRef.current = new YT.Player(hostRef.current, {
        videoId: film.youtubeId,
        width: '100%',
        height: '100%',
        playerVars: {
          start: scene.videoStart,
          end: clipEnd,
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          rel: 0,
          fs: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (e: { target: YTPlayer }) => {
            e.target.playVideo();
            setStatus('playing');
          },
          onStateChange: (e: { data: number }) => {
            const YTns = ytRef.current;
            if (!YTns) return;
            if (statusRef.current === 'ended') return;
            if (e.data === YTns.PlayerState.ENDED) {
              setStatus('ended');
              setReady(true);
              sfx.unlock();
            } else if (e.data === YTns.PlayerState.PLAYING) {
              setStatus('playing');
            } else if (e.data === YTns.PlayerState.PAUSED) {
              setStatus('paused');
            }
          },
        },
      });
    } catch {
      setStatus('poster');
    }
  };

  const togglePlay = () => {
    const player = playerRef.current;
    if (!player) return;
    if (statusRef.current === 'playing') player.pauseVideo();
    else player.playVideo();
  };

  const restartFragment = () => {
    const player = playerRef.current;
    if (!player) return;
    player.seekTo(scene.videoStart, true);
    player.playVideo();
    setStatus('playing');
  };

  const goActivity = () => {
    sfx.click();
    setPhase('activity');
  };

  const objectives = [...new Set(scene.activities.map((a) => a.objective))];
  const progress = clipLength > 0 ? Math.min(elapsed / clipLength, 1) : 0;
  const hasPlayer = status !== 'poster' && status !== 'loading';

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={goMap} className="btn-secondary !px-3 !py-2 !text-base">
          <ChevronLeft size={16} /> Mapa
        </button>
        <p className="font-hand text-xl text-tinta/70">
          Capítulo {scene.order} de {film.scenes.length}
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-tinta/10 px-5 py-3">
          <div>
            <h1 className="font-hand text-3xl leading-tight">
              {scene.emoji} {scene.title}
            </h1>
            <p className="text-sm font-semibold text-tinta/60">{scene.subtitle}</p>
          </div>
          <span className="chip" title="Cada capítulo muestra solo su fragmento, adaptado a la edad">
            <Scissors size={12} /> Corte {cfg.emoji} {formatTime(clipLength)}
          </span>
        </div>

        <div className="relative aspect-video bg-tinta">
          {/* host del reproductor de YouTube (la API sustituye este div) */}
          <div className={hasPlayer ? 'absolute inset-0 h-full w-full' : 'hidden'}>
            <div ref={hostRef} className="h-full w-full" />
          </div>

          {status === 'poster' && (
            <button onClick={startPlayback} className="group absolute inset-0" aria-label="Reproducir escena">
              <SceneArt sceneId={scene.id} />
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-tinta/25 transition group-hover:bg-tinta/15">
                <span className="flex items-center gap-2 rounded-full border-2 border-white/70 bg-tinta/50 px-6 py-3 font-hand text-2xl text-white backdrop-blur-sm transition group-hover:scale-105">
                  <Play size={22} className="fill-white" /> Ver escena
                </span>
                <span className="rounded-full bg-tinta/50 px-3 py-1 text-xs font-bold text-white/90 backdrop-blur-sm">
                  Fragmento {formatTime(scene.videoStart)} – {formatTime(clipEnd)} de la película
                </span>
              </span>
            </button>
          )}

          {status === 'loading' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
              <span className="text-4xl" aria-hidden>🎬</span>
              <p className="font-hand text-2xl">Preparando tu fragmento…</p>
            </div>
          )}

          {status === 'ended' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-tinta/70 p-6 text-center backdrop-blur-sm">
              <span className="text-5xl" aria-hidden>🎞️✨</span>
              <p className="font-hand text-3xl text-white">¡Fragmento completado!</p>
              <p className="text-sm font-bold text-white/85">
                Para desbloquear más película… ¡hay que superar la misión!
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button onClick={restartFragment} className="btn-secondary">
                  <RotateCcw size={18} /> Volver a verlo
                </button>
                <button onClick={goActivity} className="btn-primary">
                  ¡A la misión! <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* controles propios: sin barra de YouTube no se puede saltar a otra parte */}
        {hasPlayer && status !== 'ended' && (
          <div className="flex items-center gap-3 border-t-2 border-tinta/10 bg-white/60 px-4 py-2.5">
            <button
              onClick={togglePlay}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-tinta/25 bg-white shadow-crayon transition hover:scale-105"
              aria-label={status === 'playing' ? 'Pausar' : 'Reproducir'}
            >
              {status === 'playing' ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button
              onClick={restartFragment}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-tinta/25 bg-white shadow-crayon transition hover:scale-105"
              aria-label="Volver a empezar el fragmento"
            >
              <RotateCcw size={16} />
            </button>
            <div
              className="h-3.5 flex-1 overflow-hidden rounded-full border-2 border-tinta/20 bg-white"
              role="progressbar"
              aria-valuenow={Math.round(progress * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-cereza transition-[width] duration-300"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <span className="shrink-0 text-sm font-extrabold text-tinta/70">
              {formatTime(Math.round(elapsed))} / {formatTime(clipLength)}
            </span>
          </div>
        )}

        <div className="flex items-start gap-3 border-t-2 border-tinta/10 px-5 py-4">
          <span className="text-3xl" aria-hidden>
            {film.guideEmoji}
          </span>
          <div>
            <p className="font-hand text-lg leading-snug">{scene.narrative}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {objectives.map((o) => (
                <span key={o} className="chip">
                  <Target size={12} /> {o}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 border-t-2 border-tinta/10 bg-white/50 px-5 py-4 sm:flex-row sm:justify-between">
          <button
            onClick={goActivity}
            className="text-sm font-bold text-tinta/50 underline underline-offset-2 hover:text-tinta"
          >
            Saltar vídeo (modo demo)
          </button>
          <button onClick={goActivity} disabled={!ready} className="btn-primary w-full sm:w-auto">
            {ready ? (
              <>
                <Check size={18} /> Continuar a la misión
              </>
            ) : (
              <>Termina el fragmento para continuar</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
