import type { SessionPreferences, StoryNode } from "../types";
import { el } from "./dom";

export interface EndingCallbacks {
  onReplayStory: () => void;
  onChooseAnotherPath: () => void;
  onExitToLibrary: () => void;
}

/** Pantalla final. Sin premios exagerados: cierre tranquilo y opciones claras. */
export class EndingScreen {
  readonly root: HTMLElement;

  constructor(
    node: StoryNode,
    prefs: SessionPreferences,
    callbacks: EndingCallbacks
  ) {
    this.root = el("div", {
      class: "ending",
      role: "dialog",
      "aria-modal": "false",
      "aria-label": node.title || "Historia terminada",
    });

    const panel = el("div", { class: "ending__panel" });

    if (node.title && prefs.showText) {
      panel.append(el("h2", { class: "ending__title", text: node.title }));
    }
    if (node.message && prefs.showText) {
      panel.append(el("p", { class: "ending__message", text: node.message }));
    }

    const actions = el("div", { class: "ending__actions" });

    if (node.allowReplay !== false && prefs.allowReplay) {
      const replay = el("button", { type: "button", class: "btn btn--primary" }, [
        "↺ Ver otra vez",
      ]);
      replay.addEventListener("click", () => callbacks.onReplayStory());
      actions.append(replay);
    }

    if (node.allowChooseAnotherPath !== false) {
      const another = el("button", { type: "button", class: "btn btn--ghost" }, [
        "↥ Probar otra ruta",
      ]);
      another.addEventListener("click", () => callbacks.onChooseAnotherPath());
      actions.append(another);
    }

    const exit = el("button", { type: "button", class: "btn btn--ghost" }, [
      "⌂ Ir a las historias",
    ]);
    exit.addEventListener("click", () => callbacks.onExitToLibrary());
    actions.append(exit);

    panel.append(actions);
    this.root.append(panel);
  }

  focus(): void {
    this.root.querySelector<HTMLElement>(".btn")?.focus();
  }
}
