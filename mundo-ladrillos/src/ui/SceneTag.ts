/**
 * Chapita de parte para iterar el juego con feedback preciso.
 */
export interface SceneTagInfo {
  id: string;
  nombre: string;
  tramo?: string;
  modo?: string;
  hilo?: string;
  archivo?: string;
  getAudio?: () => string;
  getPos?: () => { x: number; z: number };
  getExtra?: () => string;
  pos?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface SceneTagHandle {
  el: HTMLElement;
  setAudio(name: string): void;
  dispose(): void;
}

export function mountSceneTag(info: SceneTagInfo): SceneTagHandle {
  const previous = document.getElementById('scene-tag');
  if (previous) previous.remove();

  const el = document.createElement('div');
  el.id = 'scene-tag';
  const corner = info.pos ?? 'top-left';
  const vertical = corner.startsWith('top') ? 'top:54px;' : 'bottom:40px;';
  const horizontal = corner.endsWith('left') ? 'left:10px;' : 'right:10px;';
  el.setAttribute('style',
    `position:fixed;${vertical}${horizontal}z-index:60;display:flex;align-items:center;gap:8px;` +
    'font:600 12px/1.2 ui-monospace,Menlo,Consolas,monospace;color:#ffe9c2;' +
    'background:rgba(20,16,28,.82);border:1px solid rgba(255,210,120,.35);' +
    'border-radius:10px;padding:6px 8px;backdrop-filter:blur(3px);max-width:60vw;');

  const label = document.createElement('span');
  const button = document.createElement('button');
  button.textContent = 'Copiar';
  button.setAttribute('style',
    'font:700 12px/1 system-ui;color:#0a0705;background:#ffd24a;border:none;' +
    'border-radius:7px;padding:5px 8px;cursor:pointer;white-space:nowrap;');

  const audioNow = (): string => {
    try { return info.getAudio ? info.getAudio() : '-'; } catch { return '-'; }
  };
  const render = (): void => {
    const parts = [`${info.id}`];
    if (info.modo) parts.push(info.modo);
    parts.push('Audio: ' + audioNow());
    label.textContent = parts.join('  |  ');
  };
  render();
  const timer = setInterval(render, 500);

  const report = (): string => {
    const pos = (() => {
      try {
        const p = info.getPos?.();
        return p ? `x=${p.x.toFixed(1)} z=${p.z.toFixed(1)}` : '-';
      } catch { return '-'; }
    })();
    const extra = (() => {
      try { return info.getExtra ? info.getExtra() : ''; } catch { return ''; }
    })();
    return [
      '=== REPORTE DE PARTE ===',
      `Parte: ${info.tramo ? info.tramo + ' | ' : ''}${info.id} "${info.nombre}"`,
      `Hilo/archivo: ${info.hilo ?? '?'} | ${info.archivo ?? '?'}`,
      info.modo ? `Modo: ${info.modo}` : '',
      `Audio: ${audioNow()}`,
      `Jugador: ${pos}`,
      extra ? `Extra: ${extra}` : '',
      'PROBLEMA: (describe aquí qué falla / qué cambiar)',
      '========================='
    ].filter(Boolean).join('\n');
  };

  const flash = (message: string): void => {
    const oldText = button.textContent;
    button.textContent = message;
    setTimeout(() => { button.textContent = oldText; }, 1100);
  };
  button.onclick = async (): Promise<void> => {
    const text = report();
    try {
      await navigator.clipboard.writeText(text);
      flash('Copiado');
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try { document.execCommand('copy'); flash('Copiado'); }
      catch { flash('Copia manual'); prompt('Copia esto:', text); }
      textarea.remove();
    }
  };

  el.append(label, button);
  document.body.appendChild(el);

  return {
    el,
    setAudio(name: string): void { info.getAudio = () => name; render(); },
    dispose(): void { clearInterval(timer); el.remove(); }
  };
}
