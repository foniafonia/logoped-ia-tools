/**
 * Compass — indicador de OBJETIVO: una flecha que apunta a dónde ir y la distancia.
 * El LEAD calcula el ángulo (jugador→objetivo, relativo a cámara) y la distancia,
 * y los pasa cada frame. Útil en escenas abiertas ("¿por dónde voy?").
 *
 *   const comp = mountCompass(document.body, { label: 'Muralla' });
 *   // en el bucle:  comp.set(angleRad, distMetros);
 *   comp.hide();
 *
 * `angleRad`: 0 = objetivo hacia arriba (adelante); crece en sentido horario.
 */

export interface CompassOptions { label?: string; }
export interface CompassHandle {
  root: HTMLElement;
  set(angleRad: number, meters?: number): void;
  show(): void;
  hide(): void;
  destroy(): void;
}

let styled = false;
function styles(): void {
  if (styled) return;
  styled = true;
  const css = `
  .cp-root{position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:43;
    display:flex;align-items:center;gap:9px;padding:7px 14px 7px 9px;border-radius:14px;
    color:#4a2f13;font-weight:800;font-family:'Trebuchet MS','Segoe UI',system-ui,sans-serif;
    font-size:clamp(.82rem,2.4vw,1rem);font-variant-numeric:tabular-nums;
    background:linear-gradient(180deg,#f5e9d1,#e6d3ad);
    box-shadow:0 5px 0 #b79a6a,0 9px 16px rgba(0,0,0,.35),inset 0 2px 0 rgba(255,255,255,.7)}
  .cp-dial{position:relative;width:34px;height:34px;border-radius:50%;
    background:radial-gradient(circle at 50% 40%,#fff2d8,#d9c39a);
    box-shadow:inset 0 2px 4px rgba(0,0,0,.25),inset 0 -2px 3px rgba(255,255,255,.5)}
  .cp-arrow{position:absolute;left:50%;top:50%;width:0;height:0;
    transform-origin:50% 50%;transition:transform .12s ease;
    border-left:7px solid transparent;border-right:7px solid transparent;
    border-bottom:17px solid #e0684a;margin:-11px 0 0 -7px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
  .cp-lbl{display:flex;flex-direction:column;line-height:1.05}
  .cp-lbl b{font-size:.62em;letter-spacing:.16em;text-transform:uppercase;opacity:.6;font-weight:800}
  .cp-hide{display:none}
  @media(prefers-reduced-motion:reduce){.cp-arrow{transition:none}}
  `;
  const el = document.createElement('style');
  el.textContent = css; document.head.appendChild(el);
}

export function mountCompass(parent: HTMLElement, o: CompassOptions = {}): CompassHandle {
  styles();
  const root = document.createElement('div');
  root.className = 'cp-root';
  const dial = document.createElement('div');
  dial.className = 'cp-dial';
  const arrow = document.createElement('div');
  arrow.className = 'cp-arrow';
  dial.appendChild(arrow);
  const lbl = document.createElement('div');
  lbl.className = 'cp-lbl';
  const cap = document.createElement('b');
  cap.textContent = o.label ?? 'Objetivo';
  const dist = document.createElement('span');
  dist.textContent = '';
  lbl.append(cap, dist);
  root.append(dial, lbl);
  parent.appendChild(root);

  return {
    root,
    set: (angleRad, meters) => {
      // la flecha base apunta hacia ABAJO (border-bottom); girar 180°+ángulo para
      // que 0 rad = hacia arriba (adelante)
      arrow.style.transform = `rotate(${angleRad + Math.PI}rad)`;
      if (meters != null) dist.textContent = `${Math.round(meters)} m`;
    },
    show: () => root.classList.remove('cp-hide'),
    hide: () => root.classList.add('cp-hide'),
    destroy: () => root.remove()
  };
}
