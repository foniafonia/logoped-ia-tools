import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { sfx } from '../lib/audio';
import type { Scene } from '../types';
import BlowBalloonGame from './BlowBalloonGame';
import HandCatchGame from './HandCatchGame';
import MagicWordGame from './MagicWordGame';

/**
 * Tras las actividades, el niño elige su "reto mágico":
 * mano (cámara), voz/soplo (micro) o palabra mágica (habla).
 * Cada escena recomienda uno distinto para que roten.
 */

type BonusKind = 'hand' | 'balloon' | 'word';

const BONUS_INFO: Record<BonusKind, { emoji: string; title: string; text: string }> = {
  hand: {
    emoji: '✋',
    title: 'Cazamanos',
    text: 'Atrapa los objetos con tu mano delante de la cámara',
  },
  balloon: {
    emoji: '🎈',
    title: 'Globo de voz',
    text: 'Infla globos soplando o manteniendo tu voz',
  },
  word: {
    emoji: '🗣️',
    title: 'Palabra mágica',
    text: 'Repite en voz alta las palabras de la escena',
  },
};

const ROTATION: BonusKind[] = ['hand', 'balloon', 'word'];

interface Props {
  scene: Scene;
  catchGoal: number;
  catchSpeed: number;
  onDone: (score: number) => void;
  onSkip: () => void;
}

export default function BonusHub({ scene, catchGoal, catchSpeed, onDone, onSkip }: Props) {
  const [chosen, setChosen] = useState<BonusKind | null>(null);
  const recommended = ROTATION[(scene.order - 1) % ROTATION.length];

  if (chosen === 'hand') {
    return (
      <div className="mx-auto max-w-3xl">
        <Header scene={scene} />
        <HandCatchGame scene={scene} goal={catchGoal} speed={catchSpeed} onDone={onDone} onSkip={onSkip} />
      </div>
    );
  }
  if (chosen === 'balloon') {
    return (
      <div className="mx-auto max-w-3xl">
        <Header scene={scene} />
        <BlowBalloonGame scene={scene} onDone={onDone} />
      </div>
    );
  }
  if (chosen === 'word') {
    return (
      <div className="mx-auto max-w-3xl">
        <Header scene={scene} />
        <MagicWordGame scene={scene} onDone={onDone} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Header scene={scene} />
      <div className="card p-6 text-center">
        <p className="text-4xl" aria-hidden>✨</p>
        <h1 className="font-hand text-3xl">¡Misión superada! Elige tu reto mágico</h1>
        <p className="mx-auto mt-1 max-w-md text-sm font-semibold text-tinta/70">
          Supera un reto extra para ganar monedas antes de abrir la recompensa.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {ROTATION.map((kind) => {
            const info = BONUS_INFO[kind];
            const isRecommended = kind === recommended;
            return (
              <button
                key={kind}
                onClick={() => {
                  sfx.click();
                  setChosen(kind);
                }}
                className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-5 shadow-crayon transition hover:-translate-y-1 hover:shadow-lift ${
                  isRecommended ? 'border-sol bg-sol/10' : 'border-tinta/20 bg-white'
                }`}
              >
                {isRecommended && (
                  <span className="absolute -top-3 flex items-center gap-1 rounded-full border-2 border-tinta/20 bg-sol px-2 py-0.5 text-[11px] font-extrabold">
                    <Sparkles size={11} /> ¡Prueba este!
                  </span>
                )}
                <span className="text-5xl" aria-hidden>{info.emoji}</span>
                <span className="font-hand text-2xl leading-none">{info.title}</span>
                <span className="text-xs font-semibold text-tinta/65">{info.text}</span>
              </button>
            );
          })}
        </div>
        <button
          onClick={onSkip}
          className="mt-4 text-sm font-bold text-tinta/50 underline underline-offset-2 hover:text-tinta"
        >
          Saltar el reto e ir a la recompensa
        </button>
      </div>
    </div>
  );
}

function Header({ scene }: { scene: Scene }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <p className="font-hand text-xl text-tinta/70">Reto mágico · Capítulo {scene.order}</p>
      <span className="chip text-sm">+5 monedas por acierto</span>
    </div>
  );
}
