import { Check, Lock, Play, RotateCcw, Sparkles, Star } from 'lucide-react';
import { getReward } from '../data/demoFilm';
import type { Scene } from '../types';

interface Props {
  scene: Scene;
  status: 'locked' | 'available' | 'done';
  stars: number;
  onPlay: () => void;
}

export default function SceneCard({ scene, status, stars, onPlay }: Props) {
  const locked = status === 'locked';
  const reward = getReward(scene.rewardId);

  return (
    <article
      className={`card flex items-center gap-4 p-4 transition ${
        locked ? 'opacity-60 grayscale' : 'hover:-translate-y-0.5 hover:shadow-lift'
      }`}
    >
      <div
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-tinta/20 text-3xl shadow-crayon"
        style={{ backgroundColor: locked ? '#d8d2c4' : `${scene.color}2e` }}
        aria-hidden
      >
        {locked ? <Lock size={24} className="text-tinta/50" /> : scene.emoji}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-extrabold uppercase tracking-wide" style={{ color: locked ? undefined : scene.color }}>
          Capítulo {scene.order}
        </p>
        <h3 className="truncate font-hand text-2xl leading-tight">{scene.title}</h3>
        <p className="truncate text-sm font-semibold text-tinta/60">{scene.subtitle}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {status === 'done' && (
            <span className="chip border-hierba/50 bg-hierba/10 text-hierba">
              <Check size={12} /> Completada
            </span>
          )}
          {status === 'available' && (
            <span className="chip border-sol/60 bg-sol/15 text-calabaza">
              <Sparkles size={12} /> ¡Disponible!
            </span>
          )}
          {status === 'locked' && (
            <span className="chip">
              <Lock size={12} /> Bloqueada
            </span>
          )}
          <span className="flex items-center gap-0.5" title={`${stars} de 3 estrellas`}>
            {[1, 2, 3].map((n) => (
              <Star
                key={n}
                size={16}
                className={n <= stars ? 'fill-sol text-sol' : 'text-tinta/25'}
              />
            ))}
          </span>
          <span className="text-sm" title={`Recompensa: ${reward.name}`}>
            {reward.emoji}
          </span>
        </div>
      </div>

      {!locked && (
        <button
          onClick={onPlay}
          className={status === 'done' ? 'btn-secondary shrink-0 !px-4' : 'btn-primary shrink-0 !px-4'}
        >
          {status === 'done' ? <RotateCcw size={18} /> : <Play size={18} />}
          <span className="hidden sm:inline">{status === 'done' ? 'Repetir' : 'Jugar'}</span>
        </button>
      )}
    </article>
  );
}
