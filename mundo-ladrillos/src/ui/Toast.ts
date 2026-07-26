/**
 * Toast — avisos emergentes apilables (recogiste algo, tramo desbloqueado, pista).
 * Estética de ladrillo. Aparecen arriba-centro, se apilan y se van solos.
 *
 *   toast('¡Reliquia conseguida!', { icon: '🏺', variant: 'primary' });
 *   toast('Tramo desbloqueado', { icon: '🔓' });
 */

export type ToastVariant = 'primary' | 'stone' | 'accent';
export interface ToastOptions { icon?: string; variant?: ToastVariant; ms?: number; }

let styled = false;
let host: HTMLElement | null = null;
function ensure(): HTMLElement {
  if (!styled) {
    styled = true;
    const css = `
    .tt-host{position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:70;
      display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none;
      font-family:'Trebuchet MS','Segoe UI',system-ui,sans-serif}
    .tt{display:flex;align-items:center;gap:10px;padding:11px 17px;border-radius:12px;
      color:#3a2410;font-weight:800;font-size:clamp(.9rem,2.6vw,1.05rem);white-space:nowrap;
      background:linear-gradient(180deg,#f5e9d1,#e6d3ad);
      box-shadow:0 5px 0 #b79a6a,0 10px 18px rgba(0,0,0,.4),inset 0 2px 0 rgba(255,255,255,.7);
      animation:tt-in .3s cubic-bezier(.2,.9,.25,1) both}
    .tt.tt-out{animation:tt-out .3s ease forwards}
    .tt-primary{background:linear-gradient(180deg,#ffd482,#f2b64a);box-shadow:0 5px 0 #a5651c,0 10px 18px rgba(0,0,0,.4),inset 0 2px 0 rgba(255,255,255,.6)}
    .tt-accent{background:linear-gradient(180deg,#f08c72,#e0684a);color:#fff;box-shadow:0 5px 0 #953621,0 10px 18px rgba(0,0,0,.4),inset 0 2px 0 rgba(255,255,255,.35)}
    .tt-ico{font-size:1.3em;line-height:1}
    @keyframes tt-in{from{opacity:0;transform:translateY(-14px) scale(.94)}to{opacity:1;transform:none}}
    @keyframes tt-out{to{opacity:0;transform:translateY(-10px) scale(.96)}}
    @media(prefers-reduced-motion:reduce){.tt,.tt.tt-out{animation:none}}
    `;
    const el = document.createElement('style');
    el.textContent = css; document.head.appendChild(el);
  }
  if (!host || !host.isConnected) {
    host = document.createElement('div');
    host.className = 'tt-host';
    document.body.appendChild(host);
  }
  return host;
}

export function toast(message: string, o: ToastOptions = {}): void {
  const h = ensure();
  const t = document.createElement('div');
  t.className = `tt tt-${o.variant ?? 'stone'}`;
  if (o.icon) {
    const ic = document.createElement('span');
    ic.className = 'tt-ico'; ic.textContent = o.icon; t.appendChild(ic);
  }
  t.appendChild(document.createTextNode(message));
  h.appendChild(t);
  const ms = o.ms ?? 2400;
  setTimeout(() => {
    t.classList.add('tt-out');
    setTimeout(() => t.remove(), 320);
  }, ms);
}
