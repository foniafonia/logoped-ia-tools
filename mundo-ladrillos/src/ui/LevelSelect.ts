/**
 * LevelSelect — mapa de TRAMOS de la historia como senda de nodos-ladrillo.
 * Cada tramo: completado (con estrellas), actual (pulsable, resaltado) o
 * bloqueado (atenuado). El LEAD pasa el estado; devuelve el tramo elegido.
 *
 *   mountLevelSelect(document.body, {
 *     levels: [
 *       { name: 'Campamento', state: 'done', stars: 3 },
 *       { name: 'El Jordán',  state: 'done', stars: 2 },
 *       { name: 'La llanura', state: 'current' },
 *       { name: 'Las murallas', state: 'locked' },
 *     ],
 *     onSelect: (i) => empezarTramo(i),
 *   });
 */

export type LevelState = 'done' | 'current' | 'locked';
export interface LevelNode { name: string; state: LevelState; stars?: number; }
export interface LevelSelectOptions {
  levels: LevelNode[];
  title?: string;
  onSelect: (index: number) => void;
  onBack?: () => void;
}
export interface LevelSelectHandle { root: HTMLElement; destroy(): void; }

let styled = false;
function styles(): void {
  if (styled) return;
  styled = true;
  const css = `
  .ls-root{position:fixed;inset:0;z-index:52;display:flex;flex-direction:column;
    align-items:center;justify-content:center;gap:26px;padding:24px;
    background:rgba(14,9,4,.5);backdrop-filter:blur(2px);
    font-family:'Trebuchet MS','Segoe UI',system-ui,sans-serif}
  .ls-title{margin:0;color:#ffe7bd;font-weight:800;text-transform:uppercase;
    letter-spacing:.06em;font-size:clamp(1.3rem,4vw,2rem);
    text-shadow:0 2px 0 #7a4718,0 4px 14px rgba(0,0,0,.6)}
  .ls-path{display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:center;
    gap:0}
  .ls-item{display:flex;align-items:center}
  .ls-node{position:relative;width:96px;display:flex;flex-direction:column;
    align-items:center;gap:8px;cursor:default}
  .ls-disc{width:64px;height:64px;border-radius:16px;display:flex;align-items:center;
    justify-content:center;font-weight:800;font-size:1.4rem;color:#4a2f13;
    background:#cdbfa6;box-shadow:0 6px 0 #867256,0 10px 16px rgba(0,0,0,.4),
      inset 0 2px 0 rgba(255,255,255,.5);transition:transform .1s ease}
  .ls-disc::before{content:"";position:absolute;top:-6px;width:40px;height:9px;
    border-radius:5px;background:inherit;filter:brightness(1.03)}
  .ls-done .ls-disc{background:#8fbf6a;box-shadow:0 6px 0 #5c8340,0 10px 16px rgba(0,0,0,.4),inset 0 2px 0 rgba(255,255,255,.5)}
  .ls-current .ls-disc{background:#f2b64a;box-shadow:0 6px 0 #a5651c,0 0 20px rgba(255,190,80,.6),inset 0 2px 0 rgba(255,255,255,.6);
    cursor:pointer;animation:ls-pulse 1.4s ease-in-out infinite}
  .ls-locked .ls-disc{background:#9a9284;color:#6a6255;box-shadow:0 6px 0 #5f594e,0 10px 16px rgba(0,0,0,.4),inset 0 2px 0 rgba(255,255,255,.25);opacity:.85}
  .ls-current .ls-disc:hover{transform:translateY(-3px)}
  .ls-current .ls-disc:active{transform:translateY(3px)}
  .ls-name{color:#f3e2c4;font-weight:700;font-size:.82rem;text-align:center;
    max-width:92px;text-shadow:0 1px 4px rgba(0,0,0,.7)}
  .ls-locked .ls-name{opacity:.6}
  .ls-stars{display:flex;gap:2px;height:14px}
  .ls-stars span{font-size:.85rem;line-height:1;color:#ddd0b4}
  .ls-stars span.on{color:#f2b64a}
  .ls-link{width:26px;height:8px;border-radius:4px;margin-top:26px;
    background:repeating-linear-gradient(90deg,#c9b892 0 6px,transparent 6px 10px)}
  .ls-back{margin-top:6px}
  @keyframes ls-pulse{0%,100%{filter:brightness(1)}50%{filter:brightness(1.12)}}
  @media(prefers-reduced-motion:reduce){.ls-current .ls-disc{animation:none}}
  `;
  const el = document.createElement('style');
  el.textContent = css;
  document.head.appendChild(el);
}

export function mountLevelSelect(parent: HTMLElement, opts: LevelSelectOptions): LevelSelectHandle {
  styles();
  const root = document.createElement('div');
  root.className = 'ls-root';

  const h = document.createElement('h2');
  h.className = 'ls-title';
  h.textContent = opts.title ?? 'La caída de Jericó';
  root.appendChild(h);

  const path = document.createElement('div');
  path.className = 'ls-path';

  opts.levels.forEach((lv, i) => {
    const item = document.createElement('div');
    item.className = 'ls-item';

    const node = document.createElement('div');
    node.className = `ls-node ls-${lv.state}`;

    const disc = document.createElement('div');
    disc.className = 'ls-disc';
    disc.textContent = lv.state === 'locked' ? '🔒' : String(i + 1);
    if (lv.state === 'current') {
      disc.setAttribute('role', 'button');
      disc.tabIndex = 0;
      const go = () => opts.onSelect(i);
      disc.addEventListener('click', go);
      disc.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    }
    node.appendChild(disc);

    const name = document.createElement('div');
    name.className = 'ls-name';
    name.textContent = lv.name;
    node.appendChild(name);

    const stars = document.createElement('div');
    stars.className = 'ls-stars';
    if (lv.state === 'done') {
      const got = Math.max(0, Math.min(3, lv.stars ?? 0));
      for (let s = 0; s < 3; s++) {
        const st = document.createElement('span');
        st.className = s < got ? 'on' : '';
        st.textContent = '★';
        stars.appendChild(st);
      }
    }
    node.appendChild(stars);
    item.appendChild(node);

    if (i < opts.levels.length - 1) {
      const link = document.createElement('div');
      link.className = 'ls-link';
      item.appendChild(link);
    }
    path.appendChild(item);
  });

  root.appendChild(path);
  parent.appendChild(root);

  return { root, destroy: () => root.remove() };
}
