import { bgJericoMurallas } from '../assets/bgJericoMurallas';

/**
 * Portada — pantalla de título del juego, con BOTONES DE LADRILLO.
 *
 * UI reutilizable, sin dependencias: monta un overlay a pantalla completa sobre
 * el fondo real de Higgsfield (murallas de Jericó) con el título y botones que
 * imitan piezas de plástico (brillo + tetones + pulsado). El LEAD engancha los
 * callbacks a la lógica del juego (empezar partida, ajustes…).
 *
 * USO:
 *   import { mountPortada } from './ui/Portada';
 *   const portada = mountPortada(document.body, {
 *     onPlay: () => startGame(),
 *     onContinue: hasSave ? () => loadGame() : undefined,  // se oculta si no hay
 *     onSettings: () => openSettings(),
 *   });
 *   // para quitarla al empezar:  portada.hide()  /  portada.destroy()
 */

export interface BrickButton {
  /** Texto del botón. */
  label: string;
  /** Qué pasa al pulsarlo. Si falta, el botón no se muestra. */
  onClick?: () => void;
  /** Estilo: 'primary' (ámbar, destacado) · 'stone' (piedra) · 'accent' (rojo). */
  variant?: 'primary' | 'stone' | 'accent';
  /** Emoji/carácter decorativo a la izquierda (opcional). */
  icon?: string;
}

export interface PortadaOptions {
  title?: string;      // por defecto "LA CAÍDA DE JERICÓ"
  subtitle?: string;   // por defecto un lema corto
  buttons?: BrickButton[];
  // Atajos cómodos (se ignoran si pasas `buttons`):
  onPlay?: () => void;
  onContinue?: () => void;
  onSettings?: () => void;
  onCredits?: () => void;
}

export interface PortadaHandle {
  root: HTMLElement;
  hide(): void;     // desvanece (para empezar la partida)
  show(): void;
  destroy(): void;  // quita del DOM
}

let styleInjected = false;
function injectStyles(): void {
  if (styleInjected) return;
  styleInjected = true;
  const css = `
  .lp-portada{position:fixed;inset:0;z-index:50;display:flex;flex-direction:column;
    align-items:center;justify-content:center;gap:clamp(18px,4vh,42px);
    font-family:'Trebuchet MS','Segoe UI',system-ui,sans-serif;color:#fff;
    background:#1c130a;overflow:hidden;transition:opacity .5s ease}
  .lp-portada.lp-hidden{opacity:0;pointer-events:none}
  /* fondo real (murallas) + oscurecido para legibilidad */
  .lp-portada::before{content:"";position:absolute;inset:0;
    background:var(--lp-bg) center/cover no-repeat;
    transform:scale(1.06);animation:lp-drift 24s ease-in-out infinite alternate}
  .lp-portada::after{content:"";position:absolute;inset:0;
    background:linear-gradient(180deg,rgba(20,12,4,.72)0%,rgba(20,12,4,.15)38%,
      rgba(20,12,4,.45)72%,rgba(20,12,4,.9)100%)}
  @keyframes lp-drift{from{transform:scale(1.06)translateY(0)}
    to{transform:scale(1.12)translateY(-1.5%)}}
  .lp-head{position:relative;text-align:center;padding:0 20px;
    animation:lp-in .8s cubic-bezier(.2,.9,.25,1) both}
  .lp-title{margin:0;font-weight:800;letter-spacing:.02em;line-height:.95;
    font-size:clamp(2.4rem,8vw,5.2rem);text-transform:uppercase;
    color:#ffe7bd;text-shadow:0 2px 0 #a5642a,0 4px 0 #7a4718,0 6px 0 #56320f,
      0 10px 24px rgba(0,0,0,.6)}
  .lp-title b{color:#ffcf7a}
  .lp-sub{margin:1.15em 0 0;font-size:clamp(.8rem,2vw,1.05rem);font-weight:700;
    letter-spacing:.2em;text-transform:uppercase;color:#f4dcb4;
    text-shadow:0 2px 6px rgba(0,0,0,.8)}
  .lp-menu{position:relative;display:flex;flex-direction:column;
    gap:clamp(12px,1.8vh,18px);width:min(88vw,340px)}
  .lp-btn{--c:#cdbfa6;--sh:#867256;position:relative;border:0;cursor:pointer;color:#3a2410;
    font-family:inherit;font-weight:800;font-size:clamp(1rem,3.4vw,1.28rem);
    letter-spacing:.04em;text-transform:uppercase;padding:16px 22px 20px;
    border-radius:13px;display:flex;align-items:center;justify-content:center;
    gap:10px;background:var(--c);
    box-shadow:0 7px 0 var(--sh),0 12px 22px rgba(0,0,0,.42),
      inset 0 2px 0 rgba(255,255,255,.55),inset 0 -6px 10px rgba(0,0,0,.14);
    transition:transform .07s ease,box-shadow .07s ease;
    animation:lp-in .6s cubic-bezier(.2,.9,.25,1) both}
  /* tetones de ladrillo arriba */
  .lp-btn::before{content:"";position:absolute;top:-7px;left:50%;
    transform:translateX(-50%);display:flex;width:54px;height:11px;
    background:
      radial-gradient(circle at 9px 6px,var(--c)5.5px,transparent 6px),
      radial-gradient(circle at 27px 6px,var(--c)5.5px,transparent 6px),
      radial-gradient(circle at 45px 6px,var(--c)5.5px,transparent 6px);
    filter:brightness(1.04) drop-shadow(0 -1px 0 rgba(255,255,255,.4))}
  .lp-btn:hover{transform:translateY(-2px);
    box-shadow:0 9px 0 var(--sh),0 16px 26px rgba(0,0,0,.46),
      inset 0 2px 0 rgba(255,255,255,.6),inset 0 -6px 10px rgba(0,0,0,.14)}
  .lp-btn:active{transform:translateY(5px);
    box-shadow:0 2px 0 var(--sh),0 5px 12px rgba(0,0,0,.4),
      inset 0 2px 0 rgba(255,255,255,.5),inset 0 -4px 8px rgba(0,0,0,.18)}
  .lp-btn:focus-visible{outline:3px solid #fff;outline-offset:3px}
  .lp-primary{--c:#f2b64a;--sh:#a5651c}
  .lp-stone{--c:#cdbfa6;--sh:#867256}
  .lp-accent{--c:#e0684a;--sh:#953621}
  .lp-ico{font-size:1.1em;line-height:1}
  .lp-foot{position:relative;font-size:.72rem;letter-spacing:.18em;
    text-transform:uppercase;color:#d9c19c;opacity:.7}
  @keyframes lp-in{from{opacity:0;transform:translateY(16px)}
    to{opacity:1;transform:translateY(0)}}
  @media(prefers-reduced-motion:reduce){
    .lp-portada::before{animation:none}
    .lp-head,.lp-btn{animation:none}}
  `;
  const el = document.createElement('style');
  el.textContent = css;
  document.head.appendChild(el);
}

