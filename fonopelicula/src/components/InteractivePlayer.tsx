import { ArrowRight, ChevronLeft, Play, Plus, Scissors, Target } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ageConfigs } from '../data/ages';
import { film } from '../data/demoFilm';
import { sfx } from '../lib/audio';
import { useGameStore } from '../store/gameStore';
import type { Scene } from '../types';
import SceneArt from './SceneArt';

interface Props {
  scene: Scene;
}

export default function InteractivePlayer({ scene }: Props) {
  const setPhase = useGameStore((s) => s.setPhase);
  const goMap = useGameStore((s) => s.goMap);
  const ageGroup = useGameStore((s) => s.ageGroup);
  const cfg = ageConfigs[ageGroup ?? 'libre'];

  const baseEnd = cfg.clipSeconds
    ? Math.min(scene.videoStart + cfg.clipSeconds, scene.videoEnd)
    : scene.videoEnd;

  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [clipEnd, setClipEnd] = useState(baseEnd);

  useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(() => setReady(true), 6000);
    return () => window.clearTimeout(t);
  }, [playing]);

  const objectives = [...new Set(scene.activities.map((a) => a.objective))];
  const embedSrc = `https://www.youtube-nocookie.com/embed/${film.youtubeId}?start=${scene.videoStart}&end=${clipEnd}&autoplay=1&rel=0&modestbranding=1`;
  const clipLength = clipEnd - scene.videoStart;
  const canExtend = clipEnd < scene.videoEnd;

  const goActivity = () => {
    sfx.click();
    setPhase('activity');
  };

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
          <span className="chip" title="La duración del fragmento se adapta a la edad">
            <Scissors size={12} /> Corte {cfg.emoji} {formatTime(clipLength)}
          </span>
        </div>

        <div className="relative aspect-video bg-tinta">
          {playing ? (
            <iframe
              key={clipEnd}
              className="absolute inset-0 h-full w-full"
              src={embedSrc}
              title={`Escena ${scene.order}: ${scene.title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              onClick={() => {
                sfx.click();
                setPlaying(true);
              }}
              className="group absolute inset-0"
              aria-label="Reproducir escena"
            >
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
        </div>

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
          <div className="flex items-center gap-3">
            <button
              onClick={goActivity}
              className="text-sm font-bold text-tinta/50 underline underline-offset-2 hover:text-tinta"
            >
              Saltar vídeo (modo demo)
            </button>
            {canExtend && (
              <button
                onClick={() => setClipEnd(Math.min(clipEnd + 30, scene.videoEnd))}
                className="chip !text-sm hover:bg-sol/20"
                title="Marcado a voluntad: alarga el fragmento 30 segundos"
              >
                <Plus size={12} /> Ver más película
              </button>
            )}
          </div>
          <button onClick={goActivity} disabled={!ready} className="btn-primary w-full sm:w-auto">
            Continuar a la misión <ArrowRight size={18} />
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
