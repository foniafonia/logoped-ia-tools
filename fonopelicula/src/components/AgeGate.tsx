import { motion } from 'framer-motion';
import { ageConfigs, type AgeGroup } from '../data/ages';
import { film } from '../data/demoFilm';
import { sfx } from '../lib/audio';
import { useGameStore } from '../store/gameStore';

const ORDER: AgeGroup[] = ['mini', 'media', 'mayor', 'libre'];

export default function AgeGate() {
  const setAgeGroup = useGameStore((s) => s.setAgeGroup);

  const choose = (age: AgeGroup) => {
    sfx.unlock();
    setAgeGroup(age);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-papel/95 backdrop-blur">
      <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center px-4 py-10 text-center">
        <motion.p
          initial={{ scale: 0, rotate: -12 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="text-7xl"
          aria-hidden
        >
          🎬
        </motion.p>
        <h1 className="mt-2 font-hand text-4xl sm:text-5xl">
          {film.title}: {film.tagline}
        </h1>
        <p className="mt-2 max-w-md text-sm font-bold text-tinta/70">
          {film.guideEmoji} ¡Hola! Soy {film.guideName}. Antes de empezar, dime quién va a jugar:
          la película se corta y los retos se ajustan a cada edad.
        </p>

        <div className="mt-8 grid w-full gap-4 sm:grid-cols-2">
          {ORDER.map((id, i) => {
            const cfg = ageConfigs[id];
            return (
              <motion.button
                key={id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.1 }}
                onClick={() => choose(id)}
                className="card group flex items-center gap-4 p-5 text-left transition hover:-translate-y-1 hover:shadow-lift"
              >
                <span className="text-5xl transition group-hover:scale-110" aria-hidden>
                  {cfg.emoji}
                </span>
                <span>
                  <span className="block font-hand text-2xl leading-tight">
                    {cfg.label} <span className="text-base text-tinta/60">· {cfg.ages}</span>
                  </span>
                  <span className="block text-sm font-semibold text-tinta/70">{cfg.description}</span>
                </span>
              </motion.button>
            );
          })}
        </div>

        <p className="mt-6 text-xs font-semibold text-tinta/50">
          Se puede cambiar en cualquier momento desde el mapa · Demo sin registro
        </p>
      </div>
    </div>
  );
}
