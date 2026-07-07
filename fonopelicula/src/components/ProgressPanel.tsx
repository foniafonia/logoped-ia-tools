import { FileText, Star, Trophy } from 'lucide-react';
import { film, getReward, rewards } from '../data/demoFilm';
import {
  accuracyPercent,
  completedCount,
  filmPercent,
  isSceneUnlocked,
  totalCorrect,
  totalStars,
  useGameStore,
} from '../store/gameStore';

export default function ProgressPanel() {
  const results = useGameStore((s) => s.results);

  const percent = filmPercent(results);
  const completed = completedCount(results);
  const stars = totalStars(results);
  const correct = totalCorrect(results);
  const accuracy = accuracyPercent(results);

  const earnedRewardIds = new Set(
    film.scenes.filter((s) => results[s.id]?.completed).map((s) => s.rewardId),
  );
  if (stars >= 10) earnedRewardIds.add('r-diez-estrellas');
  if (percent === 100) earnedRewardIds.add('r-superfan');

  const mission =
    film.scenes.find((s) => !results[s.id]?.completed && isSceneUnlocked(results, s.order)) ?? null;

  return (
    <div className="card p-5">
      <h2 className="mb-4 flex items-center gap-2 font-hand text-2xl">
        <Trophy size={20} className="text-calabaza" /> Tu progreso
      </h2>

      <div className="mb-4 flex items-center gap-4">
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-tinta/10"
          style={{
            background: `conic-gradient(#5F9E3E ${percent * 3.6}deg, #ffffff ${percent * 3.6}deg)`,
          }}
          role="img"
          aria-label={`Película desbloqueada al ${percent}%`}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-crema font-hand text-lg">
            {percent}%
          </span>
        </div>
        <div className="text-sm font-bold text-tinta/75">
          <p>🎬 Película desbloqueada</p>
          <p>
            {completed} de {film.scenes.length} escenas completadas
          </p>
        </div>
      </div>

      <dl className="mb-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border-2 border-tinta/10 bg-white p-2">
          <dt className="text-[11px] font-extrabold uppercase text-tinta/50">Estrellas</dt>
          <dd className="flex items-center justify-center gap-1 font-hand text-xl">
            <Star size={16} className="fill-sol text-sol" /> {stars}
          </dd>
        </div>
        <div className="rounded-lg border-2 border-tinta/10 bg-white p-2">
          <dt className="text-[11px] font-extrabold uppercase text-tinta/50">Aciertos</dt>
          <dd className="font-hand text-xl">{correct}</dd>
        </div>
        <div className="rounded-lg border-2 border-tinta/10 bg-white p-2">
          <dt className="text-[11px] font-extrabold uppercase text-tinta/50">Precisión</dt>
          <dd className="font-hand text-xl">{accuracy}%</dd>
        </div>
      </dl>

      {mission && (
        <div className="mb-4 rounded-xl border-2 border-dashed border-cielo bg-cielo/10 p-3">
          <p className="text-[11px] font-extrabold uppercase text-cielo">Misión actual</p>
          <p className="font-hand text-lg leading-snug">
            Desbloquea «{mission.title}» {mission.emoji}
          </p>
        </div>
      )}

      <p className="mb-2 text-[11px] font-extrabold uppercase text-tinta/50">Colección de recompensas</p>
      <div className="mb-4 grid grid-cols-4 gap-2">
        {rewards.map((r) => {
          const earned = earnedRewardIds.has(r.id);
          return (
            <div
              key={r.id}
              title={earned ? r.name : `${r.name} (por conseguir)`}
              className={`flex h-12 items-center justify-center rounded-lg border-2 text-2xl ${
                earned ? 'border-sol bg-sol/15' : 'border-tinta/10 bg-white opacity-35 grayscale'
              }`}
            >
              {getReward(r.id).emoji}
            </div>
          );
        })}
      </div>

      {completed > 0 && (
        <p className="flex items-center gap-1.5 text-xs font-bold text-hierba">
          <FileText size={14} /> Informe listo para el profesional
        </p>
      )}
    </div>
  );
}
