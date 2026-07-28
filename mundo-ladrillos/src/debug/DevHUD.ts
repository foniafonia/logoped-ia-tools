/**
 * DevHUD — etiqueta de estado COPIABLE + menú de SALTO a cualquier escena.
 *
 * Herramienta de trabajo (no de juego): sirve para que, jugando la build entregada,
 * el usuario pueda copiar de un toque "dónde estoy exactamente" (mundo, escena, tiempo,
 * posición, rumbo del personaje, audio, objetivo) y pegármelo en el chat para iterar en
 * ese punto concreto ("en la escena 12 Yehoshúa anda al revés"). Y un menú para saltar
 * al instante a cualquier tramo/escena y revisar cosas sin jugar todo seguido.
 *
 * Es TRANSVERSAL a los dos mundos del código:
 *   · el 0–5 (main.ts, Director + beats) publica `window.__estado` y `window.__destinos`.
 *   · el runner de tramos (runner.ts) los REEMPLAZA al tomar el lienzo.
 * El panel solo LEE esos hooks; no sabe nada del juego. Los saltos se hacen por
 * `location.hash` + recarga (universal desde cualquier punto, y respeta el gesto de
 * audio: al recargar, el botón "Empezar" ejecuta el salto elegido).
 */

export interface EstadoDev {
  mundo: string;          // p.ej. "5–10 · El Jordán y los espías"
  escena: string;         // p.ej. "Escena 10" o "Beat 4"
  titulo: string;         // título de la escena/beat
  t: number;              // segundos (del audio o de la escena)
  pos: [number, number];  // x, z del jugador
  rumbo: number;          // grados (0 = mirando al norte -z)
  audio: string;          // qué suena ahora
  objetivo: string;       // objetivo actual (texto)
}

export interface DestinoDev {
  key: string;            // clave para el hash (#go=<key>), p.ej. "b3" o "s10"
  grupo: string;          // encabezado ("0–5 · Apertura", "5–10 · El Jordán…")
  label: string;          // texto del ítem ("Beat 4 · ¡A recoger el campamento!")
}

declare global {
  interface Window {
    __estado?: () => EstadoDev;
    __destinos?: () => DestinoDev[];
  }
}

const rumboTxt = (g: number): string => {
  const n = ((Math.round(g) % 360) + 360) % 360;
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  return `${n}° (${dirs[Math.round(n / 45) % 8]})`;
};

/** Texto listo para pegar en el chat. */
function textoEstado(e: EstadoDev): string {
  return (
    `📍 JERICÓ · MUNDO ${e.mundo}\n` +
    `   ${e.escena} · «${e.titulo}»\n` +
    `   Tiempo: ${Math.round(e.t)}s\n` +
    `   Jugador: x=${e.pos[0]} z=${e.pos[1]} · rumbo ${rumboTxt(e.rumbo)}\n` +
    `   Audio: ${e.audio}\n` +
    `   Objetivo: ${e.objetivo || '—'}`
  );
}

/** Copia al portapapeles con respaldo (funciona también en file:// y sin permisos). */
function copiar(txt: string, ok: () => void): void {
  const fallback = (): void => {
    try {
      const ta = document.createElement('textarea');
      ta.value = txt;
      Object.assign(ta.style, { position: 'fixed', opacity: '0', top: '0', left: '0' } as CSSStyleDeclaration);
      document.body.appendChild(ta); ta.focus(); ta.select();
      document.execCommand('copy'); ta.remove(); ok();
    } catch { /* noop */ }
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(ok).catch(fallback);
  } else fallback();
}

let poll = 0;

