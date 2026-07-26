/**
 * BrickUI — piezas de interfaz con estética de LADRILLO de plástico, reutilizables.
 *
 * Un único sitio para el "look" de botón/panel de ladrillo (brillo, tetones,
 * hundido al pulsar) que comparten portada, menú de pausa, HUD, diálogos… Sin
 * dependencias: inyecta un `<style>` una sola vez y devuelve elementos DOM.
 *
 *   import { brickButton, brickPanel } from './ui/BrickUI';
 *   const btn = brickButton({ label: 'Reanudar', variant: 'primary', onClick: … });
 */

export type BrickVariant = 'primary' | 'stone' | 'accent' | 'teal';

export interface BrickButtonOpts {
  label: string;
  onClick?: () => void;
  variant?: BrickVariant;
  icon?: string;
  /** Botón compacto (para HUD / barras). */
  small?: boolean;
}

let injected = false;
export function ensureBrickStyles(): void {
  if (injected) return;
  injected = true;
  const css = `
  .bui-btn{--c:#cdbfa6;--sh:#867256;position:relative;border:0;cursor:pointer;
    color:#3a2410;font-family:'Trebuchet MS','Segoe UI',system-ui,sans-serif;
    font-weight:800;letter-spacing:.04em;text-transform:uppercase;
    font-size:clamp(1rem,3.4vw,1.24rem);padding:15px 22px 19px;border-radius:13px;
    display:inline-flex;align-items:center;justify-content:center;gap:10px;
    background:var(--c);box-shadow:0 7px 0 var(--sh),0 12px 22px rgba(0,0,0,.42),
      inset 0 2px 0 rgba(255,255,255,.55),inset 0 -6px 10px rgba(0,0,0,.14);
    transition:transform .07s ease,box-shadow .07s ease}
  .bui-btn::before{content:"";position:absolute;top:-7px;left:50%;
    transform:translateX(-50%);width:54px;height:11px;background:
      radial-gradient(circle at 9px 6px,var(--c)5.5px,transparent 6px),
      radial-gradient(circle at 27px 6px,var(--c)5.5px,transparent 6px),
      radial-gradient(circle at 45px 6px,var(--c)5.5px,transparent 6px);
    filter:brightness(1.04) drop-shadow(0 -1px 0 rgba(255,255,255,.4))}
  .bui-btn:hover{transform:translateY(-2px);
    box-shadow:0 9px 0 var(--sh),0 16px 26px rgba(0,0,0,.46),
      inset 0 2px 0 rgba(255,255,255,.6),inset 0 -6px 10px rgba(0,0,0,.14)}
  .bui-btn:active{transform:translateY(5px);
    box-shadow:0 2px 0 var(--sh),0 5px 12px rgba(0,0,0,.4),
      inset 0 2px 0 rgba(255,255,255,.5),inset 0 -4px 8px rgba(0,0,0,.18)}
  .bui-btn:focus-visible{outline:3px solid #fff;outline-offset:3px}
  .bui-btn.bui-sm{font-size:clamp(.8rem,2.6vw,1rem);padding:10px 15px 13px;
    border-radius:10px;box-shadow:0 5px 0 var(--sh),0 8px 14px rgba(0,0,0,.4),
      inset 0 2px 0 rgba(255,255,255,.5),inset 0 -4px 8px rgba(0,0,0,.14)}
  .bui-btn.bui-sm::before{display:none}
  .bui-btn.bui-sm:active{transform:translateY(4px);
    box-shadow:0 1px 0 var(--sh),0 3px 8px rgba(0,0,0,.4),
      inset 0 2px 0 rgba(255,255,255,.5)}
  .bui-primary{--c:#f2b64a;--sh:#a5651c}
  .bui-stone{--c:#cdbfa6;--sh:#867256}
  .bui-accent{--c:#e0684a;--sh:#953621}
  .bui-teal{--c:#4bb3a6;--sh:#256b62;color:#08302b}
  .bui-ico{font-size:1.1em;line-height:1}
  /* Panel de ladrillo (para diálogos, cartelas, cajas de menú) */
  .bui-panel{position:relative;background:linear-gradient(180deg,#f3e6cd,#e4d0aa);
    color:#3a2410;border-radius:16px;padding:18px 22px;
    box-shadow:0 10px 0 #b79a6a,0 18px 30px rgba(0,0,0,.45),
      inset 0 3px 0 rgba(255,255,255,.7),inset 0 -8px 14px rgba(0,0,0,.10)}
  @media(prefers-reduced-motion:reduce){.bui-btn{transition:none}}
  `;
  const el = document.createElement('style');
  el.textContent = css;
  document.head.appendChild(el);
}

export function brickButton(o: BrickButtonOpts): HTMLButtonElement {
  ensureBrickStyles();
  const b = document.createElement('button');
  b.className = `bui-btn bui-${o.variant ?? 'stone'}${o.small ? ' bui-sm' : ''}`;
  if (o.icon) {
    const ic = document.createElement('span');
    ic.className = 'bui-ico';
    ic.textContent = o.icon;
    b.appendChild(ic);
  }
  b.appendChild(document.createTextNode(o.label));
  if (o.onClick) b.addEventListener('click', o.onClick);
  return b;
}

/** Contenedor con relieve de ladrillo (para cartelas/diálogos/cajas). */
export function brickPanel(): HTMLDivElement {
  ensureBrickStyles();
  const p = document.createElement('div');
  p.className = 'bui-panel';
  return p;
}
