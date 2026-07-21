import type {
  Choice,
  SessionPreferences,
  Story,
  StoryCatalogEntry,
  StoryNode,
} from "../types";
import { StoryEngine, StoryValidationError } from "../engine/StoryEngine";
import { loadCatalog, loadStory } from "../engine/loadStory";
import { InteractiveVideoPlayer } from "../player/InteractiveVideoPlayer";
import { AudioController } from "../player/AudioController";
import { DecisionScreen } from "../ui/DecisionScreen";
import { FeedbackPanel } from "../ui/FeedbackPanel";
import { EndingScreen } from "../ui/EndingScreen";
import { PausePanel } from "../ui/PausePanel";
import { StoryLibrary } from "../ui/StoryLibrary";
import { SettingsPanel } from "../ui/SettingsPanel";
import {
  loadPreferences,
  mergeWithStorySettings,
  savePreferences,
} from "../ui/preferences";
import { el } from "../ui/dom";

/** Orquesta las vistas de la aplicacion y conecta motor + reproductor + UI. */
export class App {
  private mount: HTMLElement;
  private prefs: SessionPreferences;
  private basePrefs: SessionPreferences;

  private header!: HTMLElement;
  private titleEl!: HTMLElement;
  private backToLibraryBtn!: HTMLButtonElement;
  private view!: HTMLElement;
  private status!: HTMLElement;

  private catalog: StoryCatalogEntry[] = [];
  private engine?: StoryEngine;
  private story?: Story;
  private player?: InteractiveVideoPlayer;
  private audio = new AudioController();

  private overlayHost?: HTMLElement;
  private pendingTimer?: number;

  constructor(mount: HTMLElement) {
    this.mount = mount;
    this.basePrefs = loadPreferences();
    this.prefs = { ...this.basePrefs };
  }

  async init(): Promise<void> {
    this.buildChrome();
    this.applyPreferences();
    this.catalog = await loadCatalog();
    this.showLibrary();
  }

  // ---------------------------------------------------------------------------
  // Estructura general (cabecera + vista + region de estado)
  // ---------------------------------------------------------------------------

  private buildChrome(): void {
    this.mount.classList.add("app");

    this.header = el("header", { class: "app__header" });

    const brand = el("div", { class: "app__brand" }, [
      el("span", { class: "app__brand-mark", "aria-hidden": "true", text: "▷" }),
      el("span", { class: "app__brand-text", text: "Historias sociales" }),
    ]);

    this.titleEl = el("h1", { class: "app__title", text: "" });

    this.backToLibraryBtn = el(
      "button",
      { type: "button", class: "app__navbtn", "aria-label": "Ir a las historias" },
      ["⌂ Historias"]
    );
    this.backToLibraryBtn.addEventListener("click", () => this.showLibrary());
    this.backToLibraryBtn.hidden = true;

    const settingsBtn = el(
      "button",
      { type: "button", class: "app__navbtn", "aria-label": "Abrir configuracion" },
      ["⚙ Configuracion"]
    );
    settingsBtn.addEventListener("click", () => this.openSettings());

    const actions = el("div", { class: "app__actions" }, [
      this.backToLibraryBtn,
      settingsBtn,
    ]);

    this.header.append(brand, this.titleEl, actions);

    this.view = el("main", { class: "app__view" });
    this.status = el("div", {
      class: "app__status",
      role: "status",
      "aria-live": "polite",
    });

    this.mount.append(this.header, this.view, this.status);
  }

  private announce(message: string): void {
    this.status.textContent = message;
  }

  private clearView(): void {
    this.clearPending();
    this.audio.stop();
    if (this.player) {
      this.player.destroy();
      this.player = undefined;
    }
    this.overlayHost = undefined;
    this.view.innerHTML = "";
  }

  private clearPending(): void {
    if (this.pendingTimer) {
      window.clearTimeout(this.pendingTimer);
      this.pendingTimer = undefined;
    }
  }

  // ---------------------------------------------------------------------------
  // Vista: biblioteca de historias
  // ---------------------------------------------------------------------------

