/**
 * Controls — capa de CONTROLES del juego (móvil + teclado) con estética de ladrillo:
 *   · JOYSTICK virtual de movimiento (abajo-izq, táctil) → dirección normalizada
 *   · botón de INTERACCIÓN "E" (abajo-der, táctil; tecla E en escritorio)
 *   · botón de ACCIÓN secundario (salto/acción; tecla Espacio)
 *   · PROMPT contextual flotante ("Pulsa E — Hablar")
 *
 * Detecta si es táctil: en móvil muestra joystick+botones; en escritorio muestra
 * pistas de tecla (WASD + E) y escucha el teclado. El consumidor recibe la
 * dirección por `onMove(x, y)` (x=lateral, y=adelante, ambos en [-1,1]) y la
 * integra por frame; `onInteract`/`onAction` son eventos.
 *
 *   const c = mountControls(document.body, {
 *     onMove: (x, y) => { player.vx = x; player.vz = -y; },
 *     onInteract: () => hablar(),
 *     onAction: () => saltar(),
 *   });
 *   c.setPrompt('Hablar');   // muestra el globo + resalta la E · null lo oculta
 */

export interface ControlsOptions {
  onMove?: (x: number, y: number) => void;
  onInteract?: () => void;
  onAction?: () => void;
  /** Etiqueta del botón de acción. Def. "Saltar". */
  actionLabel?: string;
  /** Fuerza el modo táctil (para probar en escritorio). */
  forceTouch?: boolean;
}

export interface ControlsHandle {
  root: HTMLElement;
  /** Muestra el prompt contextual (texto) o lo oculta (null). Resalta la E. */
  setPrompt(text: string | null): void;
  showInteract(on: boolean): void;
  showAction(on: boolean): void;
  destroy(): void;
}

const isTouch = (): boolean =>
  typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches ||
  (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0);

let styled = false;
function styles(): void {
  if (styled) return;
  styled = true;
  const css = `
  .gc-root{position:fixed;inset:0;z-index:45;pointer-events:none;
    font-family:'Trebuchet MS','Segoe UI',system-ui,sans-serif;
    --pad:max(18px,env(safe-area-inset-bottom))}
  .gc-root>*{pointer-events:auto}
  /* Joystick */
  .gc-stick{position:absolute;left:max(20px,env(safe-area-inset-left));
    bottom:var(--pad);width:132px;height:132px;border-radius:50%;
    background:radial-gradient(circle at 50% 42%,rgba(245,233,209,.35),rgba(60,44,20,.32));
    box-shadow:inset 0 3px 10px rgba(0,0,0,.35),inset 0 -3px 8px rgba(255,255,255,.15),
      0 4px 14px rgba(0,0,0,.3);touch-action:none;backdrop-filter:blur(2px)}
  .gc-knob{position:absolute;left:50%;top:50%;width:60px;height:60px;
    margin:-30px 0 0 -30px;border-radius:16px;background:#f2b64a;
    box-shadow:0 5px 0 #a5651c,0 8px 14px rgba(0,0,0,.4),inset 0 2px 0 rgba(255,255,255,.6);
    transition:transform .05s linear}
  .gc-knob::before{content:"";position:absolute;top:-6px;left:50%;transform:translateX(-50%);
    width:34px;height:8px;border-radius:5px;background:#f2b64a;filter:brightness(1.03)}
  /* Botones redondos de acción */
  .gc-pad{position:absolute;right:max(20px,env(safe-area-inset-right));
    bottom:var(--pad);display:flex;align-items:flex-end;gap:16px}
  .gc-btn{position:relative;border:0;cursor:pointer;color:#3a2410;font-family:inherit;
    font-weight:800;text-transform:uppercase;border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 6px 0 var(--sh),0 10px 18px rgba(0,0,0,.4),
      inset 0 2px 0 rgba(255,255,255,.55),inset 0 -5px 9px rgba(0,0,0,.14);
    transition:transform .07s ease,box-shadow .07s ease}
  .gc-btn:active{transform:translateY(4px);
    box-shadow:0 2px 0 var(--sh),0 4px 10px rgba(0,0,0,.4),inset 0 2px 0 rgba(255,255,255,.5)}
  .gc-btn:focus-visible{outline:3px solid #fff;outline-offset:3px}
  .gc-e{width:82px;height:82px;font-size:1.9rem;background:#f2b64a;--sh:#a5651c}
  .gc-e.hl{animation:gc-pulse 1.1s ease-in-out infinite;
    box-shadow:0 6px 0 var(--sh),0 0 22px rgba(255,190,80,.8),
      inset 0 2px 0 rgba(255,255,255,.6),inset 0 -5px 9px rgba(0,0,0,.14)}
  .gc-act{width:62px;height:62px;font-size:.8rem;background:#cdbfa6;--sh:#867256}
  .gc-hide{display:none}
  /* Pista de tecla (esquina de la E) */
  .gc-key{position:absolute;right:-4px;top:-4px;min-width:20px;height:20px;padding:0 5px;
    border-radius:6px;background:#3a2410;color:#ffe7bd;font-size:.72rem;font-weight:800;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 2px 0 rgba(0,0,0,.4)}
  /* Prompt contextual */
  .gc-prompt{position:absolute;left:50%;bottom:38%;transform:translateX(-50%);
    display:none;align-items:center;gap:9px;padding:9px 15px;border-radius:12px;
    color:#3a2410;font-weight:800;font-size:clamp(.9rem,2.6vw,1.05rem);white-space:nowrap;
    background:linear-gradient(180deg,#f5e9d1,#e6d3ad);
    box-shadow:0 5px 0 #b79a6a,0 9px 16px rgba(0,0,0,.35),inset 0 2px 0 rgba(255,255,255,.7);
    animation:gc-rise .2s ease both}
  .gc-prompt.on{display:flex}
  .gc-prompt b{display:flex;align-items:center;justify-content:center;min-width:26px;height:26px;
    padding:0 6px;border-radius:7px;background:#f2b64a;color:#3a2410;
    box-shadow:0 2px 0 #a5651c,inset 0 1px 0 rgba(255,255,255,.6)}
  @keyframes gc-pulse{0%,100%{filter:brightness(1)}50%{filter:brightness(1.14)}}
  @keyframes gc-rise{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}
  @media(prefers-reduced-motion:reduce){.gc-e.hl,.gc-prompt{animation:none}}
  `;
  const el = document.createElement('style');
  el.textContent = css;
  document.head.appendChild(el);
}

