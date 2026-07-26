import { bgJericoMurallas } from '../assets/bgJericoMurallas';

/**
 * LoadingScreen — pantalla de CARGA con barra de progreso de ladrillos y una
 * pista rotatoria. Úsala mientras se prepara un tramo.
 *
 *   const load = mountLoading(document.body, { tip: 'Consejo: rodea la muralla…' });
 *   load.setProgress(0.4);   // 0..1
 *   load.done();             // desvanece y quita
 */

export interface LoadingOptions { title?: string; tip?: string; }
export interface LoadingHandle {
  setProgress(p: number): void;
  done(): void;
}

const TIPS = [
  'Los muros de Jericó caen al son del shofar.',
  'Rodea la ciudad y no te detengas.',
  'El cordón rojo de Rahab señala la casa a salvo.',
  'El Arca abre camino a través del Jordán.'
];

let styled = false;
function styles(): void {
  if (styled) return;
  styled = true;
  const css = `
  .load-root{position:fixed;inset:0;z-index:80;display:flex;flex-direction:column;
    align-items:center;justify-content:center;gap:22px;color:#ffe7bd;text-align:center;
    font-family:'Trebuchet MS','Segoe UI',system-ui,sans-serif;
    background:#1c130a;transition:opacity .45s ease}
  .load-root::before{content:"";position:absolute;inset:0;opacity:.35;
    background:var(--lb) center/cover no-repeat;filter:blur(2px)}
  .load-root.load-out{opacity:0;pointer-events:none}
  .load-title{position:relative;margin:0;font-weight:800;text-transform:uppercase;
    letter-spacing:.05em;font-size:clamp(1.4rem,5vw,2.4rem);
    text-shadow:0 2px 0 #7a4718,0 4px 16px rgba(0,0,0,.6)}
  .load-bar{position:relative;width:min(78vw,360px);height:26px;border-radius:9px;
    background:rgba(20,12,4,.55);box-shadow:inset 0 3px 7px rgba(0,0,0,.5);
    overflow:hidden;padding:4px}
  .load-fill{height:100%;width:0;border-radius:6px;background:#f2b64a;
    box-shadow:inset 0 2px 0 rgba(255,255,255,.5),inset 0 -3px 6px rgba(0,0,0,.2);
    transition:width .3s ease;
    background-image:repeating-linear-gradient(90deg,rgba(255,255,255,.18)0 3px,transparent 3px 16px)}
  .load-tip{position:relative;max-width:min(80vw,420px);font-size:.95rem;font-weight:600;
    color:#e9c79a;opacity:.9;min-height:2.6em}
  .load-pct{position:relative;font-weight:800;font-variant-numeric:tabular-nums;opacity:.9}
  @media(prefers-reduced-motion:reduce){.load-root,.load-fill{transition:none}}
  `;
  const el = document.createElement('style');
  el.textContent = css; document.head.appendChild(el);
}

export function mountLoading(parent: HTMLElement, o: LoadingOptions = {}): LoadingHandle {
  styles();
  const root = document.createElement('div');
  root.className = 'load-root';
  root.style.setProperty('--lb', `url("${bgJericoMurallas}")`);

  const title = document.createElement('h2');
  title.className = 'load-title';
  title.textContent = o.title ?? 'Cargando…';

  const bar = document.createElement('div');
  bar.className = 'load-bar';
  const fill = document.createElement('div');
  fill.className = 'load-fill';
  bar.appendChild(fill);

  const pct = document.createElement('div');
  pct.className = 'load-pct';
  pct.textContent = '0%';

  const tip = document.createElement('div');
  tip.className = 'load-tip';
  // pista aleatoria evitando Math.random en SSR: usa la longitud del tip dado o rota
  tip.textContent = o.tip ?? TIPS[Math.floor((Date.now() / 1000) % TIPS.length)];

  root.append(title, bar, pct, tip);
  parent.appendChild(root);

  return {
    setProgress: (p) => {
      const c = Math.max(0, Math.min(1, p));
      fill.style.width = `${c * 100}%`;
      pct.textContent = `${Math.round(c * 100)}%`;
    },
    done: () => {
      root.classList.add('load-out');
      setTimeout(() => root.remove(), 480);
    }
  };
}
