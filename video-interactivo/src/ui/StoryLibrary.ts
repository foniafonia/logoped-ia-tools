import type { StoryCatalogEntry } from "../types";
import { el } from "./dom";

const LEVEL_LABEL: Record<number, string> = {
  1: "Nivel 1 · Basico",
  2: "Nivel 2 · Intermedio",
  3: "Nivel 3 · Avanzado",
};

/** Biblioteca de historias: tarjetas grandes con portada, titulo y nivel. */
export class StoryLibrary {
  readonly root: HTMLElement;

  constructor(
    entries: StoryCatalogEntry[],
    onSelect: (entry: StoryCatalogEntry) => void
  ) {
    this.root = el("div", { class: "library" });

    const grid = el("div", { class: "library__grid", role: "list" });

    if (entries.length === 0) {
      grid.append(
        el("p", {
          class: "library__empty",
          text: "No hay historias disponibles todavia.",
        })
      );
    }

    for (const entry of entries) {
      grid.append(this.buildCard(entry, onSelect));
    }
    this.root.append(grid);
  }

  private buildCard(
    entry: StoryCatalogEntry,
    onSelect: (entry: StoryCatalogEntry) => void
  ): HTMLElement {
    const card = el("button", {
      type: "button",
      class: "card",
      role: "listitem",
      "aria-label": entry.title + (entry.level ? `, ${LEVEL_LABEL[entry.level]}` : ""),
    });

    const thumb = el("div", { class: "card__thumb" });
    if (entry.thumbnail) {
      const img = el("img", {
        class: "card__img",
        src: entry.thumbnail,
        alt: "",
        loading: "lazy",
      });
      img.addEventListener("error", () => {
        img.remove();
        thumb.classList.add("card__thumb--placeholder");
      });
      thumb.append(img);
    } else {
      thumb.classList.add("card__thumb--placeholder");
    }
    card.append(thumb);

    const body = el("div", { class: "card__body" });
    body.append(el("h3", { class: "card__title", text: entry.title }));
    if (entry.description) {
      body.append(el("p", { class: "card__desc", text: entry.description }));
    }
    if (entry.level) {
      body.append(
        el("span", { class: `card__level card__level--${entry.level}`, text: LEVEL_LABEL[entry.level] })
      );
    }
    card.append(body);

    card.addEventListener("click", () => onSelect(entry));
    return card;
  }
}
