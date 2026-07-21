import type { SessionPreferences } from "../types";
import { el, trapFocus } from "./dom";

export interface SettingsPanelCallbacks {
  onChange: (prefs: SessionPreferences) => void;
  onClose: () => void;
}

interface ToggleDef {
  key: keyof SessionPreferences;
  label: string;
  hint?: string;
}

const TOGGLES: ToggleDef[] = [
  { key: "showText", label: "Mostrar texto" },
  { key: "showImages", label: "Mostrar imagenes / pictogramas" },
  { key: "showAudioButtons", label: "Mostrar botones de audio" },
  { key: "autoplayAudio", label: "Reproducir audios automaticamente" },
  { key: "autoplayVideo", label: "Reproducir video automaticamente" },
  { key: "showSubtitles", label: "Mostrar subtitulos" },
  { key: "allowBack", label: "Permitir volver atras" },
  { key: "allowReplay", label: "Permitir repetir clips" },
  { key: "showFeedback", label: "Mostrar feedback" },
  { key: "soundEnabled", label: "Sonido activado" },
  { key: "reduceMotion", label: "Reducir movimiento" },
  { key: "minimalUI", label: "Ocultar elementos no esenciales" },
];

/**
 * Panel de configuracion de sesion / accesibilidad. Modal accesible con
 * atrapado de foco. Todos los cambios se aplican al instante.
 */
export class SettingsPanel {
  readonly root: HTMLElement;
  private prefs: SessionPreferences;
  private callbacks: SettingsPanelCallbacks;
  private releaseFocus?: () => void;

  constructor(prefs: SessionPreferences, callbacks: SettingsPanelCallbacks) {
    this.prefs = { ...prefs };
    this.callbacks = callbacks;

    this.root = el("div", {
      class: "settings",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "Configuracion de la sesion",
    });

    const panel = el("div", { class: "settings__panel" });
    panel.append(el("h2", { class: "settings__title", text: "Configuracion" }));

    // Escala de fuente.
    panel.append(this.buildFontControl());

    // Toggles.
    const list = el("div", { class: "settings__list" });
    for (const t of TOGGLES) {
      list.append(this.buildToggle(t));
    }
    panel.append(list);

    const actions = el("div", { class: "settings__actions" });
    const close = el("button", { type: "button", class: "btn btn--primary" }, [
      "Listo",
    ]);
    close.addEventListener("click", () => this.close());
    actions.append(close);
    panel.append(actions);

    this.root.append(panel);

    // Cerrar al hacer clic fuera o con Escape.
    this.root.addEventListener("click", (e) => {
      if (e.target === this.root) this.close();
    });
    this.root.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.close();
    });
  }

  mount(parent: HTMLElement): void {
    parent.append(this.root);
    this.releaseFocus = trapFocus(this.root);
    this.root.querySelector<HTMLElement>("button")?.focus();
  }

  private buildToggle(def: ToggleDef): HTMLElement {
    const id = `set-${def.key}`;
    const input = el("input", { type: "checkbox", id, class: "settings__checkbox" });
    input.checked = Boolean(this.prefs[def.key]);
    input.addEventListener("change", () => {
      (this.prefs[def.key] as boolean) = input.checked;
      this.emit();
    });
    const label = el("label", { class: "settings__row", for: id }, [
      input,
      el("span", { class: "settings__row-label", text: def.label }),
    ]);
    return label;
  }

  private buildFontControl(): HTMLElement {
    const row = el("div", { class: "settings__font" });
    row.append(el("span", { class: "settings__row-label", text: "Tamano del texto" }));
    const group = el("div", { class: "settings__font-btns", role: "group", "aria-label": "Tamano del texto" });

    const setScale = (scale: number) => {
      this.prefs.fontScale = scale;
      this.emit();
      group.querySelectorAll("button").forEach((b) => {
        b.classList.toggle("is-on", Number(b.dataset.scale) === scale);
        b.setAttribute("aria-pressed", String(Number(b.dataset.scale) === scale));
      });
    };

    ([
      ["A", 0.9],
      ["A", 1],
      ["A", 1.2],
      ["A", 1.45],
    ] as [string, number][]).forEach(([txt, scale], i) => {
      const btn = el("button", {
        type: "button",
        class: "settings__font-btn",
        "data-scale": scale,
        "aria-label": ["Pequeno", "Normal", "Grande", "Muy grande"][i],
        style: `font-size:${0.85 + i * 0.25}rem`,
      });
      btn.textContent = txt;
      btn.classList.toggle("is-on", this.prefs.fontScale === scale);
      btn.setAttribute("aria-pressed", String(this.prefs.fontScale === scale));
      btn.addEventListener("click", () => setScale(scale));
      group.append(btn);
    });
    row.append(group);
    return row;
  }

  private emit(): void {
    this.callbacks.onChange({ ...this.prefs });
  }

  close(): void {
    this.releaseFocus?.();
    this.root.remove();
    this.callbacks.onClose();
  }
}
