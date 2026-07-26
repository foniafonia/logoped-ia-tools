import { brickButton } from './BrickUI';

/**
 * SettingsPanel — panel de AJUSTES (música, sonido, calidad) con estética de
 * ladrillo. Completa el flujo de menú (portada/pausa → Ajustes). El LEAD recibe
 * los cambios por `onChange` y persiste como quiera.
 *
 *   mountSettings(document.body, {
 *     values: { music: 70, sfx: 90, quality: 'alto' },
 *     onChange: (v) => aplicar(v),
 *     onClose: () => {},
 *   });
 */

export type Quality = 'bajo' | 'medio' | 'alto';
export interface SettingsValues { music: number; sfx: number; quality: Quality; }
export interface SettingsOptions {
  values?: Partial<SettingsValues>;
  onChange?: (v: SettingsValues) => void;
  onClose?: () => void;
}

let styled = false;
function styles(): void {
  if (styled) return;
  styled = true;
  const css = `
  .st-root{position:fixed;inset:0;z-index:64;display:flex;align-items:center;
    justify-content:center;background:rgba(12,8,3,.6);backdrop-filter:blur(3px);
    font-family:'Trebuchet MS','Segoe UI',system-ui,sans-serif;
    animation:st-fade .22s ease both}
  .st-card{display:flex;flex-direction:column;gap:16px;width:min(90vw,380px);
    padding:24px;border-radius:18px;background:linear-gradient(180deg,#f5e9d1,#e5d1ab);
    box-shadow:0 14px 0 #b79a6a,0 24px 40px rgba(0,0,0,.5),inset 0 3px 0 rgba(255,255,255,.7);
    animation:st-pop .28s cubic-bezier(.2,.9,.25,1) both}
  .st-title{margin:0 0 2px;text-align:center;color:#5a3a18;font-weight:800;
    font-size:1.5rem;text-transform:uppercase;letter-spacing:.06em}
  .st-row{display:flex;flex-direction:column;gap:7px}
  .st-lab{display:flex;justify-content:space-between;color:#4a2f13;font-weight:700;
    font-size:.95rem}
  .st-lab b{color:#8a5a1e}
  .st-range{-webkit-appearance:none;appearance:none;width:100%;height:14px;
    border-radius:8px;background:#cbb999 linear-gradient(#0000,#0000);
    box-shadow:inset 0 2px 5px rgba(0,0,0,.25);outline:none}
  .st-range::-webkit-slider-thumb{-webkit-appearance:none;width:26px;height:26px;
    border-radius:8px;background:#f2b64a;cursor:pointer;
    box-shadow:0 3px 0 #a5651c,inset 0 2px 0 rgba(255,255,255,.6)}
  .st-range::-moz-range-thumb{width:26px;height:26px;border:0;border-radius:8px;
    background:#f2b64a;cursor:pointer;box-shadow:0 3px 0 #a5651c}
  .st-range:focus-visible::-webkit-slider-thumb{outline:3px solid #fff;outline-offset:2px}
  .st-seg{display:flex;gap:8px}
  .st-seg .bui-btn{flex:1}
  .st-seg .sel{filter:brightness(1.05);outline:3px solid #8a5a1e;outline-offset:1px}
  .st-card .st-close{width:100%;margin-top:4px}
  @keyframes st-fade{from{opacity:0}to{opacity:1}}
  @keyframes st-pop{from{opacity:0;transform:translateY(14px) scale(.96)}to{opacity:1;transform:none}}
  @media(prefers-reduced-motion:reduce){.st-root,.st-card{animation:none}}
  `;
  const el = document.createElement('style');
  el.textContent = css;
  document.head.appendChild(el);
}

function sliderRow(label: string, value: number, onInput: (v: number) => void): HTMLElement {
  const row = document.createElement('div');
  row.className = 'st-row';
  const lab = document.createElement('div');
  lab.className = 'st-lab';
  const pct = document.createElement('b');
  pct.textContent = `${value}%`;
  lab.append(document.createTextNode(label), pct);
  const range = document.createElement('input');
  range.type = 'range'; range.min = '0'; range.max = '100'; range.value = String(value);
  range.className = 'st-range';
  range.addEventListener('input', () => { const v = Number(range.value); pct.textContent = `${v}%`; onInput(v); });
  row.append(lab, range);
  return row;
}

export function mountSettings(parent: HTMLElement, opts: SettingsOptions = {}): { destroy(): void } {
  styles();
  const v: SettingsValues = {
    music: opts.values?.music ?? 70,
    sfx: opts.values?.sfx ?? 90,
    quality: opts.values?.quality ?? 'alto'
  };
  const emit = () => opts.onChange?.({ ...v });

  const root = document.createElement('div');
  root.className = 'st-root';
  const card = document.createElement('div');
  card.className = 'st-card';

  const h = document.createElement('h2');
  h.className = 'st-title';
  h.textContent = 'Ajustes';
  card.appendChild(h);

  card.appendChild(sliderRow('Música', v.music, (x) => { v.music = x; emit(); }));
  card.appendChild(sliderRow('Sonido', v.sfx, (x) => { v.sfx = x; emit(); }));

  // Calidad (segmentado)
  const qRow = document.createElement('div');
  qRow.className = 'st-row';
  const qLab = document.createElement('div');
  qLab.className = 'st-lab';
  qLab.appendChild(document.createTextNode('Calidad'));
  const seg = document.createElement('div');
  seg.className = 'st-seg';
  const qBtns: Record<Quality, HTMLElement> = {} as any;
  (['bajo', 'medio', 'alto'] as Quality[]).forEach((q) => {
    const b = brickButton({
      label: q, variant: 'stone', small: true,
      onClick: () => {
        v.quality = q;
        (Object.keys(qBtns) as Quality[]).forEach((k) => qBtns[k].classList.toggle('sel', k === q));
        emit();
      }
    });
    if (q === v.quality) b.classList.add('sel');
    qBtns[q] = b;
    seg.appendChild(b);
  });
  qRow.append(qLab, seg);
  card.appendChild(qRow);

  const destroy = () => root.remove();
  const close = brickButton({ label: 'Cerrar', variant: 'primary', onClick: () => { destroy(); opts.onClose?.(); } });
  close.classList.add('st-close');
  card.appendChild(close);

  root.appendChild(card);
  root.addEventListener('click', (e) => { if (e.target === root) { destroy(); opts.onClose?.(); } });
  parent.appendChild(root);
  return { destroy };
}
