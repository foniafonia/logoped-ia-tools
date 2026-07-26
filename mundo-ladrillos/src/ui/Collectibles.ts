/**
 * Collectibles — chip de HUD para contar recolectables (reliquias, monedas…),
 * con icono y "3 / 7". Estética de ladrillo. Pulsa un latido al incrementar.
 *
 *   const relics = mountCounter(document.body, { icon: '🏺', total: 7 });
 *   relics.set(3);   relics.inc();   // 4
 */

export interface CounterOptions {
  icon?: string;
  total?: number;      // si se da, muestra "n / total"
  value?: number;      // inicial (def. 0)
  /** Posición: 'top' (centro-arriba) o 'top-right'. Def. 'top'. */
  place?: 'top' | 'top-right';
}
export interface CounterHandle {
  root: HTMLElement;
  set(n: number): void;
  inc(step?: number): number;
  get(): number;
  destroy(): void;
}

let styled = false;
function styles(): void {
  if (styled) return;
  styled = true;
  const css = `
  .cc-chip{position:fixed;z-index:41;display:flex;align-items:center;gap:8px;
    padding:8px 15px 8px 11px;border-radius:13px;color:#4a2f13;font-weight:800;
    font-size:clamp(.9rem,2.6vw,1.1rem);font-variant-numeric:tabular-nums;
    font-family:'Trebuchet MS','Segoe UI',system-ui,sans-serif;
    background:linear-gradient(180deg,#f5e9d1,#e6d3ad);
    box-shadow:0 5px 0 #b79a6a,0 9px 16px rgba(0,0,0,.35),inset 0 2px 0 rgba(255,255,255,.7)}
  .cc-top{top:14px;left:50%;transform:translateX(-50%)}
  .cc-tr{top:60px;right:14px}
  .cc-ico{font-size:1.25em;line-height:1}
  .cc-bump{animation:cc-bump .32s cubic-bezier(.2,1.6,.4,1)}
  @keyframes cc-bump{0%{transform:scale(1)}40%{transform:scale(1.22)}100%{transform:scale(1)}}
  .cc-top.cc-bump{animation-name:cc-bump-c}
  @keyframes cc-bump-c{0%{transform:translateX(-50%) scale(1)}40%{transform:translateX(-50%) scale(1.22)}100%{transform:translateX(-50%) scale(1)}}
  @media(prefers-reduced-motion:reduce){.cc-bump{animation:none}}
  `;
  const el = document.createElement('style');
  el.textContent = css; document.head.appendChild(el);
}

export function mountCounter(parent: HTMLElement, o: CounterOptions = {}): CounterHandle {
  styles();
  const total = o.total;
  let value = o.value ?? 0;
  const chip = document.createElement('div');
  chip.className = `cc-chip ${o.place === 'top-right' ? 'cc-tr' : 'cc-top'}`;
  const ico = document.createElement('span');
  ico.className = 'cc-ico'; ico.textContent = o.icon ?? '🏺';
  const num = document.createElement('span');
  chip.append(ico, num);
  parent.appendChild(chip);

  const render = (bump: boolean) => {
    num.textContent = total != null ? `${value} / ${total}` : String(value);
    if (bump) { chip.classList.remove('cc-bump'); void chip.offsetWidth; chip.classList.add('cc-bump'); }
  };
  render(false);

  return {
    root: chip,
    set: (n) => { const b = n !== value; value = n; render(b); },
    inc: (step = 1) => { value += step; render(true); return value; },
    get: () => value,
    destroy: () => chip.remove()
  };
}