  private showLibrary(): void {
    this.clearView();
    this.engine = undefined;
    this.story = undefined;
    this.titleEl.textContent = "";
    this.backToLibraryBtn.hidden = true;

    const intro = el("div", { class: "library__intro" }, [
      el("h2", { class: "library__heading", text: "Elige una historia" }),
      el("p", {
        class: "library__sub",
        text: "Historias sociales en video para observar, decidir y aprender con calma.",
      }),
    ]);

    const library = new StoryLibrary(this.catalog, (entry) =>
      this.startStory(entry)
    );
    this.view.append(intro, library.root);
    this.announce("Biblioteca de historias.");
  }

  // ---------------------------------------------------------------------------
  // Vista: reproduccion de una historia
  // ---------------------------------------------------------------------------

  private async startStory(entry: StoryCatalogEntry): Promise<void> {
    this.clearView();
    this.view.append(
      el("div", { class: "loading" }, [
        el("span", { class: "loading__dot" }),
        el("span", { text: "Cargando historia…" }),
      ])
    );

    let story: Story;
    try {
      story = await loadStory(entry.src);
    } catch (err) {
      this.showLoadError((err as Error).message);
      return;
    }

    let engine: StoryEngine;
    try {
      engine = StoryEngine.create(story);
    } catch (err) {
      if (err instanceof StoryValidationError) {
        this.showLoadError(
          "La historia tiene errores y no se puede reproducir:\n" +
            err.result.errors.join("\n")
        );
      } else {
        this.showLoadError((err as Error).message);
      }
      return;
    }

    this.story = story;
    this.engine = engine;
    // Combinar ajustes de la historia con las preferencias de sesion.
    this.prefs = mergeWithStorySettings(this.basePrefs, story.settings);
    this.applyPreferences();

    this.titleEl.textContent = story.title;
    this.backToLibraryBtn.hidden = false;

    this.buildPlayerView();

    engine.subscribe((event) => {
      if (event.type === "node" || event.type === "back" || event.type === "restart") {
        this.renderNode(event.node);
      } else if (event.type === "replay") {
        this.player?.replay();
        this.clearOverlay();
      } else if (event.type === "error") {
        this.announce(event.message || "Se ha producido un error.");
      }
    });

    engine.start();
  }

  private buildPlayerView(): void {
    this.view.innerHTML = "";
    const wrap = el("div", { class: "stage-wrap" });
    const playerHost = el("div", { class: "stage-wrap__player" });
    this.overlayHost = el("div", { class: "stage-wrap__overlay" });

    wrap.append(playerHost, this.overlayHost);
    this.view.append(wrap);

    this.player = new InteractiveVideoPlayer(playerHost, {
      showSubtitles: this.prefs.showSubtitles,
      reduceMotion: this.prefs.reduceMotion,
      muted: !this.prefs.soundEnabled,
    });
  }

  private clearOverlay(): void {
    if (this.overlayHost) this.overlayHost.innerHTML = "";
  }

  private mountOverlay(node: HTMLElement, dimmed = true): void {
    if (!this.overlayHost) return;
    this.overlayHost.innerHTML = "";
    this.overlayHost.classList.toggle("is-dimmed", dimmed);
    this.overlayHost.append(node);
  }

  // ---------------------------------------------------------------------------
  // Renderizado por tipo de nodo
  // ---------------------------------------------------------------------------

  private renderNode(node: StoryNode): void {
    this.clearPending();
    this.clearOverlay();
    this.audio.stop();

    switch (node.type) {
      case "video":
      case "ending":
        this.playVideoNode(node);
        break;
      case "image":
        this.showImageNode(node);
        break;
      case "feedback":
        this.afterMedia(node);
        break;
      case "choice":
      case "observation":
        this.showDecision(node);
        break;
      case "pause":
        this.showPause(node);
        break;
      default:
        this.afterMedia(node);
    }
  }

