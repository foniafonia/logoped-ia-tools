import { brickButton } from './BrickUI';

/**
 * Credits — pantalla de CRÉDITOS del juego (cierra el flujo de menú de la portada).
 * Lista de secciones con roles/nombres y un botón Cerrar. Estética de ladrillo.
 *
 *   mountCredits(document.body, {
 *     sections: [{ role: 'Un juego de', names: ['Shevet Ahim'] }, ...],
 *     onClose: () => volverAPortada(),
 *   });
 */

export interface CreditSection { role: string; names: string[]; }
export interface CreditsOptions {
  title?: string;
  sections?: CreditSection[];
  onClose?: () => void;
}

const DEFAULT: CreditSection[] = [
  { role: 'Un juego de', names: ['Shevet Ahim'] },
  { role: 'Basado en', names: ['La Caída de Jericó'] },
  { role: 'Personajes y arte', names: ['Taller de ladrillos'] },
  { role: 'Gracias', names: ['A quienes rodean la muralla'] }
];

let styled = false;
function styles(): void {
  if (styled) return;
  styled = true;
  const css = `
  .cr-root{position:fixed;inset:0;z-index:66;display:flex;align-items:center;
    justify-content:center;background:rgba(12,8,3,.72);backdrop-filter:blur(3px);
    font-family:'Trebuchet MS','Segoe UI',system-ui,sans-serif;animation:cr-fade .25s ease both}
  .cr-card{display:flex;flex-direction:column;gap:8px;width:min(90vw,380px);max-height:82vh;
    padding:24px;border-radius:18px;background:linear-gradient(180deg,#f5e9d1,#e5d1ab);
    box-shadow:0 14px 0 #b79a6a,0 24px 40px rgba(0,0,0,.5),inset 0 3px 0 rgba(255,255,255,.7);
    animation:cr-pop .3s cubic-bezier(.2,.9,.25,1) both}
  .cr-title{margin:0 0 8px;text-align:center;color:#5a3a18;font-weight:800;
    font-size:1.6rem;text-transform:uppercase;letter-spacing:.06em}
  .cr-list{overflow:auto;display:flex;flex-direction:column;gap:14px;padding:2px 2px 6px}
  .cr-sec{text-align:center}
  .cr-role{font-size:.7rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase;
    color:#a5651c;opacity:.85}
  .cr-name{color:#3a2410;font-weight:800;font-size:1.1rem}
  .cr-card .bui-btn{width:100%;margin-top:6px}
  @keyframes cr-fade{from{opacity:0}to{opacity:1}}
  @keyframes cr-pop{from{opacity:0;transform:translateY(14px) scale(.96)}to{opacity:1;transform:none}}
  @media(prefers-reduced-motion:reduce){.cr-root,.cr-card{animation:none}}
  `;
  const el = document.createElement('style');
  el.textContent = css; document.head.appendChild(el);
}

export function mountCredits(parent: HTMLElement, o: CreditsOptions = {}): { destroy(): void } {
  styles();
  const root = document.createElement('div');
  root.className = 'cr-root';
  const card = document.createElement('div');
  card.className = 'cr-card';

  const h = document.createElement('h2');
  h.className = 'cr-title';
  h.textContent = o.title ?? 'Créditos';
  card.appendChild(h);

  const list = document.createElement('div');
  list.className = 'cr-list';
  (o.sections ?? DEFAULT).forEach((s) => {
    const sec = document.createElement('div');
    sec.className = 'cr-sec';
    const role = document.createElement('div');
    role.className = 'cr-role';
    role.textContent = s.role;
    sec.appendChild(role);
    s.names.forEach((n) => {
      const nm = document.createElement('div');
      nm.className = 'cr-name';
      nm.textContent = n;
      sec.appendChild(nm);
    });
    list.appendChild(sec);
  });
  card.appendChild(list);

  const destroy = () => root.remove();
  card.appendChild(brickButton({ label: 'Cerrar', variant: 'primary', onClick: () => { destroy(); o.onClose?.(); } }));

  root.appendChild(card);
  root.addEventListener('click', (e) => { if (e.target === root) { destroy(); o.onClose?.(); } });
  parent.appendChild(root);
  return { destroy };
}
