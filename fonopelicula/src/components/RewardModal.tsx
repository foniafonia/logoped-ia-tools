import { motion } from 'framer-motion';
import { ArrowRight, Coins, Map, Star, Target } from 'lucide-react';
import { film, getReward } from '../data/demoFilm';
import { filmPercent, useGameStore } from '../store/gameStore';
import type { Scene } from '../types';

interface Props {
  scene: Scene;
}

export default function RewardModal({ scene }: Props) {
  const lastResult = useGameStore((s) => s.lastResult);
  const results = useGameStore((s) => s.results);
  const goMap = useGameStore((s) => s.goMap);
  const openScene = useGameStore((s) => s.openScene);

  const reward = getReward(scene.rewardId);
  const nextScene = film.scenes.find((s) => s.order === scene.order + 1) ?? null;
  const percent = filmPercent(results);
  const objectives = [...new Set(scene.activities.map((a) => a.objective))];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-tinta/60 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0.4 }}
        className="card w-full max-w-md overflow-hidden text-center"
        role="dialog"
        aria-label="Escena completada"
      >
        <div className="px-6 py-5 text-white" style={{ backgroundColor: scene.color }}>
          <p className="text-5xl" aria-hidden>🎉</p>
          <h2 className="font-hand text-3xl">¡Escena completada!</h2>
          <p className="text-sm font-bold opacity-90">
            Capítulo {scene.order}: {scene.title}
          </p>
        </div>

        <div className="p-6">
          <div className="mb-4 flex justify-center gap-2">
            {[1, 2, 3].map((n) => (
              <motion.span
                key={n}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3 + n * 0.2, type: 'spring', bounce: 0.6 }}
              >
                <Star
                  size={44}
                  className={n <= lastResult.stars ? 'fill-sol text-sol' : 'text-tinta/20'}
                />
              </motion.span>
            ))}
          </div>

          <p className="mb-1 font-hand text-xl">
            {lastResult.firstTryCorrect} de {lastResult.totalActivities} retos a la primera
          </p>
          <p className="mb-4 flex items-center justify-center gap-1 text-sm font-bold text-calabaza">
            <Coins size={16} /> +{lastResult.firstTryCorrect * 10 + 25} monedas
          </p>

          <div className="mb-4 rounded-xl border-2 border-dashed border-sol bg-sol/10 p-4">
            <p className="text-4xl" aria-hidden>{reward.emoji}</p>
            <p className="font-hand text-xl">Has ganado: {reward.name}</p>
          </div>

          <div className="mb-4 flex flex-wrap justify-center gap-1.5">
            {objectives.map((o) => (
              <span key={o} className="chip border-hierba/50 bg-hierba/10 text-hierba">
                <Target size={12} /> {o} superado
              </span>
            ))}
          </div>

          <p className="mb-5 text-sm font-extrabold text-tinta/70">
            🎬 Película desbloqueada al {percent}%
            {nextScene && ' · ¡Nueva escena disponible!'}
          </p>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button onClick={goMap} className="btn-secondary">
              <Map size={18} /> Volver al mapa
            </button>
            {nextScene && (
              <button onClick={() => openScene(nextScene.id)} className="btn-primary">
                Siguiente escena <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