  private playVideoNode(node: StoryNode): void {
    if (!this.player) return;
    if (!node.video) {
      // Nodo de tipo video sin archivo: pasar directamente al desenlace.
      this.afterMedia(node);
      return;
    }

    this.player.setCallbacks({
      onEnded: () => this.afterMedia(node),
      onError: (m) => this.announce(m),
    });

    void this.player.load(node.video, {
      poster: node.poster,
      subtitles: node.subtitles,
      autoplay: this.prefs.autoplayVideo,
    });

    // Precargar el siguiente clip probable.
    this.player.preloadNext(this.nextVideoHint(node));
    this.announce(node.question ? "Observa el video." : "Reproduciendo video.");
  }

  private showImageNode(node: StoryNode): void {
    const img = el("div", { class: "imagenode" });
    if (node.image && this.prefs.showImages) {
      const image = el("img", {
        class: "imagenode__img",
        src: node.image,
        alt: node.imageAlt || node.title || "",
      });
      image.addEventListener("error", () => image.remove());
      img.append(image);
    }
    if (node.title && this.prefs.showText) {
      img.append(el("h2", { class: "imagenode__title", text: node.title }));
    }
    this.view.querySelector(".stage-wrap__player")?.replaceChildren(img);

    if (node.questionAudio && this.prefs.autoplayAudio) {
      void this.audio.play(node.questionAudio);
    }
    this.afterMedia(node);
  }

  /** Decide que mostrar cuando termina el medio de un nodo. */
  private afterMedia(node: StoryNode): void {
    const hasFeedback = Boolean(node.feedback) && this.prefs.showFeedback;

    if (node.type === "ending") {
      if (hasFeedback) {
        this.showFeedback(node, () => this.showEnding(node));
      } else {
        this.showEnding(node);
      }
      return;
    }

    if (hasFeedback) {
      this.showFeedback(node, () => this.afterFeedback(node));
      return;
    }
    this.afterFeedback(node);
  }

  private afterFeedback(node: StoryNode): void {
    const hasChoices = Boolean(node.choices && node.choices.length > 0);
    if (hasChoices || node.type === "observation") {
      this.showDecision(node);
    } else if (node.next) {
      this.engine?.advance();
    } else {
      // Rama sin salida: ofrecer volver a la biblioteca con calma.
      this.showDeadEnd();
    }
  }

  // --- Pantallas ---

  private showDecision(node: StoryNode): void {
    const delay = this.story?.settings?.pauseBeforeChoices ?? 400;
    const render = () => {
      const screen = new DecisionScreen(
        node,
        this.prefs,
        {
          onChoose: (choice) => this.handleChoice(choice),
          onPlayQuestionAudio: () => this.audio.play(node.questionAudio),
          onPlayChoiceAudio: (c) => this.audio.play(c.audio),
          onReplayClip: () => this.engine?.replay(),
          onPause: () => this.player?.pause(),
          onBack: this.engine?.canGoBack() ? () => this.engine?.back() : undefined,
        },
        {
          canGoBack: Boolean(this.engine?.canGoBack()) && this.prefs.allowBack,
          isObservation: node.type === "observation",
        }
      );
      this.mountOverlay(screen.root, true);
      screen.focusFirst();
      this.announce(node.question || "Elige una opcion.");
      if (node.questionAudio && this.prefs.autoplayAudio) {
        void this.audio.play(node.questionAudio);
      }
    };

    if (this.prefs.reduceMotion || delay <= 0) render();
    else this.pendingTimer = window.setTimeout(render, delay);
  }

  private handleChoice(choice: Choice): void {
    this.audio.stop();
    if (choice.id === "__continue__") {
      if (this.engine?.currentNode.next) this.engine.advance();
      else this.showEnding(this.engine!.currentNode);
      return;
    }
    // Precargar el video destino antes de navegar.
    const target = this.story?.nodes[choice.next];
    if (target?.video) this.player?.preloadNext(target.video);
    this.engine?.choose(choice.id);
  }

