import { Play, Sparkles } from 'lucide-react';
import { avatars, film } from '../data/demoFilm';
import { filmPercent, isSceneUnlocked, useGameStore } from '../store/gameStore';
import ProgressPanel from './ProgressPanel';
import SceneCard from './SceneCard';

export default function MapView() {
  const results = useGameStore((s) => s.results);
  const openScene = useGameStore((s) => s.openScene);
  const avatarId = useGameStore((s) => s.avatarId);

  const percent = filmPercent(results);
  const avatar = avatars.find((a) => a.id === avatarId) ?? avatars[0];
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

        {/* Paisaje de la aventura */}
        <div className="relative overflow-hidden rounded-xl border-2 border-tinta/15 bg-gradient-to-b from-[#bfe0f5] via-[#dcedd2] to-[#b9dc9a] p-4 shadow-crayon sm:p-6">
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <span className="anim-float absolute left-[6%] top-6 text-4xl opacity-80">☁️</span>
            <span className="anim-float-slow absolute right-[10%] top-14 text-3xl opacity-70">☁️</span>
            <span className="anim-float absolute left-[42%] top-2 text-2xl opacity-60">☁️</span>
            <span className="anim-twinkle absolute right-[28%] top-6 text-xl">✨</span>
            <span className="anim-twinkle absolute left-[20%] top-16 text-lg">✨</span>
            <span className="absolute bottom-4 left-[8%] text-3xl">🌳</span>
            <span className="absolute bottom-10 right-[6%] text-4xl">🌳</span>
            <span className="absolute bottom-2 right-[30%] text-2xl">🌼</span>
            <span className="absolute bottom-6 left-[38%] text-2xl">🌷</span>
          </div>

          <div className="relative mt-10">
            {/* camino serpenteante */}
            <svg
              className="absolute inset-0 hidden h-full w-full md:block"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
              aria-hidden
            >
              <path
                d="M 25 4 C 90 12 90 20 75 24 C 30 32 15 36 25 42 C 90 50 90 56 75 60 C 30 68 15 72 25 78 C 90 86 90 92 75 96"
                fill="none"
                stroke="#c8a46e"
                strokeWidth="3.4"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                style={{ strokeWidth: 14 }}
              />
              <path
                d="M 25 4 C 90 12 90 20 75 24 C 30 32 15 36 25 42 C 90 50 90 56 75 60 C 30 68 15 72 25 78 C 90 86 90 92 75 96"
                fill="none"
                stroke="#FFFBF0"
                strokeLinecap="round"
                strokeDasharray="2 12"
                vectorEffect="non-scaling-stroke"
                style={{ strokeWidth: 4 }}
              />
            </svg>

            <ol className="relative flex flex-col gap-7">
              {film.scenes.map((scene, i) => {
                const result = results[scene.id];
                const unlocked = isSceneUnlocked(results, scene.order);
                const status = result?.completed ? 'done' : unlocked ? 'available' : 'locked';
                const isCurrent = status === 'available' && nextScene?.id === scene.id;
                return (
                  <li
                    key={scene.id}
                    className={`relative md:w-[calc(50%+2.5rem)] ${i % 2 === 0 ? 'md:self-start' : 'md:self-end'}`}
                  >
                    {isCurrent && (
                      <span
                        className="anim-bounce-soft absolute -top-9 left-6 z-10 flex items-center gap-1 rounded-full border-2 border-tinta/20 bg-white px-3 py-1 text-xl shadow-crayon"
                        title="¡Estás aquí!"
                      >
                        {avatar.emoji}
                        <span className="font-hand text-sm">¡estás aquí!</span>
                      </span>
                    )}
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
        </div>
      </section>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <ProgressPanel />
      </aside>
    </div>
  );
}
