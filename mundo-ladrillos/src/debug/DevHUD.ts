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

/** Texto listo para pegar en el chat. `tester` = quién juega (Papá, el niño…). */
function textoEstado(e: EstadoDev, tester?: string): string {
  return (
    `📍 JERICÓ · MUNDO ${e.mundo}${tester ? ` · 👤 ${tester}` : ''}\n` +
    `   ${e.escena} · «${e.titulo}»\n` +
    `   Tiempo: ${Math.round(e.t)}s\n` +
    `   Jugador: x=${e.pos[0]} z=${e.pos[1]} · rumbo ${rumboTxt(e.rumbo)}\n` +
    `   Audio: ${e.audio}\n` +
    `   Objetivo: ${e.objetivo || '—'}`
  );
}

const NOTAS_KEY = 'jerico_notas_v1';
const TESTER_KEY = 'jerico_tester_v1';

/** Lote de notas listo para pegar en el chat. Cada nota lleva TODO lo del panel
 *  (mundo, escena, tiempo, posición+rumbo, audio, objetivo) + el texto apuntado.
 *  `tester` = quién juega (Papá, el niño…), para saber de dónde viene cada opinión. */
function textoNotas(notas: Array<{ e: EstadoDev; txt: string }>, tester?: string): string {
  const linea = (e: EstadoDev, i: number, txt: string): string =>
    `${i}) 🌍 ${e.mundo}\n` +
    `   🎬 ${e.escena} «${e.titulo}»\n` +
    `   ⏱ ${Math.round(e.t)}s · 🧍 x=${e.pos[0]} z=${e.pos[1]} · ${rumboTxt(e.rumbo)}\n` +
    `   🔊 ${e.audio}\n` +
    `   🎯 ${e.objetivo || '—'}\n` +
    `   📝 → ${txt || '(sin texto)'}`;
  const cab = `📋 NOTAS DE JUEGO${tester ? ` · 👤 ${tester}` : ''} (${notas.length}):`;
  return `${cab}\n\n` + notas.map((n, i) => linea(n.e, i + 1, n.txt)).join('\n\n');
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

/**
 * Modal de ANOTAR con voz (para que un niño no tenga que teclear). Dos vías:
 *  - 🎤 Dictar: transcripción del navegador (SpeechRecognition; Chrome + internet).
 *  - 🔴 Grabar voz: MediaRecorder → descarga un audio para pasárselo a Claude
 *    (funciona offline; sirve de respaldo si el dictado no está o el micro se bloquea).
 * Escribir a mano siempre funciona. `onSave(txt, voz?)` recibe el texto y, si grabó,
 * el nombre del audio descargado (se añade al texto como "[voz: ...]").
 */
function abrirModalNota(e: EstadoDev, onSave: (txt: string, voz?: string) => void): void {
  const SR = (window as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition
    || (window as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
  const ov = document.createElement('div');
  Object.assign(ov.style, { position: 'fixed', inset: '0', zIndex: '95', background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' } as CSSStyleDeclaration);
  const card = document.createElement('div');
  Object.assign(card.style, { width: 'min(92vw,430px)', background: '#0c1622', border: '1px solid rgba(143,224,255,.5)', borderRadius: '14px', padding: '14px', boxShadow: '0 12px 40px rgba(0,0,0,.6)', color: '#e8f4ff' } as CSSStyleDeclaration);
  const head = document.createElement('div');
  head.textContent = `📝 Nota · ${e.escena} «${e.titulo}»`;
  Object.assign(head.style, { font: '800 13px system-ui', color: '#8fe0ff', marginBottom: '8px' } as CSSStyleDeclaration);
  const ta = document.createElement('textarea');
  ta.placeholder = 'Escribe la nota… o pulsa 🎤 para dictar / 🔴 para grabar tu voz';
  Object.assign(ta.style, { width: '100%', minHeight: '84px', resize: 'vertical', borderRadius: '8px', border: '1px solid rgba(143,224,255,.35)', background: '#0a1420', color: '#eaf6ff', font: '500 14px system-ui', padding: '8px', boxSizing: 'border-box' } as CSSStyleDeclaration);
  const status = document.createElement('div');
  Object.assign(status.style, { minHeight: '16px', margin: '6px 2px', color: '#e8b04b', font: '700 12px system-ui' } as CSSStyleDeclaration);
  const btns = document.createElement('div');
  Object.assign(btns.style, { display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px', alignItems: 'center' } as CSSStyleDeclaration);
  const mk = (t: string): HTMLButtonElement => { const b = document.createElement('button'); b.textContent = t; Object.assign(b.style, { cursor: 'pointer', border: '1px solid rgba(143,224,255,.4)', background: 'rgba(20,40,60,.8)', color: '#dff3ff', borderRadius: '9px', padding: '8px 10px', font: '700 13px system-ui' } as CSSStyleDeclaration); return b; };
  let voz: string | undefined;

  // --- 🎤 Dictar (SpeechRecognition) ---
  const dictBtn = mk('🎤 Dictar');
  let rec: { stop: () => void; start: () => void } | null = null; let dicting = false;
  if (SR) {
    dictBtn.addEventListener('click', () => {
      if (dicting && rec) { try { rec.stop(); } catch { /* noop */ } return; }
      const R = new (SR as new () => any)();
      R.lang = 'es-ES'; R.interimResults = true; R.continuous = true;
      const base = ta.value ? ta.value + ' ' : '';
      R.onresult = (ev: any): void => { let s = ''; for (let i = ev.resultIndex; i < ev.results.length; i++) s += ev.results[i][0].transcript; ta.value = base + s; };
      R.onerror = (ev: any): void => { status.textContent = '⚠️ ' + (ev.error === 'not-allowed' ? 'micrófono bloqueado — escribe o graba' : 'no se pudo dictar'); };
      R.onend = (): void => { dicting = false; dictBtn.textContent = '🎤 Dictar'; };
      try { R.start(); rec = R; dicting = true; dictBtn.textContent = '⏹ Parar'; status.textContent = '🔴 Escuchando… habla ahora'; } catch { status.textContent = '⚠️ no se pudo iniciar el dictado'; }
    });
  } else { dictBtn.disabled = true; dictBtn.style.opacity = '.4'; dictBtn.title = 'Este navegador no transcribe voz'; }

  // --- 🔴 Grabar voz (MediaRecorder) → descarga un audio para enviármelo ---
  const recBtn = mk('🔴 Grabar voz');
  let mr: any = null; let recording = false;
  const hasMR = typeof (window as any).MediaRecorder !== 'undefined' && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  if (hasMR) {
    recBtn.addEventListener('click', async () => {
      if (recording && mr) { try { mr.stop(); } catch { /* noop */ } return; }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const M = new (window as any).MediaRecorder(stream); const chunks: BlobPart[] = [];
        M.ondataavailable = (ev: any): void => { if (ev.data && ev.data.size) chunks.push(ev.data); };
        M.onstop = (): void => {
          stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
          const type = M.mimeType || 'audio/webm'; const ext = type.includes('ogg') ? 'ogg' : 'webm';
          const name = `voz_jerico_${Date.now()}.${ext}`;
          const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(chunks, { type })); a.download = name; a.click();
          voz = name; status.textContent = `💾 ${name} descargado — adjúntamelo en el chat`;
          recBtn.textContent = '🔴 Grabar voz'; recording = false;
        };
        M.start(); mr = M; recording = true; recBtn.textContent = '⏹ Parar y guardar'; status.textContent = '🔴 Grabando tu voz…';
      } catch { status.textContent = '⚠️ micrófono bloqueado (archivo local): ábrelo por un servidor local o escribe la nota.'; }
    });
  } else { recBtn.disabled = true; recBtn.style.opacity = '.4'; }

  const saveBtn = mk('✅ Guardar'); saveBtn.style.marginLeft = 'auto';
  const cancelBtn = mk('Cancelar');
  const cerrar = (): void => { try { rec?.stop(); } catch { /* noop */ } try { if (mr && recording) mr.stop(); } catch { /* noop */ } ov.remove(); };
  saveBtn.addEventListener('click', () => { onSave(ta.value.trim(), voz); cerrar(); });
  cancelBtn.addEventListener('click', cerrar);
  ov.addEventListener('click', (ev) => { if (ev.target === ov) cerrar(); });

  btns.append(dictBtn, recBtn, cancelBtn, saveBtn);
  card.append(head, ta, status, btns); ov.append(card); document.body.appendChild(ov);
  ta.focus();
}

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

  // ---- fila 2: CUADERNO DE NOTAS (apuntar jugando, copiar el lote al final) ----
  const noteRow = document.createElement('div');
  Object.assign(noteRow.style, { display: 'flex', gap: '6px', marginTop: '6px' } as CSSStyleDeclaration);
  const noteBtn = mkBtn('📝 Anotar');
  const listBtn = mkBtn('📋 Notas');
  const clearBtn = mkBtn('🗑');
  clearBtn.style.flex = '0 0 auto';
  noteRow.append(noteBtn, listBtn, clearBtn);

  // ---- menú de salto (lista desplegable) ----
  const menu = document.createElement('div');
  Object.assign(menu.style, {
    display: 'none', marginTop: '8px', maxHeight: '46vh', overflowY: 'auto',
    borderTop: '1px solid rgba(143,224,255,.25)', paddingTop: '6px'
  } as CSSStyleDeclaration);

  panel.append(head, body, btnRow, noteRow, menu);
  wrap.append(pill, panel);
  document.body.appendChild(wrap);

  // ---- notas: persisten entre recargas (localStorage; si file:// lo bloquea, quedan en memoria) ----
  interface Nota { e: EstadoDev; txt: string }
  let notas: Nota[] = [];
  try { notas = JSON.parse(localStorage.getItem(NOTAS_KEY) || '[]'); } catch { notas = []; }
  const guardar = (): void => { try { localStorage.setItem(NOTAS_KEY, JSON.stringify(notas)); } catch { /* file:// sin storage: se mantienen en memoria esta sesión */ } };
  const refrescarContador = (): void => { listBtn.textContent = notas.length ? `📋 Notas·${notas.length}` : '📋 Notas'; };
  refrescarContador();

  // ---- QUIÉN JUEGA: etiqueta que acompaña a las notas (Papá / el niño / otro ordenador) ----
  let tester = '';
  try { tester = localStorage.getItem(TESTER_KEY) || ''; } catch { tester = ''; }
  const whoBtn = document.createElement('button');
  Object.assign(whoBtn.style, {
    pointerEvents: 'auto', cursor: 'pointer', width: '100%', textAlign: 'left',
    border: '1px dashed rgba(143,224,255,.45)', background: 'rgba(20,40,60,.5)', color: '#cfe8ff',
    borderRadius: '8px', padding: '5px 8px', margin: '0 0 6px', font: '700 11.5px system-ui'
  } as CSSStyleDeclaration);
  const refrescarWho = (): void => { whoBtn.textContent = `👤 Quién juega: ${tester || '(toca para poner el nombre)'}`; };
  refrescarWho();
  whoBtn.addEventListener('click', () => {
    const t = prompt('👤 ¿Quién está jugando? (p.ej. Papá, o el nombre del niño)', tester);
    if (t === null) return;
    tester = t.trim();
    try { localStorage.setItem(TESTER_KEY, tester); } catch { /* file:// sin storage: queda en memoria */ }
    refrescarWho();
  });
  panel.insertBefore(whoBtn, body);

  noteBtn.addEventListener('click', () => {
    const e = window.__estado?.(); if (!e) return;
    abrirModalNota(e, (txt, voz) => {
      const t = voz ? (txt ? `${txt} [voz: ${voz}]` : `[voz adjunta: ${voz}]`) : txt;
      notas.push({ e, txt: t });
      guardar(); refrescarContador();
      const prev = noteBtn.textContent; noteBtn.textContent = '✅ Anotado'; setTimeout(() => { noteBtn.textContent = prev; }, 900);
    });
  });
  listBtn.addEventListener('click', () => {
    if (!notas.length) { const p = listBtn.textContent; listBtn.textContent = '(vacío)'; setTimeout(() => { listBtn.textContent = p; }, 900); return; }
    copiar(textoNotas(notas, tester), () => {
      const p = listBtn.textContent; listBtn.textContent = '✅ ¡Copiadas!'; setTimeout(() => { listBtn.textContent = p as string; refrescarContador(); }, 1100);
    });
  });
  clearBtn.addEventListener('click', () => {
    if (!notas.length) return;
    if (confirm(`¿Borrar las ${notas.length} notas apuntadas?`)) { notas = []; guardar(); refrescarContador(); }
  });

  // ---- lógica ----
  const abrir = (v: boolean): void => { panel.style.display = v ? 'block' : 'none'; pill.style.display = v ? 'none' : 'block'; };
  pill.addEventListener('click', () => abrir(true));
  closeBtn.addEventListener('click', () => { abrir(false); menu.style.display = 'none'; });
  abrir(false);

  copyBtn.addEventListener('click', () => {
    const e = window.__estado?.(); if (!e) return;
    copiar(textoEstado(e, tester), () => {
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
