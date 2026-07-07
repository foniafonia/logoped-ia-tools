import { MotionConfig } from 'framer-motion';
import { Coins, Heart, Star } from 'lucide-react';
import { useState } from 'react';
import ActivityEngine from './components/ActivityEngine';
import AvatarPanel from './components/AvatarPanel';
import DemoControls from './components/DemoControls';
import InteractivePlayer from './components/InteractivePlayer';
import MapView from './components/MapView';
import ProfessionalDashboard from './components/ProfessionalDashboard';
import RewardModal from './components/RewardModal';
import { avatars, film } from './data/demoFilm';
import { totalStars, useGameStore } from './store/gameStore';

export default function App() {
  const view = useGameStore((s) => s.view);
  const scenePhase = useGameStore((s) => s.scenePhase);
  const activeSceneId = useGameStore((s) => s.activeSceneId);
  const coins = useGameStore((s) => s.coins);
  const hearts = useGameStore((s) => s.hearts);
  const avatarId = useGameStore((s) => s.avatarId);
  const results = useGameStore((s) => s.results);

  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatar = avatars.find((a) => a.id === avatarId) ?? avatars[0];
  const activeScene = film.scenes.find((s) => s.id === activeSceneId) ?? null;
  const stars = totalStars(results);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen">
        <header className="sticky top-0 z-30 border-b-2 border-tinta/10 bg-papel/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-3xl" aria-hidden>🎬</span>
              <div className="leading-tight">
                <p className="font-hand text-2xl">{film.title}</p>
                <p className="text-xs font-bold text-tinta/60">{film.tagline} · beta demo</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="chip" title="Estrellas">
                <Star size={14} className="fill-sol text-sol" /> {stars}
              </span>
              <span className="chip" title="Monedas">
                <Coins size={14} className="text-calabaza" /> {coins}
              </span>
              <span className="chip" title="Corazones">
                <Heart size={14} className="fill-cereza text-cereza" /> {hearts}
              </span>
              <button
                onClick={() => setAvatarOpen(true)}
                className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-tinta/20 text-2xl shadow-crayon transition hover:scale-105"
                style={{ backgroundColor: `${avatar.color}33` }}
                aria-label="Tu avatar"
              >
                {avatar.emoji}
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 pb-32 pt-6">
          {view === 'map' && <MapView />}
          {view === 'scene' && activeScene && scenePhase === 'video' && (
            <InteractivePlayer scene={activeScene} />
          )}
          {view === 'scene' && activeScene && scenePhase !== 'video' && (
            <ActivityEngine key={activeScene.id} scene={activeScene} />
          )}
          {view === 'dashboard' && <ProfessionalDashboard />}
        </main>

        {view === 'scene' && activeScene && scenePhase === 'reward' && (
          <RewardModal scene={activeScene} />
        )}
        <AvatarPanel open={avatarOpen} onClose={() => setAvatarOpen(false)} />
        <DemoControls />
      </div>
    </MotionConfig>
  );
}
