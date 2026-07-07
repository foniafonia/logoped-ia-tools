import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronLeft, RotateCcw, Target } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import type { Activity, ActivityOption, Scene } from '../types';

interface Props {
  scene: Scene;
}

export default function ActivityEngine({ scene }: Props) {
  const finishScene = useGameStore((s) => s.finishScene);
  const addCoins = useGameStore((s) => s.addCoins);
  const loseHeart = useGameStore((s) => s.loseHeart);
  const goMap = useGameStore((s) => s.goMap);

  const [idx, setIdx] = useState(0);
  const [firstTry, setFirstTry] = useState(0);
  const [failedThis, setFailedThis] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const total = scene.activities.length;
  const activity = scene.activities[Math.min(idx, total - 1)];
  const locked = feedback === 'correct';

  const handleResult = (ok: boolean) => {
    if (locked) return;
    if (ok) {
      const ft = failedThis ? firstTry : firstTry + 1;
      if (!failedThis) setFirstTry(ft);
      addCoins(10);
      setFeedback('correct');
      window.setTimeout(() => {
        setFeedback(null);
        setFailedThis(false);
        if (idx + 1 >= total) {
          const ratio = ft / total;
          const stars = ratio === 1 ? 3 : ratio >= 0.6 ? 2 : 1;
          finishScene(scene.id, stars, ft, total);
        } else {
          setIdx(idx + 1);
        }
      }, 1500);
    } else {
      setFailedThis(true);
      loseHeart();
      setFeedback('wrong');
      window.setTimeout(() => setFeedback(null), 1600);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={goMap} className="btn-secondary !px-3 !py-2 !text-base">
          <ChevronLeft size={16} /> Mapa
        </button>
        <p className="font-hand text-xl text-tinta/70">
          Reto {Math.min(idx + 1, total)} de {total}
        </p>
      </div>

      <div className="mb-4 flex items-center gap-2" aria-hidden>
        {scene.activities.map((a, i) => (
          <span
            key={a.id}
            className={`flex h-9 flex-1 items-center justify-center rounded-md border-2 text-lg transition ${
              i < idx ? 'border-hierba bg-hierba/20' : i === idx ? 'border-tinta/40 bg-white' : 'border-tinta/15 bg-white/40 opacity-50'
            }`}
          >
            {i < idx ? '🎞️' : '·'}
          </span>
        ))}
      </div>

      <div className="card p-5 sm:p-7">
        <span className="chip mb-3">
          <Target size={12} /> Objetivo: {activity.objective}
        </span>
        <h1 className="mb-5 font-hand text-3xl leading-tight">{activity.prompt}</h1>

        {(activity.type === 'quiz' || activity.type === 'trueFalse' || activity.type === 'emotion') && (
          <OptionsActivity key={activity.id} activity={activity} locked={locked} onAnswer={handleResult} />
        )}
        {activity.type === 'sequence' && (
          <SequenceActivity key={activity.id} activity={activity} locked={locked} onAnswer={handleResult} />
        )}
        {activity.type === 'memory' && (
          <MemoryActivity key={activity.id} activity={activity} onAnswer={handleResult} />
        )}
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className={`fixed bottom-6 left-1/2 z-40 w-[min(92vw,32rem)] -translate-x-1/2 rounded-xl border-2 px-5 py-4 text-center font-hand text-xl shadow-lift ${
              feedback === 'correct'
                ? 'border-hierba bg-hierba text-white'
                : 'border-sol bg-sol text-tinta'
            }`}
            role="status"
          >
            {feedback === 'correct'
              ? `🎉 ${activity.explanation ?? '¡Genial!'} Has recuperado un trozo de película.`
              : '💛 Casi… ¡Piensa otra vez y vuelve a intentarlo!'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Test / Verdadero-Falso / Emociones ---------- */

function OptionsActivity({
  activity,
  locked,
  onAnswer,
}: {
  activity: Activity;
  locked: boolean;
  onAnswer: (ok: boolean) => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const options = activity.options ?? [];
  const isEmotion = activity.type === 'emotion';

  const pick = (opt: ActivityOption) => {
    if (locked) return;
    setPicked(opt.id);
    onAnswer(opt.id === activity.correctOptionId);
  };

  return (
    <div className={`grid gap-3 ${isEmotion ? 'grid-cols-2 sm:grid-cols-4' : 'sm:grid-cols-2'}`}>
      {options.map((opt) => {
        const isCorrectPick = picked === opt.id && opt.id === activity.correctOptionId;
        const isWrongPick = picked === opt.id && opt.id !== activity.correctOptionId;
        return (
          <button
            key={opt.id}
            onClick={() => pick(opt)}
            disabled={locked}
            className={`rounded-xl border-2 p-4 text-left shadow-crayon transition hover:-translate-y-0.5 disabled:hover:translate-y-0 ${
              isCorrectPick
                ? 'border-hierba bg-hierba/15'
                : isWrongPick
                  ? 'border-cereza bg-cereza/10'
                  : 'border-tinta/20 bg-white hover:bg-sol/10'
            } ${isEmotion ? 'flex flex-col items-center gap-1 text-center' : 'flex items-center gap-3'}`}
          >
            <span className={isEmotion ? 'text-5xl' : 'text-2xl'} aria-hidden>
              {opt.emoji}
            </span>
            <span className="font-bold">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Ordenar secuencia ---------- */

function SequenceActivity({
  activity,
  locked,
  onAnswer,
}: {
  activity: Activity;
  locked: boolean;
  onAnswer: (ok: boolean) => void;
}) {
  const items = activity.sequenceItems ?? [];
  const shuffled = useMemo(() => shuffle(items), [items]);
  const [placed, setPlaced] = useState<ActivityOption[]>([]);

  const remaining = shuffled.filter((i) => !placed.some((p) => p.id === i.id));
  const full = placed.length === items.length;

  const check = () => {
    const ok = placed.every((p, i) => p.id === items[i].id);
    if (!ok) setPlaced([]);
    onAnswer(ok);
  };

  return (
    <div>
      <div className="mb-4 flex min-h-[4.5rem] flex-wrap items-center gap-2 rounded-xl border-2 border-dashed border-tinta/25 bg-white/60 p-3">
        {placed.length === 0 && (
          <p className="text-sm font-semibold text-tinta/50">
            Toca las tarjetas de abajo en el orden correcto…
          </p>
        )}
        {placed.map((p, i) => (
          <button
            key={p.id}
            onClick={() => !locked && setPlaced(placed.filter((x) => x.id !== p.id))}
            className="flex items-center gap-2 rounded-lg border-2 border-cielo bg-cielo/10 px-3 py-2 font-bold shadow-crayon"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cielo text-sm text-white">
              {i + 1}
            </span>
            <span aria-hidden>{p.emoji}</span> {p.label}
          </button>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {remaining.map((item) => (
          <button
            key={item.id}
            onClick={() => !locked && setPlaced([...placed, item])}
            className="flex items-center gap-2 rounded-lg border-2 border-tinta/20 bg-white px-3 py-2 font-bold shadow-crayon transition hover:-translate-y-0.5 hover:bg-sol/10"
          >
            <span aria-hidden>{item.emoji}</span> {item.label}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={check} disabled={!full || locked} className="btn-primary">
          <Check size={18} /> Comprobar orden
        </button>
        <button
          onClick={() => setPlaced([])}
          disabled={placed.length === 0 || locked}
          className="btn-secondary"
        >
          <RotateCcw size={18} /> Vaciar
        </button>
      </div>
    </div>
  );
}

/* ---------- Memoria ---------- */

interface MemoryCard {
  key: string;
  pairId: string;
  face: string;
  kind: 'emoji' | 'word';
}

function MemoryActivity({
  activity,
  onAnswer,
}: {
  activity: Activity;
  onAnswer: (ok: boolean) => void;
}) {
  const pairs = activity.memoryPairs ?? [];
  const cards = useMemo<MemoryCard[]>(
    () =>
      shuffle(
        pairs.flatMap((p) => [
          { key: `${p.id}-e`, pairId: p.id, face: p.emoji, kind: 'emoji' as const },
          { key: `${p.id}-w`, pairId: p.id, face: p.word, kind: 'word' as const },
        ]),
      ),
    [pairs],
  );
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const done = useRef(false);

  const flip = (card: MemoryCard) => {
    if (flipped.length === 2 || matched.includes(card.pairId) || flipped.includes(card.key)) return;
    const next = [...flipped, card.key];
    setFlipped(next);
    if (next.length === 2) {
      const [a, b] = next.map((k) => cards.find((c) => c.key === k)!);
      if (a.pairId === b.pairId) {
        const nextMatched = [...matched, a.pairId];
        setMatched(nextMatched);
        setFlipped([]);
        if (nextMatched.length === pairs.length && !done.current) {
          done.current = true;
          window.setTimeout(() => onAnswer(true), 400);
        }
      } else {
        window.setTimeout(() => setFlipped([]), 900);
      }
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => {
        const isUp = flipped.includes(card.key) || matched.includes(card.pairId);
        const isMatched = matched.includes(card.pairId);
        return (
          <button
            key={card.key}
            onClick={() => flip(card)}
            className={`flex h-24 items-center justify-center rounded-xl border-2 p-2 shadow-crayon transition ${
              isMatched
                ? 'border-hierba bg-hierba/15'
                : isUp
                  ? 'border-cielo bg-white'
                  : 'border-tinta/20 bg-cielo/20 hover:-translate-y-0.5'
            }`}
            aria-label={isUp ? card.face : 'Carta boca abajo'}
          >
            {isUp ? (
              <span className={card.kind === 'emoji' ? 'text-4xl' : 'font-hand text-xl'}>
                {card.face}
              </span>
            ) : (
              <span className="text-3xl" aria-hidden>
                🎞️
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- util ---------- */

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
