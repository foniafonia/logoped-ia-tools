import type { Choice, SessionPreferences, StoryNode } from "../types";
import { el } from "./dom";

export interface DecisionCallbacks {
  onChoose: (choice: Choice) => void;
  onPlayQuestionAudio: () => void;
  onPlayChoiceAudio: (choice: Choice) => void;
  onReplayClip: () => void;
  onPause: () => void;
  onBack?: () => void;
}

/**
 * Pantalla de decision. Se superpone al ultimo fotograma del video (congelado)
 * con un ligero oscurecimiento. Muestra la pregunta y las opciones en una
 * cuadricula responsive. Sin cuenta atras ni presion temporal.
 */
export class DecisionScreen {
  readonly root: HTMLElement;

  constructor(
    node: StoryNode,
    prefs: SessionPreferences,
    callbacks: DecisionCallbacks,
    options: { canGoBack: boolean; isObservation?: boolean } = { canGoBack: false }
  ) {
    const choices = node.choices ?? [];
    const count = choices.length;

    this.root = el("div", {
      class: "decision",
      role: "dialog",
      "aria-modal": "false",
      "aria-label": node.question || "Pregunta",
    });

    const panel = el("div", { class: "decision__panel" });

    // Pregunta.
    if (node.question && prefs.showText) {
      const q = el("h2", { class: "decision__question", text: node.question });
      panel.append(q);
    }

    // Boton de audio de la pregunta.
    if (node.questionAudio && prefs.showAudioButtons) {
      const audioBtn = el(
        "button",
        {
          type: "button",
          class: "decision__audio-btn",
          "aria-label": "Escuchar la pregunta",
        },
        ["🔊 Escuchar la pregunta"]
      );
      audioBtn.addEventListener("click", () => callbacks.onPlayQuestionAudio());
      panel.append(audioBtn);
    }

    // Cuadricula de opciones.
    const grid = el("div", {
      class: `decision__grid decision__grid--count-${Math.min(count, 4)}`,
      role: "group",
      "aria-label": "Opciones",
    });

    choices.forEach((choice, index) => {
      grid.append(this.buildChoice(choice, index, prefs, callbacks));
    });
    panel.append(grid);

    // Si es un nodo de observacion sin opciones, ofrecer "Continuar".
    if (count === 0 && options.isObservation) {
      const cont = el(
        "button",
        { type: "button", class: "decision__continue" },
        ["Continuar"]
      );
      cont.addEventListener("click", () =>
        callbacks.onChoose({ id: "__continue__", label: "", next: node.next ?? "" })
      );
      panel.append(cont);
    }

    // Controles auxiliares (repetir clip, pausar, volver).
    const aux = el("div", { class: "decision__aux" });
    const replay = el(
      "button",
      { type: "button", class: "decision__aux-btn", "aria-label": "Repetir el clip" },
      ["↺ Repetir clip"]
    );
    replay.addEventListener("click", () => callbacks.onReplayClip());
    aux.append(replay);

    if (options.canGoBack && callbacks.onBack) {
      const back = el(
        "button",
        { type: "button", class: "decision__aux-btn", "aria-label": "Volver atras" },
        ["← Volver"]
      );
      back.addEventListener("click", () => callbacks.onBack?.());
      aux.append(back);
    }
    panel.append(aux);

    this.root.append(panel);
  }

  private buildChoice(
    choice: Choice,
    index: number,
    prefs: SessionPreferences,
    callbacks: DecisionCallbacks
  ): HTMLElement {
    const btn = el("button", {
      type: "button",
      class: "choice",
      "data-choice-id": choice.id,
      "aria-label": choice.label || `Opcion ${index + 1}`,
    });

    if (choice.image && prefs.showImages) {
      const img = el("img", {
        class: "choice__img",
        src: choice.image,
        alt: choice.imageAlt || "",
        loading: "lazy",
      });
      img.addEventListener("error", () => {
        img.style.display = "none";
      });
      btn.append(img);
    }

    if (choice.label && prefs.showText) {
      btn.append(el("span", { class: "choice__label", text: choice.label }));
    }

    btn.addEventListener("click", () => {
      // Estado de seleccion visible antes de avanzar.
      this.root
        .querySelectorAll(".choice.is-selected")
        .forEach((n) => n.classList.remove("is-selected"));
      btn.classList.add("is-selected");
      callbacks.onChoose(choice);
    });

    // Boton de audio de la opcion (no dentra en el boton principal para
    // permitir escuchar sin elegir).
    if (choice.audio && prefs.showAudioButtons) {
      const audioBtn = el(
        "button",
        {
          type: "button",
          class: "choice__audio",
          "aria-label": `Escuchar: ${choice.label || "opcion " + (index + 1)}`,
        },
        ["🔊"]
      );
      audioBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        callbacks.onPlayChoiceAudio(choice);
      });
      const wrap = el("div", { class: "choice-wrap" }, [btn, audioBtn]);
      return wrap;
    }

    return el("div", { class: "choice-wrap" }, [btn]);
  }

  focusFirst(): void {
    const first = this.root.querySelector<HTMLElement>(".choice");
    first?.focus();
  }
}
