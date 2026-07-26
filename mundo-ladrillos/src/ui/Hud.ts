import { brickButton } from './BrickUI';

/**
 * Hud — capa de juego (heads-up display) con estética de ladrillo:
 *   · cartela de OBJETIVO (arriba-izquierda)
 *   · botón de PAUSA (arriba-derecha)
 *   · fila de PROGRESO en tetones (p.ej. las 7 vueltas a Jericó)
 *   · botón de ACCIÓN grande opcional (p.ej. "¡Toca el shofar!") abajo-centro
 *
 *   const hud = mountHud(document.body, { onPause: …, laps: 7 });
 *   hud.setObjective('Rodea la muralla');
 *   hud.setProgress(3);                 // ilumina 3 tetones
 *   hud.showAction('¡Toca el shofar!', () => blowShofar());
 *   hud.hideAction();
 */

export interface HudOptions {
  objective?: string;
  /** Nº de tetones de progreso (0 = sin barra). Def. 0. */
  laps?: number;
  onPause?: () => void;
}

export interface HudHandle {
  root: HTMLElement;
  setObjective(text: string): void;
  setProgress(done: number): void;
  showAction(label: string, onClick: () => void): void;
  hideAction(): void;
  destroy(): void;
}

let styled = false;
function styles(): void {
  if (styled) return;
  styled = true;
  const css = `
  .hud-root{position:fixed;inset:0;z-index:40;pointer-events:none;
    font-family:'Trebuchet MS','Segoe UI',system-ui,sans-serif}
  .hud-root>*{pointer-events:auto}
  .hud-obj{position:absolute;top:14px;left:14px;max-width:min(60vw,360px);
    padding:9px 15px;border-radius:11px;color:#4a2f13;font-weight:800;
    font-size:clamp(.85rem,2.6vw,1.05rem);letter-spacing:.02em;
    background:linear-gradient(180deg,#f5e9d1,#e6d3ad);
    box-shadow:0 5px 0 #b79a6a,0 9px 16px rgba(0,0,0,.35),
      inset 0 2px 0 rgba(255,255,255,.7)}
  .hud-obj .hud-lbl{display:block;font-size:.62em;letter-spacing:.22em;
    text-transform:uppercase;opacity:.6;margin-bottom:1px}
  .hud-pause{position:absolute;top:14px;right:14px}
  .hud-prog{position:absolute;top:60px;left:14px;display:flex;gap:7px}
  .hud-pip{width:17px;height:17px;border-radius:50%;
    background:radial-gradient(circle at 6px 5px,#7d6a4a,#4e3f28);
    box-shadow:inset 0 -2px 3px rgba(0,0,0,.4),0 2px 3px rgba(0,0,0,.3)}
  .hud-pip.on{background:radial-gradient(circle at 6px 5px,#ffd77a,#e7a12f);
    box-shadow:inset 0 -2px 3px rgba(120,60,0,.4),0 0 10px rgba(255,190,80,.7)}
  .hud-action{position:absolute;left:50%;bottom:26px;transform:translateX(-50%);
    animation:hud-rise .3s cubic-bezier(.2,.9,.25,1) both}
  .hud-action .bui-btn{font-size:clamp(1.1rem,4vw,1.5rem);padding:18px 34px 22px;
    animation:hud-pulse 1.4s ease-in-out infinite}
  @keyframes hud-rise{from{opacity:0;transform:translate(-50%,16px)}
    to{opacity:1;transform:translate(-50%,0)}}
  @keyframes hud-pulse{0%,100%{filter:brightness(1)}50%{filter:brightness(1.12)}}
  @media(prefers-reduced-motion:reduce){
    .hud-action,.hud-action .bui-btn{animation:none}}
  `;
  const el = document.createElement('style');
  el.textContent = css;
  document.head.appendChild(el);
}

export function mountHud(parent: HTMLElement, opts: HudOptions = {}): HudHandle {
  styles();
  const root = document.createElement('div');
  root.className = 'hud-root';

  // Objetivo
  const obj = document.createElement('div');
  obj.className = 'hud-obj';
  const lbl = document.createElement('span');
  lbl.className = 'hud-lbl';
  lbl.textContent = 'Objetivo';
  const objText = document.createElement('span');
  obj.append(lbl, objText);
  root.appendChild(obj);

  // Pausa
  if (opts.onPause) {
    const pauseWrap = document.createElement('div');
    pauseWrap.className = 'hud-pause';
    pauseWrap.appendChild(brickButton({ label: 'II', variant: 'stone', small: true, onClick: opts.onPause }));
    root.appendChild(pauseWrap);
  }

  // Progreso (tetones)
  const laps = opts.laps ?? 0;
  const prog = document.createElement('div');
  prog.className = 'hud-prog';
  const pips: HTMLElement[] = [];
  for (let i = 0; i < laps; i++) {
    const pip = document.createElement('div');
    pip.className = 'hud-pip';
    prog.appendChild(pip);
    pips.push(pip);
  }
  if (laps > 0) root.appendChild(prog);

  // Acción
  let actionWrap: HTMLElement | null = null;

  parent.appendChild(root);
  objText.textContent = opts.objective ?? '';

  return {
    root,
    setObjective: (t) => { objText.textContent = t; },
    setProgress: (done) => pips.forEach((p, i) => p.classList.toggle('on', i < done)),
    showAction: (label, onClick) => {
      if (actionWrap) actionWrap.remove();
      actionWrap = document.createElement('div');
      actionWrap.className = 'hud-action';
      actionWrap.appendChild(brickButton({ label, variant: 'accent', onClick }));
      root.appendChild(actionWrap);
    },
    hideAction: () => { if (actionWrap) { actionWrap.remove(); actionWrap = null; } },
    destroy: () => root.remove()
  };
}
