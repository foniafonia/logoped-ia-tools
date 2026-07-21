import type { SessionPreferences, StorySettings } from "../types";

/** Preferencias por defecto (calmadas y accesibles). */
export const DEFAULT_PREFERENCES: SessionPreferences = {
  showText: true,
  showImages: true,
  showAudioButtons: true,
  autoplayAudio: true,
  showSubtitles: false,
  allowBack: true,
  allowReplay: true,
  showFeedback: true,
  autoplayVideo: true,
  reduceMotion: false,
  soundEnabled: true,
  fontScale: 1,
  minimalUI: false,
};

const STORAGE_KEY = "vis:prefs";

/**
 * Guarda solo AJUSTES de accesibilidad en localStorage (sin datos personales).
 * Respeta la preferencia del sistema de reducir movimiento.
 */
export function loadPreferences(): SessionPreferences {
  const systemReduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const base: SessionPreferences = {
    ...DEFAULT_PREFERENCES,
    reduceMotion: Boolean(systemReduceMotion),
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SessionPreferences>;
      return { ...base, ...parsed };
    }
  } catch {
    /* Sin persistencia disponible: usar valores por defecto. */
  }
  return base;
}

export function savePreferences(prefs: SessionPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* Ignorar si localStorage no esta disponible. */
  }
}

/** Combina las preferencias de sesion con los ajustes propios de la historia. */
export function mergeWithStorySettings(
  prefs: SessionPreferences,
  settings?: StorySettings
): SessionPreferences {
  if (!settings) return prefs;
  return {
    ...prefs,
    showText: settings.showText ?? prefs.showText,
    showImages: settings.showImages ?? prefs.showImages,
    showAudioButtons: settings.showAudioButtons ?? prefs.showAudioButtons,
    autoplayAudio: settings.autoplayAudio ?? prefs.autoplayAudio,
    showSubtitles: settings.showSubtitles ?? prefs.showSubtitles,
    allowBack: settings.allowBack ?? prefs.allowBack,
    allowReplay: settings.allowReplay ?? prefs.allowReplay,
    showFeedback: settings.showFeedback ?? prefs.showFeedback,
    autoplayVideo: settings.autoplayVideo ?? prefs.autoplayVideo,
  };
}
