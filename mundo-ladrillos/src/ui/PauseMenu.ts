import { brickButton } from './BrickUI';

/**
 * PauseMenu — menú de PAUSA superpuesto, con botones de ladrillo.
 * Se abre/cierra sin recrearse; el LEAD engancha los callbacks.
 *
 *   const pause = mountPauseMenu(document.body, {
 *     onResume: () => resume(), onSettings: …, onRestart: …, onQuit: …,
 *   });
 *   // tecla ESC / botón:  pause.toggle()   ·   pause.open() / pause.close()
 */

export interface PauseMenuOptions {
  title?: string;
  onResume?: () => void;
  onSettings?: () => void;
  onRestart?: () => void;
  onQuit?: () => void;
}

export interface PauseMenuHandle {
  root: HTMLElement;
  open(): void;
  close(): void;
  toggle(): void;
  isOpen(): boolean;
  destroy(): void;
}

let styled = false;
function styles(): void {
  if (styled) return;
  styled = true;
  const css = `
  .pm-root{position:fixed;inset:0;z-index:60;display:none;
    align-items:center;justify-content:center;
    background:rgba(14,9,4,.58);backdrop-filter:blur(3px)}
  .pm-root.pm-on{display:flex;animation:pm-fade .2s ease both}
  .pm-card{display:flex;flex-direction:column;gap:14px;width:min(86vw,320px);
    padding:26px 24px;border-radius:18px;
    background:linear-gradient(180deg,#f3e6cd,#e4d0aa);
    box-shadow:0 14px 0 #b79a6a,0 24px 40px rgba(0,0,0,.5),
      inset 0 3px 0 rgba(255,255,255,.7);animation:pm-pop .26s cubic-bezier(.2,.9,.25,1) both}
  .pm-title{margin:0 0 6px;text-align:center;color:#5a3a18;font-weight:800;
    font-size:1.5rem;text-transform:uppercase;letter-spacing:.06em;
    font-family:'Trebuchet MS','Segoe UI',system-ui,sans-serif}
  .pm-card .bui-btn{width:100%}
  @keyframes pm-fade{from{opacity:0}to{opacity:1}}
  @keyframes pm-pop{from{opacity:0;transform:translateY(14px) scale(.96)}
    to{opacity:1;transform:none}}
  @media(prefers-reduced-motion:reduce){
    .pm-root.pm-on,.pm-card{animation:none}}
  `;
  const el = document.createElement('style');
  el.textContent = css;
  document.head.appendChild(el);
}

export function mountPauseMenu(parent: HTMLElement, opts: PauseMenuOptions = {}): PauseMenuHandle {
  styles();
  const root = document.createElement('div');
  root.className = 'pm-root';

  const card = document.createElement('div');
  card.className = 'pm-card';
  const h = document.createElement('h2');
  h.className = 'pm-title';
  h.textContent = opts.title ?? 'Pausa';
  card.appendChild(h);

  const close = () => root.classList.remove('pm-on');

  const rows: Array<[string, (() => void) | undefined, Parameters<typeof brickButton>[0]['variant'], string?]> = [
    ['Reanudar', opts.onResume, 'primary', '▶'],
    ['Ajustes', opts.onSettings, 'stone', '⚙'],
    ['Reiniciar', opts.onRestart, 'stone', '↺'],
    ['Salir al menú', opts.onQuit, 'accent']
  ];
  for (const [label, cb, variant, icon] of rows) {
    if (!cb) continue;
    // "Reanudar" cierra el menú además de su callback
    const onClick = label === 'Reanudar' ? () => { close(); cb(); } : cb;
    card.appendChild(brickButton({ label, onClick, variant, icon }));
  }

  root.appendChild(card);
  // click fuera de la tarjeta = reanudar
  root.addEventListener('click', (e) => { if (e.target === root) { close(); opts.onResume?.(); } });
  parent.appendChild(root);

  const api: PauseMenuHandle = {
    root,
    open: () => root.classList.add('pm-on'),
    close,
    toggle: () => root.classList.toggle('pm-on'),
    isOpen: () => root.classList.contains('pm-on'),
    destroy: () => root.remove()
  };
  return api;
}
