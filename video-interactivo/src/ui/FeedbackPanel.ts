import type { Feedback, FeedbackTone, SessionPreferences } from "../types";
import { el } from "./dom";

/** Etiqueta textual del tono (no dependemos solo del color). */
const TONE_LABEL: Record<FeedbackTone, string> = {
  positive: "Bien",
  reflective: "Para pensar",
  neutral: "Observa",
  consequence: "Consecuencia",
  repair: "Reparacion",
  observation: "Observacion",
};

/** Icono textual del tono (refuerza el significado sin depender del color). */
const TONE_ICON: Record<FeedbackTone, string> = {
  positive: "✓",
  reflective: "…",
  neutral: "•",
  consequence: "!",
  repair: "↻",
  observation: "?",
};

export interface FeedbackCallbacks {
  onContinue: () => void;
  onReplay?: () => void;
  onPlayAudio?: () => void;
}

/**
 * Panel de feedback clinico. Usa aria-live para anunciar el mensaje.
 * El tono se comunica con texto e icono, nunca solo con color.
 */
export class FeedbackPanel {
  readonly root: HTMLElement;

  constructor(
    feedback: Feedback,
    prefs: SessionPreferences,
    callbacks: FeedbackCallbacks,
    labels: { continueLabel?: string; showReplay?: boolean } = {}
  ) {
    const tone: FeedbackTone = feedback.tone ?? "neutral";

    this.root = el("div", {
      class: `feedback feedback--${tone}`,
      role: "status",
      "aria-live": "polite",
    });

    const panel = el("div", { class: "feedback__panel" });

    const tag = el("div", { class: "feedback__tone" }, [
      el("span", { class: "feedback__tone-icon", "aria-hidden": "true", text: TONE_ICON[tone] }),
      el("span", { class: "feedback__tone-label", text: TONE_LABEL[tone] }),
    ]);
    panel.append(tag);

    if (feedback.title && prefs.showText) {
      panel.append(el("h2", { class: "feedback__title", text: feedback.title }));
    }
    if (feedback.text && prefs.showText) {
      panel.append(el("p", { class: "feedback__text", text: feedback.text }));
    }

    if (feedback.audio && prefs.showAudioButtons && callbacks.onPlayAudio) {
      const audioBtn = el(
        "button",
        { type: "button", class: "feedback__audio", "aria-label": "Escuchar el mensaje" },
        ["🔊 Escuchar"]
      );
      audioBtn.addEventListener("click", () => callbacks.onPlayAudio?.());
      panel.append(audioBtn);
    }

    const actions = el("div", { class: "feedback__actions" });
    if (labels.showReplay && callbacks.onReplay) {
      const replay = el(
        "button",
        { type: "button", class: "btn btn--ghost" },
        ["↺ Repetir"]
      );
      replay.addEventListener("click", () => callbacks.onReplay?.());
      actions.append(replay);
    }
    const cont = el("button", { type: "button", class: "btn btn--primary" }, [
      labels.continueLabel ?? "Continuar",
    ]);
    cont.addEventListener("click", () => callbacks.onContinue());
    actions.append(cont);
    panel.append(actions);

    this.root.append(panel);
  }

  focus(): void {
    this.root.querySelector<HTMLElement>(".btn--primary")?.focus();
  }
}
