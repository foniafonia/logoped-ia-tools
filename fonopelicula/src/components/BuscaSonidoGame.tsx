import { ChevronRight, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { sfx } from '../lib/audio';
import { speak } from '../lib/speech';
import type { Scene } from '../types';

/**
 * PORT de "Busca Sonido" de FonoMundos (fonomundos/src/components/BuscaSonido.tsx).
 * Actividad fonémica real de la guía: busca los dibujos que empiezan por
 * /m/, /s/, /p/, /r/. Vocabulario y lógica de rondas fieles al original;
 * la sesión bonus juega 2 sonidos (rotan según el capítulo).
 */

const OBJETIVOS = ['M', 'S', 'P', 'R'];

const POR_INICIAL: Record<string, string[]> = {
  M: ['MESA', 'MIEL', 'MAR', 'MAPA', 'MALETA', 'MARTILLO'],
  S: ['SOL', 'SAL', 'SAPO', 'SIRENA', 'SOPA', 'SELLO', 'SANDÍA'],
  P: ['PATO', 'PALA', 'PINO', 'PIÑA', 'PEZ', 'PALOMA', 'POLO', 'PELOTA'],
  R: ['ROSA', 'RANA', 'ROCA', 'RATÓN', 'RELOJ'],
};
const DISTRACTORES = ['LUNA', 'FOCA', 'NUBE', 'TORO', 'OSO', 'UVAS', 'AVIÓN', 'LOBO', 'CASA', 'OREJA', 'LAZO', 'VELA'];

/* Subconjunto del EMOJI map de fonomundos/src/data/guia.ts */
const EMOJI: Record<string, string> = {
  MESA: '🍽️', MIEL: '🍯', MAR: '🌊', MAPA: '🗺️', MALETA: '🧳', MARTILLO: '🔨',
  SOL: '☀️', SAL: '🧂', SAPO: '🐸', SIRENA: '🧜', SOPA: '🍲', SELLO: '📮', SANDÍA: '🍉',
  PATO: '🦆', PALA: '🪏', PINO: '🌲', PIÑA: '🍍', PEZ: '🐟', PALOMA: '🕊️', POLO: '🍦', PELOTA: '⚽',
  ROSA: '🌹', RANA: '🐸', ROCA: '🪨', RATÓN: '🐭', RELOJ: '⏰',
  LUNA: '🌙', FOCA: '🦭', NUBE: '☁️', TORO: '🐂', OSO: '🐻', UVAS: '🍇',
  AVIÓN: '✈️', LOBO: '🐺', CASA: '🏠', OREJA: '👂', LAZO: '🎀', VELA: '🕯️',
};

const RONDAS_BONUS = 2;

interface Carta {
  palabra: string;
  correcta: boolean;
  estado: 'libre' | 'ok' | 'mal';
}

function barajar<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function tablero(objetivo: string): Carta[] {
  const correctas = barajar(POR_INICIAL[objetivo]).slice(0, 3);
  const otros = Object.entries(POR_INICIAL)
    .filter(([k]) => k !== objetivo)
    .flatMap(([, ws]) => ws)
    .concat(DISTRACTORES);
  const otras = barajar(otros).slice(0, 3);
  return barajar([
    ...correctas.map((palabra) => ({ palabra, correcta: true, estado: 'libre' as const })),
    ...otras.map((palabra) => ({ palabra, correcta: false, estado: 'libre' as const })),
  ]);
}

function anunciar(objetivo: string) {
  speak(`Busca todos los dibujos que empiezan por ${objetivo.toLocaleLowerCase('es-ES')}. Como ${POR_INICIAL[objetivo][0].toLocaleLowerCase('es-ES')}.`);
}

interface Props {
  scene: Scene;
  onDone: (score: number) => void;
}

export default function BuscaSonidoGame({ scene, onDone }: Props) {
  const objetivos = Array.from(
    { length: RONDAS_BONUS },
    (_, i) => OBJETIVOS[(scene.order - 1 + i) % OBJETIVOS.length],
  );
  const [empezado, setEmpezado] = useState(false);
  const [ronda, setRonda] = useState(0);
  const [cartas, setCartas] = useState<Carta[]>(() => tablero(objetivos[0]));
  const [bloqueado, setBloqueado] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [terminado, setTerminado] = useState(false);
  const aciertos = useRef(0);

  const objetivo = objetivos[Math.min(ronda, objetivos.length - 1)];
  const totalCorrectas = cartas.filter((c) => c.correcta).length;
  const encontradas = cartas.filter((c) => c.correcta && c.estado === 'ok').length;

  useEffect(() => {
    if (!empezado || terminado) return;
    const id = window.setTimeout(() => anunciar(objetivo), 400);
    return () => window.clearTimeout(id);
  }, [empezado, objetivo, terminado]);

  function tocar(idx: number) {
    if (bloqueado) return;
    const c = cartas[idx];
    if (c.estado !== 'libre') return;
    if (c.correcta) {
      aciertos.current += 1;
      sfx.correct();
      speak(c.palabra.toLocaleLowerCase('es-ES'), 0.8);
      setMensaje('');
      const next = cartas.map((x, i) => (i === idx ? { ...x, estado: 'ok' as const } : x));
      setCartas(next);
      if (next.filter((x) => x.correcta && x.estado === 'ok').length === totalCorrectas) {
        setBloqueado(true);
        window.setTimeout(() => {
          if (ronda + 1 >= objetivos.length) {
            sfx.win();
            setTerminado(true);
            return;
          }
          setRonda(ronda + 1);
          setCartas(tablero(objetivos[ronda + 1]));
          setBloqueado(false);
          setMensaje('');
        }, 1400);
      }
    } else {
      sfx.wrong();
      setCartas(cartas.map((x, i) => (i === idx ? { ...x, estado: 'mal' as const } : x)));
      window.setTimeout(() => {
        setCartas((cs) => cs.map((x, i) => (i === idx ? { ...x, estado: 'libre' as const } : x)));
      }, 500);
      setMensaje(`Prueba otra. Buscamos las que empiezan por ${objetivo}.`);
      speak(`Prueba otra. Buscamos las que empiezan por ${objetivo.toLocaleLowerCase('es-ES')}.`);
    }
  }

  if (!empezado) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-xl border-2 border-tinta/20 bg-gradient-to-b from-hierba/30 to-sol/20 shadow-crayon">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-tinta/50 p-6 text-center backdrop-blur-sm">
          <p className="text-5xl" aria-hidden>🔊🔎</p>
          <h2 className="font-hand text-3xl text-white">Caza del sonido</h2>
          <p className="max-w-md text-sm font-bold text-white/85">
            El juego de conciencia fonológica de FonoMundos: escucha el sonido y toca todos
            los dibujos que empiezan por él. {objetivos.length} sonidos: «{objetivos.join('», «')}».
          </p>
          <button onClick={() => { sfx.click(); setEmpezado(true); }} className="btn-primary">
            <Volume2 size={18} /> ¡Empezar!
          </button>
        </div>
      </div>
    );
  }

  if (terminado) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-xl border-2 border-tinta/20 bg-gradient-to-b from-hierba/30 to-sol/20 shadow-crayon">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-tinta/60 p-6 text-center backdrop-blur-sm">
          <p className="text-6xl" aria-hidden>🏅</p>
          <h2 className="font-hand text-3xl text-white">¡Sonidos cazados!</h2>
          <p className="text-sm font-bold text-white/85">
            Has encontrado {aciertos.current} dibujos · +{aciertos.current * 5} monedas extra
          </p>
          <button onClick={() => onDone(aciertos.current)} className="btn-primary">
            Recoger recompensa <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5 text-center">
      <div className="mb-2 flex items-center justify-between">
        <span className="chip">Sonido {ronda + 1}/{objetivos.length}</span>
        <span className="chip border-sol/60 bg-sol/15">{encontradas}/{totalCorrectas} encontrados</span>
      </div>
      <h2 className="font-hand text-3xl">
        Busca los que empiezan por «{objetivo}»
        <button
          onClick={() => anunciar(objetivo)}
          className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-cielo/50 bg-cielo/10 align-middle text-cielo"
          aria-label="Escuchar instrucción"
        >
          <Volume2 size={16} />
        </button>
      </h2>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {cartas.map((c, i) => (
          <button
            key={c.palabra}
            onClick={() => tocar(i)}
            disabled={bloqueado || c.estado === 'ok'}
            className={`flex flex-col items-center rounded-xl border-2 p-3 shadow-crayon transition hover:-translate-y-1 ${
              c.estado === 'ok'
                ? 'border-hierba bg-hierba text-white'
                : c.estado === 'mal'
                  ? 'border-cereza bg-cereza/20'
                  : 'border-tinta/20 bg-white'
            } ${['-rotate-1', 'rotate-1', 'rotate-0'][i % 3]}`}
          >
            <span className="text-4xl" aria-hidden>{EMOJI[c.palabra] ?? '❔'}</span>
            <span className="mt-1 font-hand text-lg">{c.palabra}</span>
          </button>
        ))}
      </div>

      {mensaje && <p className="chip mt-4 !text-sm">{mensaje}</p>}
      <p className="mt-4 text-xs font-semibold text-tinta/50">
        Pista: empiezan por el sonido «{objetivo}» (como {POR_INICIAL[objetivo][0]}) ·
        Port de FonoMundos · Objetivo: conciencia fonológica
      </p>
    </div>
  );
}
