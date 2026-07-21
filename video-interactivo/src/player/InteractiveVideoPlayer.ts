/**
 * Reproductor de video interactivo.
 *
 * Objetivos clave:
 *  - Sin pantalla negra brusca entre clips: dos capas <video> con crossfade.
 *  - Congelar el ultimo fotograma cuando el clip termina (para mostrar opciones).
 *  - Autoplay con boton grande de reserva si el navegador lo bloquea.
 *  - Controles grandes y accesibles: pausa, repetir, volumen, silencio,
 *    subtitulos, velocidad (0.75 / 1 / 1.25) y pantalla completa.
 *  - Indicador de carga y mensaje de error con opcion de continuar
 *    (para que la historia no se bloquee si falta un archivo de video).
 *  - Precarga del siguiente clip.
 */

export interface PlayerCallbacks {
  onEnded?: () => void;
  onError?: (message: string) => void;
  onAutoplayBlocked?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
}

export interface LoadOptions {
  poster?: string;
  subtitles?: string;
  autoplay?: boolean;
  /** Reproducir en bucle (para clips de "situacion" que esperan decision). */
  loop?: boolean;
}

export interface PlayerConfig {
  showSubtitles?: boolean;
  reduceMotion?: boolean;
  muted?: boolean;
}

const RATES = [0.75, 1, 1.25];

export class InteractiveVideoPlayer {
  readonly root: HTMLElement;
  private stage: HTMLElement;
  private layerA: HTMLVideoElement;
  private layerB: HTMLVideoElement;
  private active: HTMLVideoElement;
  private preloader: HTMLVideoElement;

  private controls!: HTMLElement;
  private spinner!: HTMLElement;
  private errorBox!: HTMLElement;
  private bigPlay!: HTMLButtonElement;

  private callbacks: PlayerCallbacks = {};
  private config: PlayerConfig;
  private rateIndex = 1;
  private endedHandled = false;
  private currentSubtitles?: string;

  constructor(container: HTMLElement, config: PlayerConfig = {}) {
    this.config = config;
    this.root = document.createElement("div");
    this.root.className = "ivp";
    if (config.reduceMotion) this.root.classList.add("ivp--reduce-motion");

    this.stage = document.createElement("div");
    this.stage.className = "ivp__stage";

    this.layerA = this.createVideoLayer();
    this.layerB = this.createVideoLayer();
    this.layerA.classList.add("is-active");
    this.active = this.layerA;

    this.preloader = document.createElement("video");
    this.preloader.preload = "auto";
    this.preloader.muted = true;
    this.preloader.style.display = "none";

    this.stage.append(this.layerA, this.layerB, this.preloader);
    this.root.append(this.stage);

    this.buildOverlays();
    this.buildControls();

    container.append(this.root);
    this.applyConfig();
  }

  setCallbacks(cb: PlayerCallbacks): void {
    this.callbacks = cb;
  }

  private createVideoLayer(): HTMLVideoElement {
    const v = document.createElement("video");
    v.className = "ivp__video";
    v.playsInline = true;
    v.preload = "auto";
    v.setAttribute("crossorigin", "anonymous");
    return v;
  }

  private get inactive(): HTMLVideoElement {
    return this.active === this.layerA ? this.layerB : this.layerA;
  }

  // ---------------------------------------------------------------------------
  // Carga y reproduccion
  // ---------------------------------------------------------------------------

  /**
   * Carga un clip en la capa inactiva y hace crossfade cuando esta listo,
   * de modo que el fotograma anterior permanece visible (sin negro).
   */
  async load(src: string, options: LoadOptions = {}): Promise<void> {
    this.hideError();
    this.endedHandled = false;
    const next = this.inactive;

    // Limpiar pistas de subtitulos previas.
    this.clearTracks(next);
    this.currentSubtitles = options.subtitles;

    next.loop = Boolean(options.loop);
    next.muted = Boolean(this.config.muted);
    next.playbackRate = RATES[this.rateIndex];
    if (options.poster) next.poster = options.poster;

    // Subtitulos.
    if (options.subtitles) {
      const track = document.createElement("track");
      track.kind = "subtitles";
      track.srclang = "es";
      track.label = "Espanol";
      track.default = Boolean(this.config.showSubtitles);
      track.src = options.subtitles;
      next.append(track);
    }

    this.showSpinner();
    this.attachMediaEvents(next);
    next.src = src;
    next.load();

    try {
      await this.waitCanPlay(next);
    } catch {
      this.hideSpinner();
      this.showError("No se ha podido cargar el video de este momento.");
      this.callbacks.onError?.(`No se pudo cargar: ${src}`);
      return;
    }

    this.hideSpinner();
    this.crossfadeTo(next);

    // Intento de autoplay.
    if (options.autoplay !== false) {
      try {
        await next.play();
        this.hideBigPlay();
        this.callbacks.onPlay?.();
      } catch {
        // Autoplay bloqueado: mostrar boton grande de reproduccion.
        this.showBigPlay();
        this.callbacks.onAutoplayBlocked?.();
      }
    } else {
      this.showBigPlay();
    }
    this.updateSubtitleTrack();
    this.syncControls();
  }

