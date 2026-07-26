import { ensureBrickStyles } from './BrickUI';

/**
 * DialogueBox — cartelas de diálogo/narración con estética de ladrillo y efecto
 * máquina de escribir. Pensado para la peli-juego: poco diálogo pero con peso,
 * sobre mucha acción visual (los "silencios" se narran con cartelas cortas).
 *
 *   const dlg = mountDialogue(document.body);
 *   dlg.play([
 *     { speaker: 'Yehoshúa', text: 'Rodearemos la ciudad siete veces.', color: '#4a7fd0' },
 *     { speaker: 'Narrador',  text: 'Y al séptimo día, tocaron el shofar.' },
 *   ], () => empezarClimax());     // callback al terminar la cola
 *   // avanzar: clic en la caja, o dlg.next()
 *
 * Cartela de transición (centro, sin bocadillo):  showTitleCard(parent, 'Siete días después…')
 */

export interface DialogueLine {
  speaker?: string;
  text: string;
  /** Color del nombre (identidad del personaje). Def. dorado. */
  color?: string;
}

export interface DialogueHandle {
  root: HTMLElement;
  play(lines: DialogueLine[], onDone?: () => void): void;
  next(): void;          // completa el texto o pasa a la siguiente línea
  hide(): void;
  destroy(): void;
}

let styled = false;
function styles(): void {
  if (styled) return;
  styled = true;
  const css = `
  .dlg-root{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);
    z-index:55;width:min(92vw,680px);display:none;cursor:pointer;
    font-family:'Trebuchet MS','Segoe UI',system-ui,sans-serif}
  .dlg-root.dlg-on{display:block;animation:dlg-rise .28s cubic-bezier(.2,.9,.25,1) both}
  .dlg-name{display:inline-block;margin:0 0 -6px 14px;padding:5px 16px 9px;
    font-weight:800;font-size:1rem;letter-spacing:.03em;color:#fff;
    background:var(--dlg-c,#c8922f);border-radius:11px 11px 0 0;
    box-shadow:0 4px 0 rgba(0,0,0,.28),inset 0 2px 0 rgba(255,255,255,.35)}
  .dlg-body{position:relative;min-height:74px;color:#3a2410;font-weight:600;
    font-size:clamp(1rem,2.8vw,1.22rem);line-height:1.42}
  .dlg-text{white-space:pre-wrap}
  .dlg-caret{display:inline-block;width:.6em}
  .dlg-more{position:absolute;right:14px;bottom:8px;color:#8a5a1e;
    font-size:1.1rem;opacity:0;animation:dlg-blink 1s steps(2) infinite}
  .dlg-more.on{opacity:1}
  @keyframes dlg-rise{from{opacity:0;transform:translate(-50%,14px)}
    to{opacity:1;transform:translate(-50%,0)}}
  @keyframes dlg-blink{50%{opacity:.15}}
  /* Cartela de transición centrada */
  .dlg-card{position:fixed;inset:0;z-index:58;display:flex;align-items:center;
    justify-content:center;background:rgba(12,8,3,.72);
    font-family:'Trebuchet MS','Segoe UI',system-ui,sans-serif;
    animation:dlg-fade .5s ease both}
  .dlg-card span{color:#ffe7bd;font-weight:800;text-align:center;padding:0 24px;
    font-size:clamp(1.5rem,5vw,2.6rem);letter-spacing:.04em;
    text-shadow:0 2px 0 #7a4718,0 4px 18px rgba(0,0,0,.6);
    animation:dlg-card-in .8s cubic-bezier(.2,.9,.25,1) both}
  @keyframes dlg-fade{from{opacity:0}to{opacity:1}}
  @keyframes dlg-card-in{from{opacity:0;transform:translateY(14px) scale(.97)}
    to{opacity:1;transform:none}}
  @media(prefers-reduced-motion:reduce){
    .dlg-root.dlg-on,.dlg-card,.dlg-card span{animation:none}
    .dlg-more{animation:none}}
  `;
  const el = document.createElement('style');
  el.textContent = css;
  document.head.appendChild(el);
}

export function mountDialogue(parent: HTMLElement): DialogueHandle {
  ensureBrickStyles(); // reutiliza el panel de ladrillo
  styles();

  const root = document.createElement('div');
  root.className = 'dlg-root';
  const name = document.createElement('div');
  name.className = 'dlg-name';
  const body = document.createElement('div');
  body.className = 'bui-panel dlg-body';
  const text = document.createElement('span');
  text.className = 'dlg-text';
  const more = document.createElement('div');
  more.className = 'dlg-more';
  more.textContent = '▼';
  body.append(text, more);
  root.append(name, body);
  parent.appendChild(root);

  let queue: DialogueLine[] = [];
  let idx = 0;
  let full = '';
  let ch = 0;
  let timer: ReturnType<typeof setInterval> | null = null;
  let done: (() => void) | undefined;

  const stopTimer = (): void => { if (timer) { clearInterval(timer); timer = null; } };

  const showLine = (line: DialogueLine): void => {
    stopTimer();
    name.textContent = line.speaker ?? '';
    name.style.display = line.speaker ? 'inline-block' : 'none';
    root.style.setProperty('--dlg-c', line.color ?? '#c8922f');
    full = line.text; ch = 0; text.textContent = '';
    more.classList.remove('on');
    timer = setInterval(() => {
      ch++;
      text.textContent = full.slice(0, ch);
      if (ch >= full.length) { stopTimer(); more.classList.add('on'); }
    }, 28);
  };

  const advance = (): void => {
    // si aún escribe, completa la línea de golpe
    if (timer) { stopTimer(); text.textContent = full; more.classList.add('on'); return; }
    idx++;
    if (idx < queue.length) showLine(queue[idx]);
    else { hide(); done?.(); }
  };

  const hide = (): void => { stopTimer(); root.classList.remove('dlg-on'); };

  root.addEventListener('click', advance);

  return {
    root,
    play(lines, onDone) {
      queue = lines; idx = 0; done = onDone;
      if (!lines.length) return;
      root.classList.add('dlg-on');
      showLine(lines[0]);
    },
    next: advance,
    hide,
    destroy: () => { stopTimer(); root.remove(); }
  };
}

/**
 * Cartela de transición centrada (p.ej. "Siete días después…"). Se desvanece
 * sola tras `ms` (o al hacer clic) y llama a `onDone`.
 */
export function showTitleCard(parent: HTMLElement, message: string, ms = 2600, onDone?: () => void): void {
  styles();
  const card = document.createElement('div');
  card.className = 'dlg-card';
  const span = document.createElement('span');
  span.textContent = message;
  card.appendChild(span);
  parent.appendChild(card);
  let closed = false;
  const close = (): void => {
    if (closed) return; closed = true;
    card.style.transition = 'opacity .4s ease';
    card.style.opacity = '0';
    setTimeout(() => { card.remove(); onDone?.(); }, 400);
  };
  card.addEventListener('click', close);
  setTimeout(close, ms);
}