/** Monta (o remonta) el panel DevHUD. Idempotente: quita el anterior y crea uno nuevo. */
export function installDevHUD(): void {
  document.getElementById('devhud')?.remove();
  if (poll) { clearInterval(poll); poll = 0; }

  const wrap = document.createElement('div');
  wrap.id = 'devhud';
  Object.assign(wrap.style, {
    position: 'fixed', top: '8px', right: '8px', zIndex: '80',
    font: '600 12px/1.35 ui-monospace, SFMono-Regular, Menlo, monospace',
    color: '#dfeffb', pointerEvents: 'none', userSelect: 'none'
  } as CSSStyleDeclaration);

  // ---- botón plegado (píldora discreta) ----
  const pill = document.createElement('button');
  pill.textContent = '🐞';
  Object.assign(pill.style, {
    pointerEvents: 'auto', cursor: 'pointer', border: '1px solid rgba(143,224,255,.5)',
    background: 'rgba(10,18,28,.72)', color: '#8fe0ff', borderRadius: '10px',
    padding: '6px 9px', font: '700 14px system-ui', backdropFilter: 'blur(3px)'
  } as CSSStyleDeclaration);

  // ---- panel abierto ----
  const panel = document.createElement('div');
  Object.assign(panel.style, {
    pointerEvents: 'auto', display: 'none', width: '232px',
    background: 'rgba(8,14,22,.86)', border: '1px solid rgba(143,224,255,.45)',
    borderRadius: '12px', padding: '9px 10px', boxShadow: '0 8px 22px rgba(0,0,0,.5)',
    backdropFilter: 'blur(4px)'
  } as CSSStyleDeclaration);

  const head = document.createElement('div');
  Object.assign(head.style, { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' } as CSSStyleDeclaration);
  const title = document.createElement('div');
  title.innerHTML = '<span style="color:#8fe0ff;font:800 12px system-ui;letter-spacing:1px">🐞 ESTADO · DEV</span>';
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  Object.assign(closeBtn.style, { pointerEvents: 'auto', cursor: 'pointer', border: 'none', background: 'transparent', color: '#9fb6c9', font: '700 13px system-ui' } as CSSStyleDeclaration);
  head.append(title, closeBtn);

  const body = document.createElement('div');
  Object.assign(body.style, { whiteSpace: 'pre-wrap', wordBreak: 'break-word', minHeight: '84px', color: '#e8f4ff' } as CSSStyleDeclaration);
  body.textContent = '(esperando estado…)';

  const btnRow = document.createElement('div');
  Object.assign(btnRow.style, { display: 'flex', gap: '6px', marginTop: '8px' } as CSSStyleDeclaration);
  const mkBtn = (t: string): HTMLButtonElement => {
    const b = document.createElement('button');
    b.textContent = t;
    Object.assign(b.style, {
      pointerEvents: 'auto', cursor: 'pointer', flex: '1', border: '1px solid rgba(143,224,255,.4)',
      background: 'rgba(20,40,60,.8)', color: '#dff3ff', borderRadius: '9px', padding: '7px 4px',
      font: '700 12px system-ui'
    } as CSSStyleDeclaration);
    return b;
  };
  const copyBtn = mkBtn('📋 Copiar');
  const jumpBtn = mkBtn('🎬 Ir a…');
  btnRow.append(copyBtn, jumpBtn);

  // ---- menú de salto (lista desplegable) ----
  const menu = document.createElement('div');
  Object.assign(menu.style, {
    display: 'none', marginTop: '8px', maxHeight: '46vh', overflowY: 'auto',
    borderTop: '1px solid rgba(143,224,255,.25)', paddingTop: '6px'
  } as CSSStyleDeclaration);

  panel.append(head, body, btnRow, menu);
  wrap.append(pill, panel);
  document.body.appendChild(wrap);

  // ---- lógica ----
  const abrir = (v: boolean): void => { panel.style.display = v ? 'block' : 'none'; pill.style.display = v ? 'none' : 'block'; };
  pill.addEventListener('click', () => abrir(true));
  closeBtn.addEventListener('click', () => { abrir(false); menu.style.display = 'none'; });
  abrir(false);

  copyBtn.addEventListener('click', () => {
    const e = window.__estado?.(); if (!e) return;
    copiar(textoEstado(e), () => {
      const prev = copyBtn.textContent; copyBtn.textContent = '✅ ¡Copiado!';
      setTimeout(() => { copyBtn.textContent = prev; }, 1100);
    });
  });

  let menuLleno = false;
  jumpBtn.addEventListener('click', () => {
    const abrirMenu = menu.style.display === 'none';
    menu.style.display = abrirMenu ? 'block' : 'none';
    if (abrirMenu && !menuLleno) {
      menuLleno = true;
      const dests = window.__destinos?.() ?? [];
      let grupoActual = '';
      for (const d of dests) {
        if (d.grupo !== grupoActual) {
          grupoActual = d.grupo;
          const g = document.createElement('div');
          g.textContent = d.grupo;
          Object.assign(g.style, { color: '#e8b04b', font: '800 11px system-ui', letterSpacing: '.5px', margin: '8px 0 3px' } as CSSStyleDeclaration);
          menu.appendChild(g);
        }
        const it = document.createElement('button');
        it.textContent = d.label;
        Object.assign(it.style, {
          pointerEvents: 'auto', cursor: 'pointer', display: 'block', width: '100%', textAlign: 'left',
          border: '1px solid rgba(143,224,255,.18)', background: 'rgba(18,30,44,.7)', color: '#dff3ff',
          borderRadius: '8px', padding: '6px 8px', margin: '2px 0', font: '600 11.5px system-ui'
        } as CSSStyleDeclaration);
        it.addEventListener('click', () => { location.hash = `#go=${d.key}`; location.reload(); });
        menu.appendChild(it);
      }
      if (!dests.length) { menu.textContent = '(sin destinos)'; }
    }
  });

  const render = (): void => {
    const e = window.__estado?.();
    if (!e) return;
    body.textContent =
      `🌍 ${e.mundo}\n` +
      `🎬 ${e.escena} · ${e.titulo}\n` +
      `⏱ ${Math.round(e.t)}s\n` +
      `🧍 x=${e.pos[0]} z=${e.pos[1]} · ${rumboTxt(e.rumbo)}\n` +
      `🔊 ${e.audio}\n` +
      `🎯 ${e.objetivo || '—'}`;
  };
  poll = setInterval(render, 300) as unknown as number;
  render();
}

/** Lee el destino pedido por hash (#go=<key>). Devuelve null si no hay. */
export function saltoPedido(): string | null {
  const m = /[#&]go=([a-z0-9_-]+)/i.exec(location.hash);
  return m ? m[1] : null;
}

/** Borra el hash de salto (para que una recarga normal no repita el salto). */
export function limpiarSalto(): void {
  try { history.replaceState(null, '', location.pathname + location.search); } catch { location.hash = ''; }
}
