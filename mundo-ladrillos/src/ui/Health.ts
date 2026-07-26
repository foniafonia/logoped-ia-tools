/**
 * Health — barra de VIDAS (corazones) para escenas de acción (espías, guardias).
 * Estética de ladrillo. Los corazones perdidos se apagan; al recibir daño late.
 *
 *   const hp = mountHealth(document.body, { max: 3 });
 *   hp.damage();   // -1 (late en rojo)   ·   hp.heal();   ·   hp.set(2)
 */

export interface HealthOptions { max?: number; value?: number; }
export interface HealthHandle {
  root: HTMLElement;
  set(n: number): void;
  damage(step?: number): number;
  heal(step?: number): number;
  get(): number;
  destroy(): void;
}

let styled = false;
function styles(): void {
  if (styled) return;
  styled = true;
  const css = `
  .hp-root{position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:42;
    display:flex;gap:7px;padding:7px 12px;border-radius:13px;
    background:linear-gradient(180deg,rgba(245,233,209,.85),rgba(230,211,173,.85));
    box-shadow:0 4px 0 #b79a6a,0 8px 14px rgba(0,0,0,.3),inset 0 2px 0 rgba(255,255,255,.6)}
  .hp-h{font-size:1.7rem;line-height:1;color:#d94b3a;
    text-shadow:0 2px 0 #8a2a1e,0 3px 4px rgba(0,0,0,.3);transition:transform .12s ease}
  .hp-h.off{color:#b8a888;text-shadow:0 2px 0 #8a7a5a}
  .hp-hit{animation:hp-hit .35s ease}
  @keyframes hp-hit{0%,100%{transform:scale(1)}30%{transform:scale(1.35) rotate(-8deg)}}
  @media(prefers-reduced-motion:reduce){.hp-hit{animation:none}}
  `;
  const el = document.createElement('style');
  el.textContent = css; document.head.appendChild(el);
}

export function mountHealth(parent: HTMLElement, o: HealthOptions = {}): HealthHandle {
  styles();
  const max = o.max ?? 3;
  let value = o.value ?? max;
  const root = document.createElement('div');
  root.className = 'hp-root';
  const hearts: HTMLElement[] = [];
  for (let i = 0; i < max; i++) {
    const h = document.createElement('span');
    h.className = 'hp-h'; h.textContent = '♥';
    root.appendChild(h); hearts.push(h);
  }
  parent.appendChild(root);

  const render = (hitIndex = -1) => {
    hearts.forEach((h, i) => {
      h.classList.toggle('off', i >= value);
      if (i === hitIndex) { h.classList.remove('hp-hit'); void h.offsetWidth; h.classList.add('hp-hit'); }
    });
  };
  render();

  return {
    root,
    set: (n) => { value = Math.max(0, Math.min(max, n)); render(); },
    damage: (step = 1) => { const old = value; value = Math.max(0, value - step); render(value); void old; return value; },
    heal: (step = 1) => { value = Math.min(max, value + step); render(); return value; },
    get: () => value,
    destroy: () => root.remove()
  };
}
