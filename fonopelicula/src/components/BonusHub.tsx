import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { sfx } from '../lib/audio';
import type { Scene } from '../types';
import AirPaintGame from './AirPaintGame';
import BuscaSonidoGame from './BuscaSonidoGame';
import PraxiasGame from './PraxiasGame';

/**
 * Tras las actividades, el niño elige su "reto mágico": tres ports fieles de
 * juegos reales del ecosistema Logoped-IA, no mecánicas inventadas.
 * - AirPaintGame: port de "Pintura en el aire: colores" (pintura-aire-colores)
 * - PraxiasGame: port de MirrorFono (praxias orofaciales con cámara)
 * - BuscaSonidoGame: port de "Busca Sonido" de FonoMundos
 * Cada escena recomienda uno distinto para que roten.
 */

type BonusKind = 'paint' | 'praxias' | 'busca';

const BONUS_INFO: Record<BonusKind, { emoji: string; title: string; text: string; source: string }> = {
  paint: {
    emoji: '🎨',
    title: 'Pintura en el aire',
    text: 'Agarra la pintura con el puño y lánzala al color pedido',
    source: 'Port de pintura-aire-colores',
  },
  praxias: {
    emoji: '😊',
    title: 'Praxias mágicas',
    text: 'Sonríe, besa el aire e infla las mejillas frente a la cámara',
    source: 'Port de MirrorFono',
  },
  busca: {
    emoji: '🔎',
    title: 'Caza del sonido',
    text: 'Toca los dibujos que empiezan por el sonido de Foni',
    source: 'Port de FonoMundos',
  },
};

const ROTATION: BonusKind[] = ['paint', 'praxias', 'busca'];

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

  if (chosen === 'paint') {
    return (
      <div className="mx-auto max-w-3xl">
        <Header scene={scene} />
        <AirPaintGame scene={scene} goal={catchGoal} speed={catchSpeed} onDone={onDone} onSkip={onSkip} />
      </div>
    );
  }
  if (chosen === 'praxias') {
    return (
      <div className="mx-auto max-w-3xl">
        <Header scene={scene} />
        <PraxiasGame scene={scene} onDone={onDone} onSkip={onSkip} />
      </div>
    );
  }
  if (chosen === 'busca') {
    return (
      <div className="mx-auto max-w-3xl">
        <Header scene={scene} />
        <BuscaSonidoGame scene={scene} onDone={onDone} />
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
                <span className="text-[10px] font-bold uppercase tracking-wide text-tinta/40">{info.source}</span>
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