  /** Precarga (calienta cache) del siguiente clip sin mostrarlo. */
  preloadNext(src?: string): void {
    if (!src) return;
    this.preloader.src = src;
    this.preloader.load();
  }

  private waitCanPlay(video: HTMLVideoElement): Promise<void> {
    return new Promise((resolve, reject) => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve();
      };
      const fail = () => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error("media error"));
      };
      const cleanup = () => {
        video.removeEventListener("canplay", done);
        video.removeEventListener("loadeddata", done);
        video.removeEventListener("error", fail);
      };
      video.addEventListener("canplay", done);
      video.addEventListener("loadeddata", done);
      video.addEventListener("error", fail);
      // Si ya hay datos suficientes.
      if (video.readyState >= 2) done();
    });
  }

  private crossfadeTo(next: HTMLVideoElement): void {
    const previous = this.active;
    next.classList.add("is-active");
    previous.classList.remove("is-active");
    this.active = next;
    // Detener y liberar el layer anterior tras la transicion.
    window.setTimeout(
      () => {
        if (previous !== this.active) {
          previous.pause();
        }
      },
      this.config.reduceMotion ? 0 : 420
    );
  }

  private attachMediaEvents(video: HTMLVideoElement): void {
    video.onended = null;
    video.onerror = null;
    video.onplay = null;
    video.onpause = null;
    video.onwaiting = null;
    video.onplaying = null;

    video.addEventListener("ended", () => {
      if (video !== this.active) return;
      if (video.loop) return;
      if (this.endedHandled) return;
      this.endedHandled = true;
      // Congelar ultimo fotograma: NO limpiamos el video.
      this.callbacks.onEnded?.();
    });

    video.addEventListener("error", () => {
      if (video !== this.active) return;
      this.hideSpinner();
      this.showError("Se ha producido un problema con el video.");
      this.callbacks.onError?.("Error de reproduccion.");
    });

    video.addEventListener("waiting", () => {
      if (video === this.active) this.showSpinner();
    });
    video.addEventListener("playing", () => {
      if (video === this.active) {
        this.hideSpinner();
        this.hideBigPlay();
        this.syncControls();
      }
    });
    video.addEventListener("pause", () => {
      if (video === this.active) {
        this.callbacks.onPause?.();
        this.syncControls();
      }
    });
  }

  private clearTracks(video: HTMLVideoElement): void {
    video.querySelectorAll("track").forEach((t) => t.remove());
  }

  // ---------------------------------------------------------------------------
  // Controles publicos
  // ---------------------------------------------------------------------------

  play(): void {
    this.active
      .play()
      .then(() => this.hideBigPlay())
      .catch(() => this.showBigPlay());
  }

  pause(): void {
    this.active.pause();
  }

  togglePlay(): void {
    if (this.active.paused) this.play();
    else this.pause();
  }

  /** Repite el clip actual desde el principio. */
  replay(): void {
    this.hideError();
    this.endedHandled = false;
    this.active.currentTime = 0;
    this.play();
  }

  setMuted(muted: boolean): void {
    this.config.muted = muted;
    this.layerA.muted = muted;
    this.layerB.muted = muted;
    this.syncControls();
  }

  setVolume(v: number): void {
    const vol = Math.min(1, Math.max(0, v));
    this.layerA.volume = vol;
    this.layerB.volume = vol;
    if (vol > 0) this.setMuted(false);
  }

  cycleRate(): number {
    this.rateIndex = (this.rateIndex + 1) % RATES.length;
    const rate = RATES[this.rateIndex];
    this.active.playbackRate = rate;
    this.inactive.playbackRate = rate;
    this.syncControls();
    return rate;
  }

  setSubtitles(show: boolean): void {
    this.config.showSubtitles = show;
    this.updateSubtitleTrack();
    this.syncControls();
  }

  hasSubtitles(): boolean {
    return Boolean(this.currentSubtitles);
  }

  private updateSubtitleTrack(): void {
    const tracks = this.active.textTracks;
    for (let i = 0; i < tracks.length; i++) {
      tracks[i].mode = this.config.showSubtitles ? "showing" : "hidden";
    }
  }

  async toggleFullscreen(): Promise<void> {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await this.root.requestFullscreen();
      }
    } catch {
      /* Pantalla completa no disponible: se ignora en silencio. */
    }
  }

  setReduceMotion(reduce: boolean): void {
    this.config.reduceMotion = reduce;
    this.root.classList.toggle("ivp--reduce-motion", reduce);
  }

  destroy(): void {
    this.layerA.pause();
    this.layerB.pause();
    this.layerA.src = "";
    this.layerB.src = "";
    this.preloader.src = "";
    this.root.remove();
  }

  // ---------------------------------------------------------------------------
  // Overlays (spinner, error, boton grande)
  // ---------------------------------------------------------------------------

  private buildOverlays(): void {
    this.spinner = document.createElement("div");
    this.spinner.className = "ivp__spinner";
    this.spinner.setAttribute("role", "status");
    this.spinner.setAttribute("aria-label", "Cargando video");
    this.spinner.innerHTML = `<span class="ivp__spinner-dot"></span><span class="ivp__spinner-text">Cargando…</span>`;
    this.spinner.hidden = true;

    this.bigPlay = document.createElement("button");
    this.bigPlay.type = "button";
    this.bigPlay.className = "ivp__bigplay";
    this.bigPlay.setAttribute("aria-label", "Reproducir video");
    this.bigPlay.innerHTML = `<span class="ivp__bigplay-icon" aria-hidden="true">▶</span>`;
    this.bigPlay.hidden = true;
    this.bigPlay.addEventListener("click", () => this.play());

    this.errorBox = document.createElement("div");
    this.errorBox.className = "ivp__error";
    this.errorBox.setAttribute("role", "alert");
    this.errorBox.hidden = true;

    this.stage.append(this.spinner, this.bigPlay, this.errorBox);
  }

  private showSpinner(): void {
    this.spinner.hidden = false;
  }
  private hideSpinner(): void {
    this.spinner.hidden = true;
  }
  private showBigPlay(): void {
    this.bigPlay.hidden = false;
  }
  private hideBigPlay(): void {
    this.bigPlay.hidden = true;
  }

  /**
   * Muestra un mensaje de error con un boton "Continuar" que permite avanzar
   * la historia aunque falte el archivo de video (modo demo / robustez).
   */
  private showError(message: string): void {
    this.errorBox.innerHTML = "";
    const p = document.createElement("p");
    p.className = "ivp__error-text";
    p.textContent = message;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ivp__error-btn";
    btn.textContent = "Continuar";
    btn.addEventListener("click", () => {
      this.hideError();
      if (!this.endedHandled) {
        this.endedHandled = true;
        this.callbacks.onEnded?.();
      }
    });
    this.errorBox.append(p, btn);
    this.errorBox.hidden = false;
    this.hideSpinner();
  }
  private hideError(): void {
    this.errorBox.hidden = true;
  }

  // ---------------------------------------------------------------------------
  // Barra de controles
  // ---------------------------------------------------------------------------

  private playBtn!: HTMLButtonElement;
  private muteBtn!: HTMLButtonElement;
  private rateBtn!: HTMLButtonElement;
  private ccBtn!: HTMLButtonElement;
  private volInput!: HTMLInputElement;

  private buildControls(): void {
    this.controls = document.createElement("div");
    this.controls.className = "ivp__controls";
    this.controls.setAttribute("role", "group");
    this.controls.setAttribute("aria-label", "Controles del video");

    this.playBtn = this.makeButton("⏸", "Pausar", () => this.togglePlay());
    const replayBtn = this.makeButton("↺", "Repetir clip", () => this.replay());
    this.muteBtn = this.makeButton("🔊", "Silenciar", () =>
      this.setMuted(!this.config.muted)
    );

    this.volInput = document.createElement("input");
    this.volInput.type = "range";
    this.volInput.min = "0";
    this.volInput.max = "1";
    this.volInput.step = "0.05";
    this.volInput.value = "1";
    this.volInput.className = "ivp__vol";
    this.volInput.setAttribute("aria-label", "Volumen");
    this.volInput.addEventListener("input", () =>
      this.setVolume(Number(this.volInput.value))
    );

    this.rateBtn = this.makeButton("1×", "Velocidad de reproduccion", () => {
      const rate = this.cycleRate();
      this.rateBtn.textContent = `${rate}×`;
    });

    this.ccBtn = this.makeButton("CC", "Subtitulos", () =>
      this.setSubtitles(!this.config.showSubtitles)
    );

    const fsBtn = this.makeButton("⛶", "Pantalla completa", () =>
      this.toggleFullscreen()
    );

    this.controls.append(
      this.playBtn,
      replayBtn,
      this.muteBtn,
      this.volInput,
      this.rateBtn,
      this.ccBtn,
      fsBtn
    );
    this.root.append(this.controls);
    this.syncControls();
  }

  private makeButton(
    icon: string,
    label: string,
    onClick: () => void
  ): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ivp__ctrl";
    btn.setAttribute("aria-label", label);
    btn.title = label;
    btn.textContent = icon;
    btn.addEventListener("click", onClick);
    return btn;
  }

  private syncControls(): void {
    const paused = this.active.paused;
    this.playBtn.textContent = paused ? "▶" : "⏸";
    this.playBtn.setAttribute("aria-label", paused ? "Reproducir" : "Pausar");
    this.muteBtn.textContent = this.config.muted ? "🔇" : "🔊";
    this.muteBtn.setAttribute(
      "aria-label",
      this.config.muted ? "Activar sonido" : "Silenciar"
    );
    this.muteBtn.setAttribute("aria-pressed", String(Boolean(this.config.muted)));
    this.rateBtn.textContent = `${RATES[this.rateIndex]}×`;
    this.ccBtn.setAttribute("aria-pressed", String(Boolean(this.config.showSubtitles)));
    this.ccBtn.classList.toggle("is-on", Boolean(this.config.showSubtitles));
    this.ccBtn.hidden = !this.hasSubtitles();
  }

  private applyConfig(): void {
    this.setMuted(Boolean(this.config.muted));
    this.syncControls();
  }
}
