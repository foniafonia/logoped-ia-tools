/**
 * StealthMeter — indicador de SIGILO/detección para las escenas de los espías
 * (colarse en Jericó). Un ojo que se llena de rojo según te ven; al 100% =
 * ¡descubierto! Estados: oculto (verde), sospecha (ámbar), alerta (rojo).
 *
 *   const eye = mountStealth(document.body);
 *   eye.set(0.3);            // 0..1 nivel de detección
 *   eye.onSpotted(() => reiniciar());   // se dispara al llegar a 1
 */

export interface StealthOptions { onSpotted?: () => void; }
export interface StealthHandle {
  root: HTMLElement;
  set(level: number): void;
  get(): number;
  destroy(): void;
}

let styled = false;
function styles(): void {
  if (styled) return;
  styled = true;
  const css = `
  .sm-root{position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:44;
    display:flex;align-items:center;gap:9px;padding:7px 14px 7px 9px;border-radius:14px;
    font-family:'Trebuchet MS','Segoe UI',system-ui,sans-serif;font-weight:800;
    color:#f3e2c4;font-size:.82rem;letter-spacing:.12em;text-transform:uppercase;
    background:rgba(20,12,4,.6);box-shadow:0 4px 10px rgba(0,0,0,.4);backdrop-filter:blur(2px);
    transition:box-shadow .2s ease}
  .sm-eye{position:relative;width:30px;height:30px;border-radius:50%;overflow:hidden;
    background:#2a3a2a;box-shadow:inset 0 2px 4px rgba(0,0,0,.4)}
  .sm-fill{position:absolute;left:0;bottom:0;width:100%;height:0%;
    background:linear-gradient(#ffb03a,#e0402a);transition:height .18s ease}
  .sm-pupil{position:absolute;left:50%;top:50%;width:11px;height:11px;margin:-5.5px 0 0 -5.5px;
    border-radius:50%;background:#12160f;box-shadow:0 0 0 3px rgba(255,255,255,.85)}
  .sm-lbl{min-width:78px;text-align:left}
  .sm-alert{box-shadow:0 0 18px rgba(224,64,42,.8);animation:sm-al .5s steps(2) infinite}
  @keyframes sm-al{50%{opacity:.6}}
  @media(prefers-reduced-motion:reduce){.sm-alert{animation:none}}
  `;
  const el = document.createElement('style');
  el.textContent = css; document.head.appendChild(el);
}

export function mountStealth(parent: HTMLElement, o: StealthOptions = {}): StealthHandle {
  styles();
  const root = document.createElement('div');
  root.className = 'sm-root';
  const eye = document.createElement('div');
  eye.className = 'sm-eye';
  const fill = document.createElement('div');
  fill.className = 'sm-fill';
  const pupil = document.createElement('div');
  pupil.className = 'sm-pupil';
  eye.append(fill, pupil);
  const lbl = document.createElement('div');
  lbl.className = 'sm-lbl';
  root.append(eye, lbl);
  parent.appendChild(root);

  let level = 0, spotted = false;
  const render = () => {
    const pct = Math.round(level * 100);
    fill.style.height = `${pct}%`;
    if (level >= 1) { lbl.textContent = '¡Descubierto!'; root.classList.add('sm-alert'); }
    else if (level > 0.5) { lbl.textContent = 'Sospecha'; root.classList.remove('sm-alert'); }
    else { lbl.textContent = 'Oculto'; root.classList.remove('sm-alert'); }
  };
  render();

  return {
    root,
    set: (lv) => {
      level = Math.max(0, Math.min(1, lv));
      render();
      if (level >= 1 && !spotted) { spotted = true; o.onSpotted?.(); }
      if (level < 1) spotted = false;
    },
    get: () => level,
    destroy: () => root.remove()
  };
}