export function mountControls(parent: HTMLElement, opts: ControlsOptions = {}): ControlsHandle {
  styles();
  const touch = opts.forceTouch || isTouch();

  const root = document.createElement('div');
  root.className = 'gc-root';

  // --- Prompt contextual ---
  const prompt = document.createElement('div');
  prompt.className = 'gc-prompt';
  const promptKey = document.createElement('b');
  promptKey.textContent = touch ? '✋' : 'E';
  const promptTxt = document.createElement('span');
  prompt.append(promptKey, promptTxt);
  root.appendChild(prompt);

  // --- Botón E (interacción) ---
  const eBtn = document.createElement('button');
  eBtn.className = 'gc-btn gc-e';
  eBtn.setAttribute('aria-label', 'Interactuar');
  eBtn.textContent = touch ? '✋' : 'E';
  if (!touch) {
    const key = document.createElement('span');
    key.className = 'gc-key';
    key.textContent = 'E';
    eBtn.textContent = '✋';
    eBtn.appendChild(key);
  }
  const fireInteract = () => opts.onInteract?.();
  eBtn.addEventListener('click', fireInteract);

  // --- Botón de acción (salto) ---
  const actBtn = document.createElement('button');
  actBtn.className = 'gc-btn gc-act';
  actBtn.textContent = opts.actionLabel ?? 'Saltar';
  actBtn.addEventListener('click', () => opts.onAction?.());

  const pad = document.createElement('div');
  pad.className = 'gc-pad';
  pad.append(actBtn, eBtn);
  root.appendChild(pad);

  // --- Joystick (solo táctil) ---
  let stick: HTMLElement | null = null;
  if (touch) {
    stick = document.createElement('div');
    stick.className = 'gc-stick';
    const knob = document.createElement('div');
    knob.className = 'gc-knob';
    stick.appendChild(knob);
    root.appendChild(stick);

    const R = 42; // radio máximo del pulgar
    let pid: number | null = null;
    const setKnob = (dx: number, dy: number) => { knob.style.transform = `translate(${dx}px,${dy}px)`; };
    const onDown = (e: PointerEvent) => {
      pid = e.pointerId; stick!.setPointerCapture(pid); move(e);
    };
    const move = (e: PointerEvent) => {
      if (pid === null) return;
      const r = stick!.getBoundingClientRect();
      let dx = e.clientX - (r.left + r.width / 2);
      let dy = e.clientY - (r.top + r.height / 2);
      const len = Math.hypot(dx, dy) || 1;
      if (len > R) { dx = dx / len * R; dy = dy / len * R; }
      setKnob(dx, dy);
      opts.onMove?.(dx / R, -dy / R); // y invertida: arriba = adelante (+)
    };
    const up = () => { if (pid === null) return; pid = null; setKnob(0, 0); opts.onMove?.(0, 0); };
    stick.addEventListener('pointerdown', onDown);
    stick.addEventListener('pointermove', move);
    stick.addEventListener('pointerup', up);
    stick.addEventListener('pointercancel', up);
  }

  // --- Teclado (siempre disponible: WASD/flechas + E + Espacio) ---
  const keys = new Set<string>();
  const emitKeys = () => {
    let x = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0);
    let y = (keys.has('w') || keys.has('arrowup') ? 1 : 0) - (keys.has('s') || keys.has('arrowdown') ? 1 : 0);
    const len = Math.hypot(x, y);
    if (len > 1) { x /= len; y /= len; } // normaliza la diagonal
    opts.onMove?.(x, y);
  };
  const kd = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (k === 'e') { fireInteract(); return; }
    if (k === ' ') { opts.onAction?.(); return; }
    if ('wasd'.includes(k) || k.startsWith('arrow')) { keys.add(k); emitKeys(); }
  };
  const ku = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if ('wasd'.includes(k) || k.startsWith('arrow')) { keys.delete(k); emitKeys(); }
  };
  addEventListener('keydown', kd);
  addEventListener('keyup', ku);

  parent.appendChild(root);

  return {
    root,
    setPrompt: (text) => {
      if (text) { promptTxt.textContent = text; prompt.classList.add('on'); eBtn.classList.add('hl'); }
      else { prompt.classList.remove('on'); eBtn.classList.remove('hl'); }
    },
    showInteract: (on) => eBtn.classList.toggle('gc-hide', !on),
    showAction: (on) => actBtn.classList.toggle('gc-hide', !on),
    destroy: () => { removeEventListener('keydown', kd); removeEventListener('keyup', ku); root.remove(); }
  };
}