export function mountPortada(parent: HTMLElement, opts: PortadaOptions = {}): PortadaHandle {
  injectStyles();

  const root = document.createElement('div');
  root.className = 'lp-portada';
  root.style.setProperty('--lp-bg', `url("${bgJericoMurallas}")`);

  const head = document.createElement('div');
  head.className = 'lp-head';
  const h1 = document.createElement('h1');
  h1.className = 'lp-title';
  h1.innerHTML = opts.title ?? 'La caída de <b>Jericó</b>';
  const sub = document.createElement('p');
  sub.className = 'lp-sub';
  sub.textContent = opts.subtitle ?? 'Una aventura de ladrillos';
  head.append(h1, sub);

  const menu = document.createElement('div');
  menu.className = 'lp-menu';

  // Lista de botones: o la que pasen, o la construida desde los atajos.
  const buttons: BrickButton[] = opts.buttons ?? [
    { label: 'Jugar', onClick: opts.onPlay, variant: 'primary', icon: '▶' },
    { label: 'Continuar', onClick: opts.onContinue, variant: 'stone' },
    { label: 'Ajustes', onClick: opts.onSettings, variant: 'stone', icon: '⚙' },
    { label: 'Créditos', onClick: opts.onCredits, variant: 'stone' }
  ];

  buttons.forEach((b, i) => {
    if (!b.onClick) return; // sin acción → no se muestra
    const btn = document.createElement('button');
    btn.className = `lp-btn lp-${b.variant ?? 'stone'}`;
    btn.style.animationDelay = `${0.15 + i * 0.08}s`;
    if (b.icon) {
      const ic = document.createElement('span');
      ic.className = 'lp-ico';
      ic.textContent = b.icon;
      btn.appendChild(ic);
    }
    btn.appendChild(document.createTextNode(b.label));
    btn.addEventListener('click', b.onClick);
    menu.appendChild(btn);
  });

  const foot = document.createElement('div');
  foot.className = 'lp-foot';
  foot.textContent = 'Shevet Ahim';

  root.append(head, menu, foot);
  parent.appendChild(root);

  return {
    root,
    hide: () => root.classList.add('lp-hidden'),
    show: () => root.classList.remove('lp-hidden'),
    destroy: () => root.remove()
  };
}