  private showFeedback(node: StoryNode, onContinue: () => void): void {
    if (!node.feedback) {
      onContinue();
      return;
    }
    const panel = new FeedbackPanel(
      node.feedback,
      this.prefs,
      {
        onContinue: () => {
          this.audio.stop();
          onContinue();
        },
        onReplay: this.prefs.allowReplay ? () => this.engine?.replay() : undefined,
        onPlayAudio: () => this.audio.play(node.feedback?.audio),
      },
      { showReplay: this.prefs.allowReplay && Boolean(node.video) }
    );
    this.mountOverlay(panel.root, true);
    panel.focus();
    this.announce(
      [node.feedback.title, node.feedback.text].filter(Boolean).join(". ")
    );
    if (node.feedback.audio && this.prefs.autoplayAudio) {
      void this.audio.play(node.feedback.audio);
    }
  }

  private showEnding(node: StoryNode): void {
    const screen = new EndingScreen(node, this.prefs, {
      onReplayStory: () => this.engine?.restart(),
      onChooseAnotherPath: () => this.engine?.restart(),
      onExitToLibrary: () => this.showLibrary(),
    });
    this.mountOverlay(screen.root, true);
    screen.focus();
    this.announce(
      [node.title, node.message].filter(Boolean).join(". ") || "Historia terminada."
    );
  }

  private showPause(node: StoryNode): void {
    const panel = new PausePanel(node, () => {
      if (node.next) this.engine?.advance();
      else this.showDeadEnd();
    });
    this.mountOverlay(panel.root, true);
    panel.focus();
    this.announce(node.title || "Pausa.");
  }

  private showDeadEnd(): void {
    const box = el("div", { class: "ending" }, [
      el("div", { class: "ending__panel" }, [
        el("p", { class: "ending__message", text: "Fin de esta rama." }),
        (() => {
          const b = el("button", { type: "button", class: "btn btn--primary" }, [
            "Volver a las historias",
          ]);
          b.addEventListener("click", () => this.showLibrary());
          return b;
        })(),
      ]),
    ]);
    this.mountOverlay(box, true);
    box.querySelector<HTMLElement>("button")?.focus();
  }

  private nextVideoHint(node: StoryNode): string | undefined {
    if (node.next && this.story?.nodes[node.next]?.video) {
      return this.story.nodes[node.next].video;
    }
    const firstChoice = node.choices?.[0];
    if (firstChoice && this.story?.nodes[firstChoice.next]?.video) {
      return this.story.nodes[firstChoice.next].video;
    }
    return undefined;
  }

  private showLoadError(message: string): void {
    this.clearView();
    this.backToLibraryBtn.hidden = false;
    const box = el("div", { class: "loaderror", role: "alert" }, [
      el("h2", { class: "loaderror__title", text: "No se pudo abrir la historia" }),
      el("pre", { class: "loaderror__text", text: message }),
    ]);
    const btn = el("button", { type: "button", class: "btn btn--primary" }, [
      "Volver a las historias",
    ]);
    btn.addEventListener("click", () => this.showLibrary());
    box.append(btn);
    this.view.append(box);
    this.announce("No se pudo abrir la historia.");
  }

  // ---------------------------------------------------------------------------
  // Preferencias / configuracion
  // ---------------------------------------------------------------------------

  private openSettings(): void {
    const panel = new SettingsPanel(this.prefs, {
      onChange: (prefs) => {
        this.basePrefs = { ...this.basePrefs, ...prefs };
        this.prefs = { ...this.prefs, ...prefs };
        savePreferences(this.basePrefs);
        this.applyPreferences();
      },
      onClose: () => {
        /* nada extra */
      },
    });
    panel.mount(this.mount);
  }

  private applyPreferences(): void {
    document.documentElement.style.setProperty(
      "--font-scale",
      String(this.prefs.fontScale)
    );
    this.mount.classList.toggle("app--reduce-motion", this.prefs.reduceMotion);
    this.mount.classList.toggle("app--minimal", this.prefs.minimalUI);

    this.audio.setEnabled(this.prefs.soundEnabled);
    if (this.player) {
      this.player.setReduceMotion(this.prefs.reduceMotion);
      this.player.setSubtitles(this.prefs.showSubtitles);
      this.player.setMuted(!this.prefs.soundEnabled);
    }
  }
}
