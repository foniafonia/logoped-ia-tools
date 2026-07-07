import { ArrowRight, ChevronLeft, Play, Target } from 'lucide-react';
import { useEffect, useState } from 'react';
import { film } from '../data/demoFilm';
import { useGameStore } from '../store/gameStore';
import type { Scene } from '../types';

interface Props {
  scene: Scene;
}

export default function InteractivePlayer({ scene }: Props) {
  const setPhase = useGameStore((s) => s.setPhase);
  const goMap = useGameStore((s) => s.goMap);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(() => setReady(true), 6000);
    return () => window.clearTimeout(t);
  }, [playing]);

  const objectives = [...new Set(scene.activities.map((a) => a.objective))];
  const embedSrc = `https://www.youtube-nocookie.com/embed/${film.youtubeId}?start=${scene.videoStart}&end=${scene.videoEnd}&autoplay=1&rel=0&modestbranding=1`;

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
        <div className="border-b-2 border-tinta/10 px-5 py-3">
          <h1 className="font-hand text-3xl leading-tight">
            {scene.emoji} {scene.title}
          </h1>
          <p className="text-sm font-semibold text-tinta/60">{scene.subtitle}</p>
        </div>

        <div className="relative aspect-video bg-tinta">
          {playing ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={embedSrc}
              title={`Escena ${scene.order}: ${scene.title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              onClick={() => setPlaying(true)}
              className="group absolute inset-0 flex flex-col items-center justify-center gap-4"
              style={{ background: `linear-gradient(135deg, ${scene.color} 0%, #3B3024 130%)` }}
              aria-label="Reproducir escena"
            >
              <span className="text-7xl drop-shadow-lg" aria-hidden>
                {scene.emoji}
              </span>
              <span className="flex items-center gap-2 rounded-full border-2 border-white/60 bg-white/15 px-6 py-3 font-hand text-2xl text-white backdrop-blur transition group-hover:scale-105">
                <Play size={22} className="fill-white" /> Ver escena
              </span>
              <span className="text-xs font-bold text-white/70">
                Fragmento {formatTime(scene.videoStart)} – {formatTime(scene.videoEnd)} de la película
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
          <button
            onClick={() => setPhase('activity')}
            className="text-sm font-bold text-tinta/50 underline underline-offset-2 hover:text-tinta"
          >
            Saltar vídeo (modo demo)
          </button>
          <button
            onClick={() => setPhase('activity')}
            disabled={!ready}
            className="btn-primary w-full sm:w-auto"
          >
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
