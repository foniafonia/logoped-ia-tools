/**
 * Tutorial — onboarding guiado para peques: ilumina un control (foco tipo
 * "spotlight") y muestra un consejo corto. Avanza al tocar. Ideal para explicar
 * el joystick y el botón de interacción la primera vez.
 *
 *   showTutorial(document.body, [
 *     { target: '.gc-stick', text: 'Arrastra aquí para MOVERTE' },
 *     { target: '.gc-e',     text: 'Pulsa la mano para HABLAR o actuar' },
 *   ], () => marcarTutorialVisto());
 *
 * Si un `target` no existe, ese paso se salta. Sin target → consejo centrado.
 */

export interface TutorialStep { target?: string; text: string; }

let styled = false;
function styles(): void {
  if (styled) return;
  styled = true;
  const css = `
  .tu-root{position:fixed;inset:0;z-index:75;cursor:pointer;
    font-family:'Trebuchet MS','Segoe UI',system-ui,sans-serif;animation:tu-fade .25s ease both}
  .tu-hole{position:absolute;border-radius:20px;
    box-shadow:0 0 0 9999px rgba(12,8,3,.72);
    outline:3px dashed #ffd482;outline-offset:5px;transition:all .25s ease}
  .tu-ring{position:absolute;border-radius:50%;border:3px solid #ffd482;
    animation:tu-pulse 1.3s ease-in-out infinite;pointer-events:none}
  .tu-bubble{position:absolute;max-width:min(80vw,320px);padding:14px 18px;border-radius:14px;
    color:#3a2410;font-weight:800;font-size:clamp(1rem,3vw,1.2rem);text-align:center;
    background:linear-gradient(180deg,#f5e9d1,#e6d3ad);
    box-shadow:0 8px 0 #b79a6a,0 14px 24px rgba(0,0,0,.45),inset 0 2px 0 rgba(255,255,255,.7);
    animation:tu-pop .3s cubic-bezier(.2,.9,.25,1) both}
  .tu-bubble small{display:block;margin-top:8px;font-size:.72em;font-weight:700;
    letter-spacing:.1em;text-transform:uppercase;color:#8a5a1e;opacity:.8}
  @keyframes tu-fade{from{opacity:0}to{opacity:1}}
  @keyframes tu-pop{from{opacity:0;transform:translateY(10px) scale(.96)}to{opacity:1;transform:none}}
  @keyframes tu-pulse{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.12);opacity:.5}}
  @media(prefers-reduced-motion:reduce){.tu-root,.tu-bubble,.tu-ring{animation:none}}
  `;
  const el = document.createElement('style');
  el.textContent = css; document.head.appendChild(el);
}

export function showTutorial(parent: HTMLElement, steps: TutorialStep[], onDone?: () => void): { destroy(): void } {
  styles();
  const root = document.createElement('div');
  root.className = 'tu-root';
  const hole = document.createElement('div');
  hole.className = 'tu-hole';
  const ring = document.createElement('div');
  ring.className = 'tu-ring';
  const bubble = document.createElement('div');
  bubble.className = 'tu-bubble';
  root.append(hole, ring, bubble);
  parent.appendChild(root);

  let i = 0;
  const destroy = (): void => root.remove();

  const layout = (): void => {
    const step = steps[i];
    bubble.innerHTML = '';
    bubble.appendChild(document.createTextNode(step.text));
    const hint = document.createElement('small');
    hint.textContent = i < steps.length - 1 ? 'Toca para seguir' : 'Toca para empezar';
    bubble.appendChild(hint);

    const el = step.target ? parent.ownerDocument.querySelector(step.target) as HTMLElement | null : null;
    if (el) {
      const r = el.getBoundingClientRect();
      const pad = 8;
      hole.style.display = 'block'; ring.style.display = 'block';
      hole.style.left = `${r.left - pad}px`; hole.style.top = `${r.top - pad}px`;
      hole.style.width = `${r.width + pad * 2}px`; hole.style.height = `${r.height + pad * 2}px`;
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const rad = Math.max(r.width, r.height) / 2 + 14;
      ring.style.left = `${cx - rad}px`; ring.style.top = `${cy - rad}px`;
      ring.style.width = ring.style.height = `${rad * 2}px`;
      // burbuja: encima si el objetivo está abajo, si no debajo
      const below = cy < innerHeight / 2;
      bubble.style.left = '50%'; bubble.style.transform = 'translateX(-50%)';
      if (below) bubble.style.top = `${r.bottom + 24}px`, bubble.style.bottom = 'auto';
      else bubble.style.bottom = `${innerHeight - r.top + 24}px`, bubble.style.top = 'auto';
    } else {
      // sin objetivo: oscurece todo y centra el consejo
      hole.style.display = 'none'; ring.style.display = 'none';
      root.style.background = 'rgba(12,8,3,.72)';
      bubble.style.left = '50%'; bubble.style.top = '50%';
      bubble.style.transform = 'translate(-50%,-50%)'; bubble.style.bottom = 'auto';
    }
  };

  const next = (): void => {
    i++;
    if (i >= steps.length) { destroy(); onDone?.(); return; }
    // salta pasos cuyo objetivo no existe
    if (steps[i].target && !parent.ownerDocument.querySelector(steps[i].target!)) { next(); return; }
    layout();
  };

  root.addEventListener('click', next);
  // primer paso válido
  if (steps[0]?.target && !parent.ownerDocument.querySelector(steps[0].target)) next();
  else layout();

  return { destroy };
}
