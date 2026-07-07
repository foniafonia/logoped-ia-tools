import { Check, ChevronRight, Ear, Mic, SkipForward, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { sfx } from '../lib/audio';
import { canRecognize, listen, normalize, speak, type RecognitionHandle } from '../lib/speech';
import type { Scene } from '../types';

/**
 * Reto de habla: Foni dice una palabra de la escena y el niño la repite en voz
 * alta. Usa el reconocimiento de voz del navegador (es-ES, local, sin backend).
 * Si el navegador no lo soporta, el adulto valida con un botón.
 */

type Mode = 'intro' | 'playing' | 'done';

interface Props {
  scene: Scene;
  onDone: (score: number) => void;
}

export default function MagicWordGame({ scene, onDone }: Props) {
  const words = scene.magicWords;
  const [mode, setMode] = useState<Mode>('intro');
  const [index, setIndex] = useState(0);
  const [said, setSaid] = useState(0);
  const [heard, setHeard] = useState('');
  const [celebrating, setCelebrating] = useState(false);
  const [supported] = useState(() => canRecognize());

  const handleRef = useRef<RecognitionHandle | null>(null);
  const indexRef = useRef(0);
  const celebratingRef = useRef(false);
  indexRef.current = index;
  celebratingRef.current = celebrating;

  useEffect(() => {
    return () => handleRef.current?.stop();
  }, []);

  const currentWord = words[Math.min(index, words.length - 1)];

  const start = () => {
    sfx.click();
    setMode('playing');
    speak(`¡La palabra mágica es… ${words[0]}! Repítela fuerte y claro.`);
    if (supported) {
      handleRef.current = listen(
        (text) => {
          setHeard(text.split(' ').slice(-6).join(' '));
          if (celebratingRef.current) return;
          const target = normalize(words[indexRef.current] ?? '');
          if (target && normalize(text).includes(target)) {
            wordSaid();
          }
        },
        () => undefined,
      );
    }
  };

  const wordSaid = () => {
    if (celebratingRef.current) return;
    setCelebrating(true);
    sfx.correct();
    setSaid((s) => s + 1);
    const next = indexRef.current + 1;
    window.setTimeout(() => {
      setCelebrating(false);
      setHeard('');
      if (next >= words.length) {
        handleRef.current?.stop();
        sfx.win();
        setMode('done');
      } else {
        setIndex(next);
        speak(`¡Genial! Ahora… ${words[next]}`);
      }
    }, 1400);
  };

  const skipWord = () => {
    const next = indexRef.current + 1;
    setHeard('');
    if (next >= words.length) {
      handleRef.current?.stop();
      setMode('done');
    } else {
      setIndex(next);
      speak(words[next]);
    }
  };

  return (
    <div>
      {mode === 'playing' && (
        <div className="mb-3 flex items-center justify-between">
          <span className="chip border-sol/60 bg-sol/15 text-sm">🗣️ {said} / {words.length}</span>
          <span className="chip text-sm">
            <Ear size={13} /> {supported ? 'Te escucho…' : 'Modo adulto'}
          </span>
        </div>
      )}

      <div className="relative aspect-video select-none overflow-hidden rounded-xl border-2 border-tinta/20 bg-gradient-to-b from-[#f5d9a8] to-[#f2b17a] shadow-crayon">
        {mode === 'intro' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-tinta/50 p-6 text-center backdrop-blur-sm">
            <p className="text-5xl" aria-hidden>🗣️✨</p>
            <h2 className="font-hand text-3xl text-white">¡Di la palabra mágica!</h2>
            <p className="max-w-md text-sm font-bold text-white/85">
              Foni dirá {words.length} palabras de la escena. Repítelas en voz alta, fuerte y claro.
              {supported
                ? ' Tu voz no se graba: el navegador la reconoce en tu dispositivo.'
                : ' Tu navegador no reconoce voz: un adulto valida cada palabra con el botón.'}
            </p>
            <button onClick={start} className="btn-primary">
              <Mic size={18} /> ¡Empezar!
            </button>
          </div>
        )}

        {mode === 'playing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="flex items-center gap-1.5" aria-hidden>
              {words.map((w, i) => (
                <span
                  key={w}
                  className={`h-3 w-8 rounded-full border-2 border-tinta/25 ${i < said ? 'bg-hierba' : 'bg-white/70'}`}
                />
              ))}
            </div>
            <div
              className={`rounded-2xl border-4 bg-white px-10 py-6 shadow-lift transition ${
                celebrating ? 'scale-110 border-hierba' : 'border-tinta/20'
              }`}
            >
              <p className="font-hand text-5xl tracking-wide">
                {celebrating ? '🎉 ¡' : ''}{currentWord}{celebrating ? '!' : ''}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button onClick={() => speak(currentWord)} className="btn-secondary !text-base">
                <Volume2 size={16} /> Escuchar otra vez
              </button>
              {!supported && (
                <button onClick={wordSaid} className="btn-primary !text-base">
                  <Check size={16} /> ¡Lo ha dicho!
                </button>
              )}
              <button
                onClick={skipWord}
                className="text-xs font-bold text-tinta/50 underline underline-offset-2 hover:text-tinta"
              >
                <SkipForward size={12} className="mr-1 inline" />
                Pasar palabra
              </button>
            </div>
            {supported && (
              <p className="min-h-5 text-xs font-semibold italic text-tinta/60">
                {heard ? `He oído: «${heard}»` : 'Habla cerca del micrófono…'}
              </p>
            )}
          </div>
        )}

        {mode === 'done' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-tinta/60 p-6 text-center backdrop-blur-sm">
            <p className="text-6xl" aria-hidden>{said >= words.length ? '🏅' : '💪'}</p>
            <h2 className="font-hand text-3xl text-white">
              {said >= words.length ? '¡Palabras mágicas conseguidas!' : '¡Buen intento!'}
            </h2>
            <p className="text-sm font-bold text-white/85">
              Has dicho {said} de {words.length} palabras · +{said * 5} monedas extra
            </p>
            <button onClick={() => onDone(said)} className="btn-primary">
              Recoger recompensa <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {mode === 'playing' && (
        <p className="mt-3 text-center text-xs font-semibold text-tinta/60">
          Objetivo pedagógico: articulación, vocabulario y denominación en voz alta
        </p>
      )}
    </div>
  );
}
