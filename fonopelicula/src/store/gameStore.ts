import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AgeGroup } from '../data/ages';
import { avatars, film } from '../data/demoFilm';
import type { SceneResult } from '../types';

export type View = 'map' | 'scene' | 'dashboard';
export type ScenePhase = 'video' | 'activity' | 'bonus' | 'reward';

interface LastResult {
  stars: number;
  firstTryCorrect: number;
  totalActivities: number;
}

interface GameState {
  view: View;
  activeSceneId: string | null;
  scenePhase: ScenePhase;
  results: Record<string, SceneResult>;
  coins: number;
  hearts: number;
  avatarId: string;
  lastResult: LastResult;
  /** resultado de las actividades a la espera del minijuego bonus */
  pendingResult: LastResult;
  ageGroup: AgeGroup | null;
  muted: boolean;

  openScene: (sceneId: string, phase?: ScenePhase) => void;
  setPhase: (phase: ScenePhase) => void;
  goMap: () => void;
  goDashboard: () => void;
  addCoins: (amount: number) => void;
  loseHeart: () => void;
  setPendingResult: (result: LastResult) => void;
  finishScene: (sceneId: string, stars: number, firstTryCorrect: number, totalActivities: number) => void;
  previewReward: (sceneId: string) => void;
  setAvatar: (avatarId: string) => void;
  setAgeGroup: (age: AgeGroup | null) => void;
  toggleMuted: () => void;
  unlockAll: () => void;
  resetDemo: () => void;
}

const initialProgress = {
  results: {} as Record<string, SceneResult>,
  coins: 0,
  hearts: 5,
  avatarId: avatars[0].id,
};

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      view: 'map',
      activeSceneId: null,
      scenePhase: 'video',
      lastResult: { stars: 0, firstTryCorrect: 0, totalActivities: 0 },
      pendingResult: { stars: 1, firstTryCorrect: 0, totalActivities: 0 },
      ageGroup: null,
      muted: false,
      ...initialProgress,

      openScene: (sceneId, phase = 'video') =>
        set({ view: 'scene', activeSceneId: sceneId, scenePhase: phase }),

      setPhase: (phase) => set({ scenePhase: phase }),

      goMap: () => set({ view: 'map', activeSceneId: null, scenePhase: 'video' }),

      goDashboard: () => set({ view: 'dashboard' }),

      addCoins: (amount) => set((s) => ({ coins: s.coins + amount })),

      loseHeart: () => set((s) => ({ hearts: Math.max(1, s.hearts - 1) })),

      setPendingResult: (result) => set({ pendingResult: result }),

      finishScene: (sceneId, stars, firstTryCorrect, totalActivities) =>
        set((s) => {
          const prev = s.results[sceneId];
          return {
            scenePhase: 'reward',
            hearts: 5,
            coins: s.coins + 25,
            lastResult: { stars, firstTryCorrect, totalActivities },
            results: {
              ...s.results,
              [sceneId]: {
                completed: true,
                stars: Math.max(stars, prev?.stars ?? 0),
                firstTryCorrect,
                totalActivities,
                plays: (prev?.plays ?? 0) + 1,
              },
            },
          };
        }),

      previewReward: (sceneId) =>
        set({
          view: 'scene',
          activeSceneId: sceneId,
          scenePhase: 'reward',
          lastResult: { stars: 3, firstTryCorrect: 3, totalActivities: 3 },
        }),

      setAvatar: (avatarId) => set({ avatarId }),

      setAgeGroup: (ageGroup) => set({ ageGroup }),

      toggleMuted: () => set((s) => ({ muted: !s.muted })),

      unlockAll: () =>
        set((s) => {
          const starPattern = [3, 2, 3, 3, 2, 3];
          const results = { ...s.results };
          film.scenes.forEach((scene, i) => {
            if (!results[scene.id]?.completed) {
              results[scene.id] = {
                completed: true,
                stars: starPattern[i % starPattern.length],
                firstTryCorrect: scene.activities.length - (i % 2),
                totalActivities: scene.activities.length,
                plays: 1,
              };
            }
          });
          return { results, coins: Math.max(s.coins, 180), view: 'map' };
        }),

      resetDemo: () =>
        set({
          view: 'map',
          activeSceneId: null,
          scenePhase: 'video',
          lastResult: { stars: 0, firstTryCorrect: 0, totalActivities: 0 },
          pendingResult: { stars: 1, firstTryCorrect: 0, totalActivities: 0 },
          ageGroup: null,
          ...initialProgress,
        }),
    }),
    {
      name: 'fonopelicula-demo-v1',
      partialize: (s) => ({
        results: s.results,
        coins: s.coins,
        hearts: s.hearts,
        avatarId: s.avatarId,
        ageGroup: s.ageGroup,
        muted: s.muted,
      }),
    },
  ),
);

/* ---------- Selectores / helpers ---------- */

export function isSceneUnlocked(results: Record<string, SceneResult>, order: number): boolean {
  if (order === 1) return true;
  const prev = film.scenes.find((s) => s.order === order - 1);
  return prev ? Boolean(results[prev.id]?.completed) : false;
}

export function completedCount(results: Record<string, SceneResult>): number {
  return film.scenes.filter((s) => results[s.id]?.completed).length;
}

export function filmPercent(results: Record<string, SceneResult>): number {
  return Math.round((completedCount(results) / film.scenes.length) * 100);
}

export function totalStars(results: Record<string, SceneResult>): number {
  return film.scenes.reduce((acc, s) => acc + (results[s.id]?.stars ?? 0), 0);
}

export function totalCorrect(results: Record<string, SceneResult>): number {
  return film.scenes.reduce((acc, s) => acc + (results[s.id]?.firstTryCorrect ?? 0), 0);
}

export function accuracyPercent(results: Record<string, SceneResult>): number {
  const done = film.scenes.filter((s) => results[s.id]?.completed);
  if (done.length === 0) return 0;
  const correct = done.reduce((acc, s) => acc + (results[s.id]?.firstTryCorrect ?? 0), 0);
  const total = done.reduce((acc, s) => acc + (results[s.id]?.totalActivities ?? 0), 0);
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

export function playerLevel(coins: number): number {
  return 1 + Math.floor(coins / 100);
}
