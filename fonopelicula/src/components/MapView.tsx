import { Play, Sparkles } from 'lucide-react';
import { film } from '../data/demoFilm';
import { filmPercent, isSceneUnlocked, useGameStore } from '../store/gameStore';
import ProgressPanel from './ProgressPanel';
import SceneCard from './SceneCard';

export default function MapView() {
  const results = useGameStore((s) => s.results);
  const openScene = useGameStore((s) => s.openScene);

  const percent = filmPercent(results);
  const nextScene =
    film.scenes.find((s) => !results[s.id]?.completed && isSceneUnlocked(results, s.order)) ?? null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section aria-label="Mapa de la película">
        <div className="card mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-hand text-3xl">El mapa de tu película</h1>
            <p className="text-sm font-semibold text-tinta/70">
              {film.guideEmoji} {film.guideName} te acompaña: supera cada escena para desbloquear la
              siguiente.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-4 w-full max-w-xs overflow-hidden rounded-full border-2 border-tinta/20 bg-white">
                <div
                  className="h-full rounded-full bg-hierba transition-all duration-700"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="whitespace-nowrap text-sm font-extrabold">
                Película desbloqueada al {percent}%
              </span>
            </div>
          </div>
          {nextScene ? (
            <button onClick={() => openScene(nextScene.id)} className="btn-primary shrink-0">
              <Play size={18} /> Continuar aventura
            </button>
          ) : (
            <span className="chip shrink-0 border-hierba bg-hierba/10 text-sm text-hierba">
              <Sparkles size={14} /> ¡Película completa!
            </span>
          )}
        </div>

        <div className="relative">
          <div
            className="absolute bottom-6 left-1/2 top-6 hidden w-0 -translate-x-1/2 border-l-4 border-dashed border-tinta/20 md:block"
            aria-hidden
          />
          <ol className="flex flex-col gap-6">
            {film.scenes.map((scene, i) => {
              const result = results[scene.id];
              const unlocked = isSceneUnlocked(results, scene.order);
              const status = result?.completed ? 'done' : unlocked ? 'available' : 'locked';
              return (
                <li
                  key={scene.id}
                  className={`relative md:w-[calc(50%+3rem)] ${i % 2 === 0 ? 'md:self-start' : 'md:self-end'}`}
                >
                  <SceneCard
                    scene={scene}
                    status={status}
                    stars={result?.stars ?? 0}
                    onPlay={() => openScene(scene.id)}
                  />
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <ProgressPanel />
      </aside>
    </div>
  );
}
