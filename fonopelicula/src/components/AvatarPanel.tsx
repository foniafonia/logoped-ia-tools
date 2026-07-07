import { AnimatePresence, motion } from 'framer-motion';
import { Check, Heart, X } from 'lucide-react';
import { avatars } from '../data/demoFilm';
import { playerLevel, useGameStore } from '../store/gameStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AvatarPanel({ open, onClose }: Props) {
  const avatarId = useGameStore((s) => s.avatarId);
  const setAvatar = useGameStore((s) => s.setAvatar);
  const coins = useGameStore((s) => s.coins);
  const hearts = useGameStore((s) => s.hearts);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-tinta/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="card w-full max-w-sm p-6"
            role="dialog"
            aria-label="Tu personaje"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-hand text-2xl">Tu personaje</h2>
              <button onClick={onClose} className="btn-secondary !p-2" aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 flex items-center justify-between rounded-xl border-2 border-tinta/10 bg-white p-3">
              <span className="chip border-cielo/50 bg-cielo/10 text-cielo">
                Nivel {playerLevel(coins)}
              </span>
              <span className="flex items-center gap-1" aria-label={`${hearts} corazones`}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Heart
                    key={n}
                    size={18}
                    className={n <= hearts ? 'fill-cereza text-cereza' : 'text-tinta/20'}
                  />
                ))}
              </span>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-3">
              {avatars.map((a) => {
                const active = a.id === avatarId;
                return (
                  <button
                    key={a.id}
                    onClick={() => setAvatar(a.id)}
                    className={`relative flex flex-col items-center gap-1 rounded-xl border-2 p-3 shadow-crayon transition hover:-translate-y-0.5 ${
                      active ? 'border-hierba bg-hierba/10' : 'border-tinta/15 bg-white'
                    }`}
                  >
                    {active && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-hierba text-white">
                        <Check size={14} />
                      </span>
                    )}
                    <span
                      className="flex h-14 w-14 items-center justify-center rounded-full text-3xl"
                      style={{ backgroundColor: `${a.color}2e` }}
                    >
                      {a.emoji}
                    </span>
                    <span className="text-xs font-bold leading-tight">{a.name}</span>
                  </button>
                );
              })}
            </div>

            <p className="text-center text-xs font-semibold text-tinta/50">
              La personalización completa (ropa, accesorios y mascotas) llegará en la versión final.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
