import { brickButton } from './BrickUI';

/**
 * ResultScreen — pantalla de fin de tramo (VICTORIA / reintentar) con estrellas
 * y botones de ladrillo. Se muestra sobre la escena y se autodestruye al elegir.
 *
 *   showResult(document.body, {
 *     win: true, stars: 2,
 *     onNext: () => siguienteTramo(), onRetry: () => reiniciar(), onMenu: () => alMenu(),
 *   });
 */

export interface ResultOptions {
  win: boolean;
  title?: string;
  /** Estrellas conseguidas 0..3 (solo si win). */
  stars?: number;
  onRetry?: () => void;
  onNext?: () => void;
  onMenu?: () => void;
}

let styled = false;
function styles(): void {
  if (styled) return;
  styled = true;
  const css = `
  .rs-root{position:fixed;inset:0;z-index:65;display:flex;align-items:center;
    justify-content:center;background:rgba(12,8,3,.66);backdrop-filter:blur(3px);
    font-family:'Trebuchet MS','Segoe UI',system-ui,sans-serif;
    animation:rs-fade .25s ease both}
  .rs-card{display:flex;flex-direction:column;align-items:center;gap:14px;
    width:min(88vw,360px);padding:26px 26px 28px;border-radius:20px;
    background:linear-gradient(180deg,#f5e9d1,#e5d1ab);
    box-shadow:0 16px 0 #b79a6a,0 26px 44px rgba(0,0,0,.5),
      inset 0 3px 0 rgba(255,255,255,.7);
    animation:rs-pop .32s cubic-bezier(.2,.9,.25,1) both}
  .rs-title{margin:0;font-weight:800;font-size:2rem;letter-spacing:.04em;
    text-transform:uppercase;text-align:center}
  .rs-win{color:#c8922f;text-shadow:0 2px 0 #8a5a18}
  .rs-lose{color:#a35a44}
  .rs-stars{display:flex;gap:10px;margin:2px 0 6px}
  .rs-star{font-size:2.5rem;line-height:1;color:#d8c39a;
    transition:transform .3s cubic-bezier(.2,1.6,.4,1)}
  .rs-star.on{color:#f2b64a;text-shadow:0 0 14px rgba(255,190,80,.7);
    animation:rs-star .4s cubic-bezier(.2,1.6,.4,1) both}
  .rs-card .bui-btn{width:100%}
  .rs-row{display:flex;gap:10px;width:100%}
  .rs-row .bui-btn{flex:1}
  @keyframes rs-fade{from{opacity:0}to{opacity:1}}
  @keyframes rs-pop{from{opacity:0;transform:translateY(16px) scale(.95)}to{opacity:1;transform:none}}
  @keyframes rs-star{from{transform:scale(0) rotate(-40deg)}to{transform:scale(1)}}
  @media(prefers-reduced-motion:reduce){.rs-root,.rs-card,.rs-star.on{animation:none}}
  `;
  const el = document.createElement('style');
  el.textContent = css;
  document.head.appendChild(el);
}

export function showResult(parent: HTMLElement, o: ResultOptions): { destroy(): void } {
  styles();
  const root = document.createElement('div');
  root.className = 'rs-root';
  const card = document.createElement('div');
  card.className = 'rs-card';

  const h = document.createElement('h2');
  h.className = `rs-title ${o.win ? 'rs-win' : 'rs-lose'}`;
  h.textContent = o.title ?? (o.win ? '¡Victoria!' : 'Inténtalo de nuevo');
  card.appendChild(h);

  if (o.win) {
    const stars = document.createElement('div');
    stars.className = 'rs-stars';
    const got = Math.max(0, Math.min(3, o.stars ?? 0));
    for (let i = 0; i < 3; i++) {
      const s = document.createElement('span');
      s.className = 'rs-star' + (i < got ? ' on' : '');
      s.textContent = '★';
      s.style.animationDelay = `${0.15 + i * 0.16}s`;
      stars.appendChild(s);
    }
    card.appendChild(stars);
  }

  const destroy = (): void => root.remove();
  const wrap = (cb?: () => void) => cb ? () => { destroy(); cb(); } : undefined;

  if (o.win && o.onNext) card.appendChild(brickButton({ label: 'Siguiente', variant: 'primary', icon: '▶', onClick: wrap(o.onNext) }));
  const row = document.createElement('div');
  row.className = 'rs-row';
  if (o.onRetry) row.appendChild(brickButton({ label: 'Reintentar', variant: o.win ? 'stone' : 'primary', icon: '↺', onClick: wrap(o.onRetry) }));
  if (o.onMenu) row.appendChild(brickButton({ label: 'Menú', variant: 'stone', onClick: wrap(o.onMenu) }));
  if (row.childElementCount) card.appendChild(row);

  root.appendChild(card);
  parent.appendChild(root);
  return { destroy };
}
