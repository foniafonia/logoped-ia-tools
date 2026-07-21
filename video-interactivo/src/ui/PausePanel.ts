import type { StoryNode } from "../types";
import { el } from "./dom";

/**
 * Nodo de pausa: pensado para que el profesional detenga la historia y hable
 * con la persona. No hay presion; solo un boton para continuar cuando decidan.
 */
export class PausePanel {
  readonly root: HTMLElement;

  constructor(node: StoryNode, onContinue: () => void) {
    this.root = el("div", {
      class: "pause",
      role: "dialog",
      "aria-modal": "false",
      "aria-label": node.pauseLabel || node.title || "Pausa",
    });
    const panel = el("div", { class: "pause__panel" });
    panel.append(
      el("div", { class: "pause__icon", "aria-hidden": "true", text: "⏸" })
    );
    panel.append(
      el("h2", { class: "pause__title", text: node.title || "Momento para hablar" })
    );
    if (node.message) {
      panel.append(el("p", { class: "pause__text", text: node.message }));
    }
    const btn = el("button", { type: "button", class: "btn btn--primary" }, [
      "Continuar cuando queramos",
    ]);
    btn.addEventListener("click", onContinue);
    panel.append(btn);
    this.root.append(panel);
  }

  focus(): void {
    this.root.querySelector<HTMLElement>(".btn")?.focus();
  }
}
