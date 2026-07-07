import { AnimatePresence, motion } from 'framer-motion';
import {
  Clapperboard,
  Gift,
  HelpCircle,
  Map,
  Play,
  RotateCcw,
  Unlock,
  Users,
  X,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { film } from '../data/demoFilm';
import { useGameStore } from '../store/gameStore';

export default function DemoControls() {
  const [open, setOpen] = useState(false);
  const goMap = useGameStore((s) => s.goMap);
  const goDashboard = useGameStore((s) => s.goDashboard);
  const openScene = useGameStore((s) => s.openScene);
  const previewReward = useGameStore((s) => s.previewReward);
  const unlockAll = useGameStore((s) => s.unlockAll);
  const resetDemo = useGameStore((s) => s.resetDemo);

  const firstScene = film.scenes[0];
  const run = (action: () => void) => {
    action();
    setOpen(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            className="card w-64 p-3"
            aria-label="Atajos de presentación"
          >
            <p className="mb-2 px-1 text-[11px] font-extrabold uppercase text-tinta/50">
              Tour rápido para la reunión
            </p>
            <ul className="flex flex-col gap-1">
              <DemoItem icon={<Map size={16} />} label="1 · Mapa de la película" onClick={() => run(goMap)} />
              <DemoItem
                icon={<Play size={16} />}
                label="2 · Ver una escena"
                onClick={() => run(() => openScene(firstScene.id, 'video'))}
              />
              <DemoItem
                icon={<HelpCircle size={16} />}
                label="3 · Jugar una pregunta"
                onClick={() => run(() => openScene(firstScene.id, 'activity'))}
              />
              <DemoItem
                icon={<Gift size={16} />}
                label="4 · Ver una recompensa"
                onClick={() => run(() => previewReward(firstScene.id))}
              />
              <DemoItem
                icon={<Users size={16} />}
                label="5 · Panel profesional"
                onClick={() => run(goDashboard)}
              />
            </ul>
            <hr className="my-2 border-tinta/10" />
            <ul className="flex flex-col gap-1">
              <DemoItem
                icon={<Unlock size={16} />}
                label="Desbloquear toda la película"
                onClick={() => run(unlockAll)}
              />
              <DemoItem
                icon={<RotateCcw size={16} />}
                label="Reiniciar demo"
                onClick={() => run(resetDemo)}
              />
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen(!open)}
        className="btn-primary !rounded-full !px-5"
        aria-expanded={open}
      >
        {open ? <X size={18} /> : <Clapperboard size={18} />} Demo cliente
      </button>
    </div>
  );
}

function DemoItem({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-bold transition hover:bg-sol/15"
      >
        <span className="text-tinta/60">{icon}</span> {label}
      </button>
    </li>
  );
}
